import type { Termost } from "termost";

import os from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { helpers } from "termost";

import type { Configuration } from "../bundler/config";

import { build } from "../bundler/build";
import { createConfiguration } from "../bundler/config";
import {
	copyFile,
	createRegExpMatcher,
	download,
	removePath,
	resolveFromInternalDirectory,
	unzip,
	writeFile,
} from "../helpers";

type CompileCommandContext = {
	config: Configuration;
	osType: OsType;
	targetInput: string;
};

const TEMPORARY_PATH = resolveFromInternalDirectory("dist", "tmp");
const TEMPORARY_DOWNLOAD_PATH = join(TEMPORARY_PATH, "zip");
const TEMPORARY_RUNTIME_PATH = join(TEMPORARY_PATH, "runtime");

export const createCompileCommand = (program: Termost) => {
	return program
		.command<CompileCommandContext>({
			description:
				"Compiles the source code into a self-contained executable",
			name: "compile",
		})
		.option({
			defaultValue: "local",
			description: "Set a different cross-compilation target",
			key: "targetInput",
			name: {
				long: "target",
				short: "t",
			},
		})
		.task({
			handler() {
				return createConfiguration({
					minification: true,
					sourceMaps: false,
					standalone: true,
				});
			},
			key: "config",
			label: "Create configuration",
		})
		.task({
			async handler({ targetInput }) {
				if (targetInput === "local") {
					await copyFile(process.execPath, TEMPORARY_RUNTIME_PATH);

					return getOsType(os.type());
				}

				const matchedRuntimeParts = matchRuntimeParts(targetInput);

				if (!matchedRuntimeParts) {
					throw new Error(
						"Invalid `runtime` flag input. The accepted targets are the one listed in https://nodejs.org/download/release/ with the following format `node-vx.y.z-(darwin|linux|win)-(arm64|x64|x86)`.",
					);
				}

				const osType = getOsType(matchedRuntimeParts.os);
				const extension = osType === "windows" ? "zip" : "tar.gz";

				await download(
					`https://nodejs.org/download/release/${matchedRuntimeParts.version}/${targetInput}.${extension}`,
					TEMPORARY_DOWNLOAD_PATH,
				);

				await unzip(
					{
						path: TEMPORARY_DOWNLOAD_PATH,
						targetedArchivePath:
							osType === "windows"
								? join(targetInput, "node.exe")
								: join(targetInput, "bin", "node"),
					},
					{
						directoryPath: dirname(TEMPORARY_RUNTIME_PATH),
						filename: basename(TEMPORARY_RUNTIME_PATH),
					},
				);

				return osType;
			},
			key: "osType",
			label({ targetInput }) {
				return `Get \`${targetInput}\` runtime`;
			},
		})
		.task({
			async handler({ config }) {
				await build(config);
			},
			label: "Build",
		})
		.task({
			async handler({ config, osType }) {
				await Promise.all(
					config.metadata.map(async ({ bin, require }) => {
						if (!require || !bin) return;

						return compile({ bin, input: require, osType });
					}),
				);
			},
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
		});
};

type OsType = "linux" | "macos" | "windows";

const getOsType = (input: string): OsType => {
	switch (input) {
		case "Darwin":
		case "darwin": {
			return "macos";
		}
		case "Linux":
		case "linux": {
			return "linux";
		}
		case "win":
		case "Windows_NT": {
			return "windows";
		}
		default: {
			throw new Error(`Unsupported operating system \`${input}\``);
		}
	}
};

const matchRuntimeParts = createRegExpMatcher<
	"architecture" | "os" | "version"
>(
	/^node-(?<version>v\d+\.\d+\.\d+)-(?<os>darwin|linux|win)-(?<architecture>arm64|x64|x86)$/,
);

const compile = async ({
	bin,
	input,
	osType,
}: {
	bin: string;
	input: string;
} & Pick<CompileCommandContext, "osType">) => {
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
	);

	await Promise.all([
		helpers.exec(`node --experimental-sea-config ${seaConfigFileName}`),
		copyFile(TEMPORARY_RUNTIME_PATH, executableFileName),
	]);

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
		[blobFileName, seaConfigFileName, TEMPORARY_PATH].map(async (path) =>
			removePath(path),
		),
	);
};
