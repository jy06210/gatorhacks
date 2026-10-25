"""Credential-safe diagnostics shared by provider and pipeline."""
import os
import re


def safe_error(exc: Exception, secrets=()) -> str:
    message = str(exc)
    for value in (*secrets, *(v for k, v in os.environ.items() if any(s in k.upper() for s in ('KEY', 'TOKEN', 'SECRET', 'PASSWORD')))):
        if value:
            message = message.replace(value, '[REDACTED]')
    message = re.sub(r'AIza[\w-]+', '[REDACTED]', message)
    message = re.sub(r'(?i)((?:api[_-]?key|key|token|authorization|x-goog-api-key)\s*[=:]\s*)[^\s,&\}\]]+', r'\1[REDACTED]', message)
    status = getattr(exc, 'code', None) or getattr(exc, 'status_code', None)
    if not isinstance(status, (int, str)):
        status = None
    response = getattr(exc, 'response', None)
    status = status or getattr(response, 'status_code', None)
    return f'{type(exc).__name__} status={status or "unknown"}: {message[:1200]}'
