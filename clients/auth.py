#!/usr/bin/env python3
""" Client to connect/disconnect sessions on the files manager server """
import base64
import sys
import os
import json
import requests

HOST = os.environ.get('HOST', '0.0.0.0')
PORT = os.environ.get('PORT', '5000')


def new(email: str, password: str):
    """ Create a new user """
    r_json = {"email": email, "password": password}
    res = requests.post(f'http://{HOST}:{PORT}/users', json=r_json, timeout=5)

    if not res.ok:
        print(f'Failed to create a new user: {res.status_code}')
        print(json.dumps(res.json(), indent=2))
        sys.exit(1)

    print(json.dumps(res.json(), indent=2))


def connect(email: str, password: str):
    """ Authenticate user and returns token on success
    raises an exception on error """
    credentials = base64.b64encode(f'{email}:{password}'.encode()).decode()
    res = requests.get(f'http://{HOST}:{PORT}/connect', headers={
        'Authorization': f'Basic {credentials}',
    }, timeout=5)

    if not res.ok:
        print(f'Failed to connect: {res.status_code}')
        print(json.dumps(res.json(), indent=2))
        sys.exit(1)

    print(res.json()['token'])


def disconnect(token: str):
    """ Logout user to close session """
    res = requests.get(f'http://{HOST}:{PORT}/disconnect',
                       headers={'X-Token': token},
                       timeout=5)

    if not res.ok:
        print(f'Failed to disconnect token: {token}: {res.status_code}')
        print(json.dumps(res.json(), indent=2))


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage:\n\tauth.py new email password")
        print("Usage:\n\tauth.py connect email password")
        print("\tauth.py disconnect token")
        sys.exit(1)

    command = sys.argv[1]

    if command == 'connect':
        if len(sys.argv) < 4:
            print("Usage: auth.py connect email password")
            sys.exit(1)
        connect(sys.argv[2], sys.argv[3])
    elif command == 'disconnect':
        disconnect(sys.argv[2])
    elif command == 'new':
        if len(sys.argv) < 4:
            print("Usage: auth.py connect email password")
            sys.exit(1)
        new(sys.argv[2], sys.argv[3])
    else:
        print("Invalid command")
        sys.exit(1)
