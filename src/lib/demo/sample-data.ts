/**
 * Sample data for the UI prototype. Nothing here came from a daemon.
 *
 * The records use the wire DTO shapes from `$lib/protocol/types` so the data
 * layer can be swapped for real responses without reshaping components.
 * Every screen that uses this module must show that the data is sample data.
 */
import type {
	ArtifactResponse,
	BatchResponse,
	EventResponse,
	GenerationSettings,
	MessageResponse,
	ModelRequestResponse,
	ModelResponse,
	NodeResponse,
	ProjectResponse,
	SessionResponse,
	SteeringInstructionResponse,
	TaskResponse,
	ToolInvocationResponse,
	TurnResponse,
	UsageResponse,
	WorkspaceResponse,
} from "$lib/protocol/types";
import type {
	ArtifactRef,
	BatchDetail,
	NodeDetail,
	ProjectDetail,
	SessionDetail,
	TimelineItem,
	WorkspaceDiffSummary,
} from "$lib/view/types";

export type SampleScenario = "sample" | "empty" | "offline";

const HOME = "node_home_linux";
const SLOP = "prj_slopconductor";
const HIVE = "prj_hive_desktop";

/* ---------- builders ---------- */

const settings = (max: number | null = null): GenerationSettings => ({
	max_output_tokens: max,
	reasoning_effort: null,
});

const usage = (input: number | null, output: number | null, total: number | null = null): UsageResponse => ({
	input_tokens: input,
	output_tokens: output,
	total_tokens: total,
	total_source: total === null ? null : "provider",
});

const sha = (seed: string): string => seed.repeat(64).slice(0, 64);

function userMessage(id: string, sessionId: string, turnId: string, text: string): MessageResponse {
	return {
		id,
		session_id: sessionId,
		turn_id: turnId,
		role: "user",
		text,
		status: "completed",
		blocks: [{ id: `${id}_text`, type: "text", text }],
		request_id: null,
	};
}

function assistantMessage(
	id: string,
	sessionId: string,
	turnId: string,
	requestId: string | null,
	text: string,
	status: string = "completed",
): MessageResponse {
	return {
		id,
		session_id: sessionId,
		turn_id: turnId,
		role: "assistant",
		text,
		status,
		blocks: [{ id: `${id}_text`, type: "text", text }],
		request_id: requestId,
	};
}

function modelRequest(p: {
	id: string;
	turnId: string;
	messageId: string;
	ordinal: number;
	model: string;
	usage: UsageResponse | null;
	status?: string;
	finish?: string | null;
	errorCode?: string | null;
	maxTokens?: number | null;
}): ModelRequestResponse {
	return {
		id: p.id,
		turn_id: p.turnId,
		message_id: p.messageId,
		ordinal: p.ordinal,
		requested_model: p.model,
		resolved_model: p.model.split("/").pop() ?? p.model,
		requested_settings: settings(p.maxTokens ?? 4096),
		effective_settings: settings(p.maxTokens ?? 4096),
		status: p.status ?? "completed",
		finish_reason: p.finish === undefined ? "stop" : p.finish,
		usage: p.usage,
		error_code: p.errorCode ?? null,
	};
}

function tool(p: {
	id: string;
	turnId: string;
	requestId: string;
	name: string;
	args: Record<string, unknown>;
	status: string;
	output: string | null;
	artifacts?: string[];
	effectsUnknown?: boolean;
	errorCode?: string | null;
}): ToolInvocationResponse {
	return {
		id: p.id,
		turn_id: p.turnId,
		request_id: p.requestId,
		call_id: `call_${p.id}`,
		name: p.name,
		arguments: p.args,
		status: p.status,
		output: p.output,
		artifact_ids: p.artifacts ?? [],
		error_code: p.errorCode ?? null,
		effects_unknown: p.effectsUnknown ?? false,
	};
}

function steering(
	id: string,
	turnId: string,
	text: string,
	delivery: SteeringInstructionResponse["delivery"],
	status: string,
	errorCode: string | null = null,
): SteeringInstructionResponse {
	return { id, turn_id: turnId, text, delivery, status, error_code: errorCode };
}

function turn(p: {
	id: string;
	sessionId: string;
	userMessageId: string;
	assistantMessageId: string | null;
	status: string;
	model: string;
	usage: UsageResponse | null;
	maxTokens?: number | null;
	requestIds: string[];
	toolIds: string[];
	errorCode?: string | null;
	errorMessage?: string | null;
}): TurnResponse {
	return {
		id: p.id,
		session_id: p.sessionId,
		user_message_id: p.userMessageId,
		assistant_message_id: p.assistantMessageId,
		status: p.status,
		requested_model: p.model,
		resolved_model: p.model.split("/").pop() ?? p.model,
		usage: p.usage,
		error_code: p.errorCode ?? null,
		error_message: p.errorMessage ?? null,
		settings: settings(p.maxTokens ?? 4096),
		model_request_ids: p.requestIds,
		tool_invocation_ids: p.toolIds,
	};
}

function event(
	sessionId: string,
	sequence: number,
	kind: string,
	turnId: string | null,
	extra: { messageId?: string; requestId?: string; invocationId?: string } = {},
): EventResponse {
	return {
		session_id: sessionId,
		sequence,
		kind,
		turn_id: turnId,
		message_id: extra.messageId ?? null,
		revision: Math.floor(sequence / 6),
		request_id: extra.requestId ?? null,
		invocation_id: extra.invocationId ?? null,
	};
}

