# Changesets

Add a changeset for every pull request that changes the public API, behavior,
styles, tokens, or consumer contract of either `@oxygen-design/ui` or
`@oxygen-design/patterns`. Include each public package affected by the change;
the base package and patterns package are versioned independently.

Use `patch` for compatible fixes, `minor` for compatible additions, and
`major` for breaking changes. The private Storybook application is ignored.
