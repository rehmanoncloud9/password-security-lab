from __future__ import annotations

import pytest

from app.crypto import hash_password, verify_password


@pytest.mark.parametrize("algorithm", ["sha256", "pbkdf2_sha256", "bcrypt", "argon2id"])
def test_verifier_accepts_correct_and_rejects_wrong_sample(algorithm: str) -> None:
    material = hash_password("synthetic-demo-sample", algorithm)
    assert verify_password("synthetic-demo-sample", algorithm, material.encoded)
    assert not verify_password("another-synthetic-sample", algorithm, material.encoded)


@pytest.mark.parametrize("algorithm", ["pbkdf2_sha256", "bcrypt", "argon2id"])
def test_adaptive_hashes_use_independent_salts_and_both_verify(algorithm: str) -> None:
    first = hash_password("same synthetic sample", algorithm)
    second = hash_password("same synthetic sample", algorithm)
    assert first.encoded != second.encoded
    assert verify_password("same synthetic sample", algorithm, first.encoded)
    assert verify_password("same synthetic sample", algorithm, second.encoded)


def test_sha256_is_deterministic_educational_baseline() -> None:
    assert (
        hash_password("synthetic", "sha256").encoded == hash_password("synthetic", "sha256").encoded
    )


def test_bcrypt_rejects_more_than_72_utf8_bytes_without_truncation() -> None:
    with pytest.raises(ValueError, match="72 UTF-8 bytes"):
        hash_password("é" * 37, "bcrypt")


def test_parameterized_pbkdf2_verifier_keeps_its_iteration_count() -> None:
    material = hash_password("synthetic", "pbkdf2_sha256", {"iterations": 600_001})
    assert material.parameters["iterations"] == 600_001
    assert verify_password("synthetic", "pbkdf2_sha256", material.encoded)


def test_costs_below_the_documented_minimum_are_rejected() -> None:
    with pytest.raises(ValueError, match="iterations"):
        hash_password("synthetic", "pbkdf2_sha256", {"iterations": 599_999})
    with pytest.raises(ValueError, match="parameters"):
        hash_password("synthetic", "argon2id", {"memoryKiB": 8192})


@pytest.mark.parametrize(
    ("algorithm", "encoded"),
    [
        ("sha256", "not-a-digest"),
        ("pbkdf2_sha256", "$psa$pbkdf2-sha256$i=1$YWJj$YWJj"),
        ("bcrypt", "$2b$04$invalid"),
        ("argon2id", "$argon2id$v=19$m=8,t=1,p=1$c2FsdA$YWJj"),
    ],
)
def test_malformed_or_unsafe_verifier_is_rejected(algorithm: str, encoded: str) -> None:
    with pytest.raises(ValueError):
        verify_password("synthetic", algorithm, encoded)
