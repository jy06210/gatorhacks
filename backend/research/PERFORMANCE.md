# Research performance and recovery

## Batched hosted path (synthesis version 7)

The Gemini path batches eligible source documents into one extraction request,
returning policies and biography facts under explicit source IDs. Exact quotes
and candidate ownership are still checked against each original source; biography
still requires independent corroboration. When extraction and biography use different
models, or older saved research lacks biography facts, biography extraction uses a
separate source-ID batch. Ollama and Gemma overrides retain their prior local/single
request paths. `LLM_BATCHING=0` disables hosted batching.

Uncached biography and populated issue sections share a generation request, then
a separate verification request. Each section has its own sentence verdicts and
every cited (sentence, claim ID) pair requires an explicit supported verdict.
Missing, repeated or invented IDs cannot pass. Failed sections alone fall back to
the bounded existing path; cached successful sections are not regenerated.
Policy prose now targets 80-130 words when evidence supports detail, prioritizing
named legislation, votes, proposals, conditions and dates. Past actions are not
silently presented as current campaign positions. Sparse evidence stays short.
No confidence score is invented: internal diagnostics expose cited-source counts,
accepted-claim counts, and official-record-source counts. The clean export schema
is unchanged.

Hosted articles are no longer split into 4 KB prompts by default. The 3.5 Flash-Lite
[published limits](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite)
are 1,048,576 input and 65,536 output tokens. Batches respect these context/output
budgets and configured TPM pacing; oversized batches split. Output truncation
splits the failed batch, or the article at a paragraph boundary if a single article
overflowed. `--max-input-chars` remains an explicit override. The 2 MB fetch cap
still applies. `LLM_CONTEXT_TOKENS` and `LLM_BATCH_OUTPUT_TOKENS` permit lower limits;
other model overrides use conservative context defaults rather than inheriting the
3.5 Flash-Lite limit. Input tokens are estimated; exact provider usage is logged.

For the requested project's 250K input TPM / 15 RPM budget, the 3.5 Flash-Lite path
now defaults to those pacing values. They are project configuration supplied for
this task, not a promise that every project has the same free quota. Existing
`LLM_TPM_BUDGET` and `LLM_RPM_BUDGET` overrides still win; old 12K/8 settings in `.env`
will continue to pace/split more conservatively until updated.

### Call accounting (no live benchmark)

The saved David Jolly run recorded 37 calls: 13 extraction, 6 biography, 10 synthesis
and 8 verification. That includes its cache state and follow-up research and is not
a directly comparable cold-run benchmark. In mocked tests, 12 populated policy
sections use **2 calls instead of 24**; two whole source pages use **1 instead of 2**
extraction calls and keep source ownership isolated. For a representative cold path
of five eligible whole sources plus a corroborated biography and 12 issue sections,
the ideal count is **36 -> 3** (5 extraction + 5 biography + 26 final calls -> one
combined extraction + one generation + one verification). Retries, follow-up
searches, failed sections, model overrides and context/output splitting increase
that number. Unchanged successful cache hits require no model generation.

Batching reduces RPM pressure and instruction overhead but increases each response's
size and failure scope. Semantic verification remains model-based and fallible;
the stricter per-cited-claim checks can reject more questionable prose. No live
latency or model-quality claim is made from mocked results.

### Bounded browser fallback

Trafilatura recall extraction is attempted before Playwright. Browser rendering is
allowed only after a successful unrestricted HTML response with empty/navigation-only
text, and after robots.txt permits it (404 means no declared policy). At most two
pages per process are rendered; navigation is limited to 20 seconds plus 1.5 seconds
for rendering, and output remains capped at 2 MB. A cross-domain script redirect,
403/other HTTP failure, CAPTCHA/challenge or detected paywall stops processing.
There is no stealth, credential use, paywall bypass or access-control workaround.
Inaccessible sources use the existing bounded alternate-source search, preserving
null/failure diagnostics when adequate evidence remains unavailable.

Set `RESEARCH_BROWSER_FALLBACK=0` to disable rendering. The existing Playwright
dependency/browser image is reused; if host Chromium binaries are absent, fallback
fails gracefully (install separately with `python -m playwright install chromium`).
Tests mock browser calls and never launch a browser or use live APIs.

