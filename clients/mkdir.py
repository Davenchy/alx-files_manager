#!/usr/bin/env python3
""" Create a new direcotry on the files server """
import sys
import os
import json
import requests


HOST = os.environ.get('HOST', '0.0.0.0')
PORT = os.environ.get('PORT', '5000')

if len(sys.argv) < 3:
    print("Usage: mkdir.py token dir_name [parentId]")
    sys.exit(1)

token = sys.argv[1]
dir_name = sys.argv[2]
parent_id = sys.argv[3] if len(sys.argv) >= 4 else None

print(f"Making directory {dir_name} under",
      'ROOT' if parent_id is None else parent_id)

r_json = {
        'name': dir_name,
        'type': 'folder',
        'isPublic': True}
if parent_id is not None:
    r_json['parentId'] = parent_id
r_headers = {'X-Token': token}

r = requests.post(f"http://{HOST}:{PORT}/files",
                  json=r_json,
                  headers=r_headers,
                  timeout=5)

if not r.ok:
    print(f'Failed to create a new directory: {dir_name}: {r.status_code}')
    print(json.dumps(r.json(), indent=2))
    sys.exit(1)

print(json.dumps(r.json(), indent=2))
