"""Prepare local demo connection credentials before pgAdmin's normal startup."""
import json
import os
from pathlib import Path
import re


def prepare():
    secrets = dict(re.findall(
        r'^export ([A-Z_]+)=([a-f0-9]{64})$',
        Path('/run/cab-secrets/config.env').read_text(), re.MULTILINE))
    definitions = json.loads(Path('/pgadmin4/cab-servers.json').read_text())
    storage = Path('/var/lib/pgadmin/storage') / os.environ['PGADMIN_DEFAULT_EMAIL'].replace('@', '_')
    storage.mkdir(parents=True, exist_ok=True)
    passfile = storage / '.pgpass'
    lines = []
    for server in definitions['Servers'].values():
        prefix = server['Host'].removesuffix('-db').replace('-', '_').upper()
        password = secrets[prefix + '_DB_ADMIN_PASSWORD']
        lines.append(f"{server['Host']}:5432:*:postgres:{password}")
        server['PassFile'] = '.pgpass'
        server['ConnectionParameters'] = {'passfile': '.pgpass', 'sslmode': 'prefer'}
    # libpq requires that password files cannot be read by other users.
    descriptor = os.open(passfile, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(descriptor, 'w') as output:
        os.chmod(passfile, 0o600)
        output.write('\n'.join(lines) + '\n')
    generated = Path('/var/lib/pgadmin/cab-servers.json')
    generated.write_text(json.dumps(definitions))
    os.environ['PGADMIN_SERVER_JSON_FILE'] = str(generated)


if __name__ == '__main__':
    prepare()
    os.execv('/entrypoint.sh', ['/entrypoint.sh'])
