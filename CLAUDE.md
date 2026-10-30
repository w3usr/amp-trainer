# W3USR Amplifier Trainer

A project of the **University of Scranton Amateur Radio Club (W3USR)**.

New to this club's repositories? Read [`docs/ONBOARDING.md`](docs/ONBOARDING.md) first.

## Project Overview
An interactive training application for the station's **ACOM 1010** HF linear amplifier. It is a
web app that runs in a phone or desktop browser. It simulates the amplifier's front panel and its
behavior into the station's actual antennas. It teaches students to tune it and to change bands
safely, and explains the tube and output-network theory behind each knob as they turn it. It
tests students before their supervised check-out on the real amplifier and runs timed band-change
challenges in which only a safe, correct run counts. It is the companion to the club's ACOM 1010
briefing (in the private `w3usr_antennas` repository, `docs/presentations/acom1010_talk/`).

**Live site**: https://w3usr.github.io/amp-trainer/ (GitHub Pages, built from `main`)

**Project type**: Software build (web application)
**Project lead**: Nathaniel A. Frissell, W2NAF
**Faculty advisor**: Nathaniel A. Frissell, W2NAF
**Club license trustee**: Nathaniel A. Frissell, W2NAF
**Other contributors**: TBD
**Funder**: Unfunded / club-internal
**Project period**: 2026-10-30 to TBD

## Project Goal
A student who completes the trainer can tune the ACOM 1010 on every band and antenna the station
uses and recognize and respond to each protection condition. That student is ready for a short
supervised check-out on the real amplifier. The simulator's tuning behavior matches the real
amplifier, as measured on the W3USR installation.

The requirements are in [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md).

## Repository Visibility

**This repository is: PUBLIC**, decided by Nathaniel A. Frissell, W2NAF, on 2026-10-30
(it was private from creation earlier that day until then).
**Reason**: The trainer is meant to be shared, with students on their own phones and with other
clubs, and it is served free from GitHub Pages. Code is MIT-licensed and documentation CC BY 4.0
(`LICENSE`, `LICENSE-docs.md`, `NOTICE`).

**What stays out of this repository.** Anything the club has no right to redistribute: the
ACOM 1010 manual, tube datasheets, vendor or partner documents and correspondence. Those live
in the private `w3usr_antennas` repository, which this one does not include as a submodule,
because a public repository cannot usefully point at a private one. Cite them by section
instead; short quotations and the handful of manual values the model needs (such as Table 4-1)
are fine, credited in `NOTICE`. The club's own measurements, such as antenna sweeps, may be
committed here.

This template sets no default. Decide deliberately at instantiation and record the decision
above, because the answer changes what may be committed.

| Choose **public** when | Choose **private** when |
|---|---|
| The work is meant to be shared: club website source, station how-to guides, outreach material, open-source tools | The repo holds unpublished research data, an in-progress grant application, or draft material the club is not ready to stand behind |
| Other clubs or HamSCI could reuse it | It must hold the keys, tokens, or host details a deploy or development setup needs |
| It is a build log or design the club wants to publish | Member contact information beyond a callsign is unavoidable in the work |

**Never commit, at any visibility:**
- Student records, grades, rosters tied to student IDs, or anything else covered by FERPA
- Member home addresses, phone numbers, personal email addresses, or dates of birth
- **Personal credentials**: anyone's university login, personal account password, or personal
  API key. A person's credential is theirs, and it opens doors well beyond this project.
- Photographs of identifiable people without their permission

**Never commit to a public repository:**
- Credentials, keys, tokens, or access information of any kind
- Building access details, alarm codes, or rooftop and tower access procedures

**A private repository may hold the access information a project needs to deploy and
develop**, where that has been carefully and deliberately decided. Deploy keys, service
tokens, host names and paths, and a `.env` for a staging environment are legitimate contents
of a private orchestrator repository, and pretending otherwise pushes them somewhere worse.

Carefully and deliberately means:

- **The project lead and a W3USR faculty advisor decide together, in advance.** A member does
  not add a credential on their own judgement mid-task.
- **The credential belongs to the project.** A deploy key or service account scoped to one
  target, never a person's own login.
- **Scope it to what the deploy needs** and no further. A key that can push to one host beats
  one that can administer the account.
- **Record what is in there**, in the repository, so the next person can find every credential
  when it is time to rotate them.
- **Rotate on turnover.** Members graduate. Rotate when someone with access leaves the
  project, and on any suspicion of exposure.
- **The repository stays private until you rotate.** Git history keeps a committed secret
  after the file is deleted, so this repository cannot simply be flipped to public later:
  rotate everything first, then flip.

Callsigns and names are public information in the FCC ULS database, so publishing a callsign
is fine. Aggregating a member's callsign with their address, schedule, or dorm is not.

## Repository Structure

Instantiated from the W3USR `ai_project_template` scaffold. Current layout:

