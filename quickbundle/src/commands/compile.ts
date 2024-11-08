import { basename, dirname, resolve } from "node:path";
import os from "node:os";
import { rm, writeFile } from "node:fs/promises";

import { helpers } from "termost";
import type { Termost } from "termost";

import { createConfiguration } from "../bundler/config";
import type { Configuration } from "../bundler/config";
import { build } from "../bundler/build";

type CompileCommandContext = {
	config: Configuration;
	osType: "linux" | "macos" | "windows";
};

export const createCompileCommand = (program: Termost) => {
	return program
		.command<CompileCommandContext>({
			name: "compile",
			description: "Compiles the source code into a self-contained executable",
		})
		.task({
			key: "osType",
			label: "Get context",
			handler() {
				const type = os.type();

				return type === "Windows_NT"
					? "windows"
					: type === "Darwin"
						? "macos"
						: "linux";
			},
		})
		.task({
			key: "config",
			label: "Create configuration",
			handler() {
				return createConfiguration({
					minification: true,
					sourceMaps: false,
					standalone: true,
				});
			},
		})
		.task({
			label: "Build",
			async handler({ config }) {
				await build(config);
			},
		})
		.task({
			label({ config }) {
				const binaries = config.metadata
					.map(({ bin }) => {
						if (!bin) return undefined;

						return `\`${bin}\``;
					})
					.filter(Boolean)
					.join(", ");

				return `Compile ${binaries}`;
			},
			async handler({ config, osType }) {
				await Promise.all(
					config.metadata.map(async ({ bin, require }) => {
						if (!require || !bin) return;

						return compile({ bin, input: require, osType });
					}),
				);
			},
		});
};

const compile = async ({
	bin,
	input,
	osType,
}: Pick<CompileCommandContext, "osType"> & {
	bin: string;
	input: string;
}) => {
	const inputFileName = basename(input);
	const inputDirectory = dirname(input);

	const resolveFromInputDirectory = (...paths: string[]) => {
		return resolve(inputDirectory, ...paths);
	};

	const blobFileName = resolveFromInputDirectory(`${inputFileName}.blob`);

	const executableFileName = resolveFromInputDirectory(
		`${bin}${osType === "windows" ? ".exe" : ""}`,
	);

	const seaConfigFileName = resolveFromInputDirectory(
		`${inputFileName}.sea-config.json`,
	);

	await writeFile(
		seaConfigFileName,
		JSON.stringify({
			disableExperimentalSEAWarning: true,
			main: input,
			output: blobFileName,
			useCodeCache: false,
			useSnapshot: false,
		}),
		"utf-8",
	);

	await Promise.all(
		[
			`node --experimental-sea-config ${seaConfigFileName}`,
			`node -e "require('fs').copyFileSync(process.execPath, '${executableFileName}')"`,
		].map(async (command) => helpers.exec(command)),
	);

	if (osType === "macos") {
		await helpers.exec(`codesign --remove-signature ${executableFileName}`);
	}

	await helpers.exec(
		`npx postject ${executableFileName} NODE_SEA_BLOB ${blobFileName} --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 ${osType === "macos" ? "--macho-segment-name NODE_SEA" : ""}`,
	);

	if (osType === "macos") {
		await helpers.exec(`codesign --sign - ${executableFileName}`);
	}

	await Promise.all(
		[blobFileName, seaConfigFileName].map(async (file) => rm(file)),
	);
};
