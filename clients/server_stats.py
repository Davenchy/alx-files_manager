#!/usr/bin/env python3
""" Print files manager server stats """
import os
import sys
import json
import requests

HOST = os.environ.get('HOST', '0.0.0.0')
PORT = os.environ.get('PORT', '5000')

res = requests.get(f'http://{HOST}:{PORT}/status', timeout=5)
if not res.ok:
    print(f'Faile to load server status: {res.status_code}')
    print(json.dumps(r.json(), indent=2))
    sys.exit(1)

data = res.json()
print("Is MongoDB connected:", data['db'])
print("Is RedisDB connected:", data['redis'])

res = requests.get(f'http://{HOST}:{PORT}/stats', timeout=5)
if not res.ok:
    print(f'Faile to load server states: {res.status_code}')
    print(json.dumps(r.json(), indent=2))
    sys.exit(1)

data = res.json()
print("Users:", data['users'])
print("Files:", data['files'])
