"""Strict HTTP input/output schemas. Validation responses never echo field values."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, StrictInt, StrictStr, field_validator

Algorithm = Literal["sha256", "pbkdf2_sha256", "bcrypt", "argon2id"]


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True, str_strip_whitespace=False)


class PasswordRequest(StrictModel):
    password: StrictStr = Field(min_length=1, max_length=1024)

    @field_validator("password")
    @classmethod
    def require_valid_utf8(cls, value: str) -> str:
        try:
            value.encode("utf-8")
        except UnicodeEncodeError as exc:
            raise ValueError("Password must contain valid Unicode scalar values.") from exc
        return value


class HashRequest(PasswordRequest):
    algorithm: Algorithm
    iterations: StrictInt | None = Field(default=None, ge=600_000, le=1_200_000)
    work_factor: StrictInt | None = Field(default=None, ge=10, le=14)
    memory_kib: StrictInt | None = Field(default=None, ge=19_456, le=65_536)
    time_cost: StrictInt | None = Field(default=None, ge=2, le=4)
    parallelism: StrictInt | None = Field(default=None, ge=1, le=2)


class VerifyRequest(PasswordRequest):
    hash_id: StrictStr = Field(min_length=32, max_length=64, pattern=r"^[A-Za-z0-9_-]+$")


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
    max_attempts: int = Field(default=10_000, ge=1, le=10_000)
    timeout_seconds: int = Field(default=10, ge=1, le=10)
    alphabet_id: Literal["binary", "digits-small"] = "binary"
    max_length: int = Field(default=2, ge=1, le=3)
