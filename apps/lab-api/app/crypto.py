"""Cryptographic demonstration primitives backed by Python and vetted libraries."""

from __future__ import annotations

import base64
import hashlib
import hmac
import secrets
import threading
import time
from dataclasses import dataclass

import bcrypt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError

ALGORITHMS = {"sha256", "pbkdf2_sha256", "bcrypt", "argon2id"}
PBKDF2_ITERATIONS = 600_000
ARGON2_MEMORY_KIB = 19_456
ARGON2_TIME_COST = 2
ARGON2_PARALLELISM = 1
BCRYPT_COST = 10
SALT_BYTES = 16
MAX_PASSWORD_UTF8_BYTES = 4096
KDF_SLOTS = threading.BoundedSemaphore(2)


class ResourceBusyError(RuntimeError):
    """The fixed number of concurrent expensive KDF operations is occupied."""


_argon = PasswordHasher(
    time_cost=ARGON2_TIME_COST,
    memory_cost=ARGON2_MEMORY_KIB,
    parallelism=ARGON2_PARALLELISM,
    salt_len=SALT_BYTES,
    hash_len=32,
)


@dataclass(frozen=True)
class HashMaterial:
    algorithm: str
    encoded: str
    parameters: dict[str, int]
    salt_display: str
    elapsed_ms: float


def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("ascii").rstrip("=")


def _unb64(data: str) -> bytes:
    return base64.urlsafe_b64decode(data + "=" * (-len(data) % 4))


def _hash_password(
    password: str, algorithm: str, requested: dict[str, int] | None = None
) -> HashMaterial:
    """Create a verifier; reject unsupported algorithms and bcrypt overflow."""
    if algorithm not in ALGORITHMS:
        raise ValueError("Unsupported algorithm")
    requested = requested or {}
    allowed_options = {
        "sha256": set(),
        "pbkdf2_sha256": {"iterations"},
        "bcrypt": {"workFactor"},
        "argon2id": {"memoryKiB", "timeCost", "parallelism"},
    }[algorithm]
    if set(requested) - allowed_options:
        raise ValueError("A hashing parameter does not apply to the selected algorithm")
    password_bytes = password.encode("utf-8")
    if len(password_bytes) > MAX_PASSWORD_UTF8_BYTES:
        raise ValueError("Input exceeds the lab byte limit")
    if algorithm == "bcrypt" and len(password_bytes) > 72:
        raise ValueError("bcrypt accepts at most 72 UTF-8 bytes; input was not truncated")

    started = time.perf_counter_ns()
    if algorithm == "sha256":
        encoded = hashlib.sha256(password_bytes).hexdigest()
        params: dict[str, int] = {}
        salt_display = "None (deliberately unsalted baseline)"
    elif algorithm == "pbkdf2_sha256":
        iterations = requested.get("iterations", PBKDF2_ITERATIONS)
        if not PBKDF2_ITERATIONS <= iterations <= 1_200_000:
            raise ValueError("PBKDF2 iterations must be between 600000 and 1200000")
        salt = secrets.token_bytes(SALT_BYTES)
        derived = hashlib.pbkdf2_hmac("sha256", password_bytes, salt, iterations, 32)
        encoded = f"$psa$pbkdf2-sha256$i={iterations}${_b64(salt)}${_b64(derived)}"
        params = {"iterations": iterations, "saltBytes": SALT_BYTES, "derivedBytes": 32}
        salt_display = _b64(salt)
    elif algorithm == "bcrypt":
        work_factor = requested.get("workFactor", BCRYPT_COST)
        if not 10 <= work_factor <= 14:
            raise ValueError("bcrypt work factor must be between 10 and 14")
        encoded_bytes = bcrypt.hashpw(password_bytes, bcrypt.gensalt(rounds=work_factor))
        encoded = encoded_bytes.decode("ascii")
        params = {"cost": work_factor, "maxInputBytes": 72}
        salt_display = "Embedded in bcrypt verifier"
    else:
        memory_kib = requested.get("memoryKiB", ARGON2_MEMORY_KIB)
        time_cost = requested.get("timeCost", ARGON2_TIME_COST)
        parallelism = requested.get("parallelism", ARGON2_PARALLELISM)
        if (
            not 19_456 <= memory_kib <= 65_536
            or not 2 <= time_cost <= 4
            or not 1 <= parallelism <= 2
        ):
            raise ValueError("Argon2id parameters are outside the allowed range")
        hasher = PasswordHasher(
            time_cost=time_cost,
            memory_cost=memory_kib,
            parallelism=parallelism,
            salt_len=SALT_BYTES,
            hash_len=32,
        )
        encoded = hasher.hash(password)
        salt_display = "Embedded in Argon2id verifier"
        params = {
            "memoryKiB": memory_kib,
            "iterations": time_cost,
            "parallelism": parallelism,
            "saltBytes": SALT_BYTES,
        }
    elapsed = (time.perf_counter_ns() - started) / 1_000_000
    return HashMaterial(algorithm, encoded, params, salt_display, elapsed)


