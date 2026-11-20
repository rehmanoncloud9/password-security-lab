"""Strict HTTP input/output schemas. Validation responses never echo field values.

The Research Lab API strictly operates on server-owned synthetic fixtures.
No endpoint accepts free-form user password strings.
"""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, StrictInt, StrictStr

from .fixtures import CandidateVariant, FixtureId

Algorithm = Literal["sha256", "pbkdf2_sha256", "bcrypt", "argon2id"]


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True, str_strip_whitespace=False)


class FixtureResponse(BaseModel):
    fixture_id: str = Field(alias="fixtureId")
    label: str
    description: str
    candidate_preview: str = Field(alias="candidatePreview")
    available_variants: list[str] = Field(alias="availableVariants")


class HashRequest(StrictModel):
    fixture_id: FixtureId = Field(
        default="fixture-alpha-baseline",
        description="Synthetic fixture ID. User passwords are not accepted.",
    )
    algorithm: Algorithm
    iterations: StrictInt | None = Field(default=None, ge=600_000, le=1_200_000)
    work_factor: StrictInt | None = Field(default=None, ge=10, le=14)
    memory_kib: StrictInt | None = Field(default=None, ge=19_456, le=65_536)
    time_cost: StrictInt | None = Field(default=None, ge=2, le=4)
    parallelism: StrictInt | None = Field(default=None, ge=1, le=2)


class HashResponse(BaseModel):
    hash_id: str = Field(alias="hashId")
    algorithm: str
    stored_hash: str = Field(alias="storedHash")
    parameters: dict[str, Any]
    salt: str
    generation_ms: float = Field(alias="generationMs")
    expires_in_seconds: int = Field(alias="expiresInSeconds")
    fixture_id: str = Field(alias="fixtureId")


class VerifyRequest(StrictModel):
    hash_id: StrictStr = Field(min_length=32, max_length=64, pattern=r"^[A-Za-z0-9_-]+$")
    candidate_variant: CandidateVariant = Field(
        default="correct",
        description="Candidate variant to test: 'correct', 'wrong', or 'modified'.",
    )


class VerifyResponse(BaseModel):
    matched: bool
    algorithm: str
    verification_ms: float = Field(alias="verificationMs")
    candidate_variant: str = Field(alias="candidateVariant")
    fixture_id: str = Field(alias="fixtureId")


class AttackRequest(StrictModel):
    experiment: Literal[
        "dictionary",
        "bruteforce",
        "pattern",
        "suffix",
        "substitution",
        "word_combination",
    ]
    target_id: Literal[
        "dictionary-first",
        "dictionary-last",
        "bruteforce-two",
        "pattern-date",
        "suffix-year",
        "substitution-basic",
        "word-combination-two",
    ]
    algorithm: Algorithm
    max_attempts: StrictInt = Field(default=10_000, ge=1, le=10_000)
    timeout_seconds: StrictInt = Field(default=10, ge=1, le=10)
    alphabet_id: Literal["binary", "digits-small"] = "binary"
    max_length: StrictInt = Field(default=2, ge=1, le=4)


class BenchmarkRequest(StrictModel):
    repetitions: StrictInt | None = Field(default=5, ge=3, le=20)