function session(p: {
	id: string;
	title: string;
	model: string;
	ownerNodeId?: string;
	revision: number;
	lastSeq: number;
	managedWorkspaceId: string | null;
	execution: SessionResponse["execution"];
	maxTokens?: number | null;
}): SessionResponse {
	return {
		id: p.id,
		owner_node_id: p.ownerNodeId ?? HOME,
		title: p.title,
		provider: p.model.split("/")[0] ?? "opencode-go",
		model: p.model,
		max_tokens: p.maxTokens ?? 4096,
		revision: p.revision,
		last_event_sequence: p.lastSeq,
		settings: settings(p.maxTokens ?? 4096),
		execution: p.execution,
		managed_workspace_id: p.managedWorkspaceId,
	};
}

function artifact(id: string, seed: string, sizeBytes: number, mediaType: string): ArtifactResponse {
	return { id, sha256: sha(seed), size_bytes: sizeBytes, media_type: mediaType };
}

/* ---------- nodes ---------- */

export const SAMPLE_NODES: NodeDetail[] = [
	{
		node: { node_id: HOME, name: "Home Linux", os: "linux" },
		note: "This machine. Owns the sample sessions, batches, and projects.",
	},
	{
		node: { node_id: "node_home_windows", name: "Home Windows", os: "windows" },
		note: "Same PC as Home Linux. Inactive while the other OS is running.",
	},
	{
		node: { node_id: "node_work_windows", name: "Work Windows", os: "windows" },
		note: "Work PC. Remote access needs Tailscale, which is not set up yet.",
	},
	{
		node: { node_id: "node_vps", name: "VPS", os: "linux" },
		note: "Optional aggregate. No sessions in this sample.",
	},
];

/* ---------- models ---------- */

const CAPS = {
	tools: true,
	reasoning_efforts: [],
	incremental_streaming: true,
	max_output_tokens: 8192,
	output_token_cap_supported: true,
};

export const SAMPLE_MODELS: ModelResponse[] = [
	{ id: "glm-5.3", provider: "opencode-go", model: "glm-5.3", display_name: "GLM-5.3", ready: true, is_default: false, reason: null, capabilities: CAPS },
	{ id: "glm-5.3-flash", provider: "opencode-go", model: "glm-5.3-flash", display_name: "GLM-5.3-Flash", ready: true, is_default: true, reason: null, capabilities: CAPS },
	{ id: "kimi-k2.7-code", provider: "opencode-go", model: "kimi-k2.7-code", display_name: "Kimi K2.7 Code", ready: true, is_default: false, reason: null, capabilities: CAPS },
	{ id: "claude-haiku-5-5", provider: "opencode-go", model: "claude-haiku-5-5", display_name: "Claude Haiku 5.5", ready: true, is_default: false, reason: null, capabilities: CAPS },
	{ id: "deepseek-v4-pro", provider: "opencode-go", model: "deepseek-v4-pro", display_name: "DeepSeek V4 Pro", ready: true, is_default: false, reason: null, capabilities: CAPS },
	{ id: "qwen3.8-max", provider: "opencode-go", model: "qwen3.8-max", display_name: "Qwen3.8 Max", ready: false, is_default: false, reason: "Not available on this key", capabilities: CAPS },
];

export function modelLabel(modelId: string): string {
	const local = modelId.split("/").pop() ?? modelId;
	return SAMPLE_MODELS.find((m) => m.model === local)?.display_name ?? local;
}

/* ---------- projects and workspaces ---------- */

const PROJECTS: ProjectResponse[] = [
	{
		id: SLOP,
		owner_node_id: HOME,
		path: "/home/aimaster/projects/slopconductor",
		git_common_dir: "/home/aimaster/projects/slopconductor/.git",
	},
	{
		id: HIVE,
		owner_node_id: HOME,
		path: "/home/aimaster/projects/hive-desktop",
		git_common_dir: "/home/aimaster/projects/hive-desktop/.git",
	},
];

const WS_ACTIVE: WorkspaceResponse = {
	id: "wsp_19c0",
	project_id: SLOP,
	session_id: "ses_7f3a",
	owner_node_id: HOME,
	path: "/home/aimaster/.local/share/slopconductor/workspaces/wsp_19c0",
	base_commit: "528d1c2",
	status: "ready",
	error_code: null,
	effects_unknown: false,
};

const WS_DONE: WorkspaceResponse = {
	id: "wsp_8b2f",
	project_id: SLOP,
	session_id: "ses_b41c",
	owner_node_id: HOME,
	path: "/home/aimaster/.local/share/slopconductor/workspaces/wsp_8b2f",
	base_commit: "528d1c2",
	status: "ready",
	error_code: null,
	effects_unknown: false,
};

const WS_FAILED: WorkspaceResponse = {
	id: "wsp_e41d",
	project_id: SLOP,
	session_id: "ses_c90e",
	owner_node_id: HOME,
	path: "/home/aimaster/.local/share/slopconductor/workspaces/wsp_e41d",
	base_commit: "3a0f7e9",
	status: "failed",
	error_code: "git_worktree_add",
	effects_unknown: true,
};

const WS_HIVE: WorkspaceResponse = {
	id: "wsp_0f6c",
	project_id: HIVE,
	session_id: "ses_51de",
	owner_node_id: HOME,
	path: "/home/aimaster/.local/share/slopconductor/workspaces/wsp_0f6c",
	base_commit: "a7c3e02",
	status: "ready",
	error_code: null,
	effects_unknown: false,
};

