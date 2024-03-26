export type Chat = {
	id: string;
	tile: string;
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
