# Hive Desktop

Desktop shell for an external AI daemon, built with Tauri 2, Svelte 5 / SvelteKit 3 (static SPA), Tailwind CSS 4, shadcn-svelte, and Phosphor icons.

This scaffold includes a minimal chat workspace. Daemon transport, chat persistence, streaming, and tool execution are not connected yet.

## Development

```sh
npm ci
npm run tauri dev
```

pFor frontend-only development, run `npm run dev` and open `http://localhost:1420`.

## Validation and builds

```sh
npm run check
npm run build
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo check --manifest-path src-tauri/Cargo.toml --locked
npm run tauri build
```

Native checks and packaging require the system dependencies listed above. On Debian/Ubuntu these include `build-essential`, `pkg-config`, `libwebkit2gtk-4.1-dev`, `libxdo-dev`, `libssl-dev`, `librsvg2-dev`, and `libayatana-appindicator3-dev`.

## UI components

```sh
npx svelte-kit sync
npx shadcn-svelte@latest add button
```

Components live in `src/lib/components/ui`, global styles in `src/routes/layout.css`, and the desktop configuration in `src-tauri/tauri.conf.json`. Import icons from `phosphor-svelte`.

Dependencies use the latest compatible stable releases at initialization. TypeScript stays on version 6 because the current `svelte-check` release does not support TypeScript 7. Both npm and Cargo lockfiles are committed for reproducible installs.
