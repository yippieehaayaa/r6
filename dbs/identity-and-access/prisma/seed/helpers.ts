export const log = (msg: string) => console.log(`  ✓ ${msg}`);
export const skip = (msg: string) =>
	console.log(`  · ${msg} (already exists, skipped)`);
