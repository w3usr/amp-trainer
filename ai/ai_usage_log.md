# AI Usage Log: {{PROJECT_NAME}}

A project of the University of Scranton Amateur Radio Club (W3USR).

This log records every substantive AI-assisted session for "{{PROJECT_TITLE}}".

Required by the University of Scranton AI Policy, the HamSCI Generative AI Use Agreement,
NASA and NSF guidance on generative AI in funded research, and {{FUNDER}} expectations.
See `.claude/rules/ai-governance.md`.

**At instantiation:** replace the placeholders above and delete every entry below the
append marker, including the example and any entries inherited from the template repository.
This log records *this* project's sessions. Entries are appended newest at the bottom, and the
`/commit` command writes them for you.

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

## [EXAMPLE: delete this entry] [2026-09-01 19:04 EDT]
- **Tool**: Claude (Anthropic), claude-opus-5
- **Session Purpose**: Draft the station setup page for the club website and verify the
  equipment list against the shack inventory sheet.
- **Sections/Files Affected**: `web/station.html`, `web/assets/station.css`
- **Nature of Contribution**: Draft and edit; equipment list verified against the inventory
  sheet by {{NAME, CALLSIGN}}
- **Human Review Status**: Reviewed and verified
- **Git Hash**: 0000000

## [2026-09-12 13:35 UTC]
- **Tool**: Claude (Anthropic), claude-opus-5
- **Session Purpose**: Fork the W2NAF academic project template into a W3USR club template:
  rewrite the scaffold so it is directly applicable to University of Scranton Amateur Radio
  Club projects, add amateur-radio operating governance and a student-facing onboarding
  guide, and repoint the repository from `w2naf-academia` to `w3usr`.
- **Sections/Files Affected**: `CLAUDE.md` (rewritten), `README.md` (rewritten),
  `.gitignore` (secrets, Node/web, bulk-data sections added),
  `ai/ai_usage_log.md` (reset as a W3USR template with a format block and example entry),
  `.claude/commands/commit.md` (added a pre-commit sensitive-material check and submodule
  push-order verification), `.claude/rules/ai-governance.md` (rewritten: FCC, ARDC, FERPA,
  coursework conflict, disclosure table), `.claude/rules/latex-writing.md` and
  `.claude/rules/python-code.md` (reworked for club use),
  `.claude/rules/amateur-radio-operations.md` (new), `.claude/rules/web-development.md` (new),
  `docs/ONBOARDING.md` (new). Git remote repointed to `git@github.com:w3usr/ai_project_template.git`.
- **Nature of Contribution**: Draft and scaffolding; policy text drafted from the prior
  template and from the applicable institutional, funder, and FCC policies
- **Human Review Status**: Pending review: the Part 97 section citations in
  `.claude/rules/amateur-radio-operations.md`, and the club roles named in `CLAUDE.md`,
  need verification by the trustee or advisor before this template is used for a real project
- **Git Hash**: f745d39

## [2026-09-12 13:38 UTC]
- **Tool**: Claude (Anthropic), claude-opus-5
- **Session Purpose**: License the template scaffold itself under CC BY 4.0, at NAF's
  direction, so other clubs may reuse it with attribution.
- **Sections/Files Affected**: `LICENSE` (new), `README.md` and `CLAUDE.md` (instantiation
  step and directory tree updated to say the license is replaced rather than added)
- **Nature of Contribution**: Scaffolding. The CC BY 4.0 legal text was retrieved verbatim
  from https://creativecommons.org/licenses/by/4.0/legalcode.txt rather than reproduced
  from memory.
- **Human Review Status**: Reviewed and verified; license choice directed by NAF
- **Git Hash**: a64c44f

## [2026-09-12 13:39 UTC]
- **Tool**: Claude (Anthropic), claude-opus-5
- **Session Purpose**: Fix license detection. GitHub reported the repository license as
  NOASSERTION because a hand-written preamble preceded the canonical CC BY 4.0 text in
  `LICENSE`, which defeats GitHub's license detection.