```
amp-trainer/
|-- CLAUDE.md
|-- README.md
|-- LICENSE                       <- MIT, for the software
|-- LICENSE-docs.md               <- CC BY 4.0, for the documentation
|-- NOTICE                        <- copyright and what neither license covers
|-- .gitignore
|-- .github/workflows/pages.yml   <- tests the model, builds the page, publishes to Pages from main
|-- app/page.html                 <- the trainer's page; the model is inlined at /*MODEL*/
|-- model/
|   |-- model.js                  <- physics model and simulator state; every value sourced
|   `-- test.js                   <- acceptance cases from docs/REQUIREMENTS.md §6
|-- scripts/build.mjs             <- builds dist/index.html (gitignored)
|-- .claude/
|   |-- settings.json             <- registers the session-start template check
|   |-- template.json             <- which template commit was last adopted
|   |-- commands/                 <- /commit and /template-sync workflows
|   |-- hooks/template_check.sh
|   `-- rules/
|       |-- ai-governance.md          <- always applies
|       |-- simulator-fidelity.md     <- this project's constraints; always applies
|       |-- web-development.md
|       `-- python-code.md            <- for calibration and data tooling
|-- ai/
|   `-- ai_usage_log.md           <- mandatory AI session log
|-- docs/
|   |-- ONBOARDING.md             <- read this first
|   |-- REQUIREMENTS.md           <- what the trainer must do; start here
|   `-- ai_policy_agreement/      <- sign before using AI tools
```

The prototype is plain JavaScript in one page, with no dependencies, so it builds with Node alone.
`docs/REQUIREMENTS.md` §9 proposes TypeScript and Vite for later phases. Calibration data and
antenna sweeps go under `data/` when they exist.
```

## Curated Documents

**Commit the curated, human-readable record.** Memos, notes, reports, posters, newsletters, slides and other curated write-ups are
committed as PDFs next to their source (LaTeX or Markdown), rebuilt in the same commit so the two
never disagree. They show what was concluded without anyone having to rebuild anything, and the
commit history becomes a readable record of what was done. Figures a memo or paper includes are
committed with that document. The rule is about curated documents, not bulk output: batches of
generated figures, per-event plot sets, galleries and image compilations stay out of git and are
regenerated by committed scripts. Also out: LaTeX intermediates (`.aux`, `.log`, `.bbl` and the
like), caches, scratch output, and raw data. A curated PDF over 50 MB needs a decision first.

## Git Workflow

Every change goes through a pull request, in this repo and in every submodule. Nothing is
committed directly to `main`.

1. Branch from the remote tip: `git fetch && git switch -c <topic> origin/main`.
2. Commit on the branch, with the `[AI-assisted]` prefix where applicable.
3. Push the branch and open a PR: `git push -u origin <topic>`, then `gh pr create`.
4. The project lead reviews and merges. Claude never pushes `main` and never merges.

Once you have approved a commit, pushing its feature branch and opening or updating its PR is
standing permission. Ask the project lead before any other push. Never force-push or hard-reset.

## Submodules (optional)

If the project includes a submodule (an Overleaf document, the club website repo, a separate
code repo):

1. Make changes and commit **inside** the submodule first, on its own branch and PR.
2. Bump the submodule pointer in this repo only after the submodule PR has merged. Never point
   this repo at an unmerged branch commit.
3. Push the submodule **before** pushing this repo. A parent pushed ahead of its submodule
   works on your laptop and breaks for everyone who clones it.
4. Use the `[AI-assisted]` prefix on commits whose content was produced with AI assistance.
5. A repo whose remote cannot host a PR (Overleaf, say) is outside the PR rule; ask the
   project lead before changing one.

The `/commit` workflow auto-detects submodules via `git submodule status`.

## Template Updates

This repository follows an `ai_project_template`; `.claude/template.json` records which one and
which of its commits was last adopted. A session-start hook (`.claude/hooks/template_check.sh`,
registered in `.claude/settings.json`) checks that template at most once a day and, if it has
moved on, says so at the start of the session. When it does, tell the user and offer
`/template-sync`, which applies the template's changes **as changes**, on a branch and through a
PR, without overwriting project-specific content. The check is read-only and silent when offline.

A workflow improvement made here that other projects would want belongs upstream too: propose it
to the template in the same session.

## AI Governance

All AI-assisted work on this project must comply with `.claude/rules/ai-governance.md`.

**Before any of it: sign the Generative AI Use Agreement in `docs/ai_policy_agreement/`.**
Members who have not signed it do not run AI-assisted work on this project.

One thing is non-negotiable: **every substantive AI session is logged in
`ai/ai_usage_log.md` before the work is committed.** Use the `/commit` command, which does the
logging and committing in the right order.

This project's own constraints are in `.claude/rules/simulator-fidelity.md`. In short:
- **No fabricated physics.** Every physical value in the simulator carries its source
  (manual, datasheet, a measurement on the W3USR station), or is marked as a placeholder. Uncalibrated
  values are allowed, and so are placeholder values, but neither may be presented as real.
- **The manual governs procedure.** Training content never teaches a step that contradicts the
  ACOM 1010 manual.
- **The simulator does not authorize operation.** Passing it makes a student eligible for a
  supervised check-out on the real amplifier, and nothing more.

## Getting Help

- Club questions, station access, on-air activity: Nathaniel A. Frissell, W2NAF
- This repository: Nathaniel A. Frissell, W2NAF
