import requests


response = requests.post(
    "http://127.0.0.1:8080/realms/quickstart/protocol/openid-connect/token",
    headers={
        "content-type": "application/x-www-form-urlencoded"
    },
    data={
        "client_id": "test-cli",
        "username": "alice",
        "password": "alice",
        "grant_type": "password"
    }
)

token = response.json().get("access_token")


r = requests.post(
    "http://localhost:3000/secured",
    headers={
        "Authorization": f"bearer {token}"
    }
)

print(r.content)