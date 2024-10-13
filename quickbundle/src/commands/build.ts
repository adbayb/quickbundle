import { gzipSize } from "gzip-size";
import { helpers } from "termost";
import type { Termost } from "termost";

import { build } from "../bundler/build";
import type { BuildItemOutput } from "../bundler/build";
import { createConfigurations } from "../bundler/config";
import { readFile } from "../helpers";

import { createCommand } from "./createCommand";
import type { CreateCommandContext } from "./createCommand";

type LogInput = BuildItemOutput & {
	compressedSize: number;
	filename: string;
	rawSize: number;
};

type BuildCommandContext = CreateCommandContext<{
	buildOutput: BuildItemOutput[];
	logInput: LogInput[];
}>;

export const createBuildCommand = (program: Termost) => {
	createCommand<BuildCommandContext>(program, {
		name: "build",
		description: "Build the source code (production mode)",
	})
		.task({
			key: "buildOutput",
			label: "Bundle assets 📦",
			async handler(context) {
				return build(
					createConfigurations({
						minification: context.minification,
						sourceMaps: context.sourceMaps,
					}),
				);
			},
		})
		.task({
			key: "logInput",
			label: "Generate report 📝",
			async handler(context) {
				return computeBundleSize(context.buildOutput);
			},
			skip(context) {
				return context.buildOutput.length === 0;
			},
		})
		.task({
			handler(context) {
				const padding =
					context.logInput
						.map((item) => item.rawSize)
						.reduce((pad: number, currentRawSize: number) => {
							return Math.max(pad, String(currentRawSize).length);
						}, 0) + 2;

				context.logInput.forEach((item) => {
					helpers.message(
						[
							`${item.rawSize.toString().padStart(padding)} B raw`,
							`${item.compressedSize.toString().padStart(padding)} B gz`,
						],
						{
							label: `${item.filename} (took ${item.elapedTime}ms)`,
							type: "information",
						},
					);
				});
			},
			skip(context) {
				return context.buildOutput.length === 0;
			},
		});
};

const computeBundleSize = async (buildOutput: BuildItemOutput[]) => {
	const computeFileSize = async (
		buildItemOutput: BuildItemOutput,
	): Promise<LogInput> => {
		const content = await readFile(buildItemOutput.filename);
		const gzSize = await gzipSize(content);

		return {
			...buildItemOutput,
			compressedSize: gzSize,
			rawSize: content.byteLength,
		};
	};

	return Promise.all(buildOutput.map(async (item) => computeFileSize(item)));
};
