import type { Termost } from "termost";

import { gzipSize } from "gzip-size";
import { helpers } from "termost";

import type { BuildItemOutput } from "../bundler/build";
import type { CreateCommandContext } from "../helpers";

import { build } from "../bundler/build";
import { createConfiguration } from "../bundler/config";
import { createCommand, readFile } from "../helpers";

type BuildCommandContext = CreateCommandContext<{
	buildOutput: BuildItemOutput[];
	logInput: LogInput[];
}>;

type LogInput = {
	compressedSize: number;
	filePath: string;
	rawSize: number;
} & BuildItemOutput;

export const createBuildCommand = (program: Termost) => {
	return createCommand<BuildCommandContext>(program, {
		description: "Build the source code (production mode)",
		name: "build",
	})
		.task({
			async handler(context) {
				return build(
					createConfiguration({
						minification: context.minification,
						sourceMaps: context.sourceMaps,
						standalone: false,
					}),
				);
			},
			key: "buildOutput",
			label: "Bundle assets 📦",
		})
		.task({
			async handler(context) {
				return computeBundleSize(context.buildOutput);
			},
			key: "logInput",
			label: "Generate report 📝",
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
							label: `${item.filePath} (took ${item.elapsedTime}ms)`,
							lineBreak: { end: false, start: true },
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
		const content = await readFile(buildItemOutput.filePath);
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
