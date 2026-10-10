# Agent guidance

These instructions apply throughout this repository.

## Project and architecture

- Hive is a desktop AI chat client built with Tauri 2, Svelte 5, SvelteKit 3 in static SPA mode, Tailwind CSS 4, shadcn-svelte, and Phosphor icons.
- The external daemon owns AI inference, tool execution, and conversation persistence. Keep the desktop client focused on connecting, sending user actions, and displaying daemon state.
- Do not add server-only SvelteKit features or assume a Node.js server exists in the packaged app. Keep SSR disabled and preserve the static adapter.
- Keep daemon transport and protocol types in dedicated modules under `src/lib`; do not scatter connection logic through UI components.
- Treat connection loss, reconnecting, loading, empty states, cancellation, and errors as normal product states. Use stable event IDs and reconcile streamed events without duplicating messages or tool output.
- Never present mock data or a local UI action as a successful daemon operation. Clearly distinguish disconnected state from an active connection.
- Keep Rust responsible for desktop integration where needed. Use narrowly scoped Tauri capabilities and validate inputs at privileged boundaries.

## Components and styling

- Always use shadcn-svelte components for UI controls and primitives. Before building a control, check `src/lib/components/ui` and the shadcn-svelte registry; install the appropriate component if it is missing.
- Compose and extend shadcn components for product features. Do not hand-roll equivalents of available buttons, inputs, dialogs, menus, tooltips, tabs, or other primitives. Semantic HTML is appropriate for layout and content.
- Keep shared UI primitives in `src/lib/components/ui` and product components elsewhere under `src/lib/components`.
- Always use the shadcn theme's semantic color tokens, such as `bg-background`, `text-foreground`, `bg-muted`, `text-muted-foreground`, `border-border`, `text-destructive`, and `ring-ring`.
- Do not hardcode colors in component markup or styles: no hex/RGB/OKLCH literals, arbitrary color values, or palette utilities such as `text-gray-500` or `bg-blue-600`.
- If an existing token cannot express a needed meaning, add a semantic token to `src/routes/layout.css`. Define it in both `:root` and `.dark`, expose it through Tailwind's `@theme inline` using `--color-*`, and use the resulting token utilities. Add a matching foreground token when text appears on the new color.
- Keep literal color definitions centralized in the theme. Name tokens by purpose, such as `tool-running`, rather than their hue. Reuse existing tokens when their meaning fits.
- Preserve readable contrast, visible keyboard focus, and consistent spacing and typography in both light and dark themes.
- Use Tailwind utilities for styling and `cn` from `$lib/utils` when combining conditional classes.
- Use Phosphor icons consistently. Prefer direct imports such as `phosphor-svelte/lib/ChatCircleIcon` to avoid processing the entire icon library.
- Give icon-only controls accessible names. Use proper labels, semantic elements, keyboard interaction, and the accessibility behavior supplied by shadcn components.

## Svelte and code organization

- Use TypeScript and Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`) for new components. Prefer derived state over effects that synchronize duplicate state.
- Keep components focused. Extract reusable behavior and components when it improves clarity; avoid speculative abstractions and unrelated refactors.
- Use explicit types for daemon messages and tool events. Validate untrusted payloads before treating them as typed data.
- Clean up subscriptions, timers, listeners, and connections when their owner is destroyed.
- Keep streaming updates efficient and bound retained tool output where necessary. Preserve the user's scroll position and text selection.
- Render daemon text safely. Sanitize any rendered HTML and do not execute scripts or commands embedded in messages.
- Never commit credentials, private daemon output, build artifacts, or local environment files.

## Dependencies and workflow

- Use npm and maintain `package-lock.json`; commit `src-tauri/Cargo.lock` for this application. Do not introduce another package manager or lockfile.
- Prefer current stable, compatible dependencies. Check peer requirements before upgrading; do not bypass conflicts with `--force` or `--legacy-peer-deps`. TypeScript is currently on version 6 for Svelte checker compatibility.
- Add shadcn components with:

  ```sh
  npx svelte-kit sync
  npx shadcn-svelte@latest add <component>
  ```

- Read existing code before editing. Keep changes scoped to the requested task and preserve unrelated user work.
- Update the README when setup, commands, architecture, or configuration changes.

## Validation

- For application changes, run `npm run check` and `npm run build`.
- For Rust changes, also run `cargo fmt --manifest-path src-tauri/Cargo.toml --check` and `cargo check --manifest-path src-tauri/Cargo.toml --locked`.
- Native checks require Tauri's OS prerequisites. If a check is blocked by missing system dependencies, state that explicitly; do not report it as passing.
- Test meaningful behavior when adding protocol handling, reconnection, state reconciliation, or other nontrivial logic. Documentation-only changes do not require an application build.
- When changing visible UI, inspect the result where browser or desktop preview is available, including keyboard access and relevant loading, empty, error, and disconnected states.
- Before finishing, review the diff for unintended changes and report what changed, validation results, and any remaining limitations.
