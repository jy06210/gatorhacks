
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

OFFICES = {
    "S": "U.S. Senate",
    "H": "U.S. House"
}


def get_contests(state, office):
    """Retrieve 2026 federal contests, handling pagination."""
    url = f"{BASE_URL}/api/v1/contests"
    all_records = []
    offset = 0
    limit = 50

    while True:
        response = requests.get(
            url,
            params={
                "state": state,
                "office": office,
                "limit": limit,
                "offset": offset
            },
            headers={"Accept": "application/json"},
            timeout=30
        )

        if not response.ok:
            print("API Error:", response.text[:1000])
            break

        payload = response.json()
        data = payload.get("data", {})
        records = data.get("records", [])

        if not records:
            break

        all_records.extend(records)

        total = data.get("total_matches", len(records))

        if len(all_records) >= total:
            break

        next_offset = data.get("next_offset")
        offset = (
            next_offset
            if isinstance(next_offset, int)
            else offset + len(records)
        )

        if offset <= 0 or len(all_records) > 1000:
            break

    return all_records


def extract_candidates(contest):
    """Find candidate records attached to a contest."""
    candidate_keys = (
        "candidates",
        "candidate_records",
        "filings",
        "candidate_filings"
    )

    def search(value):
        if isinstance(value, dict):
            for key in candidate_keys:
                records = value.get(key)
                if isinstance(records, list):
                    return records

            for nested in value.values():
                if isinstance(nested, (dict, list)):
                    found = search(nested)
                    if found is not None:
                        return found

        elif isinstance(value, list):
            for item in value:
                found = search(item)
                if found is not None:
                    return found

        return None

    return search(contest)


def candidate_name(candidate):
    if isinstance(candidate, str):
        return candidate

    if not isinstance(candidate, dict):
        return str(candidate)

    return (
        candidate.get("name")
        or candidate.get("candidate_name")
        or candidate.get("full_name")
        or candidate.get("display_name")
        or "Name unavailable"
    )


def main():
    print("\n2026 FEDERAL ELECTION CANDIDATES")
    print("=" * 60)

    for state_code, state_name in STATES.items():

        print(f"\n{'#' * 60}")
        print(state_name.upper())
        print(f"{'#' * 60}")

        for office_code, office_name in OFFICES.items():

            print(f"\n--- {office_name} ---")

            contests = get_contests(
                state_code,
                office_code
            )

            print("Total contests:", len(contests))

            for contest in contests:

                title = contest.get(
                    "title", "Unknown contest"
                )

                print(f"\nRACE: {title}")

                candidates = extract_candidates(contest)

                if candidates is None:
                    print(
                        "Candidate list not found in "
                        "the expected fields."
                    )
                    print(
                        "Available contest fields:",
                        list(contest.keys())
                    )
                    continue

                if not candidates:
                    print("No candidate records returned.")
                    continue

                print("Candidates:", len(candidates))

                for candidate in candidates:
                    print(" -", candidate_name(candidate))

                    if isinstance(candidate, dict):
                        party = (
                            candidate.get("party")
                            or candidate.get("party_name")
                        )

                        if party:
                            print("   Party:", party)

    print("\n" + "=" * 60)
    print("DONE")
    print(
        "Note: Candidate filings do not prove "
        "official ballot qualification."
    )


if __name__ == "__main__":
    main()
