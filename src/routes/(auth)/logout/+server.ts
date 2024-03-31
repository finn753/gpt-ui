import { redirect, type RequestEvent } from "@sveltejs/kit";

export const GET = async ({ locals }: RequestEvent) => {
	await locals.supabase.auth.signOut();
	throw redirect(303, "/");
};
