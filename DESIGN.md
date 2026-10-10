# Hive design direction

This file is the source of design decisions for the Hive desktop client. Use it
before adding a screen, a token, a status, or a component. When a decision here
changes, update this file in the same change.

Process: adapted from the frontend-design guidance (Anthropic, `anthropics/skills`).
Plan first, check the plan against the brief, then build.

## 1. What we are designing

Hive is the desktop control surface for Slop Conductor. A daemon runs on each
machine and owns sessions, tasks, batches, workspaces, and tool execution. Hive
connects to a daemon, sends user actions, and displays daemon state. It does not
run agents itself.

Primary user: one developer with several machines (a home Linux PC, a work
Windows PC, a VPS). They start many jobs, leave them running, check back from
any device, read what the agent did, and steer or stop it.

Primary jobs, in order:

1. See what is running, on which node, and whether the node is connected.
2. Understand exactly what an agent did, including tool calls and effects that
   are unknown after an interruption.
3. Steer, pause, cancel, or retry without guessing what state the daemon is in.
4. Compare the results of a batch and retry only the failed combinations.

Hive is an operations console with calm reading surfaces. It is not a chat toy.

## 2. Concept

Name: **Propolis and Wax**. Wax is the light surface. Propolis is the dark
surface, a warm brown-black with a hint of hue, not neutral black. Honey is the
one accent.

The single memorable element is the **batch comb**. Each combination in a batch
is a cell in a honeycomb. Status fills the cells, so a running sweep reads at a
glance. Everything around the comb stays quiet and disciplined.

Metaphor rules:

- Hexagons mark units of work: batch cells and the brand mark. Everything else
  is square, ruled, and flat.
- Honey means active. It is not decoration. It appears on running work, the
  primary action, and focus.
- Bee vocabulary lives in the brand, the empty-state voice, and the comb motif.
  Product nouns stay literal: Node, Session, Task, Run, Turn, Batch, Workspace,
  Artifact. Users manage sessions, not colonies.

## 3. Design plan

### 3.1 Palette

Seven named colors. Hex values are sRGB approximations of the oklch source
values, which live in `src/routes/layout.css`.

| Name | Role | Light (oklch) | Light hex | Dark (oklch) | Dark hex |
| --- | --- | --- | --- | --- | --- |
| Wax | Light surface and light-mode ink base | 0.982 0.006 92 (background) | #FAF9F5 | 0.2 0.011 65 (background, Propolis) | #1A1511 |
| Propolis | Ink on light, dark surface | 0.26 0.025 60 (foreground) | #2D2118 | 0.955 0.012 90 (foreground, Wax) | #F3F0E7 |
| Honey | Primary action, focus, running | 0.83 0.14 83 (fill); 0.64 0.15 72 (running ink, light) | #F3BE4F; #C37A00 | 0.84 0.14 83 | #F7C152 |
| Clover | Completed, applied | 0.53 0.12 150 | #2C7F44 | 0.78 0.13 150 | #76CF8A |
| Ember | Failed, destructive | 0.55 0.19 32 | #C8331A | 0.72 0.17 30 | #FD7562 |
| Dusk | Effects unknown, interrupted, incomplete | 0.5 0.16 300 | #7347AF | 0.77 0.12 300 | #C0A2F5 |
| Slate | Paused, accepted | 0.52 0.05 250 | #536B85 | 0.76 0.05 250 | #9AB4D0 |

Contrast checks at the time of writing:

- Body text on the light background is 14.9:1, and muted text is 5.7:1.
- Status icons on the light background are 3.3 to 6.1:1 (3:1 is the minimum for
  non-text).
- The focus ring on the light background is 3.5:1.
- Input boundaries are 3.2:1 in light mode and 3.7:1 in dark mode.

### 3.2 Type

- One family for interface and display: **Bricolage Grotesque** (variable,
  weight axis). Its quirky, slightly hand-cut shapes carry the natural,
  modern character without a second display face.
