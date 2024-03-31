export const load = async (event) => {
	const supabase = event.locals.supabase;

	const response = await supabase.from("Profiles").select("openai_api_key").single();
	const openaiApiKey = response.data.openai_api_key || null;

	return { openaiApiKey };
};