Coverage update (synthesis version 6): discovery adds election-independent official
biography and legislative-record queries. Candidate-specific Senate/House domains,
Congress member pages, and bills naming the candidate as sponsor/cosponsor can
establish page identity without mentioning an election. Full candidate-name checks
remain required; these pages do not establish ballot eligibility. Historical
election records are excluded when their explicit year conflicts with the requested
election; at most two election-record results occupy the initial reserve pool.

Automatic research performs a bounded follow-up pass (at most three queries per
invocation) for missing biography corroboration and categories diagnosed as lacking
accepted evidence. Successful categories and API/verification failures are not
searched again as evidence gaps. Attempted targets/queries/results are persisted
in internal `profile.diagnostics.targeted_research`; reruns skip those targets and
can address remaining gaps. Fresh results extend raw evidence; synthesis caches
reuse unchanged successful sections. Manual URL mode and `--resynthesize` never
perform targeted web research. No search or model request is made by tests.

Internal source `research_diagnostics.status` distinguishes inaccessible sources,
page extraction failure, identity rejection, page-budget limits, model extraction
failure and no supported findings. Category diagnostics retain research coverage
alongside the independent semantic-verification result. Missing findings are not
treated as proof the candidate has no position. Biography may use two corroborated
background facts without asserting unverified candidacy; office-sought verification
is reported separately. Role aliases/date-only qualifiers no longer prevent office
corroboration, but service dates are not promoted without their own corroboration.
Acting/interim/uncertain qualifiers and distinct current/previous roles stay separate.
The clean `_profile.json` schema is unchanged.

The shared hosted default is now `gemini-3.5-flash-lite` for extraction, biography,
synthesis and semantic verification. Gemini uses JSON MIME type plus the actual
Pydantic JSON schema, with local validation retained. For 3.5 Flash-Lite, sampling
overrides are omitted and minimal thinking is used to fit the existing bounded
output budgets. The 3,000/1,800 token caps are application budgets, not Gemma model
limits. No quota values are inferred from the selected model. Environment stage
overrides, `LLM_MODEL` and legacy `GEMMA_MODEL` still take precedence; remove old
Gemma overrides if you want the new default. Local Ollama remains unchanged.

Version 5 additionally consolidates identical accepted position summaries across
different issue labels and quotes, preserving all unique quotes, context and source
attribution for verification. Different summaries, including qualifications and
opposing positions, remain separate. Prompt claim rows no longer repeat the
candidate name. Verification omits redundant summary text for uncited claims while
retaining their exact evidence for conflict checks. Semantic verification remains
mandatory; token savings depend on how much repetition a candidate's evidence has.

Public output is now `<candidate>_<timestamp>_profile.json` containing only
`candidate_name`, `office`, `biography`, and `issues` with all 12 categories and
supporting URLs. Full research/profile diagnostics are retained in
`candidate_profiles/.cache/profile_research/`, alongside the existing request and
recovery caches. Resynthesis accepts those internal research files or older raw
research JSON; the clean export alone intentionally lacks evidence for resynthesis.
Existing raw datasets are not removed. Empty sections still use null/empty sources.

Synthesis version 4 packs prompt-only source/evidence tables: exact quotes are not
repeated inside context, identical quote/context evidence shares provenance IDs,
and full URL paths stay in Python's citation map rather than repeated prompts.
Domains, source types, collection dates and candidate ownership remain available
to the model; full raw text, timestamps and URLs remain unchanged in saved JSON.
Verification still checks every sentence and all category evidence for conflicts.
On the saved Angie Nixon sample, evidence payloads fell from 60,418 to 41,258 UTF-8
bytes (31.7%), excluding instruction savings. These are byte measurements, not
provider token counts. No live API calls were made for this measurement.

## Audit of the previous implementation

The pre-change call graph was:

