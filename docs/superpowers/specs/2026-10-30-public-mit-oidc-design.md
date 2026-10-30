# Public MIT packages with OIDC publishing

The user selected MIT licensing, a public GitHub repository, public npm packages, and OIDC Trusted Publishing. Standard GitHub-hosted runners and public npm packages keep this within the free service offering.

## Scope

- Add the MIT text to the repository and both package roots, with copyright attributed to Oxygen contributors; preserve third-party notices.
- Publish only `@oxygen-design/ui` and `@oxygen-design/patterns`. The root and Storybook remain unpublishable.
- Keep independent Changesets versions and existing public APIs.
- Pack with pnpm to resolve workspace references, then publish those exact tarballs using npm CLI 11.5.1, which supports OIDC. The installed Changesets 3.0.3 chooses pnpm's publishing implementation, so invoking `changeset publish` would not select that npm CLI.
- Retain provenance, remove long-lived npm-token fallback, and allow manual workflow retries.
- Allow manual Check workflow dispatch so maintainers can run required checks for release PRs created with the ephemeral GITHUB_TOKEN.
- Document repository-publication commands, per-package npm trusted-publisher fields, and first-publication bootstrap using an interactive maintainer login where the registry requires an existing package.

## Validation and remote completion

Validate publish-plan handling with controlled external process boundaries, run existing tooling and package consumers, and inspect actual packed license files. Scan all local Git history before making it public. GitHub visibility, branch protections, package ownership, trusted-publisher settings, and the first OIDC registry publish must be verified remotely; a local dry run is not proof of those steps.

## Isolation

Changes live in a separate clone, fast-forwarded to the remote main merge of the existing Storybook fix (the file tree is identical); the parent thread's checkout, branches, and configuration are not edited. Authentication is completed by the user without sending secrets into chat.