const DIFF_ACTIVE: WorkspaceDiffSummary = {
	base_commit: "528d1c2",
	files: [
		{ path: "crates/slop-cli/src/follow.rs", added: 15, removed: 3 },
		{ path: "crates/slop-cli/tests/follow.rs", added: 22, removed: 0 },
		{ path: "docs/clients.md", added: 3, removed: 1 },
	],
};

const DIFF_HIVE: WorkspaceDiffSummary = {
	base_commit: "a7c3e02",
	files: [
		{ path: "src/lib/settings.ts", added: 8, removed: 12 },
		{ path: "src-tauri/src/lib.rs", added: 4, removed: 0 },
	],
};

/* ---------- sessions ---------- */

const S1 = "ses_7f3a";
const S1_T1 = "turn_s1_1";
const S1_T2 = "turn_s1_2";

const s1Requests = {
	r1a: modelRequest({ id: "req_s1_1a", turnId: S1_T1, messageId: "msg_s1_a1a", ordinal: 1, model: "opencode-go/glm-5.3", usage: usage(1842, 96, 1938), finish: "tool_calls" }),
	r1b: modelRequest({ id: "req_s1_1b", turnId: S1_T1, messageId: "msg_s1_a1b", ordinal: 2, model: "opencode-go/glm-5.3", usage: usage(1204, 318), finish: "tool_calls" }),
	r1c: modelRequest({ id: "req_s1_1c", turnId: S1_T1, messageId: "msg_s1_a1c", ordinal: 3, model: "opencode-go/glm-5.3", usage: usage(1540, 74, 1614), finish: "stop" }),
	r2a: modelRequest({ id: "req_s1_2a", turnId: S1_T2, messageId: "msg_s1_a2a", ordinal: 1, model: "opencode-go/glm-5.3", usage: usage(2311, 402), finish: "tool_calls" }),
	r2b: modelRequest({ id: "req_s1_2b", turnId: S1_T2, messageId: "msg_s1_a2b", ordinal: 2, model: "opencode-go/glm-5.3", usage: null, status: "running", finish: null }),
};

const s1Tools = {
	read: tool({
		id: "inv_s1_1a",
		turnId: S1_T1,
		requestId: "req_s1_1a",
		name: "read",
		args: { path: "crates/slop-cli/src/follow.rs", offset: 1, limit: 120 },
		status: "completed",
		output: "use crate::output;\n\npub async fn follow(stream: EventStream) -> Result<()> {\n    while let Some(frame) = stream.next().await {\n        match frame? {\n            Frame::Durable { event } => render_event(&event),\n            Frame::Delta { .. } => {}\n            Frame::Heartbeat => {}\n        }\n    }\n    Ok(())\n}",
	}),
	grep: tool({
		id: "inv_s1_1b",
		turnId: S1_T1,
		requestId: "req_s1_1a",
		name: "bash",
		args: { command: 'rg -n "steer" crates/slop-cli -g "*.rs"' },
		status: "completed",
		output: "crates/slop-cli/src/follow.rs:41:    // steering is durable\ncrates/slop-cli/src/follow.rs:88:fn render_steering(status: &str)\ncrates/slop-cli/tests/follow.rs:12:fn next_boundary_applies()\n\n14 matches in 3 files",
	}),
	edit1: tool({
		id: "inv_s1_1c",
		turnId: S1_T1,
		requestId: "req_s1_1b",
		name: "edit",
		args: {
			path: "crates/slop-cli/src/follow.rs",
			edits: [
				{
					oldText: "            Frame::Durable { event } => render_event(&event),",
					newText: "            Frame::Durable { event } => render_event(&event),\n            Frame::Steering { status } => render_steering(&status),",
				},
			],
		},
		status: "completed",
		output: "Replaced 1 region in crates/slop-cli/src/follow.rs.",
	}),
	test1: tool({
		id: "inv_s1_1d",
		turnId: S1_T1,
		requestId: "req_s1_1b",
		name: "bash",
		args: { command: "cargo test -p slop-cli follow" },
		status: "completed",
		output: "running 12 tests\ntest follow::renders_durable_events ... ok\ntest follow::steering_renders_status ... ok\n...\ntest result: ok. 12 passed; 0 failed; 0 ignored",
		artifacts: ["art_s1_log"],
	}),
	edit2: tool({
		id: "inv_s1_2a",
		turnId: S1_T2,
		requestId: "req_s1_2a",
		name: "edit",
		args: {
			path: "crates/slop-cli/tests/follow.rs",
			edits: [
				{
					oldText: "fn next_boundary_applies() {",
					newText: "fn immediate_applies_now() {\n    let steering = Steering::immediate(\"stop and reconsider\");\n    assert_applied(steering);\n}\n\nfn next_boundary_applies() {",
				},
			],
		},
		status: "completed",
		output: "Replaced 1 region in crates/slop-cli/tests/follow.rs.",
	}),
	test2: tool({
		id: "inv_s1_2b",
		turnId: S1_T2,
		requestId: "req_s1_2b",
		name: "bash",
		args: { command: "cargo test -p slop-cli follow" },
		status: "running",
		output: "running 13 tests\ntest follow::steering_renders_status ... ok\ntest follow::next_boundary_applies ... ok\ntest follow::immediate_applies_now ...",
	}),
};

