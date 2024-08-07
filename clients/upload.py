#!/usr/bin/env python3
""" Simple client to upload image file to the files manager server"""
import base64
import sys
import os
import json
from typing import Optional
import requests

HOST = os.environ.get('HOST', '0.0.0.0')
PORT = os.environ.get('PORT', '5000')


def upload(file_path: str, file_type: str, token: str,
           parent_id: Optional[str]):
    """ Upload file to the server """
    file_encoded = None
    with open(file_path, "rb") as image_file:
        file_encoded = base64.b64encode(image_file.read()).decode('utf-8')

    file_name = file_path.split('/')[-1]
    r_json = {
            'name': file_name,
            'type': file_type,
            'isPublic': True,
            'data': file_encoded}
    if parent_id is not None:
        r_json['parentId'] = parent_id
    r_headers = {'X-Token': token}

    r = requests.post(f"http://{HOST}:{PORT}/files",
                      json=r_json,
                      headers=r_headers,
                      timeout=5)

    if not r.ok:
        print(f'Failed to upload {file_type}: {file_path}: {r.status_code}')
        print(json.dumps(r.json(), indent=2))
        sys.exit(1)
    else:
        print(json.dumps(r.json(), indent=2))


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: upload.py token {file|image} file_path [parentId]")
        sys.exit(1)

    token = sys.argv[1]
    file_type = sys.argv[2]
    file_path = sys.argv[3]
    parent_id = sys.argv[4] if len(sys.argv) >= 5 else None

    if file_type not in ['image', 'file']:
        print("Invalid file type: " + file_type)
        sys.exit(1)

    print(f"Uploading {file_type}: {file_path}")
    upload(file_path, file_type, token, parent_id)
