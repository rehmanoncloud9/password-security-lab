"""Server-owned synthetic fixture registry for Research Lab demonstrations."""

from __future__ import annotations

from typing import Literal, TypedDict

FixtureId = Literal[
    "fixture-alpha-baseline",
    "fixture-beta-structured",
    "fixture-gamma-compact",
]

CandidateVariant = Literal["correct", "wrong", "modified"]


class SyntheticFixture(TypedDict):
    id: FixtureId
    label: str
    description: str
    candidate: str
    variants: dict[CandidateVariant, str]


SYNTHETIC_FIXTURES: dict[FixtureId, SyntheticFixture] = {
    "fixture-alpha-baseline": {
        "id": "fixture-alpha-baseline",
        "label": "Synthetic Multi-Word: 'correct-horse-battery'",
        "description": "Standard synthetic multi-word teaching fixture.",
        "candidate": "correct-horse-battery",
        "variants": {
            "correct": "correct-horse-battery",
            "wrong": "incorrect-horse-battery",
            "modified": "correct-horse-battery-1",
        },
    },
    "fixture-beta-structured": {
        "id": "fixture-beta-structured",
        "label": "Synthetic Structured: 'BlueMeadow#2026'",
        "description": "Synthetic mixed case, symbol, and year suffix fixture.",
        "candidate": "BlueMeadow#2026",
        "variants": {
            "correct": "BlueMeadow#2026",
            "wrong": "BlueMeadow#2025",
            "modified": "bluemeadow#2026",
        },
    },
    "fixture-gamma-compact": {
        "id": "fixture-gamma-compact",
        "label": "Synthetic Compact: 'k9#vQ2!mZ'",
        "description": "Synthetic high-entropy 9-character alphanumeric fixture.",
        "candidate": "k9#vQ2!mZ",
        "variants": {
            "correct": "k9#vQ2!mZ",
            "wrong": "k9#vQ2!mX",
            "modified": "K9#vQ2!mZ",
        },
    },
}


def get_fixture(fixture_id: str) -> SyntheticFixture:
    if fixture_id not in SYNTHETIC_FIXTURES:
        raise ValueError(f"Unknown fixture_id: '{fixture_id}'")
    return SYNTHETIC_FIXTURES[fixture_id]  # type: ignore[return-value]


def get_variant_candidate(fixture_id: str, variant: CandidateVariant) -> str:
    fixture = get_fixture(fixture_id)
    if variant not in fixture["variants"]:
        raise ValueError(f"Unknown candidate variant: '{variant}'")
    return fixture["variants"][variant]
