import process from "node:process";

import { rollup } from "rollup";

import { onLog } from "./helpers";
import type { Configuration } from "./config";

export type BuildItemOutput = { elapsedTime: number; filename: string };

export const build = async (configurations: Configuration[]) => {
	process.env.NODE_ENV ??= "production";

	const output: BuildItemOutput[] = [];

	for (const config of configurations) {
		const initialTime = Date.now();

		const bundle = await rollup({
			...config,
			onLog,
		});

		if (config.output) {
			const outputEntries = Array.isArray(config.output)
				? config.output
				: [config.output];

			const promises: Promise<BuildItemOutput>[] = [];

			for (const outputEntry of outputEntries) {
				const outputFilename = outputEntry.file ?? outputEntry.dir;

				if (!outputFilename) {
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
									filename: outputFilename,
								});
							})
							.catch((reason: unknown) => {
								reject(reason as Error);
							});
					}),
				);
			}

			output.push(...(await Promise.all(promises)));
		}
	}

	return output;
};
