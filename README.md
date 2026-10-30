# W3USR Amplifier Trainer

A training simulator for the **ACOM 1010** HF linear amplifier at **W3USR**, the University of
Scranton Amateur Radio Club station. It runs in a phone or desktop browser and lets students:

- **learn**: tune the amplifier into the station's real antennas, with the tube and
  output-network theory shown live as the knobs turn;
- **qualify**: pass a scenario test that makes them eligible for a supervised check-out on
  the real amplifier;
- **compete**: race band changes against the clock, where only a safe, correct run counts.

**Status:** requirements drafting. See [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md).

> The simulator is a training aid. Passing it does not authorize anyone to operate the station.

## Getting started

```bash
git clone --recurse-submodules git@github.com:w3usr/w3usr_amp_trainer.git
```

Already cloned without submodules? `git submodule update --init`

New to the club's repositories? Read [`docs/ONBOARDING.md`](docs/ONBOARDING.md), and sign the AI
use agreement in [`docs/ai_policy_agreement/`](docs/ai_policy_agreement/) before any AI-assisted
work.

## Where things are

| Path | What |
|---|---|
| [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md) | What the trainer must do, its fidelity targets, and the open decisions |
| [`w3usr_antennas/`](w3usr_antennas/) | Submodule: the station's antenna system, the ACOM 1010 manual, tube datasheets, the club briefing |
| [`.claude/rules/simulator-fidelity.md`](.claude/rules/simulator-fidelity.md) | Sourcing, calibration and safety rules for the simulator |
| [`ai/ai_usage_log.md`](ai/ai_usage_log.md) | Log of AI-assisted work on this project |

## AI assistance

This repository contains AI-assisted work, reviewed by club members; `ai/ai_usage_log.md` is
the record.
