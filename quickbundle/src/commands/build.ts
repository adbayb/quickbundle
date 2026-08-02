import { gzipSync } from "node:zlib";
import { helpers } from "termost";
import type { BuildItemOutput } from "../bundler/build";
import { build } from "../bundler/build";
import { createConfig } from "../bundler/config";
import type { CreateCommandContext } from "../helpers";
import { createBuildLikeCommand, readFile } from "../helpers";
import type { CommandFactory } from "../types";

type BuildCommandContext = CreateCommandContext<{
	buildOutput: BuildItemOutput[];
	logInput: LogInput[];
}>;

type LogInput = BuildItemOutput & {
	compressedSize: number;
	filePath: string;
	rawSize: number;
};

export const createBuildCommand: CommandFactory = (program) => {
	createBuildLikeCommand<BuildCommandContext>(program, {
		name: "build",
		description: "Build the source code (production mode)",
	})
		.task({
			key: "buildOutput",
			label: "Bundle assets 📦",
			async handler(context) {
				return build(
					createConfig({
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
				return getBundleSize(context.buildOutput);
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

const getBundleSize = async (buildOutput: BuildItemOutput[]) => {
	return Promise.all(
		buildOutput.map(async (item) => {
			return getFileSize(item);
		}),
	);
};

const getFileSize = async (buildItemOutput: BuildItemOutput): Promise<LogInput> => {
	const content = await readFile(buildItemOutput.filePath);
	const gzSize = gzipSync(content).length;

	return {
		...buildItemOutput,
		compressedSize: gzSize,
		rawSize: content.byteLength,
	};
};

const formatSize = (bytes: number) => {
	const kiloBytes = bytes / 1000;

	return kiloBytes < 1 ? `${bytes} B` : `${kiloBytes.toFixed(2)} kB`;
};
