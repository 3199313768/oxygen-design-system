# Oxygen Design System

Private React design system for Oxygen projects. The publishable package is
`@oxygen-design/ui`; Storybook remains a private workspace application.

## Package Contents

- Accessible base controls built from shadcn/ui patterns and Radix Primitives.
- Generic page patterns without routing, data access, or business state.
- Precompiled component CSS that does not require Tailwind in consumers.
- Standalone framework-neutral design tokens.
- Curated Lucide icon exports under their original component names.

## Local Development

Requirements: Node.js `22.14.0` or newer in the Node 22 line and pnpm
`11.9.0`.

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
pnpm storybook
```

Build the static Storybook and verify the real package tarball with:

```bash
pnpm storybook:build
pnpm verify:package
```

## Consumer Installation

The npm Organization and first release must exist before installation. Configure
the token outside source control, then install the exact pre-1.0 version:

```ini
@oxygen-design:registry=https://registry.npmjs.org/
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

```bash
pnpm add @oxygen-design/ui@0.1.0 --save-exact
```

Import components and precompiled styles once at the application entry:

```tsx
import { Button, EmptyState, PageHeader } from '@oxygen-design/ui';
import '@oxygen-design/ui/styles.css';
```

Framework-neutral consumers may import only the tokens:

```css
@import '@oxygen-design/ui/tokens.css';
```

React and React DOM are peer dependencies. Consumers do not need Tailwind CSS
or access to this repository's source files.

## Release Process

The development manifest remains at `0.0.0`; the initial minor changeset
produces `0.1.0`. Later compatible fixes use patch changesets, compatible public
additions use minor changesets, and breaking API changes use major changesets.

The release workflow creates a version pull request and runs `pnpm release`
after it is merged. Prefer npm Trusted Publishing. If the npm account cannot use
trusted publishing, configure a granular `NPM_TOKEN` restricted to
`@oxygen-design/ui`. Never store token values in this repository.

No GitHub remote, npm Organization, trusted publisher, token, or package release
is created by the local scaffold.