- Machine values only in **JetBrains Mono**: IDs, paths, commands, shell
  output, diffs, event kinds, token counts, and commit hashes. Mono is never used
  for labels or prose.

Scale (px / line-height / weight):

| Role | Size / LH | Weight | Notes |
| --- | --- | --- | --- |
| Page title (display) | 28 / 1.2 | 650 | Tracking -0.02em. Used sparingly. |
| Session title | 18 / 1.3 | 600 | Header of the session view. |
| Section heading | 15 / 1.3 | 600 | Inspector and panel headings. |
| Body (UI) | 14 / 1.45 | 450 | Default for everything interactive. |
| Prose (timeline) | 15 / 1.6 | 420 | Max 68ch line length. |
| Meta | 12 / 1.4 | 450 | Muted; labels next to values. |
| Machine | 12 / 1.5 | 400 | JetBrains Mono. |

Typographic rules:

- Sentence case everywhere. No all-caps labels or eyebrows.
- Hierarchy comes from size, weight, and color, not from accent words or
  decorative labels.
- Meta is written as labeled fields (Project, Base, Model), not joined with
  middle dots.
- Text is left-aligned. Numbers in tables are right-aligned.

### 3.3 Shape, depth, and density

- Corners are square (`--radius: 0`). Structure is carried by 1px hairline
  borders. Only the hexagon is curved.
- Lists are rows with dividers, not grids of identical cards.
- Shadows appear only on overlays (popover, sheet, dialog), from shadcn defaults.
- Desktop-first and dense: 28 to 32px row height, 14px base text. The minimum
  window is 720 by 480.

### 3.4 Layout

Four zones in a single window. Sheets replace the side zones when the window is
narrow.

```
+----+------------------+------------------------------------+----------------+
|    | Sessions    [+]  | Session title            [Pause]   | Workspace      |
| hx | [search......]   | Project  Base  Node  Model         | Events         |
|    |------------------|------------------------------------| Artifacts      |
| S  | Running          |  You                               | Turn           |
| B  |  o Steering...   |  Add a steering queue...           |                |
| P  |                  |                                    |                |
| N  | Paused           |  Assistant  GLM-5.3                |                |
|    |  o Flaky test    |  reading follow.rs        [read] ok|                |
|    |                  |  [edit follow.rs +14 -3]     ok    |                |
|    | Needs attention  |  [bash cargo test]    running      |                |
|    |  ! Migrate...    |------------------------------------|                |
|    |                  | [Textarea.......................]  |                |
|    |                  | (After turn|Next boundary|Immediate)|  [Send]        |
+----+------------------+------------------------------------+----------------+
 rail    list (288px)            timeline (fluid)              inspector (320px)
```

- Rail (56px): brand mark, four sections (Sessions, Batches, Projects, Nodes),
  theme toggle at the bottom.
- List (288px): searchable, grouped by state, rows are the primary navigation.
- Timeline: centered column with a max width of about 760px. Text is
  left-aligned.
- Inspector (320px): tabs for Workspace, Events, Artifacts, and Turn.
- Sample notice bar: always visible above the content. See section 6.

Breakpoints: the session list and batch and project lists sit beside their
detail at 1024px and up, and become a left sheet below that. The inspector sits
beside the timeline at 1280px and up, and becomes a right sheet below that. The
header toggles both. Sheets carry their own close bar, so the close control never
overlaps content. The minimum window width is 720px.

Batches view: list on the left, comb in the center, the selected cell's details
on the right. Projects view: project list and a table of workspaces. Nodes view:
rows with connection state and the sample-scenario switch.

### 3.5 Principles

1. Truth before polish. Connection state and sample status are always visible.
   Sample data is never presented as an accepted or completed daemon operation.
2. Status is shape, then word, then color. Color is never the only signal.
3. Text stays ink. Color marks state through icons, dots, and tints. Body text
   is never honey or clover.
4. Uncertainty has its own color and wording (Dusk). It is never folded into
   failure or success. The daemon does not replay unknown effects, and neither
   does the UI.
5. One hero, quiet surroundings. The comb is the only decorative element.

