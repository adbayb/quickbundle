import { rollup } from "rollup";

import { CONFIGURATIONS } from "./config";

export type BuildItemOutput = { elapedTime: number; filename: string };

export const build = async () => {
	const output: BuildItemOutput[] = [];

	for (const config of CONFIGURATIONS) {
		const initialTime = Date.now();

		const bundle = await rollup({
			...config,
			onLog(_, log) {
				if (log.message.includes("Generated an empty chunk")) return;
			},
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
									elapedTime: Date.now() - initialTime,
									filename: outputFilename,
								});
							})
							.catch(reject);
					}),
				);
			}

			output.push(...(await Promise.all(promises)));
		}
	}

	return output;
};
