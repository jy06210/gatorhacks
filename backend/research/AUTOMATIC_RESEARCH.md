# Automatic candidate research

For stage-model selection, quota budgets, incremental caches, recovery and usage
diagnostics, see [PERFORMANCE.md](PERFORMANCE.md).

## Consolidated profile JSON

Clean exports now contain only `candidate_name`, `office`, `biography`, and
`issues` (all 12 categories). Each section contains a summary and supporting URLs.
The full research envelope described below remains internal under
`candidate_profiles/.cache/profile_research/` for audit and resynthesis. Existing
raw input datasets are preserved. `_profile.json` is the clean export; to resynthesize
again, supply the original raw JSON or its internal research copy, not the export.

Each new saved result now has `profile.biography` and `profile.issues` (all 12
taxonomy keys). Each section is `{"summary": null, "sources": []}` when evidence
is insufficient or synthesis fails. Existing `sources`, findings, raw proposals,
rejection reasons, text and errors remain available without alteration.

After validation, hosted Gemma writes natural prose with sentence-level evidence
IDs: biography uses 2-4 sentences under 100 words; populated policy categories
target 80-130 words in 3-5 sentences when adequately supported. Sparse categories
stay shorter rather than padding. Related positions consolidate and findings need not
appear. Exact quotes, nearby context, candidate attribution, URLs, source type and
timestamps accompany policy evidence. Python validates cited IDs and derives URLs
only from cited evidence. Repetitive reporting prefixes are no longer inserted.

A separate grounding request checks every assertion against its cited quotes and
context and checks all accepted evidence for hidden contradictions or lost
qualifications. Unsupported or malformed prose gets one regeneration attempt,
then null. API failures leave the affected section null. Model-based grounding is
fallible and still benefits from human review; it is not a proof of entailment.

Biography extraction produces quoted structured facts: hometown, birthplace,
education, current/previous offices, service years, and office sought. First names,
surnames and questionnaire fields resolve only in candidate-specific context.
Equivalent facts can corroborate across differently worded sources; dates and
qualifications remain separate. Each fact requires two distinct publisher domains
and nonidentical documents (subdomains/mirrored copies do not count twice). This
does not conclusively detect syndicated reporting on different domains. Both a
corroborated background fact and candidacy are required, or biography stays null.

`profile.diagnostics` records insufficient evidence/corroboration, API failures,
unsupported generated claims, and validation failures, alongside biography fact
evidence and successful sentence/claim citations and verdicts. Synthesis version 7 replaces
the old concatenated output and automatically regenerates older cached summaries
from cached research without a new web run. Failed/empty version-2 summaries stay
cached until explicitly resynthesized or refreshed.

Hosted research reuses its configured model/client for synthesis. Local Ollama
research is unchanged; final synthesis uses hosted Gemma if `GEMINI_API_KEY` is
configured and otherwise leaves null profile sections. Final profiles are cached
with research; old research cache entries can gain summaries without another web run.

Regenerate only the final profile from saved research (no Brave, fetching, policy
extraction, or Ollama requests; only hosted Gemma synthesis):

```powershell
.\backend\.venv\Scripts\python.exe backend/research/candidate_research.py `
  --resynthesize backend/data/research/candidate_profiles/your_saved_research.json
```

This writes `your_saved_research_profile.json` beside the input, leaving the input
file unchanged. The original `sources` array, including unknown debugging fields,
is preserved exactly as JSON data. `--model`/`GEMMA_MODEL` selects hosted Gemma;
`--candidate` and `--office` are read from the file, not required in this mode.
`profile.synthesis_version` identifies the cached synthesis format. Existing CLI
research flags still work normally. No frontend or API endpoint changes are made.

Policy taxonomy: `backend/data/policy_taxonomy.json` is the shared label source
for Python and frontend consumers (no frontend changes are required). Both model
prompts request one of its 12 categories plus a specific `policy_issue` and
`attributed_candidate`. Invalid categories are rejected. Older responses lacking
a category use a deterministic issue-label mapping; unmatched legacy issues fall
under Local Issues. Existing saved datasets are not rewritten.

Profiles now include `policy_categories`, a map containing all 12 labels, with
empty arrays for unsupported categories. Each grouped position has one category,
its original specific issue and neutral summary, and an `evidence` array retaining
all distinct source URL/quote/timestamp combinations plus nearby source context.
Grouping merges whitespace/case-equivalent issue, summary, and quote duplicates,
including repeated extraction of the same statement. Different quotes, conditional
statements, paraphrases and conflicting summaries remain separate; there is no
additional model call to guess semantic equivalence. This conservative approach
can retain overlapping positions rather than accidentally erase distinctions.

`sources[].findings` still contains accepted source-level findings.
`sources[].raw_findings` records every parsed proposal, its chunk number, acceptance,
and rejection reason before deduplication. Exact quote validation remains per chunk.
Prompts require candidate attribution; explicit Candidate: headings and named
speakers provide additional checks for multi-candidate material. Ambiguous guides
without clear candidate boundaries still need human review. Quote presence alone
does not prove semantic entailment. The cache version changed for the new schema.

Debugging and article coverage: articles are split at paragraph/sentence boundaries
into at most eight bounded chunks, sequentially for both providers. Each quote is
validated against its own chunk; duplicate issue/quote pairs are removed. Failed
chunks preserve successful findings and mark the source partial. `analyzed_text`
contains the covered prefix; `input_truncated` now means the eight-chunk limit was
reached, rather than simply exceeding one prompt.

A live FOX49 reproduction hit `MAX_TOKENS` at the hosted output limit. Gemma 4
now uses minimal thinking so the token budget goes toward JSON extraction; Gemma 3
and local Ollama receive no new thinking option. Truncated output remains an
explicit partial error rather than being parsed as a complete result.

Hosted failures log sanitized exception type, message, HTTP status when available,
and elapsed time. Configurable retries respect provider retry delays or exponential
backoff with jitter; explicit daily/access failures stop further calls for that
model. Invalid JSON/schema output is reported without provider retry; token-limit output
is explicitly reported. No stack traces or request headers are printed. Use
`--refresh` to retry failures; the cache version changed for chunked research.

Policy pages, interviews and questionnaires rank above general campaign coverage;
video-only, Wikipedia, and campaign-finance news are penalized. Election records
are fetched for identity corroboration rather than model policy extraction.
Their URLs and readable evidence remain in the JSON, with corroboration details
in `limitations`. Candidate name, office, Florida, and the election year must match
locally in the record. FEC office fields are interpreted as federal offices.

Identity inheritance is limited to exact campaign hosts (plus `www`), established
by a labeled campaign-website link near the candidate/office in a verified record,
or a candidate-named campaign domain with verified identity. Arbitrary publishers,
subdomains, lookalikes and similarly named candidates do not inherit verification.

Run from the repository root in Windows PowerShell:

```powershell
# If needed: py -m venv backend/.venv
.\backend\.venv\Scripts\python.exe -m pip install -r backend/research/requirements.txt
$env:BRAVE_SEARCH_API_KEY = "your-brave-key"
$env:GEMINI_API_KEY = "your-google-ai-studio-key"
.\backend\.venv\Scripts\python.exe backend/research/candidate_research.py `
  --provider gemma-api --candidate "Byron Donalds" --office "Governor of Florida" `
  --election-context "Florida 2026 general election"
