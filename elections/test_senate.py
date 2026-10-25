
import os
import requests
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "https://election.org"
API_KEY = os.getenv("ELECTION_API_KEY", "").strip()

STATES = {
    "FL": "Florida",
    "CA": "California"
}

def get_senate_candidates(state):
    url = f"{BASE_URL}/api/v1/contests"

    response = requests.get(
        url,
        params={
            "state": state,
            "office": "S"
        },
        headers={"Accept": "application/json"},
        timeout=30
    )

    print("Status Code:", response.status_code)
    response.raise_for_status()

    data = response.json()
    contests = data.get("data", {}).get("records", [])

    return contests


def main():
    print("\n2026 U.S. SENATE CANDIDATES")
    print("=" * 50)

    for state_code, state_name in STATES.items():

        print(f"\n{'=' * 50}")
        print(state_name.upper())
        print("=" * 50)

        contests = get_senate_candidates(state_code)

        if not contests:
            print("No 2026 Senate contest returned.")
            continue

        for contest in contests:
            print("\nRace:", contest.get("title"))

            candidates = contest.get("candidates", [])

            confirmed = []
            unverified = []

            for candidate in candidates:
                ballot = candidate.get("november_candidacy")

                if (
                    isinstance(ballot, dict)
                    and ballot.get("status") == "on_ballot"
                    and ballot.get("stage") == "general"
                    and ballot.get("election_date") == "2026-11-03"
                ):
                    confirmed.append(candidate)
                else:
                    unverified.append(candidate)

            print("\nCONFIRMED NOVEMBER BALLOT CANDIDATES")

            if not confirmed:
                print("None confirmed by this API response.")

            for candidate in confirmed:
                ballot = candidate["november_candidacy"]

                print("\nName:", ballot.get("ballot_name")
                      or candidate.get("name"))
                print("Party:", ballot.get("party_label")
                      or candidate.get("party"))
                print("Status: On ballot")
                print("Source:", ballot.get("source_url"))

            print("\nOTHER CANDIDATE FILINGS")

            if not unverified:
                print("None")

            for candidate in unverified:
                print(
                    "-",
                    candidate.get("name", "Unknown"),
                    "| Party:",
                    candidate.get("party", "Unknown"),
                    "| Ballot status not confirmed"
                )

            print("\nTotal filings:", len(candidates))
            print("Confirmed on ballot:", len(confirmed))


if __name__ == "__main__":
    main()
