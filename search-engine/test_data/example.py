import requests

def fetch_data():
    response = requests.get("https://api.example.com")
    return response.json()