const s1Messages = {
	u1: userMessage("msg_s1_u1", S1, S1_T1, "Add a steering queue to the session view. Keep the public API unchanged."),
	a1a: assistantMessage("msg_s1_a1a", S1, S1_T1, "req_s1_1a", "I'll read the follow loop first, then check how steering is delivered today."),
	a1b: assistantMessage("msg_s1_a1b", S1, S1_T1, "req_s1_1b", "Steering arrives as durable events, so the renderer can show accepted and applied states from one stream. I'll add the status line in follow.rs."),
	a1c: assistantMessage("msg_s1_a1c", S1, S1_T1, "req_s1_1c", "Done. Accepted and applied steering now render as separate lines. The public API is unchanged, and the follow tests pass."),
	u2: userMessage("msg_s1_u2", S1, S1_T2, "Also cover the immediate delivery mode in the tests."),
	a2a: assistantMessage("msg_s1_a2a", S1, S1_T2, "req_s1_2a", "The next-boundary test is the template. I'll add an immediate-mode case beside it."),
	a2b: assistantMessage("msg_s1_a2b", S1, S1_T2, "req_s1_2b", "Running the follow tests to confirm the new case passes.", "checkpoint"),
};

const s1Steering = {
	applied: steering("ins_s1_1", S1_T2, "Prefer the durable events endpoint over polling.", "next-boundary", "applied"),
	accepted: steering("ins_s1_2", S1_T2, "Keep the public API unchanged.", "after-turn", "accepted"),
};

const s1Artifacts: ArtifactRef[] = [
	{ artifact: artifact("art_s1_log", "9c1e4b07a2d5f8e1", 38144, "text/plain"), source_label: "cargo test output", invocation_id: "inv_s1_1d" },
	{ artifact: artifact("art_s1_diff", "5f0a2e91c7b3d648", 3412, "text/x-diff"), source_label: "Workspace diff", invocation_id: null },
];

const s1Turn1 = turn({ id: S1_T1, sessionId: S1, userMessageId: "msg_s1_u1", assistantMessageId: "msg_s1_a1c", status: "completed", model: "opencode-go/glm-5.3", usage: usage(4586, 488), requestIds: ["req_s1_1a", "req_s1_1b", "req_s1_1c"], toolIds: ["inv_s1_1a", "inv_s1_1b", "inv_s1_1c", "inv_s1_1d"] });
const s1Turn2 = turn({ id: S1_T2, sessionId: S1, userMessageId: "msg_s1_u2", assistantMessageId: "msg_s1_a2b", status: "running", model: "opencode-go/glm-5.3", usage: usage(2311, 402), requestIds: ["req_s1_2a", "req_s1_2b"], toolIds: ["inv_s1_2a", "inv_s1_2b"] });

const s1Timeline: TimelineItem[] = [
	{ kind: "turn", turn: s1Turn1 },
	{ kind: "message", message: s1Messages.u1 },
	{ kind: "request", request: s1Requests.r1a },
	{ kind: "message", message: s1Messages.a1a },
	{ kind: "tool", invocation: s1Tools.read },
	{ kind: "tool", invocation: s1Tools.grep },
	{ kind: "request", request: s1Requests.r1b },
	{ kind: "message", message: s1Messages.a1b },
	{ kind: "tool", invocation: s1Tools.edit1 },
	{ kind: "tool", invocation: s1Tools.test1 },
	{ kind: "request", request: s1Requests.r1c },
	{ kind: "message", message: s1Messages.a1c },
	{ kind: "turn", turn: s1Turn2 },
	{ kind: "message", message: s1Messages.u2 },
	{ kind: "request", request: s1Requests.r2a },
	{ kind: "message", message: s1Messages.a2a },
	{ kind: "tool", invocation: s1Tools.edit2 },
	{ kind: "steering", instruction: s1Steering.applied },
	{ kind: "request", request: s1Requests.r2b },
	{ kind: "message", message: s1Messages.a2b },
	{ kind: "tool", invocation: s1Tools.test2 },
	{ kind: "steering", instruction: s1Steering.accepted },
];

const s1Events: EventResponse[] = [
	event(S1, 81, "user_message_accepted", S1_T2, { messageId: "msg_s1_u2" }),
	event(S1, 82, "turn_admitted", S1_T2),
	event(S1, 83, "model_request_started", S1_T2, { requestId: "req_s1_2a" }),
	event(S1, 84, "model_request_finished", S1_T2, { requestId: "req_s1_2a" }),
	event(S1, 85, "tool_invocation_recorded", S1_T2, { invocationId: "inv_s1_2a" }),
	event(S1, 86, "steering_accepted", S1_T2),
	event(S1, 87, "tool_invocation_completed", S1_T2, { invocationId: "inv_s1_2a" }),
	event(S1, 88, "steering_applied", S1_T2),
	event(S1, 89, "model_request_started", S1_T2, { requestId: "req_s1_2b" }),
	event(S1, 90, "tool_invocation_recorded", S1_T2, { invocationId: "inv_s1_2b" }),
	event(S1, 91, "tool_invocation_started", S1_T2, { invocationId: "inv_s1_2b" }),
	event(S1, 92, "steering_accepted", S1_T2),
];

/** Minimal event history for sessions that are not expanded in the prototype. */
function briefEvents(sessionId: string, lastSeq: number, turnId: string, kinds: string[]): EventResponse[] {
	return kinds.map((kind, i) => event(sessionId, lastSeq - kinds.length + 1 + i, kind, turnId));
}

