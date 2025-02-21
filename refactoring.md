# Refactoring Guidelines

- Remove all API calls from the components or pages if possible.
- Make features loosely coupled.
- Everything that is coupled should be in the same feature or in a common library.
- Minimize usage of hooks, only when it's necessary.
- Do not use inline SVG - convert to icon component.
- Prefer to use context instead of stores.