def hash_password(
    password: str, algorithm: str, requested: dict[str, int] | None = None
) -> HashMaterial:
    if not KDF_SLOTS.acquire(timeout=0.25):
        raise ResourceBusyError("The local lab is busy; retry after the active operation finishes.")
    try:
        return _hash_password(password, algorithm, requested)
    finally:
        KDF_SLOTS.release()


def verify_password(password: str, algorithm: str, encoded: str) -> bool:
    if not KDF_SLOTS.acquire(timeout=0.25):
        raise ResourceBusyError("The local lab is busy; retry after the active operation finishes.")
    try:
        return _verify_password(password, algorithm, encoded)
    finally:
        KDF_SLOTS.release()


def _verify_password(password: str, algorithm: str, encoded: str) -> bool:
    """Verify only known PSA formats; validate encoded costs before expensive work."""
    password_bytes = password.encode("utf-8")
    if len(password_bytes) > MAX_PASSWORD_UTF8_BYTES:
        raise ValueError("Input exceeds the lab byte limit")
    try:
        if algorithm == "sha256":
            if len(encoded) != 64 or any(c not in "0123456789abcdef" for c in encoded):
                raise ValueError("Malformed SHA-256 verifier")
            actual = hashlib.sha256(password_bytes).hexdigest()
            return hmac.compare_digest(actual, encoded)
        if algorithm == "pbkdf2_sha256":
            parts = encoded.split("$")
            if len(parts) != 6 or parts[1:3] != ["psa", "pbkdf2-sha256"]:
                raise ValueError("Malformed PBKDF2 verifier")
            iterations = int(parts[3].removeprefix("i="))
            if not PBKDF2_ITERATIONS <= iterations <= 1_200_000:
                raise ValueError("PBKDF2 cost is outside the allowed range")
            salt, expected = _unb64(parts[4]), _unb64(parts[5])
            if not 16 <= len(salt) <= 32 or len(expected) != 32:
                raise ValueError("Malformed PBKDF2 verifier")
            actual = hashlib.pbkdf2_hmac("sha256", password_bytes, salt, iterations, 32)
            return hmac.compare_digest(actual, expected)
        if algorithm == "bcrypt":
            if len(password_bytes) > 72:
                raise ValueError("bcrypt accepts at most 72 UTF-8 bytes; input was not truncated")
            cost = int(encoded.split("$")[2])
            if not 10 <= cost <= 14:
                raise ValueError("bcrypt cost is outside the allowed range")
            return bcrypt.checkpw(password_bytes, encoded.encode("ascii"))
        if algorithm == "argon2id":
            parts = encoded.split("$")
            if len(parts) != 6 or parts[1] != "argon2id" or parts[2] != "v=19":
                raise ValueError("Malformed Argon2id verifier")
            costs = dict(item.split("=") for item in parts[3].split(","))
            memory, iterations, parallelism = int(costs["m"]), int(costs["t"]), int(costs["p"])
            if not (19_456 <= memory <= 65_536 and 2 <= iterations <= 4 and 1 <= parallelism <= 2):
                raise ValueError("Argon2id cost is outside the allowed range")
            return _argon.verify(encoded, password)
    except VerifyMismatchError:
        return False
    except (
        InvalidHashError,
        VerificationError,
        ValueError,
        KeyError,
        IndexError,
        TypeError,
    ) as exc:
        if isinstance(exc, ValueError) and str(exc) not in {""}:
            raise
        raise ValueError("Malformed stored verifier") from None
    raise ValueError("Unsupported algorithm")
