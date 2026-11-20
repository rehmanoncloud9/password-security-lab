from __future__ import annotations

import hashlib

import pytest
from argon2 import PasswordHasher

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


# --- Known Answer Tests (KATs) ---


def test_nist_sha256_known_answer_vectors() -> None:
    """Published test vectors from NIST FIPS 180-4 / CAVP for SHA-256."""
    # Vector 1: empty string
    empty_digest = hashlib.sha256(b"").hexdigest()
    assert empty_digest == "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    assert verify_password("", "sha256", empty_digest)

    # Vector 2: "abc"
    abc_digest = hashlib.sha256(b"abc").hexdigest()
    assert abc_digest == "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    assert verify_password("abc", "sha256", abc_digest)


def test_rfc6070_pbkdf2_known_answer_vectors() -> None:
    """Published test vectors from RFC 6070 / RFC 7914 for PBKDF2-HMAC-SHA256."""
    password = b"password"
    salt = b"salt"
    # Vector: iterations = 1, length = 32
    derived_1 = hashlib.pbkdf2_hmac("sha256", password, salt, 1, 32).hex()
    assert derived_1 == "120fb6cffcf8b32c43e7225256c4f837a86548c92ccc35480805987cb70be17b"

    # Vector: iterations = 2, length = 32
    derived_2 = hashlib.pbkdf2_hmac("sha256", password, salt, 2, 32).hex()
    assert derived_2 == "ae4d0c95af6b46d32d0adff928f06dd02a303f8ef3c251dfd6e2d85a95474c43"

    # Vector: iterations = 4096, length = 32
    derived_4096 = hashlib.pbkdf2_hmac("sha256", password, salt, 4096, 32).hex()
    assert derived_4096 == "c5e478d59288c841aa530db6845c4c8d962893a001ce4e11a4963873aa98134a"


def test_argon2id_non_default_parameters_verification() -> None:
    """Verify that PasswordHasher.verify correctly handles non-default parameters within bounds."""
    # Generate an Argon2id hash with non-default memory (32 MiB) and time_cost (3)
    hasher_custom = PasswordHasher(
        time_cost=3, memory_cost=32_768, parallelism=1, salt_len=16, hash_len=32
    )
    custom_hash = hasher_custom.hash("synthetic-sample-non-default")

    # verify_password must successfully verify it without re-instantiation error
    assert verify_password("synthetic-sample-non-default", "argon2id", custom_hash)
    assert not verify_password("wrong-password", "argon2id", custom_hash)


def test_bcrypt_72_byte_utf8_boundary() -> None:
    """bcrypt accepts <= 72 UTF-8 bytes and strictly rejects 73+ bytes."""
    # Exactly 72 ASCII bytes (72 UTF-8 bytes)
    sample_72 = "a" * 72
    mat_72 = hash_password(sample_72, "bcrypt")
    assert verify_password(sample_72, "bcrypt", mat_72.encoded)

    # 73 ASCII bytes: must raise ValueError
    sample_73 = "a" * 73
    with pytest.raises(ValueError, match="72 UTF-8 bytes"):
        hash_password(sample_73, "bcrypt")

    # Multi-byte UTF-8: 36 characters of 'é' (2 bytes each = 72 bytes) -> OK
    sample_multibyte_72 = "é" * 36
    mat_multi = hash_password(sample_multibyte_72, "bcrypt")
    assert verify_password(sample_multibyte_72, "bcrypt", mat_multi.encoded)

    # 37 characters of 'é' (74 bytes) -> Rejected
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
        ("pbkdf2_sha256", "$psa$v1$pbkdf2-sha256$i=1$YWJj$YWJj"),
        ("bcrypt", "$2b$04$invalid"),
        ("argon2id", "$argon2id$v=19$m=8,t=1,p=1$c2FsdA$YWJj"),
    ],
)
def test_malformed_or_unsafe_verifier_is_rejected(algorithm: str, encoded: str) -> None:
    with pytest.raises(ValueError):
        verify_password("synthetic", algorithm, encoded)
