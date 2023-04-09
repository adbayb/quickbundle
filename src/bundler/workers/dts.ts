import { generateDtsBundle } from "dts-bundle-generator";
import { expose } from "threads/worker";

expose((source: string) => {
	const errors: Array<string> = [];

	// To prevent any UI glitch, catch any error by monkey patching
	// the default error logger and forward them to the parent worker
	console.error = (error: string) => {
		errors.push(error);
	};

	try {
		return generateDtsBundle([
			{
				filePath: source,
				noCheck: false,
				output: {
					noBanner: true,
					// @ts-expect-error toto
					noCheck: false,
				},
			},
		])[0] as string;
	} catch (error) {
		throw errors;
	}
});
