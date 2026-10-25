# Single-candidate research

For automatic Brave + hosted Gemma setup, caching, and new CLI options, see [AUTOMATIC_RESEARCH.md](AUTOMATIC_RESEARCH.md).

The following describes manual local Ollama mode. Research one known Florida candidate from 2–3 manually selected public HTML URLs.
The Docker research service includes Playwright for the active webpage rendering fallback.

Install Python 3.11+ and Ollama. From the repository root in PowerShell:

```powershell
py -m venv backend/.venv
.\backend\.venv\Scripts\python.exe -m pip install -r backend/research/requirements.txt
ollama pull gemma3:4b
# Run ollama serve in another terminal if the Ollama desktop app is not running.
.\backend\.venv\Scripts\python.exe backend/research/candidate_research.py `
  --candidate "Anna V. Eskamani" `
  --office "Florida House of Representatives" `
  --urls "https://annaforflorida.com/" "https://annaforflorida.com/issues/"
```

These are manual example inputs, not a maintained source registry. Select current
accessible policy/interview pages for your candidate. Outdated or blocked URLs
produce explicit limitations.

JSON saves to `backend/data/research/candidate_profiles/` with candidate and UTC
timestamp in the filename. Each source preserves requested/final URLs, collection
timestamp, extracted text, analyzed excerpt, findings, and errors.

Defaults: sequential CPU-only gemma3:4b inference, 4096-token context, 1400 output
tokens, 25-second fetch timeout, 600-second inference timeout, and 2 MB HTML limit.
Input is bounded to the smaller of --max-input-chars (4000) and context minus 1500,
measured conservatively in UTF-8 bytes (2596 bytes by default). This reserves room
for instructions and output. Long pages are truncated and marked partial. Pick
focused pages; this is not exhaustive research.

Options: --ollama-endpoint http://localhost:11434 (also OLLAMA_HOST),
--context-window, --max-input-chars, --output-dir.

Status `ok` means each source yielded findings without truncation or rejected
quotes. `partial` means evidence, analysis, or findings are missing.
`source_unavailable` means no supplied page yielded readable text. These statuses
are saved results and exit successfully; invalid CLI arguments exit nonzero.
HTTP errors, challenges, non-HTML/PDF pages, and JavaScript-only pages are reported
without bypassing access controls. Ollama failures preserve fetched evidence.

Supporting quotes must match the analyzed text exactly. Invented quotes are
rejected. The model is instructed to use only summaries entailed by those quotes.
Exact matching verifies evidence presence, not semantic entailment or candidate
identity: review summaries and attribution before publication. Model-provided
URLs are never used. No search service, browser, API key, or database is needed.

Offline tests:

```powershell
.\backend\.venv\Scripts\python.exe -m unittest discover -s backend/research -p "test_*.py" -v
```

Docker (Ollama running on the Windows host):

```powershell
docker compose build research
docker compose run --rm --no-deps research python research/candidate_research.py --candidate "Anna V. Eskamani" --office "Florida House of Representatives" --urls "https://annaforflorida.com/" "https://annaforflorida.com/issues/" --ollama-endpoint http://host.docker.internal:11434
docker compose run --rm --no-deps research python -m unittest discover -s research -p "test_*.py" -v
```

References: [Ollama API](https://github.com/ollama/ollama/blob/main/docs/api.md),
[Trafilatura API](https://trafilatura.readthedocs.io/en/latest/corefunctions.html).