- **Sections/Files Affected**: `LICENSE` (reduced to the canonical CC BY 4.0 text alone),
  `NOTICE` (new, carrying the copyright line, attribution string, and the note that the
  scaffold derives from the W2NAF academic template), `README.md` and `CLAUDE.md` (file
  tables updated)
- **Nature of Contribution**: Edit
- **Human Review Status**: Reviewed and verified
- **Git Hash**: 1813961

## [2026-09-12 13:39 UTC]
- **Tool**: Claude (Anthropic), claude-opus-5
- **Session Purpose**: Punctuation sweep of the template's own files, replacing em dashes
  with the colon or semicolon that names the relationship, so the scaffold other projects
  copy is internally consistent.
- **Sections/Files Affected**: `ai/ai_usage_log.md` (title, example-entry label, two review
  status lines), `.claude/commands/commit.md` (title)
- **Nature of Contribution**: Edit
- **Human Review Status**: Reviewed and verified
- **Git Hash**: c769950

## [2026-09-12 13:58 UTC]
- **Tool**: Claude (Anthropic), claude-opus-5
- **Session Purpose**: Remove the FCC operating governance from the general template, at
  NAF's direction. Operating constraints do not apply to every club project and belong in a
  per-project rule file where they are required.
- **Sections/Files Affected**: `.claude/rules/amateur-radio-operations.md` (deleted);
  `README.md` (pitch reduced to two items, rule-file table and prune list updated,
  "Non-Negotiables" reduced to the AI log alone); `CLAUDE.md` (directory tree, AI Governance
  section reduced to the log requirement plus a placeholder for project-specific rules);
  `.claude/rules/ai-governance.md` (FCC section removed and sections renumbered, "AI Is Not
  an Author" narrowed, project-specific-constraints placeholder added);
  `docs/ONBOARDING.md` ("three things" reduced to two, rule table and who-to-ask updated);
  `.claude/rules/python-code.md` ("Code That Touches the Radio" replaced with a general
  "Side Effects" section); `.claude/commands/commit.md` (log-file bullet removed from the
  pre-staging check)
- **Nature of Contribution**: Edit and deletion, at NAF's direction
- **Human Review Status**: Reviewed and verified; scope of the removal directed by NAF
- **Git Hash**: 3edc7ba

## [2026-09-12 14:06 UTC]
- **Tool**: Claude (Anthropic), claude-opus-5
- **Session Purpose**: Make the signed Generative AI Use Agreement an explicit prerequisite
  in the onboarding document and across the template, and commit the agreement form itself.
- **Sections/Files Affected**: `docs/ai_policy_agreement/` (HamSCI agreement PDF and DOCX,
  supplied by NAF, now tracked); `docs/ONBOARDING.md` (new opening section "First: sign the
  AI use agreement", summarizing the form's certifications; signing added to the
  first-fifteen-minutes checklist and to the who-to-ask table); `.claude/rules/ai-governance.md`
  (new "Prerequisite: The Signed Agreement" section; Scranton policy URL and Jesuit mission
  alignment added from the form); `CLAUDE.md` (directory tree and AI Governance section);
  `README.md` (pitch, file table, and placeholder-replacement step)
- **Nature of Contribution**: Edit. The summary of the agreement's terms was taken from the
  text of `HamSCI_AI_Policy_Agreement.pdf` rather than written from memory.
- **Human Review Status**: Reviewed and verified against the source document
- **Git Hash**: 1248074

## [2026-09-12 14:08 UTC]
- **Tool**: Claude (Anthropic), claude-opus-5
- **Session Purpose**: Address signed AI use agreements to "a W3USR faculty advisor" rather
  than to a named-advisor placeholder, per NAF: the recipient may be him, his co-advisor
  Dr. Navid Shahrouzi, or a future advisor.
- **Sections/Files Affected**: `docs/ONBOARDING.md` (return line and who-to-ask row),
  `.claude/rules/ai-governance.md` (prerequisite section), `README.md`
  (placeholder-replacement step, which no longer needs to mention the agreement)
- **Nature of Contribution**: Edit, at NAF's direction
- **Human Review Status**: Reviewed and verified
- **Git Hash**: c9aa3f1

## [2026-09-12 14:25 UTC]
- **Tool**: Claude (Anthropic), claude-opus-5
- **Session Purpose**: Correct the never-commit list, which barred credentials at any
  visibility. Per NAF, some private club repositories legitimately hold access information:
  the forthcoming w3usr.org-PRIVATE orchestrator repository needs it for deploy and
  development. Committing such material is to be "carefully and deliberately decided"
  rather than prohibited.
- **Sections/Files Affected**: `CLAUDE.md` (never-commit list split into at-any-visibility,
  public-only, and a deliberate-decision section with conditions; visibility criteria table
  updated); `docs/ONBOARDING.md` (student-facing credential bullet); `.claude/settings.json`
  (`permissions.deny` read rules for `.env`, `.env.*`, `secrets/**`, `*.pem`, `*.key`,
  `**/credentials.json`); `README.md` (new instantiation step 4 on extending the deny rules,
  later steps renumbered, file table); `.claude/commands/commit.md` (pre-staging check);
  `.claude/rules/web-development.md` and `.claude/rules/python-code.md` (secrets guidance)
- **Nature of Contribution**: Edit, at NAF's direction. Permission-rule syntax verified
  against the Claude Code documentation at code.claude.com/docs/en/permissions rather than
  written from memory.
- **Human Review Status**: Reviewed and verified
- **Git Hash**: 7252c10

## [2026-09-12 14:36 UTC]
- **Tool**: Claude (Anthropic), claude-opus-5
- **Session Purpose**: Drop the `permissions.deny` read rules, which NAF did not ask for and
  declined when offered.
- **Sections/Files Affected**: `.claude/settings.json` (back to the `$schema` line alone),
  `README.md` (instantiation step removed, later steps renumbered, file-table row removed),
  `CLAUDE.md` ("Keep it out of the AI's reach" bullet removed),
  `.claude/rules/web-development.md` (settings cross-reference removed)
- **Nature of Contribution**: Edit, at NAF's direction
- **Human Review Status**: Reviewed and verified
- **Git Hash**: 4e494e2

## [2026-10-01 16:26 UTC]
- **Tool**: Claude (Anthropic), claude-opus-5-5
- **Session Purpose**: Update the template so that every commit goes on a feature branch and
  through a pull request that a human reviews and merges, replacing the earlier
  "commit to main, ask before pushing" workflow.
- **Sections/Files Affected**: `.claude/commands/commit.md` (steps 7 to 10 rewritten for branch, PR, pointer bump, push order), `CLAUDE.md` (new Git Workflow section; Submodules steps), `.claude/rules/python-code.md`, `.claude/rules/web-development.md`, `.claude/rules/ai-governance.md`, `docs/ONBOARDING.md` (working loop, git commands), `README.md`
- **Nature of Contribution**: Edit
- **Human Review Status**: Pending review
- **Git Hash**: 14bbda7 (branch pr-workflow, PR w3usr/ai_project_template#1), merged as ada5e54

## [2026-10-01 17:46 UTC]
- **Tool**: Claude (Anthropic), claude-opus-5-5
- **Session Purpose**: Stop the AI usage log from forcing a second pull request per change. The
  Git Hash field is now filled in once, on the change's own branch; a merge commit keeps that
  SHA valid, so no post-merge "merged SHA" update is needed.
- **Sections/Files Affected**: `.claude/commands/commit.md` (Git Hash and submodule pointer-bump steps)
- **Nature of Contribution**: Edit
- **Human Review Status**: Pending review
- **Git Hash**: 74d016a (PR w3usr/ai_project_template#3)

## [2026-10-10 12:09 UTC]
- **Tool**: Claude (Anthropic), claude-opus-5-5 (1M context)
- **Session Purpose**: Make committing rendered output standing guidance, at NAF's direction
  (2026-10-10): memo and report PDFs and final figures capture the results of the code in
  human-readable form and must be committed, or past work is hard to look back on.
- **Sections/Files Affected**: `CLAUDE.md` (new "Rendered Output" section), `.claude/rules/latex-writing.md`, `.claude/rules/python-code.md`, `.claude/commands/commit.md` (step 3 also checks rendered output is staged), `.gitignore`.
- **Nature of Contribution**: Edit (workflow guidance).
- **Human Review Status**: Pending review.
- **Git Hash**: cc72649, branch `commit-rendered-output`

## [2026-10-10 12:35 UTC]
- **Tool**: Claude (Anthropic), claude-opus-5-5 (1M context)
- **Session Purpose**: Narrow the committed-output rule to curated documents, at NAF's direction
  (2026-10-10): "I'm looking more to capture PDFs that are memos, notes, or some more curated
  level of analysis", not large generated outputs such as figure batches.
- **Sections/Files Affected**: `CLAUDE.md` ("Curated Documents"), `.claude/commands/commit.md` (step 3), `.claude/rules/python-code.md`.
- **Nature of Contribution**: Edit (workflow guidance).
- **Human Review Status**: Pending review.
- **Git Hash**: e240c57, branch `curated-documents-only`

## [2026-10-10 15:01 UTC]
- **Tool**: Claude (Anthropic), claude-opus-5-5 (1M context)
- **Session Purpose**: Make projects check their upstream ai_project_template for workflow and
  rule changes, at NAF's direction (2026-10-10), so repositories stop drifting from their
  template unnoticed.
- **Sections/Files Affected**: `.claude/template.json` (new: this template's record and the
  sibling templates it watches); `.claude/hooks/template_check.sh` (new: session-start check,
  read-only, once a day, silent on failure); `.claude/settings.json` (registers the hook);
  `.claude/commands/template-sync.md` (new: applies template changes as changes, through a PR);
  `CLAUDE.md` ("Template Updates"); `README.md` (instantiation step for the record).
- **Nature of Contribution**: Code generation, drafting.
- **Human Review Status**: Pending review.
- **Notes**: The check script was tested on scratch repositories (behind, current, freshly
  instantiated, unreachable upstream) and on this template. Hook format checked against the
  Claude Code hooks documentation. Project hooks run without a trust prompt; this one only reads
  `.claude/template.json` and makes one public HTTPS request to GitHub.
- **Git Hash**: e581426, branch `template-sync-tooling`

## [2026-10-10 15:14 UTC]
- **Tool**: Claude (Anthropic), claude-opus-5-5 (1M context)
- **Session Purpose**: Fix a flaw in the template check found before rolling it out: comparing
  commit SHAs alone made templates flag each other indefinitely (marking a sibling reviewed is
  itself a commit the siblings see) and flagged projects for template changes with nothing to
  adopt.
- **Sections/Files Affected**: `.claude/hooks/template_check.sh` (asks GitHub's compare API which
  files changed and ignores `.claude/template.json`, `ai/ai_usage_log.md` and, in a project, its
  `not_adopted` files; falls back to flagging if the file list is unavailable; names the changed
  files in its notice); `.claude/commands/template-sync.md` (record and log are never taken from
  the template; companion changes only need marking reviewed); `.claude/template.json` (sibling
  template-sync tooling, the companion of this template's own, marked reviewed).
- **Nature of Contribution**: Code generation, edit.
- **Human Review Status**: Pending review.
- **Notes**: Tested on scratch repositories (behind: flagged with file list; only ignorable
  changes: silent) and on the live w2naf-academia template (flags both siblings' tooling PRs).
- **Git Hash**: 532956a, branch `template-check-filter`
