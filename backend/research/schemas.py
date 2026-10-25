"""Validated output contracts for the single-candidate researcher."""
from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator, model_validator
from policy_taxonomy import CATEGORIES, map_category


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Finding(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    policy_issue: str = Field(min_length=1, max_length=120)
    category: str
    attributed_candidate: str | None = None
    neutral_summary: str = Field(min_length=1, max_length=600)
    supporting_quote: str = Field(min_length=20, max_length=1200)

    @model_validator(mode='before')
    @classmethod
    def legacy_category(cls, value):
        if isinstance(value, dict) and 'category' not in value:
            value = {**value, 'category': map_category(value.get('policy_issue', ''))}
        return value

    @field_validator('category')
    @classmethod
    def fixed_category(cls, value):
        if value not in CATEGORIES:
            raise ValueError('Unknown policy category')
        return value


class ModelFindings(BaseModel):
    model_config = ConfigDict(extra="forbid")
    findings: list[Finding]


class SourcedFinding(Finding):
    source_url: HttpUrl
    collected_at: datetime


class SourceResult(BaseModel):
    model_config = ConfigDict(validate_assignment=True)
    source_url: HttpUrl
    final_url: HttpUrl | None = None
    collected_at: datetime = Field(default_factory=utc_now)
    status: Literal["ok", "partial", "source_unavailable"] = "source_unavailable"
    error: str | None = None
    retrieved_text: str = ""
    analyzed_text: str = ""
    input_truncated: bool = False
    rejected_findings: int = 0
    findings: list[SourcedFinding] = Field(default_factory=list)
    raw_findings: list[dict] = Field(default_factory=list)
    completed_chunks: list[int] = Field(default_factory=list)
    identity_verified: bool = False
    research_diagnostics: dict = Field(default_factory=dict)
    biography_extractions: list[dict] | None = None


class PolicyEvidence(BaseModel):
    source_url: HttpUrl
    collected_at: datetime
    supporting_quote: str
    context: str
    policy_issue: str
    neutral_summary: str


class GroupedFinding(BaseModel):
    category: str
    policy_issue: str
    neutral_summary: str
    evidence: list[PolicyEvidence]


class ProfileSummary(BaseModel):
    summary: str | None = None
    sources: list[HttpUrl] = Field(default_factory=list)


class ConsolidatedProfile(BaseModel):
    synthesis_version: int = 0
    diagnostics: dict[str, dict] = Field(default_factory=dict)
    biography: ProfileSummary = Field(default_factory=ProfileSummary)
    issues: dict[str, ProfileSummary] = Field(default_factory=lambda: {c: ProfileSummary() for c in CATEGORIES})


class CandidateProfile(BaseModel):
    candidate_name: str
    office: str
    election_context: str = "Florida 2026 general election"
    provider: str = "ollama"
    model: str = "gemma3:4b"
    limitations: list[str] = Field(default_factory=list)
    state: Literal["FL"] = "FL"
    collected_at: datetime = Field(default_factory=utc_now)
    status: Literal["ok", "partial", "source_unavailable"]
    sources: list[SourceResult]
    policy_categories: dict[str, list[GroupedFinding]] = Field(default_factory=lambda: {c: [] for c in CATEGORIES})
    profile: ConsolidatedProfile = Field(default_factory=ConsolidatedProfile)
