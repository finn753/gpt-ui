import { getAvailableModels } from "$lib/modelManager";

export const load = async (event) => {
	const supabase = event.locals.supabase;

	const response = await supabase.from("Profiles").select().single();
	const openaiApiKey = response.data.openai_api_key || null;
	const tavilyApiKey = response.data.tavily_api_key || null;

	const availableModels = getAvailableModels();

	return { openaiApiKey, tavilyApiKey, availableModels };
};
