export async function convertImageToBase64(file: File): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			const base64 = e.target?.result as string;
			resolve(base64);
		};
		reader.onerror = (e) => {
			reject(new Error(`Failed to read file: ${e.target?.error}`));
		};
		reader.readAsDataURL(file);
	});
}

export async function convertImageListToBase64(files: File[] | undefined): Promise<string[]> {
	if (!files) return [];

	try {
		return await Promise.all(files.map((file) => convertImageToBase64(file)));
	} catch (error) {
		console.error("Failed to convert images to base64:", error);
		throw error; // re-throw the error if you want to handle it further up the call stack
	}
}
