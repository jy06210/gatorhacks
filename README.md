<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

For the local candidate research CLI, see [backend/research/README.md](backend/research/README.md).

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

The frontend uses local sample ballot data for races, amendments, comparisons,
and saved ballot plans. It does not currently call a backend ballot API or Gemini.

Candidate research is a separate Python CLI. For the current Gemini pipeline,
source discovery, caching, verification, and clean `_profile.json` output, see
[automatic research](backend/research/AUTOMATIC_RESEARCH.md) and
[performance settings](backend/research/PERFORMANCE.md). Existing environment
files supply its keys; do not commit them.

Docker uses the same research requirements, including Playwright for webpage
rendering. Build with `docker compose build research`, then run the CLI with
`docker compose run --rm research python research/candidate_research.py --provider google-api --candidate "David Jolly" --office "Governor of Florida"`.
The service passes Gemini and Brave keys from the environment and mounts research
data and outputs. Local Ollama remains available as an explicit CLI provider.

Offline checks: `npm run lint`, `npm run build`, and
`python -m unittest discover -s backend/research -p "test_*.py"`.
