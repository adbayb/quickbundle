import { join } from "node:path";
import { rolldown } from "rolldown";

import type { Configuration } from "./config";

export type BuildItemOutput = { elapsedTime: number; filePath: string };

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
				promises.push(
					new Promise((resolve, reject) => {
						bundle
							.write(outputEntry)
							.then(({ output: rolldownOutput }) => {
								resolve({
									elapsedTime: Date.now() - initialTime,
									filePath: join(
										outputEntry.dir ?? "",
										rolldownOutput.find(
											(item) =>
												item.type === "chunk" &&
												item.isEntry,
										)?.fileName ?? "",
									),
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
