import { rename } from "node:fs/promises";
import { dirname, join } from "node:path";
import { helpers } from "termost";
import { build } from "../bundler/build";
import type { Config } from "../bundler/config";
import { createConfig } from "../bundler/config";
import { createRegExpMatcher, removePath } from "../helpers";
import type { CommandFactory } from "../types";

type CompileCommandContext = {
	config: Config;
	targetInput: string;
};

export const createCompileCommand: CommandFactory = (program) => {
	program
		.command<CompileCommandContext>({
			name: "compile",
			description: "Compiles the source code into a self-contained executable",
		})
		.option({
			key: "targetInput",
			name: {
				long: "target",
				short: "t",
			},
			description: "Set a different cross-compilation target",
			defaultValue: "local",
		})
		.task({
			key: "config",
			label: "Create configuration",
			handler() {
				return createConfig({
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
						if (!bin) {
							return undefined;
						}

						return `\`${bin}\``;
					})
					.filter(Boolean)
					.join(", ");

				return `Compile ${binaries}`;
			},
			async handler({ config, targetInput }) {
				for (const { bin, require } of config.metadata) {
					if (!require || !bin) {
						return;
					}

					let os = process.platform === "win32" ? "win" : process.platform;
					let architecture: string = process.arch;
					let version: string | undefined = undefined;

					if (targetInput !== "local") {
						const nodeProperties = getNodeProperties(targetInput);

						if (!nodeProperties) {
							throw new Error(
								"Invalid `runtime` flag input. The accepted targets are the one listed in https://nodejs.org/download/release/ with the following format `node-vx.y.z-(darwin|linux|win)-(arm64|x64|x86)`.",
							);
						}

						const {
							architecture: nodeArchitecture,
							os: nodeOs,
							version: nodeVersion,
						} = nodeProperties;

						architecture = nodeArchitecture;
						os = nodeOs;
						version = nodeVersion;
					}

					const distributionPath = dirname(require);
					const target = `${os}-${architecture}`;
					const targetPath = join(distributionPath, target);

					const packAppFlags = Object.entries({
						"entry": require,
						"output-dir": distributionPath,
						"output-name": bin,
						"runtime": version ? `node@${version}` : undefined,
						target,
					})
						.map(([flagName, flagValue]) => {
							if (!flagValue) {
								return undefined;
							}

							return `--${flagName} ${flagValue}`;
						})
						.filter(Boolean)
						.join(" ");

					await helpers.exec(`npx --yes pnpm pack-app ${packAppFlags}`);
					await rename(join(targetPath, bin), join(distributionPath, bin));

					await Promise.all(
						[require, targetPath].map(async (path) => {
							return removePath(path);
						}),
					);
				}
			},
		});
};

const getNodeProperties = createRegExpMatcher<"architecture" | "os" | "version">(
	/^node-(?<version>v\d+\.\d+\.\d+)-(?<os>darwin|linux|win)-(?<architecture>arm64|x64|x86)$/u,
);
