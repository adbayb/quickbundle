import { helpers } from "termost";
import type { Termost } from "termost";
import { gzipSize } from "gzip-size";

import { createCommand, readFile } from "../helpers";
import type { CreateCommandContext } from "../helpers";
import { createConfigurations } from "../bundler/config";
import { build } from "../bundler/build";
import type { BuildItemOutput } from "../bundler/build";

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
	return createCommand<BuildCommandContext>(program, {
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
						standalone: false,
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
				context.logInput.forEach((item) => {
					helpers.message(
						[
							`${formatSize(item.rawSize)} raw`,
							`${formatSize(item.compressedSize)} gzip`,
						]
							.map((message, index) => {
								return index === 0 ? message : `   ${message}`;
							})
							.join("\n"),
						{
							label: `${item.filename} (took ${item.elapsedTime}ms)`,
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

const formatSize = (bytes: number) => {
	const kiloBytes = bytes / 1000;

	return kiloBytes < 1 ? `${bytes} B` : `${kiloBytes.toFixed(2)} kB`;
};