const S2 = "ses_2b9d";
const S2_T1 = "turn_s2_1";
const s2u = userMessage("msg_s2_u1", S2, S2_T1, "Fix the flaky projects smoke test. Check the workspace path before the second run.");
const s2a = assistantMessage("msg_s2_a1", S2, S2_T1, "req_s2_1", "The smoke test races on the workspace path. I'll pin the ids before the second run, then pause here so you can review the approach.");
const s2r = modelRequest({ id: "req_s2_1", turnId: S2_T1, messageId: "msg_s2_a1", ordinal: 1, model: "opencode-go/claude-haiku-5-5", usage: usage(980, 143) });

const S3 = "ses_51de";
const S3_T1 = "turn_s3_1";
const s3u = userMessage("msg_s3_u1", S3, S3_T1, "Move the settings file into the daemon config store.");
const s3a = assistantMessage("msg_s3_a1", S3, S3_T1, "req_s3_1", "Reading the current settings store before I move it.", "interrupted");
const s3r = modelRequest({ id: "req_s3_1", turnId: S3_T1, messageId: "msg_s3_a1", ordinal: 1, model: "opencode-go/kimi-k2.7-code", usage: null, status: "interrupted", finish: null, errorCode: "daemon_shutdown" });
const s3Read = tool({ id: "inv_s3_1a", turnId: S3_T1, requestId: "req_s3_1", name: "read", args: { path: "src/lib/settings.ts", offset: 1, limit: 200 }, status: "completed", output: "export const settings = { theme: 'system' };" });
const s3Push = tool({ id: "inv_s3_1b", turnId: S3_T1, requestId: "req_s3_1", name: "bash", args: { command: "git push origin settings-move" }, status: "interrupted", output: "To github.com:aimaster/hive-desktop.git\n * [new branch]      settings-move -> settings-move", effectsUnknown: true, errorCode: "daemon_shutdown" });

const S4 = "ses_e0a7";
const S4_T1 = "turn_s4_1";
const s4u = userMessage("msg_s4_u1", S4, S4_T1, "Summarize the provider interface doc in five bullets.");

const S5 = "ses_b41c";
const S5_T1 = "turn_s5_1";
const s5u = userMessage("msg_s5_u1", S5, S5_T1, "Explain the workspace lease rules in one paragraph.");
const s5a = assistantMessage("msg_s5_a1", S5, S5_T1, "req_s5_1", "A workspace lease belongs to one canonical root and one admitted turn at a time. Two sessions cannot write the same root concurrently, and the lease is released when the turn reaches a terminal state. Nested roots and external editors are outside the lease.");
const s5r = modelRequest({ id: "req_s5_1", turnId: S5_T1, messageId: "msg_s5_a1", ordinal: 1, model: "opencode-go/deepseek-v4-pro", usage: usage(1310, 97) });

const S6 = "ses_c90e";
const S6_T1 = "turn_s6_1";
const s6u = userMessage("msg_s6_u1", S6, S6_T1, "Check that the worktree path works on Windows.");

const S7 = "ses_04f8";
const S7_T1 = "turn_s7_1";
const s7u = userMessage("msg_s7_u1", S7, S7_T1, "Draft release notes for the next tag from the commit log.");
const s7a = assistantMessage("msg_s7_a1", S7, S7_T1, "req_s7_1", "Drafting the release notes from the", "checkpoint");
const s7r = modelRequest({ id: "req_s7_1", turnId: S7_T1, messageId: "msg_s7_a1", ordinal: 1, model: "opencode-go/qwen3.8-max", usage: null, status: "cancelled", finish: null, errorCode: "cancelled" });

