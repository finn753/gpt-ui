export type Message = {
	id: string;
	text: string;
	role: "user" | "assistant" | "tool";
	model: string;
	created_at: Date;
};
