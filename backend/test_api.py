import requests

url = "http://localhost:8000/api/v1/users"
payload = {
    "email": "test_api_final@example.com",
    "password": "password123",
    "role": "admin"
}
try:
    response = requests.post(url, json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