## 4. Review against the brief

First-pass instincts for a "natural, modern" AI tool are the defaults the
frontend-design guidance warns about. Each was checked and replaced:

| Default we avoided | What we did instead |
| --- | --- |
| Warm cream background, high-contrast serif display, terracotta accent | Wax and Propolis neutrals, one grotesque family, honey accent with no terracotta |
| Near-black background with one acid or vermilion accent | Propolis, a hued brown-black derived from the material. Honey is one of seven named colors, with status meaning |
| SaaS card kit: identical rounded cards, shadows, gradients | Rows with dividers, square corners, hairline borders, no gradients, shadows only on overlays |
| Tracked-out all-caps eyebrow above every heading | Sentence case. Labels appear only when they carry information |
| Meta strings joined with middle dots | Labeled fields |
| Arrows at the end of links and buttons | Plain verbs |
| Monospace for small data labels | Mono only for machine values; labels use the grotesque |
| Numbered 01/02/03 markers | Only the batch combination index, which is a real identity |
| Glow, gradient washes, scattered fade-in on every section | One orchestrated moment: the comb fills once when a batch opens |
| Neutral #111 for "black" | Propolis, deliberately warm |

The result is still a restrained, opinionated direction. The only ornament is
the hexagon, and it marks real units of work.

## 5. Tokens

All colors come from the theme in `src/routes/layout.css`. Components use
utilities such as `bg-background`, `text-muted-foreground`, and `fill-status-running`.
They never contain hex, oklch, or palette literals.

| Token | Purpose |
| --- | --- |
| `background`, `foreground` | Page surface and default ink |
| `card`, `popover` | Raised surfaces inside the page and overlays |
| `muted`, `muted-foreground` | Quiet surfaces and secondary text |
| `border`, `input` | Hairlines and control boundaries (input is darker for 3:1) |
| `ring` | Focus ring (honey ink) |
| `primary`, `primary-foreground` | Honey fill for the main action |
| `secondary`, `accent` | Hover and selected surfaces. Selected rows and toggles use `accent` (light 0.915 0.022 84, dark 0.30 0.013 66). The shadcn toggle default uses `muted`, which is too close to the page, so toggle groups override it |
| `destructive` | Ember: failure and destructive actions |
| `sidebar*` | Navigation rail |
| `status-running` | Honey ink: running work |
| `status-success` | Clover: completed or applied |
| `status-paused` | Slate: paused or accepted |
| `status-unknown` | Dusk: effects unknown, interrupted, incomplete |

Rule for new tokens: name by purpose (`status-*`), define in both `:root` and
`.dark`, expose through `@theme inline`, and add a matching foreground if text
will sit on the color.

## 6. Status vocabulary and sample data

`src/lib/status.ts` is the only place that maps daemon values to labels, icons,
and tokens. Components import from it and never invent their own mapping.

| Daemon value | Label | Icon | Token | Notes |
| --- | --- | --- | --- | --- |
| turn `queued` | Queued | CircleDashed | muted-foreground | Not started |
| turn `running` | Running | CircleNotch | status-running | Spins; static under reduced motion |
| turn `paused` | Paused | Pause | status-paused | Resumable |
| turn `completed` | Completed | CheckCircle | status-success | |
| turn `failed` | Failed | XCircle | destructive | Retryable |
| turn `cancelled` | Cancelled | Prohibit | muted-foreground | User intent |
| turn `interrupted` | Interrupted | WarningDiamond | status-unknown | Daemon or process stopped. Retry is explicit |
| turn `incomplete` | Incomplete | Warning | status-unknown | Output limit reached |
| tool flag `effects_unknown` | Effects unknown | Question | status-unknown | Shown beside the tool, never as success |
| steering `accepted` | Accepted | Circle | status-paused | Persisted, not yet applied |
| steering `applied` | Applied | CheckCircle | status-success | |
| steering `rejected` | Rejected | XCircle | destructive | |
| workspace `reserved` / `allocating` | Creating worktree | CircleNotch | status-running | |
| workspace `ready` | Ready | CheckCircle | status-success | |
| workspace `removing` | Removing | CircleNotch | status-running | |
| workspace `failed` | Failed | XCircle | destructive | |

