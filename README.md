# W3USR Amplifier Trainer

A training simulator for the **ACOM 1010** HF linear amplifier at **W3USR**, the University of
Scranton Amateur Radio Club station. It runs in a phone or desktop browser and lets students:

- **learn**: tune the amplifier into the station's real antennas, with the tube and
  output-network theory shown live as the knobs turn;
- **qualify**: pass a scenario test that makes them eligible for a supervised check-out on
  the real amplifier;
- **compete**: race band changes against the clock, where only a safe, correct run counts.

**Try it:** https://w3usr.github.io/amp-trainer/

**Status:** working prototype with an uncalibrated model; requirements in
[`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md).

> The simulator is a training aid. Passing it does not authorize anyone to operate the station.

## Getting started

```bash
git clone git@github.com:w3usr/amp-trainer.git
```

Run the model's acceptance tests and build the page (Node 18 or later, no other dependencies):

```bash
node model/test.js
node scripts/build.mjs        # writes dist/index.html; open it in a browser
```

Every merge to `main` runs the same tests and publishes the page to GitHub Pages.

New to the club's repositories? Read [`docs/ONBOARDING.md`](docs/ONBOARDING.md), and sign the AI
use agreement in [`docs/ai_policy_agreement/`](docs/ai_policy_agreement/) before any AI-assisted
work.

## Where things are

| Path | What |
|---|---|
| [`app/page.html`](app/page.html) | The trainer's page: front panel, transceiver, procedure, theory views |
| [`model/`](model/) | The physics model with every value's source, and its acceptance tests |
| [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md) | What the trainer must do, its fidelity targets, and the open decisions |
| [`.claude/rules/simulator-fidelity.md`](.claude/rules/simulator-fidelity.md) | Sourcing, calibration and safety rules for the simulator |
| [`ai/ai_usage_log.md`](ai/ai_usage_log.md) | Log of AI-assisted work on this project |

## AI assistance

This repository contains AI-assisted work, written with Claude (Anthropic) and reviewed by
Nathaniel A. Frissell, W2NAF. [`ai/ai_usage_log.md`](ai/ai_usage_log.md) records each session.

## License

Software: [MIT](LICENSE). Documentation: [CC BY 4.0](LICENSE-docs.md). ACOM 1010 manual values
and tube data remain their publishers'; see [`NOTICE`](NOTICE). ACOM is not affiliated with this
project.
