import { toast } from "svelte-sonner";

export function handleError(message: string, error: unknown) {
	console.error(message, error);
	toast.error(message);
}
