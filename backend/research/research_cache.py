"""Versioned file cache; credentials never form part of a cache key."""
from datetime import timedelta
import hashlib
import json
from pathlib import Path

from schemas import CandidateProfile, utc_now
from llm_runtime import atomic_json


def cache_path(directory: Path, candidate: str, office: str, context: str, **settings) -> Path:
    identity = ["v4-taxonomy", " ".join(candidate.lower().split()), " ".join(office.lower().split()),
                " ".join(context.lower().split()), settings]
    digest = hashlib.sha256(json.dumps(identity, sort_keys=True).encode()).hexdigest()
    return directory / f"{digest}.json"


def read_cache(path: Path, ttl_hours: float) -> CandidateProfile | None:
    try:
        profile = CandidateProfile.model_validate_json(path.read_text(encoding="utf-8"))
        age = utc_now() - profile.collected_at
        if timedelta(0) <= age < timedelta(hours=ttl_hours) and any(s.findings for s in profile.sources):
            return profile
    except (OSError, ValueError, TypeError):
        pass
    return None


def write_cache(path: Path, profile: CandidateProfile) -> None:
    if any(s.findings for s in profile.sources):
        path.parent.mkdir(parents=True, exist_ok=True)
        atomic_json(path, profile.model_dump(mode='json'))
