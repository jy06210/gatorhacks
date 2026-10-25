# Orange You Voting 🍊

An interactive, responsive **front-end demo** based on five supplied wireframes. Designed with Apple-inspired clarity, generous whitespace, and the brand palette:

- Primary orange `#ED7A13`
- Cream `#FFFADD` (corrected)
- Sage green `#6A8042`
- Forest green `#1E3006`

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite (normally http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Pages

- `/`: fixed-height desktop home screen with address entry and voting dates
- `/my-ballot`: office and issue filters, expandable side-by-side candidate comparisons
- `/candidates`: responsive candidate directory
- `/candidates/:id`: candidate profile with issue positions, background, funding information, source references
- `/amendments`: example ballot measures with even-handed Yes / No cards

## Important demo limitations

**Nothing in the candidate or measure dataset represents a real election, candidacy, or political position.** All are fictional UI placeholders, visibly marked as such. The address field currently saves the input locally and opens the My Ballot page, but **does not geocode the address, verify eligibility, determine precinct/district/county, or pull a real ballot**. Campaign positions, specific dates, race matching, and donor information require a verified backend. The Save Ballot button is a UI-only state toggle; address values are saved to localStorage. Do not deploy this as an authoritative election guide without the necessary integrations and data quality checks.

## Connecting your backend

Replace the records in `src/data.ts` with typed calls to your API, ideally from these endpoints:

- `GET /api/locations/resolve?address=...`: geocoded address and election districts
- `GET /api/elections?locationId=...`: relevant election(s), races, dates, measures
- `GET /api/candidates?electionId=...&raceId=...`
- `GET /api/candidates/:id`: profile, sourced positions, background, campaign finance
- `GET /api/measures?electionId=...`: ballot measure text, sourced Yes/No effects

Each candidate-issue assertion should have a source title, URL, publisher, publication date, and verification status. Only show races for the precise address once geocoding and election district resolution succeed. Prefer official election office sources for administrative facts.

## Tech

React 19, TypeScript, Vite, Lucide icons, custom responsive CSS (no additional CSS framework).