const SESSIONS: SessionDetail[] = [
	{
		session: session({ id: S1, title: "Keep the public API unchanged while adding steering", model: "opencode-go/glm-5.3", revision: 15, lastSeq: 92, managedWorkspaceId: WS_ACTIVE.id, execution: { root: WS_ACTIVE.path, allowed_tools: ["read", "write", "edit", "bash"], shell_timeout_ms: 30000, max_output_bytes: 1048576, max_tool_calls: 32, max_model_requests: 16 } }),
		updated_label: "Now",
		project_name: "slopconductor",
		timeline: s1Timeline,
		turns: [s1Turn1, s1Turn2],
		events: s1Events,
		artifacts: s1Artifacts,
		workspace: WS_ACTIVE,
		diff: DIFF_ACTIVE,
	},
	{
		session: session({ id: S2, title: "Fix the flaky projects smoke test", model: "opencode-go/claude-haiku-5-5", revision: 6, lastSeq: 27, managedWorkspaceId: null, execution: null }),
		updated_label: "14 min ago",
		project_name: null,
		timeline: [
			{ kind: "turn", turn: turn({ id: S2_T1, sessionId: S2, userMessageId: s2u.id, assistantMessageId: s2a.id, status: "paused", model: "opencode-go/claude-haiku-5-5", usage: usage(980, 143), requestIds: [s2r.id], toolIds: [] }) },
			{ kind: "message", message: s2u },
			{ kind: "request", request: s2r },
			{ kind: "message", message: s2a },
		],
		turns: [turn({ id: S2_T1, sessionId: S2, userMessageId: s2u.id, assistantMessageId: s2a.id, status: "paused", model: "opencode-go/claude-haiku-5-5", usage: usage(980, 143), requestIds: [s2r.id], toolIds: [] })],
		events: briefEvents(S2, 27, S2_T1, ["user_message_accepted", "turn_admitted", "model_request_finished", "turn_paused"]),
		artifacts: [],
		workspace: null,
		diff: null,
	},
	{
		session: session({ id: S3, title: "Move Hive settings into the daemon config store", model: "opencode-go/kimi-k2.7-code", revision: 9, lastSeq: 44, managedWorkspaceId: WS_HIVE.id, execution: { root: WS_HIVE.path, allowed_tools: ["read", "edit", "bash"], shell_timeout_ms: 30000, max_output_bytes: 1048576, max_tool_calls: 32, max_model_requests: 16 } }),
		updated_label: "2 h ago",
		project_name: "hive-desktop",
		timeline: [
			{ kind: "turn", turn: turn({ id: S3_T1, sessionId: S3, userMessageId: s3u.id, assistantMessageId: s3a.id, status: "interrupted", model: "opencode-go/kimi-k2.7-code", usage: null, requestIds: [s3r.id], toolIds: [s3Read.id, s3Push.id], errorCode: "daemon_shutdown", errorMessage: "The daemon stopped while a command was running." }) },
			{ kind: "message", message: s3u },
			{ kind: "request", request: s3r },
			{ kind: "message", message: s3a },
			{ kind: "tool", invocation: s3Read },
			{ kind: "tool", invocation: s3Push },
		],
		turns: [turn({ id: S3_T1, sessionId: S3, userMessageId: s3u.id, assistantMessageId: s3a.id, status: "interrupted", model: "opencode-go/kimi-k2.7-code", usage: null, requestIds: [s3r.id], toolIds: [s3Read.id, s3Push.id], errorCode: "daemon_shutdown", errorMessage: "The daemon stopped while a command was running." })],
		events: briefEvents(S3, 44, S3_T1, ["turn_admitted", "tool_invocation_started", "daemon_shutdown", "turn_interrupted"]),
		artifacts: [],
		workspace: WS_HIVE,
		diff: DIFF_HIVE,
	},
	{
		session: session({ id: S4, title: "Summarize the provider interface doc", model: "opencode-go/glm-5.3-flash", revision: 1, lastSeq: 3, managedWorkspaceId: null, execution: null }),
		updated_label: "3 min ago",
		project_name: null,
		timeline: [
			{ kind: "turn", turn: turn({ id: S4_T1, sessionId: S4, userMessageId: s4u.id, assistantMessageId: null, status: "queued", model: "opencode-go/glm-5.3-flash", usage: null, requestIds: [], toolIds: [] }) },
			{ kind: "message", message: s4u },
		],
		turns: [turn({ id: S4_T1, sessionId: S4, userMessageId: s4u.id, assistantMessageId: null, status: "queued", model: "opencode-go/glm-5.3-flash", usage: null, requestIds: [], toolIds: [] })],
		events: briefEvents(S4, 3, S4_T1, ["user_message_accepted", "turn_queued"]),
		artifacts: [],
		workspace: null,
		diff: null,
	},
	{
		session: session({ id: S5, title: "Explain the workspace lease rules", model: "opencode-go/deepseek-v4-pro", revision: 4, lastSeq: 18, managedWorkspaceId: WS_DONE.id, execution: { root: WS_DONE.path, allowed_tools: ["read"], shell_timeout_ms: 30000, max_output_bytes: 1048576, max_tool_calls: 32, max_model_requests: 16 } }),
		updated_label: "Yesterday",
		project_name: "slopconductor",
		timeline: [
			{ kind: "turn", turn: turn({ id: S5_T1, sessionId: S5, userMessageId: s5u.id, assistantMessageId: s5a.id, status: "completed", model: "opencode-go/deepseek-v4-pro", usage: usage(1310, 97), requestIds: [s5r.id], toolIds: [] }) },
			{ kind: "message", message: s5u },
			{ kind: "request", request: s5r },
			{ kind: "message", message: s5a },
		],
		turns: [turn({ id: S5_T1, sessionId: S5, userMessageId: s5u.id, assistantMessageId: s5a.id, status: "completed", model: "opencode-go/deepseek-v4-pro", usage: usage(1310, 97), requestIds: [s5r.id], toolIds: [] })],
		events: briefEvents(S5, 18, S5_T1, ["user_message_accepted", "turn_admitted", "assistant_message_completed", "turn_completed"]),
		artifacts: [],
		workspace: WS_DONE,
		diff: { base_commit: "528d1c2", files: [] },
	},
	{
		session: session({ id: S6, title: "Retry the Windows worktree check", model: "opencode-go/qwen3.8-max", revision: 3, lastSeq: 11, managedWorkspaceId: WS_FAILED.id, execution: { root: WS_FAILED.path, allowed_tools: ["read", "bash"], shell_timeout_ms: 30000, max_output_bytes: 1048576, max_tool_calls: 32, max_model_requests: 16 } }),
		updated_label: "Yesterday",
		project_name: "slopconductor",
		timeline: [
			{ kind: "turn", turn: turn({ id: S6_T1, sessionId: S6, userMessageId: s6u.id, assistantMessageId: null, status: "failed", model: "opencode-go/qwen3.8-max", usage: null, requestIds: [], toolIds: [], errorCode: "workspace_failed", errorMessage: "The worktree could not be created. Git reported an error." }) },
			{ kind: "message", message: s6u },
		],
		turns: [turn({ id: S6_T1, sessionId: S6, userMessageId: s6u.id, assistantMessageId: null, status: "failed", model: "opencode-go/qwen3.8-max", usage: null, requestIds: [], toolIds: [], errorCode: "workspace_failed", errorMessage: "The worktree could not be created. Git reported an error." })],
		events: briefEvents(S6, 11, S6_T1, ["user_message_accepted", "workspace_allocating", "workspace_failed", "turn_failed"]),
		artifacts: [],
		workspace: WS_FAILED,
		diff: null,
	},
	{
		session: session({ id: S7, title: "Draft release notes for the next tag", model: "opencode-go/qwen3.8-max", revision: 3, lastSeq: 9, managedWorkspaceId: null, execution: null }),
		updated_label: "3 days ago",
		project_name: null,
		timeline: [
			{ kind: "turn", turn: turn({ id: S7_T1, sessionId: S7, userMessageId: s7u.id, assistantMessageId: s7a.id, status: "cancelled", model: "opencode-go/qwen3.8-max", usage: null, requestIds: [s7r.id], toolIds: [], errorCode: "cancelled" }) },
			{ kind: "message", message: s7u },
			{ kind: "request", request: s7r },
			{ kind: "message", message: s7a },
		],
		turns: [turn({ id: S7_T1, sessionId: S7, userMessageId: s7u.id, assistantMessageId: s7a.id, status: "cancelled", model: "opencode-go/qwen3.8-max", usage: null, requestIds: [s7r.id], toolIds: [], errorCode: "cancelled" })],
		events: briefEvents(S7, 9, S7_T1, ["user_message_accepted", "turn_admitted", "turn_cancel_requested", "turn_cancelled"]),
		artifacts: [],
		workspace: null,
		diff: null,
	},
];