```

Alternatively add the two variables to the repository-root `.env` (ignored by
Git). The CLI loads it without overriding environment variables. Never commit
real keys. Keys are not logged or saved; model/search errors are sanitized.

Omitting `--urls` runs six Brave queries combining candidate, office aliases,
Florida, election year, campaign, policy positions, questionnaires, voter guides,
interviews, and FEC/Florida election records. Candidate names must match but every
snippet need not repeat the exact office wording. US/U.S./United States Senate
are normalized while state Senate remains distinct. Selection removes duplicate
URLs/tracking parameters and caps each domain at two pages. Up to ten ranked URLs
are fetched, including records and reserve sources. Blocked or unverifiable pages
do not stop processing. `--max-sources` (3-5, default 5) limits pages sent to the
model; reserve/record statuses are retained in JSON. Discovered URLs, rejections,
and reasons log to stderr (URL query strings are omitted).
Campaign statements are self-reported evidence, not independent verification.

Before inference, identity can be established by title/body name and office,
verified campaign-domain inheritance, or candidate name in the page combined with
an official election-record corroboration and identity-matched search metadata.
Search snippets alone never become policy evidence. Same-name candidates and
historical attribution can still require review. Unavailable records are reported
explicitly; missing corroboration does not block directly identity-matched pages.
Cache keys are versioned for the revised discovery rules.

Hosted default for all stages: `gemini-3.5-flash-lite`; override with `--model`,
`LLM_MODEL`, legacy `GEMMA_MODEL`, or stage-specific model variables for
a model enabled for your account. See Google's current
[hosted Gemma documentation](https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api).
Local Ollama remains `gemma3:4b`. Both use the same findings JSON and exact quote
validation. Hosted output is requested as JSON and validated locally, without
assuming native structured-output support for every Gemma model. Summaries still
need semantic review. Sources are processed sequentially with bounded excerpts.

Profiles save under `backend/data/research/candidate_profiles/`. Fresh results
with supported findings are reused from `.cache/` for 24 hours. Keys include
normalized candidate/office, election context, provider/model, manual URLs, and
input/source settings. `--refresh` bypasses reuse; `--cache-hours 0` also disables
reuse. Results with no findings are not cached; partial results with evidence can
be reused. Refresh to retry missing sources. Cache hits print the saved JSON path.
Search, per-source fetch/inference, and total elapsed seconds log to stderr.

Manual input still works with either provider (`ollama` is the default), accepts
2-5 URLs, and skips the automatic identity filter; prompts still require attribution:

```powershell
.\backend\.venv\Scripts\python.exe backend/research/candidate_research.py `
  --provider gemma-api --candidate "Byron Donalds" --office "Governor of Florida" `
  --urls "https://byrondonalds.com/" "https://byrondonalds.com/issues/"
.\backend\.venv\Scripts\python.exe -m unittest discover -s backend/research -p "test_*.py" -v
```

Tests mock external requests; no paid API calls. To use Docker, rebuild, set the
keys in PowerShell, and pass `-e BRAVE_SEARCH_API_KEY -e GEMINI_API_KEY` to
`docker compose run` before `research`. The image includes the research CLI and its browser fallback.

[Brave API reference](https://api-dashboard.search.brave.com/api-reference/web/search/get).
