import { join } from "node:path";
import { rolldown } from "rolldown";

import type { Configuration } from "./config";

export type BuildItemOutput = { elapsedTime: number; filePath: string };

// eslint-disable-next-line sonarjs/cognitive-complexity
export const build = async (input: Configuration) => {
	process.env.NODE_ENV ??= "production";

	const { data: configurations } = input;
	const output: BuildItemOutput[] = [];

	for (const config of configurations) {
		const initialTime = Date.now();
		const bundle = await rolldown(config);

		if (config.output) {
			const outputEntries = Array.isArray(config.output)
				? config.output
				: [config.output];

			const promises: Promise<BuildItemOutput>[] = [];

			for (const outputEntry of outputEntries) {
				const entryFileName = outputEntry.entryFileNames;

				const outputFilePath = join(
					outputEntry.dir ?? "",
					typeof entryFileName === "string" ? entryFileName : "",
				);

				if (!outputFilePath) {
					throw new Error(
						"Misconfigured file entry point. Make sure to define an `import`, `require`, or `default` field.",
					);
				}

				promises.push(
					new Promise((resolve, reject) => {
						bundle
							.write(outputEntry)
							.then(() => {
								resolve({
									elapsedTime: Date.now() - initialTime,
									filePath: outputFilePath,
								});
							})
							.catch((error: unknown) => {
								if (error instanceof Error) {
									reject(error);
								}
							});
					}),
				);
			}

			output.push(...(await Promise.all(promises)));
		}
	}

	return output;
};