/* ---------- batches ---------- */

const BATCH_ID = "bat_4c21";
const BATCH_PROMPTS = ["Improve error messages in the CLI.", "Make failures explain the next step."];
const BATCH_MODELS = ["opencode-go/glm-5.3", "opencode-go/kimi-k2.7-code", "opencode-go/claude-haiku-5-5"];
const BATCH_SETTINGS: GenerationSettings[] = [settings(2048), settings(4096)];

/**
 * Member status by combination index. Index is prompt * 6 + model * 2 + settings,
 * matching the daemon's deterministic expansion (prompt outermost).
 */
const MEMBER_STATUS: string[] = [
	"completed", "completed", "completed", "completed", "completed", "completed",
	"running", "running",
	"failed",
	"interrupted",
	"queued", "queued",
];

const MEMBER_OUTPUT: Record<number, string> = {
	0: "Errors name the file, the line, and the expected value. The message no longer repeats the stack trace.",
	1: "Errors name the file and line. Each message includes the expected value and one suggested command.",
	2: "Errors use a short summary. The full trace is printed only when the --verbose flag is set.",
	3: "Each failure explains the next step: rerun with --json, check the daemon address, or retry later.",
	4: "Failure messages include an error code, the cause, and whether the action can be retried.",
	5: "Errors state what happened and what is safe to do next. No apology, no duplicate context.",
};

function memberTask(index: number): TaskResponse {
	const promptIndex = Math.floor(index / 6);
	const modelIndex = Math.floor((index % 6) / 2);
	const settingsIndex = index % 2;
	const status = MEMBER_STATUS[index] ?? "queued";
	const taskId = `tsk_bat4c21_${String(index).padStart(2, "0")}`;
	const runId = `run_bat4c21_${String(index).padStart(2, "0")}`;
	const failed = status === "failed";
	const interrupted = status === "interrupted";
	const turnRecord = turn({
		id: `turn_bat4c21_${index}`,
		sessionId: `ses_bat4c21_${index}`,
		userMessageId: `msg_bat4c21_${index}`,
		assistantMessageId: status === "completed" ? `msg_bat4c21_a${index}` : null,
		status,
		model: BATCH_MODELS[modelIndex] ?? BATCH_MODELS[0]!,
		usage: status === "completed" ? usage(1100 + index * 7, 240 + index * 3) : null,
		maxTokens: BATCH_SETTINGS[settingsIndex]?.max_output_tokens ?? 4096,
		requestIds: [],
		toolIds: [],
		errorCode: failed ? "provider_rate_limited" : interrupted ? "daemon_shutdown" : null,
		errorMessage: failed
			? "The provider rate limit was reached. Retry this combination later."
			: interrupted
				? "The daemon stopped during this combination. Retry is explicit."
				: null,
	});
	return {
		id: taskId,
		owner_node_id: HOME,
		spec: {
			title: null,
			prompt: BATCH_PROMPTS[promptIndex] ?? BATCH_PROMPTS[0]!,
			model: BATCH_MODELS[modelIndex] ?? BATCH_MODELS[0]!,
			settings: BATCH_SETTINGS[settingsIndex] ?? settings(),
			project: { project_id: SLOP, base_ref: "main", allowed_tools: ["read", "edit", "bash"] },
		},
		batch_id: BATCH_ID,
		combination_index: index,
		last_event_sequence: 300 + index,
		latest_run: {
			id: runId,
			task_id: taskId,
			attempt: 1,
			retry_of: null,
			session_id: `ses_bat4c21_${index}`,
			workspace_id: null,
			effects_unknown: interrupted,
			turn: turnRecord,
		},
	};
}

