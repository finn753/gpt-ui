export const load = async (event) => {
	const supabase = event.locals.supabase;

	const response = await supabase.from("Profiles").select().single();
	const openaiApiKey = response.data.openai_api_key || null;
	const tavilyApiKey = response.data.tavily_api_key || null;
	const groqApiKey = response.data.groq_api_key || null;
	const mistralApiKey = response.data.mistral_api_key || null;
	const anthropicApiKey = response.data.anthropic_api_key || null;

	return { openaiApiKey, tavilyApiKey, groqApiKey, mistralApiKey, anthropicApiKey };
};