| Stage | Calls | Approximate input/output per call |
| --- | --- | --- |
| Brave discovery | Six HTTP searches; no LLM | No model tokens |
| Fetch/extract HTML | Up to ten HTTP pages, Trafilatura locally | No model tokens |
| Policy extraction | One hosted call per chunk; up to 8 chunks x 5 pages | Default 4 KB evidence plus instructions: roughly 1,300-2,000 input tokens; up to 3,000 output tokens |
| Biography extraction | One per eligible source | Previously up to 10,000 characters plus instructions, roughly 3,000-4,000 input tokens; up to 3,000 output |
| Final synthesis | One generation + one verifier per populated section | Each prompt capped at 48 KB: roughly 12,000-16,000 input tokens at the cap; previously up to 3,000 output each |
| Regeneration | Another generation/verifier pair on unsupported or malformed output | Could double final-stage work |

These are rough estimates, not tokenizer counts or quota promises. Typical short
JSON responses are much smaller than their output limits. Provider-reported usage
is now recorded when available; UTF-8 bytes / 3 is the conservative pacing estimate.

The saved Angie Nixon research inspected for this change has ten source attempts,
42 accepted findings, and nine populated issue categories. Without a usable
biography it still required at least 18 synthesis/verification requests on a fresh
run. Policy-source biography windows now range from approximately 1.8 to 4.4 KB
for that sample. No new live generation calls were made for the audit.

Necessary calls: extracting positions and biography facts, writing prose, and
semantic checking of generated claims. Redundant work included repeated verifier
evidence, repeated successful work after interruption, and retrying known exhausted
quotas. Deterministic JSON/ID/URL/quote checks remain local. Every generated prose
section still gets semantic verification: this safeguard has not been removed.

## Configuration

Keep existing commands and `GEMMA_MODEL` working, or use `--provider google-api`
(an alias for the same Google SDK client). Local `--provider ollama` is unchanged.
Hosted model IDs are centralized/configurable; no SDK or provider is switched
automatically on errors and no fallback incurs unexpected API usage.

List generation models visible to your configured project before choosing:

```powershell
.\backend\.venv\Scripts\python.exe backend/research/candidate_research.py --list-models
```

Google's current [model catalogue](https://ai.google.dev/gemini-api/docs/models)
lists Flash and Flash-Lite models. For the demo, start with an available stable
Flash-Lite for latency; consider an available Flash for verification if grounding
quality warrants it. This is a proposed configuration, not a measured quality or
latency comparison. Availability and quotas are project-specific; SDK acceptance
of a model string does not establish access or a free tier.

Example environment (PowerShell or equivalent root `.env` entries):

```powershell
# Only use these example model IDs if --list-models reports them.
$env:EXTRACTION_MODEL = "gemini-3.5-flash-lite"
$env:BIOGRAPHY_MODEL = "gemini-3.5-flash-lite"
$env:SYNTHESIS_MODEL = "gemini-3.5-flash-lite"
$env:VERIFICATION_MODEL = "gemini-3.5-flash-lite"
# Or set LLM_MODEL / legacy GEMMA_MODEL for a common default.
# Gemma remains supported, for example gemma-4-26b-a4b-it when available.

# User-selected safety budgets, NOT assumed provider quotas:
$env:LLM_RPM_BUDGET = "8"
$env:LLM_TPM_BUDGET = "12000"
$env:LLM_MAX_ATTEMPTS = "2"
$env:LLM_MAX_RETRY_WAIT_SECONDS = "120"
$env:LLM_CACHE_HOURS = "168"
$env:BIOGRAPHY_INPUT_CHARS = "6000"
```

Explicit stage flags override their environment setting:
`--extraction-model`, `--synthesis-model`, `--verification-model`.
`--model` still selects the common fallback; unset stage overrides to use it
everywhere. `BIOGRAPHY_MODEL` falls back to `EXTRACTION_MODEL`. Without any model
configuration, the existing Gemma default remains. No environment secrets are
printed or included in cache keys/content.

Pacing defaults to disabled until budgets are configured, rather than asserting a
model has a particular quota. TPM budget controls estimated **input** tokens in a
rolling minute. Oversized single prompts fail rather than exceed that budget.
Pacing is shared across stages in one process, not across separate processes or
other applications using the same project. Run candidates sequentially for the
demo; adjust budgets using your AI Studio project limits.

## Rate limits