Connection and sample state, shown on every screen:

- **Sample data** (current): a bar above the content says "Sample data. No node
  is connected." Send, pause, cancel, retry, and create actions are disabled and
  show their reason beside the control.
- **Connected** (future): the node name, daemon version, and last event
  sequence. It appears only after a real health and node query succeeds.
- **Reconnecting** (future): last known data stays visible, labeled with its age.
- **Offline**: last known data, labeled with its age, plus the reason.
- **Empty**: what the screen shows once connected, and the next step.

Node connection states, used on the Nodes screen:

| State | Label | Icon | Token | Notes |
| --- | --- | --- | --- | --- |
| not connected | Not connected | CircleDashed | muted-foreground | Default for every node in sample data |
| unreachable | Unreachable | WarningDiamond | status-unknown | Last data is shown with its age |
| inactive | Inactive | Pause | status-paused | Dual-boot PC running the other OS |

The Nodes screen has a sample-state switch: Sample data, Empty node, and Node
offline. It changes what the sample shows. It never connects anything.

Sample data must never imply that a daemon accepted an instruction. Use "Sample"
or "Not connected", never "Sent" or "Saved", until the daemon has acknowledged.

## 7. Patterns

Session timeline:

- User messages: a "You" label and prose, with a foreground rule at the left. No
  bubbles. No timestamps: the wire carries none yet.
- Assistant messages: a model label, then prose. A checkpoint says "More text may
  follow" instead of showing a spinner.
- Tool rows: icon, verb (Read file, Edit file, Write file, Run command),
  machine-value arguments, status, and an Effects unknown badge when it applies.
  Running, failed, interrupted, and uncertain rows open by default. Expanded
  output states its limit ("Limited to 1 MB per call"). Edits show the removed
  and added text with a border marker, not colored text.
- Effects unknown block: "The command stopped before its outcome was recorded.
  It may have changed files or sent data. It was not replayed. The agent decides
  the next step."
- Steering notes: inline with the delivery mode and status, then one sentence on
  what the status means. Example: "Accepted. It waits for the next safe boundary."
- Model request markers: a thin rule with status and usage, for example "Request
  2, Input 1,204, Output 318". Unknown counters read "Unknown", never 0.
- Turn dividers: "Turn 2, Running, GLM-5.3". An interrupted turn adds "Nothing
  was replayed. Send a new message to continue."

Composer:

- A textarea, a delivery toggle (After turn, Next boundary, Immediate), a model
  select, and a Send button. The hint text explains the selected mode in plain
  words.
- Sending is disabled while there is no connection. The reason is shown next to
  the button.
- The keyboard hint for send is shown, but the shortcut is inert until wired.

Inspector:

- Workspace: project, base commit, worktree status, diff summary, changed files.
- Events: durable events in sequence order, with mono sequence numbers and kinds.
- Artifacts: the source label (for example "cargo test output"), media type,
  size, and a short SHA-256 prefix. The wire has no file name, so none is shown.
- Turn: requested and resolved model, output limit, usage per turn, and each
  request. Reasoning reads "Provider default" because no model accepts an override.

Batch comb:

- Flat-top hexagons in a four-column honeycomb, one per combination, with the
  combination number in mono and the status icon below it. Rows stagger like a
  comb, and larger batches grow downward.
- Status comes from the icon, the word in the details panel, and the tint
  together. Selecting a cell rings it in honey ink and opens its details: prompt,
  model, output limit, output or error, and retry status.
- The one moment of motion is the fill when a batch opens. It is disabled under
  reduced motion.

New batch dialog:

- A local preview. It validates the matrix against the daemon's rules: a name,
  at least one prompt and model, output limits between 1 and 32,768, and at most
  256 combinations. It shows the count as prompts × models × limits.
