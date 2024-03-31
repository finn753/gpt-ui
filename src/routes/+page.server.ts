import { redirect } from "@sveltejs/kit";

export const load = async (event) => {
	if (await event.locals.getSession()) {
		throw redirect(303, "/chats");
	}
};
