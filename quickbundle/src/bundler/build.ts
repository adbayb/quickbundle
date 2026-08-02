import { join } from "node:path";
import { rolldown } from "rolldown";
import type { Config } from "./config";

export type BuildItemOutput = { elapsedTime: number; filePath: string };

export const build = async (input: Config) => {
	process.env.NODE_ENV ??= "production";

	const { data: configurations } = input;
	const output: BuildItemOutput[] = [];

	for (const config of configurations) {
		const initialTime = Date.now();
		const bundle = await rolldown(config);

		if (config.output) {
			const outputEntries = Array.isArray(config.output) ? config.output : [config.output];

			const promises: Promise<BuildItemOutput>[] = Array.from(
				outputEntries,
				async (outputEntry) => {
					const { output: rolldownOutput } = await bundle.write(outputEntry);

					return {
						elapsedTime: Date.now() - initialTime,
						filePath: join(
							outputEntry.dir ?? "",
							rolldownOutput.find((item) => {
								return item.type === "chunk" && item.isEntry;
							})?.fileName ?? "",
						),
					};
				},
			);

			output.push(...(await Promise.all(promises)));
		}
	}

	return output;
};
