import type { TagElement } from "$lib/scripts/misc/types";

export const load = async (event) => {
	const supabase = event.locals.supabase;

	const profileResponse = await supabase.from("Profiles").select().single();
	const openaiApiKey = profileResponse.data.openai_api_key || null;
	const tavilyApiKey = profileResponse.data.tavily_api_key || null;
	const groqApiKey = profileResponse.data.groq_api_key || null;
	const mistralApiKey = profileResponse.data.mistral_api_key || null;
	const anthropicApiKey = profileResponse.data.anthropic_api_key || null;
	const perplexityApiKey = profileResponse.data.perplexity_api_key || null;
	const geminiApiKey = profileResponse.data.gemini_api_key || null;

	const customModelTemplates = profileResponse.data.custom_model_templates || [];

	const memories = profileResponse.data.lds_memory || [];

	const tagsResponse = await supabase.from("tags").select();
	const tags: Record<string, TagElement> = tagsResponse.data.reduce(
		(acc: Record<string, TagElement>, tag: { id: number } & TagElement) => {
			acc[tag.id] = { id: tag.id, name: tag.name, hidden: tag.hidden };
			return acc;
		},
		{}
	);

	return {
		openaiApiKey,
		tavilyApiKey,
		groqApiKey,
		mistralApiKey,
		anthropicApiKey,
		perplexityApiKey,
		geminiApiKey,
		customModelTemplates,
		memories,
		tags
	};
};
