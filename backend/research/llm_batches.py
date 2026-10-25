"""Small structured batch envelopes; IDs never cross source/section boundaries."""
from pydantic import BaseModel, ConfigDict, Field
from schemas import Finding
from biography_facts import BioFact


class DocumentExtraction(BaseModel):
    model_config = ConfigDict(extra='forbid')
    source_id: str
    findings: list[Finding]
    biography: list[BioFact] = Field(default_factory=list)


class BatchExtraction(BaseModel):
    model_config = ConfigDict(extra='forbid')
    documents: list[DocumentExtraction]


class BioDocument(BaseModel):
    model_config = ConfigDict(extra='forbid')
    source_id: str
    facts: list[BioFact]


class BatchBiography(BaseModel):
    model_config = ConfigDict(extra='forbid')
    documents: list[BioDocument]


def exact_ids(items, expected, field):
    ids = [getattr(item, field) for item in items]
    if len(ids) != len(set(ids)) or set(ids) != set(expected):
        raise ValueError('Batch omitted, repeated, or invented IDs')


def batch_enabled(client):
    # Explicit capability flag; mocks/custom/local clients keep existing behavior.
    return getattr(client, 'supports_batches', False) is True
