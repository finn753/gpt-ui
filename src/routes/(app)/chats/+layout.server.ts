import type { LayoutServerLoad } from "../../../../.svelte-kit/types/src/routes/$types";
import type { ChatDataMap } from "$lib/types";

const exampleChatDataMap: ChatDataMap = {
	"1": {
		id: "1",
		title: "Chat 1",
		tags: ["tag1", "tag2"],
		summary: "Summary 1",
		model: "model1",
		created_at: new Date(),
		updated_at: new Date()
	},
	"2": {
		id: "2",
		title: "Chat 2",
		tags: ["tag1", "tag2"],
		summary: "Summary 2",
		model: "model2",
		created_at: new Date(),
		updated_at: new Date()
	}
};

export const load: LayoutServerLoad = async () => {
	return { exampleChatDataMap };
};
