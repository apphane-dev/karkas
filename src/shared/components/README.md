# Shared components ownership

- `ui/` contains Park UI-generated/adapted primitives. Treat this folder as managed by `mise run park:*` tasks.
- Owned composite components live outside `ui/` in this directory, and may compose/re-export Park primitives through `./ui`.
- When adding a new Park primitive, use `mise run park:add <name>`; when adding project-specific components, create them beside this README instead of in `ui/`.
