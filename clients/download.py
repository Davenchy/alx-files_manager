#!/usr/bin/env python3
""" Download a file from the files server """
import sys
import os
import json
import requests

HOST = os.environ.get('HOST', '0.0.0.0')
PORT = os.environ.get('PORT', '5000')

if len(sys.argv) < 4:
    print("Usage: download.py token fileId outputFile [size]")
    sys.exit(1)

token = sys.argv[1]
file_id = sys.argv[2]
output_file = sys.argv[3]
file_size = sys.argv[4] if len(sys.argv) >= 5 else None

r_headers = {'X-Token': token}

r_params = {}
if file_size is not None:
    if file_size in ['500', '250', '100']:
        r_params['size'] = file_size
    else:
        print('Allowed file sizes are 100, 250, 500:', file_size)
        sys.exit(1)

r = requests.get(f'http://{HOST}:{PORT}/files/{file_id}/data',
                 params=r_params,
                 headers=r_headers,
                 timeout=5)

if not r.ok:
    print(f'Failed to download file: {file_id}: {r.status_code}')
    print(json.dumps(r.json(), indent=2))
    sys.exit(1)

print('FileType:', r.headers.get('Content-Type', 'Unknown'))
with open(output_file, 'wb') as f:
    f.write(r.content)

print("File saved to:", output_file)