function batchStatuses(members: TaskResponse[]): Record<string, number> {
	const counts: Record<string, number> = {};
	for (const m of members) {
		const s = m.latest_run.turn.status;
		counts[s] = (counts[s] ?? 0) + 1;
	}
	return counts;
}

const BATCH_MEMBERS = Array.from({ length: 12 }, (_, i) => memberTask(i));

const BATCH_CMP_ID = "bat_9e07";
const CMP_MODELS = ["opencode-go/glm-5.3", "opencode-go/deepseek-v4-pro", "opencode-go/claude-haiku-5-5"];
const CMP_PROMPT = "Fix the failing follow test without changing its assertions.";

const BATCH_CMP_MEMBERS: TaskResponse[] = CMP_MODELS.map((model, i) => ({
	id: `tsk_bat9e07_${i}`,
	owner_node_id: HOME,
	spec: {
		title: null,
		prompt: CMP_PROMPT,
		model,
		settings: settings(4096),
		project: { project_id: SLOP, base_ref: "main", allowed_tools: ["read", "edit", "bash"] },
	},
	batch_id: BATCH_CMP_ID,
	combination_index: i,
	last_event_sequence: 200 + i,
	latest_run: {
		id: `run_bat9e07_${i}`,
		task_id: `tsk_bat9e07_${i}`,
		attempt: 1,
		retry_of: null,
		session_id: `ses_bat9e07_${i}`,
		workspace_id: null,
		effects_unknown: false,
		turn: turn({
			id: `turn_bat9e07_${i}`,
			sessionId: `ses_bat9e07_${i}`,
			userMessageId: `msg_bat9e07_${i}`,
			assistantMessageId: `msg_bat9e07_a${i}`,
			status: "completed",
			model,
			usage: usage(860 + i * 40, 210 + i * 12),
			maxTokens: 4096,
			requestIds: [],
			toolIds: [],
		}),
	},
}));

const BATCHES: BatchDetail[] = [
	{
		batch: {
			id: BATCH_ID,
			owner_node_id: HOME,
			spec: {
				name: "Error handling sweep",
				prompts: BATCH_PROMPTS,
				models: BATCH_MODELS,
				settings: BATCH_SETTINGS,
				project: { project_id: SLOP, base_ref: "main", allowed_tools: ["read", "edit", "bash"] },
				max_concurrent_runs: 2,
				default_max_output_tokens: null,
			},
			total: BATCH_MEMBERS.length,
			statuses: batchStatuses(BATCH_MEMBERS),
		} satisfies BatchResponse,
		project_name: "slopconductor",
		members: BATCH_MEMBERS.map((task, i) => ({ task, output: MEMBER_OUTPUT[i] ?? null })),
	},
	{
		batch: {
			id: BATCH_CMP_ID,
			owner_node_id: HOME,
			spec: {
				name: "Model comparison for the follow fix",
				prompts: [CMP_PROMPT],
				models: CMP_MODELS,
				settings: [settings(4096)],
				project: { project_id: SLOP, base_ref: "main", allowed_tools: ["read", "edit", "bash"] },
				max_concurrent_runs: 3,
				default_max_output_tokens: null,
			},
			total: BATCH_CMP_MEMBERS.length,
			statuses: batchStatuses(BATCH_CMP_MEMBERS),
		},
		project_name: "slopconductor",
		members: BATCH_CMP_MEMBERS.map((task) => ({
			task,
			output: "The assertion now matches the durable event order. The follow test passes without edits to the expectations.",
		})),
	},
];

/* ---------- projects ---------- */

const PROJECT_DETAILS: ProjectDetail[] = [
	{
		project: PROJECTS[0]!,
		name: "slopconductor",
		workspaces: [
			{ workspace: WS_ACTIVE, session_title: "Keep the public API unchanged while adding steering", diff: DIFF_ACTIVE },
			{ workspace: WS_DONE, session_title: "Explain the workspace lease rules", diff: { base_commit: "528d1c2", files: [] } },
			{ workspace: WS_FAILED, session_title: "Retry the Windows worktree check", diff: null },
		],
	},
	{
		project: PROJECTS[1]!,
		name: "hive-desktop",
		workspaces: [{ workspace: WS_HIVE, session_title: "Move Hive settings into the daemon config store", diff: DIFF_HIVE }],
	},
];

/* ---------- scenario-aware accessors ---------- */

export function visibleSessions(scenario: SampleScenario): SessionDetail[] {
	return scenario === "empty" ? [] : SESSIONS;
}

export function visibleBatches(scenario: SampleScenario): BatchDetail[] {
	return scenario === "empty" ? [] : BATCHES;
}

export function visibleProjects(scenario: SampleScenario): ProjectDetail[] {
	return scenario === "empty" ? [] : PROJECT_DETAILS;
}

/** Plain-language statement shown in the sample notice bar. */
export function sampleNotice(scenario: SampleScenario): { title: string; detail: string; tone: "sample" | "offline" } {
	if (scenario === "empty") {
		return {
			title: "Sample empty state",
			detail: "No node is connected, and this node has no sessions, batches, or projects yet.",
			tone: "sample",
		};
	}
	if (scenario === "offline") {
		return {
			title: "Home Linux is unreachable",
			detail: "Showing data last received 12 minutes ago. Actions are paused until the node responds.",
			tone: "offline",
		};
	}
	return {
		title: "Sample data",
		detail: "No node is connected. Nothing here was sent to or accepted by a daemon.",
		tone: "sample",
	};
}
