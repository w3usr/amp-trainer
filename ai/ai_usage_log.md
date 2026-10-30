# AI Usage Log: W3USR Amplifier Trainer

A project of the University of Scranton Amateur Radio Club (W3USR).

This log records every substantive AI-assisted session for the W3USR Amplifier Trainer
(`w3usr/amp-trainer`, named `w3usr_amp_trainer` until 2026-10-30).

Required by the University of Scranton AI Policy, the HamSCI Generative AI Use Agreement,
NASA and NSF guidance on generative AI in funded research, and the expectations of any future funder.
See `.claude/rules/ai-governance.md`.

Entries are appended newest at the bottom, and the `/commit` command writes them for you.

---

## Entry format

```
## [YYYY-MM-DD HH:MM TZ]
- **Tool**: Claude (Anthropic), <exact-model-id>
- **Session Purpose**: What this session set out to do
- **Sections/Files Affected**: The specific files or documents touched
- **Nature of Contribution**: Draft / Edit / Analysis / Code generation / Research / Scaffolding
- **Human Review Status**: Reviewed and verified / Partially reviewed / Pending review
- **Git Hash**: Filled in after committing
```

Date and time come from the system clock via `date`, never from an estimate. The Tool field
carries the actual running model ID.

---

<!-- Append new entries below this line, newest at the bottom. -->

## [2026-10-30 03:19 UTC]
- **Tool**: Claude (Anthropic), claude-opus-5-5 (1M context)
- **Session Purpose**: Create the w3usr_amp_trainer repository for an ACOM 1010 amplifier
  training simulator, instantiate it from the W3USR template, and draft its requirements from
  the ACOM 1010 manual, the tube datasheet, and the W3USR front-panel photo.
- **Sections/Files Affected**: `CLAUDE.md` (placeholders filled; visibility PRIVATE; structure;
  project constraints), `.claude/rules/ai-governance.md` (§5 unfunded, §7 points to the new rule),
  `.claude/rules/simulator-fidelity.md` (new), `docs/REQUIREMENTS.md` (new, draft),
  `README.md` (rewritten), `NOTICE` (all rights reserved), `LICENSE` and
  `.claude/rules/latex-writing.md` (removed), `.claude/template.json` (project record),
  `ai/ai_usage_log.md` (reset), `.gitmodules` and `w3usr_antennas` (submodule added at 0def907).
  Repository created on GitHub as w3usr/w3usr_amp_trainer (private) from the template.
- **Nature of Contribution**: Scaffolding and draft. Panel, tuning, protection and rating facts
  were taken from the text of the ACOM 1010 manual (July 2023) and the Svetlana 4CX800A datasheet,
  and the dial scales and band positions from the W3USR front-panel photo, not from memory. The
  hosting options draw on w3usr.org-PRIVATE/deploy/README.md and ARCOps docs/REQUIREMENTS.md.
- **Human Review Status**: Pending review
- **Git Hash**: 4841053 (PR w3usr/w3usr_amp_trainer#1)

## [2026-10-30 22:50 UTC]
- **Tool**: Claude (Anthropic), claude-opus-5-5
- **Session Purpose**: Prepare the trainer for public release on GitHub Pages: rename the repository
  to amp-trainer, drop the private w3usr_antennas submodule, license the work (MIT software,
  CC BY 4.0 documentation), and commit the working prototype with a test-and-publish workflow.
- **Sections/Files Affected**: LICENSE, LICENSE-docs.md, NOTICE (new licensing and exceptions);
  CLAUDE.md (visibility PUBLIC, what stays out, layout); README.md; docs/REQUIREMENTS.md (sources,
  FR-21, data inventory, §10 decision, §11); .claude/rules/simulator-fidelity.md; .gitignore;
  ai/ai_usage_log.md header; .gitmodules and w3usr_antennas removed; new app/page.html,
  model/model.js, model/test.js, scripts/build.mjs, .github/workflows/pages.yml. Repository
  renamed on GitHub from w3usr_amp_trainer to amp-trainer.
- **Nature of Contribution**: Code generation (simulator model, UI, tests, build, CI workflow);
  edit (licensing, visibility and requirements documents)
- **Human Review Status**: Pending review (the visibility, URL and license decisions are
  W2NAF's; the prototype was exercised by W2NAF on a phone in published versions 1 to 7)
- **Git Hash**: e25d427 (PR w3usr/amp-trainer#2)
