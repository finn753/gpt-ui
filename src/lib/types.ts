export type ChatStructure = {
	id: string;
	title: string;
	tags: string[];
	summary: string;
	model: string;
	created_at: Date;
	updated_at: Date;
};

export type MessageStructure = {
	id: string;
	chat_id: string;
	content: string;
	role: "user" | "assistant" | "tool";
	model: string;
	created_at: Date;
};

/**
 * @deprecated Change of DataStructure
 */
export type OldChatData = ChatStructure & { messages: MessageStructure[] };
/**
 * @deprecated Change of DataStructure
 */
export type OldChatDataMap = Record<string, OldChatData>;

export type ChatDataMap = Record<string, ChatStructure>;
export type ChatContentMap = Record<string, MessageStructure[]>;
