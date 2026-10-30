# /commit: AI-Assisted Commit Workflow (W3USR)

Run this any time you finish a substantive AI-assisted work session in a W3USR project.

It logs the AI session first, then commits, in that order. The order is the point: the log is
the club's record of what AI did, and a commit without one is a gap in that record.

Handles flat repos, single-submodule repos (e.g. Overleaf only), and multi-submodule repos.
Submodules are auto-detected from `git submodule status`.

## Steps

### 1. Get the current timestamp
```bash
date
```
Use this exact output. Never estimate the date or time.

### 2. Identify all changes
```bash
git status
git submodule foreach 'git status'
git diff --stat
git submodule foreach 'git diff --stat'
```
No output from `git submodule foreach` means the repo has no submodules; proceed without them.

### 3. Check what is about to be staged
Before drafting anything, look at the changed files for material that must never be committed
(see `CLAUDE.md` and `.claude/rules/ai-governance.md`):

- credentials, API keys, or `.env` files with real values, unless `CLAUDE.md` records a
  deliberate decision that this private repository holds deploy configuration
- a personal login or personal API key, which is never committed at any visibility
- student records, rosters tied to student IDs, member addresses or phone numbers
- building access details, alarm codes, tower or rooftop access procedures
- photographs of identifiable people without permission

If any appear, stop and raise it with the user before committing.

Then check the other direction: every memo, note or report PDF this session produced or
changed is staged alongside its source and was rebuilt from it. Bulk generated output
(figure batches, plot sets, image compilations) is not staged; see `CLAUDE.md`.

### 4. Ask the user for the session purpose
Draft a one- or two-sentence purpose for the log. Show it to the user and ask them to confirm
or correct it.

### 5. Draft the AI usage log entry
Use the **actual running model ID** in the Tool field (e.g. `claude-opus-5`), never a
placeholder.

```
## [YYYY-MM-DD HH:MM TZ]
- **Tool**: Claude (Anthropic), <actual-model-id>
- **Session Purpose**: [user's description]
- **Sections/Files Affected**: [changed files and sections]
- **Nature of Contribution**: [Draft / Edit / Analysis / Code generation / Research / etc.]
- **Human Review Status**: [Reviewed and verified / Partially reviewed / Pending review]
- **Git Hash**: [filled in after committing]
```

Set **Human Review Status** honestly. "Pending review" is a legitimate and useful value, and
it is far better than claiming a review that did not happen.

Present the draft. Wait for confirmation or corrections.

### 6. Append the entry to `ai/ai_usage_log.md`

### 7. Every repo with changes: feature branch, commit, push the branch, open a PR
Nothing is committed directly to `main`, in this repo or any submodule. Work the submodules
first, then the main repo. For each repo with changes, propose a short kebab-case branch name
with the commit message and wait for the user's approval. Then:
```bash
git -C <repo> fetch
git -C <repo> switch -c <topic> origin/main     # uncommitted changes carry over to the branch
git -C <repo> add <files>
git -C <repo> commit -m "[AI-assisted] <description>"
git -C <repo> push -u origin <topic>
gh pr create --repo <owner>/<repo> --base main --head <topic> --title "..." --body-file <file>
```
If the repo is already on a feature branch whose PR is still open **for this same change**, add
the commit there and push it; do not open a second PR. If it is on some other branch, say so and
ask before branching.

The PR body says what changed and why, references the tracking issue, links the companion PRs
in the other repos of the same change, and ends with an AI attribution line. Pushing the feature
branch, opening the PR and pushing further commits to it are standing permission once the user
has approved the commit. **Never push `main`. Never merge**: the project lead reviews and merges. A repo
whose remote cannot host a PR (an Overleaf project, say) is outside this step; ask.

In the main repo, stage `ai/ai_usage_log.md` with the other changed files. **Do not stage a
submodule pointer that names an unmerged branch commit.**

A brand-new repository whose remote has no `main` yet is the one exception: its first commit
seeds `main`. Ask before that push.

### 8. Fill in the git hash(es)
```bash
git log --oneline -1
```
Update the entry's **Git Hash** field with the branch commit and PR for each repo (e.g.
`main-repo=abc1234 (PR owner/repo#5), sub=def5678 (PR owner/sub#3)`). Commit that on the same
branch with a plain message without the `[AI-assisted]` prefix, such as
`Update AI usage log with git hashes`, and push it.

That is the last log update for this change, and it never needs a PR of its own. A merge commit
keeps every branch SHA, so the recorded hash stays valid after the merge. If a PR is squash- or
rebase-merged, its branch SHAs no longer exist: correct them to the merged SHA on the next
branch that touches the log.

### 9. After a submodule PR merges: bump the pointer
```bash
git -C <sub> switch main && git -C <sub> pull --ff-only && git -C <sub> branch -d <topic>
git add <sub> && git commit -m "Bump <sub> to merged PR #N"
```
Make that commit on the main repo's feature branch: the still-open PR for the same change if
there is one, otherwise a new branch and PR. The pointer-bump commit is this repo's record of
the merged submodule SHA; the log needs no further update.

### 10. Pushing
Never push `main`. The feature-branch pushes above are the one standing exception; ask before
any other push. Fetch and verify the remote state first, push fast-forward only, never
force-push, never hard-reset.

With submodules, **push the submodule before the parent**. A parent that reaches GitHub ahead
of its submodule looks correct on the machine that pushed it and breaks for everyone who clones.
Verify first:
```bash
git -C <submodule-path> branch -r --contains HEAD   # empty output = local only; push it first
```

## Notes

- The `[AI-assisted]` prefix goes on commits whose content was produced or substantially
  shaped with AI. A purely human edit (the user fixes a typo, rewords a sentence) does not
  carry it.
- Submodules get their own `[AI-assisted]` commits where their content is AI-assisted,
  separately from the parent's pointer-bump commit.
- Use `git add <specific-files>` rather than `git add -A` or `git add .`, so build output,
  credentials, and large binaries are not staged by accident.
- Reference a tracking issue where one exists (`refs #N`, or `closes #N` when declaring the
  work finished is yours to declare).
