"""Local atomic caches, configurable pacing, and provider error classification."""
from collections import deque
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
import hashlib
import json
import os
from pathlib import Path
import random
import tempfile
from time import monotonic, sleep


DEFAULT_MODEL = 'gemini-3.5-flash-lite'


def model_settings(base=None):
    legacy = base or os.getenv('LLM_MODEL') or os.getenv('GEMMA_MODEL') or DEFAULT_MODEL
    return {'extraction': os.getenv('EXTRACTION_MODEL') or legacy,
            'biography': os.getenv('BIOGRAPHY_MODEL') or os.getenv('EXTRACTION_MODEL') or legacy,
            'synthesis': os.getenv('SYNTHESIS_MODEL') or legacy,
            'verification': os.getenv('VERIFICATION_MODEL') or os.getenv('SYNTHESIS_MODEL') or legacy}


def fingerprint(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, ensure_ascii=False).encode()).hexdigest()


def atomic_json(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile('w', encoding='utf-8', dir=path.parent, delete=False, suffix='.tmp') as stream:
            temporary = Path(stream.name)
            json.dump(value, stream, ensure_ascii=False, indent=2)
        temporary.replace(path)
    finally:
        if temporary and temporary.exists():
            temporary.unlink()


class JsonCache:
    def __init__(self, directory, ttl_hours=168):
        self.directory = Path(directory)
        self.ttl_hours = ttl_hours

    def get(self, key):
        try:
            path = self.directory / (key + '.json')
            age = datetime.now(timezone.utc).timestamp() - path.stat().st_mtime
            if age < 0 or age >= self.ttl_hours * 3600:
                return None
            return json.loads(path.read_text(encoding='utf-8'))
        except (OSError, ValueError):
            return None

    def put(self, key, value):
        atomic_json(self.directory / (key + '.json'), value)


class Pacer:
    """One process/project-wide budget; not a claim about provider quotas."""
    def __init__(self, rpm=0, tpm=0, clock=monotonic, wait=sleep):
        if rpm < 0 or tpm < 0:
            raise ValueError('LLM pacing budgets must be nonnegative')
        self.rpm, self.tpm, self.clock, self.wait = rpm, tpm, clock, wait
        self.events = deque()

    def reserve(self, tokens):
        if self.tpm and tokens > self.tpm:
            raise ValueError('Prompt exceeds configured LLM_TPM_BUDGET; reduce evidence or raise your configured budget')
        while True:
            now = self.clock()
            while self.events and now - self.events[0][0] >= 60:
                self.events.popleft()
            if (not self.rpm or len(self.events) < self.rpm) and (not self.tpm or sum(e[1] for e in self.events)+tokens <= self.tpm):
                self.events.append((now, tokens))
                return
            # Short sleeps allow interruption; no blocking sleep exceeds five seconds.
            self.wait(min(5, max(.01, 60 - (now-self.events[0][0]))))


def status_code(exc):
    code = getattr(exc, 'code', None) or getattr(exc, 'status_code', None)
    if not isinstance(code, (str, int)):
        code = None
    response = getattr(exc, 'response', None)
    code = code or getattr(response, 'status_code', None)
    try:
        return int(code)
    except (ValueError, TypeError):
        return None


def retry_policy(exc, attempt):
    """Return (classification, delay). None delay means do not retry."""
    code = status_code(exc)
    message = str(exc).lower()
    payload = getattr(exc, 'response_json', None)
    if isinstance(payload, dict):
        message += ' ' + json.dumps(payload).lower()
    # Only explicit permanent signals stop daily/billing retries; generic quota errors remain unknown.
    if code in (401,403) or any(s in message for s in ('perday', 'per_day', 'per day', 'daily quota', 'billing disabled', 'billing account disabled', 'insufficient credits', 'payment required', 'quota_value: 0', '"quotavalue": "0"')):
        return 'daily_quota_or_access', None
    if code not in (429,500,502,503,504) and 'timeout' not in type(exc).__name__.lower():
        return 'nonretryable', None
    delay = None
    response = getattr(exc, 'response', None)
    headers = getattr(response, 'headers', {})
    if isinstance(headers, dict) or hasattr(headers, 'get'):
        value = headers.get('Retry-After') or headers.get('retry-after')
        if isinstance(value, str):
            try:
                delay = max(0, float(value))
            except ValueError:
                try:
                    delay = max(0, (parsedate_to_datetime(value)-datetime.now(timezone.utc)).total_seconds())
                except (ValueError, TypeError):
                    pass
    if delay is None:
        import re
        match = re.search(r'retrydelay[\s\"\x27:]+([\d.]+)s|retry in\s+([\d.]+)s', message)
        if match:
            delay = float(next(v for v in match.groups() if v))
    return ('rate_limit' if code == 429 else 'transient'), (delay if delay is not None else min(30, 2 ** (attempt+1)) + random.uniform(0, 1))


class ProviderUnavailable(ValueError):
    pass