SDK-internal retries are disabled so attempts are bounded and visible. The client
respects Retry-After (seconds/date) and provider retryDelay/retry-in messages;
otherwise it uses exponential backoff with jitter. Sleeps are at most five
seconds at a time. Delays above the configured maximum cause deferral rather than
an early retry. Explicit daily-quota, zero-quota, billing-disabled and access
errors do not retry. Generic quota errors are not assumed to be daily exhaustion.

After persistent quota failure, a per-model circuit stops more network calls for
that model for the remainder of the run; successful cache entries remain usable.
Restart/resume later when quota is available. Null sections carry diagnostics.
See [Google rate limits](https://ai.google.dev/gemini-api/docs/rate-limits) and
[troubleshooting](https://ai.google.dev/gemini-api/docs/troubleshooting).

## Cache and recovery

- Research snapshots under `candidate_profiles/.cache/recovery/` preserve discovery
  URLs/metadata, fetched text/page identity details, raw accepted/rejected findings,
  and successful chunk indexes. Rerun the same command to resume. Candidate,
  office, election, sources, extraction model and input settings isolate recovery.
- Successful schema-valid hosted responses cache under ignored
  `backend/research/outputs/llm_cache/requests/`. Keys include candidate/election
  namespace, exact prompt/evidence, model, response schema, generation settings,
  and runtime version. API failures are never cached as successful responses.
- Successful **grounded** sections cache under `outputs/llm_cache/sections/`.
  Versioned evidence/configuration fingerprints invalidate changed evidence or
  stage-model settings. Ungrounded/null failures are not cached as successes.
- A valid research result is saved before synthesis. Every finished section is
  checkpointed, and resynthesis writes a valid partial `_profile.json` after each
  section. If interrupted, rerunning reuses completed model requests and sections.
  There is no transaction spanning API response arrival and disk write; interruption
  before that response is committed can repeat that request.
- Writes use a unique temporary file and atomic replacement. Source research files
  and their original `sources` arrays are not rewritten by resynthesis.

`--refresh` bypasses research/recovery reuse, but identical successful model calls
can still hit their evidence cache. Set `LLM_CACHE_HOURS=0` to disable hosted
request/section reuse for intentional regeneration. Research `--cache-hours`
controls the separate research/recovery cache. The caches store public evidence
and summaries locally, not API keys. Old checkpoint files are not automatically
deleted; TTL controls reuse. No database or external cache infrastructure is used.

## Commands

With Brave and Google API keys configured, research a new candidate:

```powershell
.\backend\.venv\Scripts\python.exe backend/research/candidate_research.py `
  --provider google-api --candidate "Angie Nixon" --office "United States Senate" `
  --election-context "Florida 2026 general election"
```

Regenerate the saved Angie Nixon profile, without discovery, fetching or policy
extraction (hosted biography extraction/synthesis/verification may run on cache misses):

```powershell
.\backend\.venv\Scripts\python.exe backend/research/candidate_research.py `
  --resynthesize backend/data/research/candidate_profiles/angie_nixon_20261025T022544437537Z.json
```

Resume either command by running it again. Successful sections are reused rather
than treating an interrupted partial profile as finished. Exactly 12 category
entries and null missing/failed summaries remain unchanged in the schema.

## Observability and tradeoffs

Logs report research/synthesis durations, per-stage model/calls/cache hits/misses,
retry counts and token estimates/reported usage. `profile.diagnostics.runtime`
contains stage counters and timing for the saved run. A full research cache hit
does not represent new token use; earlier persisted counters describe that earlier
run. Semantic verifier verdicts and failed-section reasons remain inspectable.

The verifier now receives evidence once plus sentence ID references, rather than
duplicating full bundles for every citation. Biography windows are bounded to
relevant passages. Per-category generation/verification remains deliberately
separate: batching was not introduced because it increases individual prompt
size at a low TPM limit and broadens failure/retry scope. Cached requests/sections
remove repeated calls without removing grounding. Narrow biography windows can
miss facts; evidence gaps remain null. Model-based entailment and independent-
source heuristics are still fallible and need human review before publication.

Offline tests:

```powershell
.\backend\.venv\Scripts\python.exe -m unittest discover -s backend/research -p "test_*.py" -v
```
