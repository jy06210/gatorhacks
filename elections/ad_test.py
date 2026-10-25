
import os
import requests
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "https://election.org"
API_KEY = os.getenv("ELECTION_API_KEY", "").strip()

def get_amendments():
    url = f"{BASE_URL}/api/v1/ballot-measures"

    response = requests.get(
        url,
        params={
            "state": "FL",
            "level": "statewide"
        },
        headers={"Accept": "application/json"},
        timeout=30
    )

    print("Status Code:", response.status_code)

    if not response.ok:
        print("API Error:", response.text[:2000])
        return

    data = response.json()

    print("\nFLORIDA AMENDMENTS")
    print("-------------------")

    print(data)

if __name__ == "__main__":
    get_amendments()
