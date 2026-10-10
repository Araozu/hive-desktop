/**
 * UI-side projections built from daemon records. These are not wire types.
 * When the daemon is connected, a data layer will build these from DTOs.
 */
import type {
	ArtifactResponse,
	BatchResponse,
	EventResponse,
	MessageResponse,
	ModelRequestResponse,
	NodeResponse,
	ProjectResponse,
	SessionResponse,
	SteeringInstructionResponse,
	TaskResponse,
	ToolInvocationResponse,
	TurnResponse,
	WorkspaceResponse,
} from "$lib/protocol/types";

/** One ordered entry in a session timeline. Order is the daemon's event order. */
export type TimelineItem =
	| { kind: "turn"; turn: TurnResponse }
	| { kind: "message"; message: MessageResponse }
	| { kind: "request"; request: ModelRequestResponse }
	| { kind: "tool"; invocation: ToolInvocationResponse }
	| { kind: "steering"; instruction: SteeringInstructionResponse };

export interface DiffFile {
	path: string;
	added: number;
	removed: number;
}

export interface WorkspaceDiffSummary {
	base_commit: string;
	files: DiffFile[];
}

/**
 * Artifacts carry no name on the wire. The source label says where the bytes
 * came from, for example "cargo test output" or "Workspace diff".
 */
export interface ArtifactRef {
	artifact: ArtifactResponse;
	source_label: string;
	invocation_id: string | null;
}

export interface SessionDetail {
	session: SessionResponse;
	/** Human-readable age of the last activity. Sample data only. */
	updated_label: string;
	project_name: string | null;
	timeline: TimelineItem[];
	turns: TurnResponse[];
	events: EventResponse[];
	artifacts: ArtifactRef[];
	workspace: WorkspaceResponse | null;
	diff: WorkspaceDiffSummary | null;
}

export interface BatchMember {
	task: TaskResponse;
	/** Assistant output, when the combination produced one. */
	output: string | null;
}

export interface BatchDetail {
	batch: BatchResponse;
	project_name: string | null;
	members: BatchMember[];
}

export interface WorkspaceRow {
	workspace: WorkspaceResponse;
	session_title: string;
	diff: WorkspaceDiffSummary | null;
}

export interface ProjectDetail {
	project: ProjectResponse;
	name: string;
	workspaces: WorkspaceRow[];
}

export interface NodeDetail {
	node: NodeResponse;
	/** Plain-language note about this node's relationship to this machine. */
	note: string;
}
