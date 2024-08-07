#!/usr/bin/env python3
""" List all files on the files server that owned by the user """
import os
import sys
import json
import requests

HOST = os.environ.get('HOST', '0.0.0.0')
PORT = os.environ.get('PORT', '5000')

if len(sys.argv) < 2:
    print('Usage: list_files.py token [parentId]')
    sys.exit(1)

token = sys.argv[1]
parent_id = sys.argv[2] if len(sys.argv) >= 3 else None

print("Listing:", parent_id if parent_id else 'ROOT')

r_params = {}
if parent_id:
    r_params['parentId'] = parent_id

r = requests.get(f'http://{HOST}:{PORT}/files',
                 params=r_params,
                 headers={'X-Token': token},
                 timeout=5)

if not r.ok:
    print('Failed to connect and list files:', r.status_code)
    print(r.json())
    sys.exit(1)

print(json.dumps(r.json(), indent=2))
