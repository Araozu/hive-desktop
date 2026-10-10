/**
 * Wire types for the Slop Conductor daemon API.
 *
 * Mirrors slopconductor's `slop-protocol` crate (working tree, 2026-10-10).
 * Field names are the wire names. Do not reshape them for UI convenience;
 * UI-only projections belong in `$lib/view`.
 *
 * Several status fields are plain strings on the wire. The unions below list the
 * values the UI can present. Unknown values must fall back to a neutral style
 * (see `$lib/status`), never to a success or failure style.
 */

export type DeliveryMode = 'after-turn' | 'next-boundary' | 'immediate';

export type TurnStatus =
	| 'queued'
	| 'paused'
	| 'running'
	| 'completed'
	| 'failed'
	| 'cancelled'
	| 'interrupted'
	| 'incomplete';

export type ModelRequestStatus = 'running' | 'completed' | 'failed' | 'cancelled' | 'interrupted';

export type ToolStatus = 'pending' | 'running' | 'completed' | 'failed' | 'interrupted' | 'skipped';

export type SteeringStatus = 'accepted' | 'applied' | 'rejected';

export type WorkspaceStatus = 'reserved' | 'allocating' | 'ready' | 'failed' | 'removing' | 'removed';

export interface GenerationSettings {
	max_output_tokens: number | null;
	reasoning_effort: string | null;
}

export interface WorkspacePolicy {
	/** Absolute path on the authoritative daemon's machine. */
	root: string;
	allowed_tools: string[];
	shell_timeout_ms: number;
	max_output_bytes: number;
	max_tool_calls: number;
	max_model_requests: number;
}

export interface SessionResponse {
	id: string;
	owner_node_id: string;
	title: string | null;
	provider: string;
	model: string;
	max_tokens: number | null;
	revision: number;
	last_event_sequence: number;
	settings: GenerationSettings;
	execution: WorkspacePolicy | null;
	managed_workspace_id: string | null;
}

export type BlockContent =
	| { type: 'text'; text: string }
	| { type: 'tool_call'; call_id: string; name: string; arguments: Record<string, unknown> }
	| {
			type: 'tool_result';
			call_id: string;
			is_error: boolean;
			output: string;
			artifact_ids: string[];
			effects_unknown: boolean;
	  }
	| { type: 'refusal'; text: string }
	| { type: 'unknown' };

export type ContentBlock = { id: string } & BlockContent;

export interface UsageResponse {
	input_tokens: number | null;
	output_tokens: number | null;
	total_tokens: number | null;
	total_source: string | null;
}

export interface MessageResponse {
	id: string;
	session_id: string;
	turn_id: string;
	role: 'user' | 'assistant' | (string & {});
	text: string;
	status: string;
	blocks: ContentBlock[];
	request_id: string | null;
}

export interface TurnResponse {
	id: string;
	session_id: string;
	user_message_id: string;
	assistant_message_id: string | null;
	status: TurnStatus | (string & {});
	requested_model: string;
	resolved_model: string | null;
	usage: UsageResponse | null;
	error_code: string | null;
	error_message: string | null;
	settings: GenerationSettings;
	model_request_ids: string[];
	tool_invocation_ids: string[];
}

export interface ModelRequestResponse {
	id: string;
	turn_id: string;
	message_id: string;
	ordinal: number;
	requested_model: string;
	resolved_model: string | null;
	requested_settings: GenerationSettings;
	effective_settings: GenerationSettings;
	status: ModelRequestStatus | (string & {});
	finish_reason: string | null;
	usage: UsageResponse | null;
	error_code: string | null;
}

export interface ToolInvocationResponse {
	id: string;
	turn_id: string;
	request_id: string;
	call_id: string;
	name: string;
	arguments: Record<string, unknown>;
	status: ToolStatus | (string & {});
	output: string | null;
	artifact_ids: string[];
	error_code: string | null;
	effects_unknown: boolean;
}

export interface SteeringInstructionResponse {
	id: string;
	turn_id: string;
	text: string;
	delivery: DeliveryMode;
	status: SteeringStatus | (string & {});
	error_code: string | null;
}

export interface EventResponse {
	session_id: string;
	sequence: number;
	kind: string;
	turn_id: string | null;
	message_id: string | null;
	revision: number;
	request_id?: string | null;
	invocation_id?: string | null;
}

export interface ArtifactResponse {
	id: string;
	sha256: string;
	size_bytes: number;
	media_type: string;
}

export interface ModelCapabilities {
	tools: boolean;
	reasoning_efforts: string[];
	incremental_streaming: boolean;
	max_output_tokens: number;
	output_token_cap_supported: boolean;
}

export interface ModelResponse {
	id: string;
	provider: string;
	model: string;
	display_name: string;
	ready: boolean;
	is_default: boolean;
	reason: string | null;
	capabilities: ModelCapabilities;
}

export interface NodeResponse {
	node_id: string;
	name: string;
	os: string;
}

export interface ProjectResponse {
	id: string;
	owner_node_id: string;
	path: string;
	/** Canonical Git common directory. Separate clones are separate projects. */
	git_common_dir: string;
}

export interface WorkspaceResponse {
	id: string;
	project_id: string;
	session_id: string;
	owner_node_id: string;
	path: string;
	base_commit: string;
	status: WorkspaceStatus | (string & {});
	error_code: string | null;
	effects_unknown: boolean;
}

export interface ProjectWorkspaceRequest {
	project_id: string;
	base_ref: string | null;
	allowed_tools: string[];
}

export interface TaskSpec {
	title: string | null;
	prompt: string;
	/** Provider-qualified model identifier, for example `opencode-go/glm-5.3`. */
	model: string;
	settings: GenerationSettings;
	project: ProjectWorkspaceRequest | null;
}

export interface RunResponse {
	id: string;
	task_id: string;
	attempt: number;
	retry_of: string | null;
	session_id: string;
	workspace_id: string | null;
	effects_unknown: boolean;
	turn: TurnResponse;
}

export interface TaskResponse {
	id: string;
	owner_node_id: string;
	spec: TaskSpec;
	batch_id: string | null;
	combination_index: number | null;
	last_event_sequence: number;
	latest_run: RunResponse;
}

export interface BatchSpec {
	name: string;
	prompts: string[];
	models: string[];
	settings: GenerationSettings[];
	project: ProjectWorkspaceRequest | null;
	max_concurrent_runs: number;
	default_max_output_tokens: number | null;
}

export interface BatchResponse {
	id: string;
	owner_node_id: string;
	spec: BatchSpec;
	total: number;
	/** Count of members by turn status. */
	statuses: Record<string, number>;
}

export interface ErrorResponse {
	code: string;
	message: string;
}
