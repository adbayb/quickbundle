import { generateDtsBundle } from "dts-bundle-generator";
import { expose } from "threads/worker";

expose((source: string) => {
	const errors: string[] = [];

	// To prevent any UI glitch, catch any error by monkey patching
	// the default error logger and forward them to the parent worker
	console.error = (error: string) => {
		errors.push(error);
	};

	try {
		return generateDtsBundle([
			{
				filePath: source,
				output: {
					noBanner: true,
				},
			},
		])[0] as string;
	} catch {
		// eslint-disable-next-line @typescript-eslint/no-throw-literal
		throw errors;
	}
});
