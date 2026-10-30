# Public MIT and OIDC Implementation Plan

> Execute inline using `superpowers:executing-plans`; this side conversation does not use subagents.

**Goal:** Deliver MIT-licensed public packages and an OIDC-only release path, then complete authorized remote settings when authenticated access is available.

**Architecture:** Retain Changesets for versioning and dependency-aware pack plans. Publish its verified tarballs with the npm CLI instead of Changesets' detected pnpm publisher. Keep all changes in this separate clone.

**Tech Stack:** Node 22.22.2, pnpm 11.9.0, Changesets 3.0.3, npm 11.5.1, GitHub Actions.

## Global constraints

No public API or component-source changes. No paid plans. Root and Storybook remain private in npm manifests. No permanent npm tokens. Preserve parent-thread work.

## Tasks

- [x] Inspect manifests, release workflow, credentials and all local history (12 commits, 340 blobs; targeted scan found no credential patterns).
- [x] Add regression tests for artifact integrity, dry runs, OIDC requirements and stopping after a failed npm publish; observe missing-module failure first.
- [x] Add `scripts/publish-npm.mjs`: validate Changesets pack-plan version, public package allowlist, relative archive paths and SHA-256 integrity before any publish; require CI OIDC for live publishing; invoke npm sequentially and stop on failure.
- [x] Add MIT LICENSE files, package READMEs and source-repository metadata; update the root README and the release runbook.
- [x] Change `release` to `pnpm build && pnpm changeset pack --out-dir output/release && node scripts/publish-npm.mjs output/release/publish-plan.json && pnpm changeset git-tag`; install npm 11.5.1 in Release and remove NPM_TOKEN. Add manual Check and Release dispatch.
- [x] Validate tooling, lint, types, builds, packed consumers, exact license payloads and npm dry-run output. Review `git diff --check` and the final diff.
- [ ] With authenticated access, publish the branch and PR, make the GitHub repository public, verify required checks, and configure each npm package's trusted publisher for `3199313768/oxygen-design-system`, workflow `release.yml`. Bootstrap only missing packages through interactive npm login, then verify an actual OIDC publication.

Remote settings stay explicitly pending when authentication or connectivity is unavailable. Do not claim local configuration proves remote publication.

## Validation evidence

- `pnpm verify`: passed with 24 tooling tests, 223 UI tests, 8 patterns tests, execution-coverage thresholds, types, lint, package builds and Storybook build. Existing Storybook directive and chunk-size warnings remain.
- Focused publisher regression: 8 expected failures against an empty implementation, then all 9 tests passed with the implementation.
- `pnpm verify:package`: passed for both real tarball consumers after a network-enabled retry; the sandbox-only attempt could not resolve registry.npmjs.org.
- Real Changesets pack using an offline input plan: passed; both archives carry the identical MIT text, package README, repository metadata and public access. SHA-256 integrity matches the generated output plan.
- Real npm dry run: passed for both exact archives. The local CLI was npm 10.9.7; CI installs npm 11.5.1 for actual OIDC. This does not establish remote OIDC success.
- Both workflow YAML files parse successfully and retain `check` / `browser` and `id-token: write`.
- GitHub CLI is installed and the user completed login; the authenticated repository API confirms administrator access and private visibility. npm ownership and trusted-publisher settings remain to be configured.

Official npm guidance was retrieved over an approved network-enabled prerequisite check: npm >=11.5.1 and Node >=22.14.0; filename `release.yml`; public source/package for provenance; new trusted publishers require timely validation. Public registry currently lists UI 0.1.0 as UNLICENSED and returns 404 for patterns. The runbook preserves that existing UI version and bootstraps only a missing patterns package before the 0.1.1 version PR is merged.

## Actions permission adjustment

Automatic approval review rejected enabling `can_approve_pull_request_reviews=true`, because it also allows Actions to approve PR reviews. That setting is preserved. Release now reports pending changesets and skips publishing until a maintainer-created version PR consumes them; only a versioned main publishes with OIDC. The publish job no longer requests pull-request write permission. Creating the version PR uses the already-authenticated maintainer account.