- "Create batch" stays disabled, and its reason is shown beside it, until a node
  accepts the batch.

Errors and empty states:

- Say what happened, what is safe, and what the user can do. Errors do not
  apologize. Example: "Effects unknown. The daemon stopped during this command,
  so it may have changed files. Nothing was replayed."
- Empty states are plain and point to the next step. Example: "No sessions yet.
  Start one on a connected node."

## 8. Copy

- Sentence case. Buttons start with a verb: Send, Pause turn, Cancel turn,
  Retry failed, Create batch.
- The same word is used across a flow. A "Retry" button does not produce a
  "Restart" message.
- Plain nouns: Session, Batch, Node, Workspace. No marketing language.
- No exclamation marks. No emoji.
- "Accepted" means the daemon persisted it. "Sent" and "Saved" are used only
  after acknowledgement.

## 9. Motion and accessibility

- Motion has a purpose. The running icon spins. The comb fills once on open.
  Sheets and dialogs use the shadcn defaults. Nothing animates on scroll.
- Respect `prefers-reduced-motion`: stop spinning icons and skip the comb fill.
- Focus is always visible: a 3px ring in honey ink in both themes.
- Text contrast is at least 4.5:1. Non-text contrast (icons, control
  boundaries, focus) is at least 3:1.
- Targets are at least 28px high in dense lists and reachable by keyboard.
- Icon-only buttons have an accessible name and a tooltip.
- Status is never color alone: each status has an icon and a word.

## 10. Implementation rules for this repo

- Use shadcn-svelte primitives for every control. Installed: Alert, Badge,
  Button, Checkbox, Collapsible, Dialog, Empty, Input, Kbd, Label, Progress,
  Select, Separator, Sheet, Table, Tabs, Textarea, Toggle, ToggleGroup, and
  Tooltip. Compose them in `src/lib/components`. Before adding a control, check
  `src/lib/components/ui` first.
- Shared shell pieces: `shared/status-badge` and `shared/status-icon` render
  status from `src/lib/status.ts`. `shared/list-pane` is the responsive list
  column. `shared/sheet-titlebar` is the close bar for sheets.
- Phosphor icons come from direct imports, such as
  `phosphor-svelte/lib/CircleNotchIcon`.
- Protocol DTOs live in `src/lib/protocol/types.ts`, mirroring
  slopconductor's `slop-protocol` wire names. Demo data lives in
  `src/lib/demo`. Neither is imported by transport code yet.
- Svelte 5 runes for new components. Prefer `$derived` over `$effect` for
  derived state.
- Mutating controls are disabled until daemon wiring exists. Each one has a
  visible reason.

## 11. Review checklist

Before merging UI work:

- [ ] Checked in light and dark themes.
- [ ] Every status goes through `src/lib/status.ts`.
- [ ] No hex, oklch, or palette literals in components.
- [ ] No all-caps labels, trailing arrows, middle-dot meta strings, or emoji.
- [ ] Sample or connection state is visible on the screen.
- [ ] Disabled actions show their reason.
- [ ] Keyboard focus is visible. Icon-only buttons are labeled.
- [ ] Empty, offline, and error states exist for the screen.
- [ ] Usable at the 720px minimum width.
- [ ] `npm run check` and `npm run build` pass.

## 12. Open items

- Package manager: `AGENTS.md` asks for both pnpm with Vite Plus and npm with
  `package-lock.json`. This UI uses npm and the existing lockfile until that is
  resolved.
- Fonts: Bricolage Grotesque and JetBrains Mono are both under the SIL Open
  Font License.
- Reduced-motion and high-contrast preferences need a pass on real hardware.
- Token and cost display depends on provider-reported usage, which is often
  partial. The UI shows Unknown rather than estimating.
- Protocol gaps the UI works around. Artifacts have no file name, so they are
  labeled by source. Events and messages have no timestamps, so the sample uses
  relative age labels that are not wired to real time. Reasoning effort has no
  supported values yet. Wire these up before relying on the sample labels.
- Motion check on real hardware: the comb fill and the running spinner.
