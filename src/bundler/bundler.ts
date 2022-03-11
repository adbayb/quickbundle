import path from "path";
import { build } from "esbuild";
import { spawn } from "child_process";
import { CWD } from "../constants";
import { ModuleFormat } from "../types";
import { Metadata } from "./metadata";
import { jsxPlugin } from "./plugins";
import { getTypeScriptOptions } from "./typescript";

export const exec = async (command: string, options: ExecOptions = {}) => {
	return new Promise<string>((resolve, reject) => {
		let stdout = "";
		let stderr = "";
		const [bin, ...args] = command.split(" ") as [string, ...string[]];

		const childProcess = spawn(bin, args, {
			cwd: options.cwd,
			shell: true,
			stdio: "pipe",
			env: {
				...process.env,
				// @note: make sure to force color display for spawned processes
				FORCE_COLOR: "1",
			},
		});

		childProcess.stdout.on("data", (chunk) => {
			stdout += chunk;
		});

		childProcess.stderr.on("data", (chunk) => {
			stderr += chunk;
		});

		childProcess.on("close", (exitCode) => {
			if (exitCode !== 0) {
				const errorStream = stderr || stdout;

				reject(errorStream.trim());
			} else {
				resolve(stdout.trim());
			}
		});
	});
};

type ExecOptions = {
	cwd?: string;
};

type BundlerOptions = {
	isProduction: boolean;
	onWatch: (error: Error | null) => void;
};

export const createBundler = async (
	metadata: Metadata,
	{ isProduction = false, onWatch }: Partial<BundlerOptions>
) => {
	const isWatchMode = typeof onWatch === "function";
	const isTypingMode = true;
	const tsOptions = await getTypeScriptOptions();

	const generateTyping = async () => {
		const { types: typingFile } = metadata;

		if (!tsOptions || !typingFile) return;

		try {
			const typingDir = path.dirname(typingFile);

			await exec(
				`tsc --declaration --emitDeclarationOnly --incremental --outDir ${typingDir}`,
				{ cwd: CWD }
			);
		} catch (error) {
			throw new Error(`Typing generation failed:\n${error}`);
		}
	};

	return async (format: ModuleFormat) => {
		const outfile = metadata.destination[format];

		if (!outfile) {
			return Promise.reject(
				"Unknown `destination` for the given `format`"
			);
		}

		const pTyping = isTypingMode ? generateTyping() : Promise.resolve();
		const pBuild = build({
			absWorkingDir: CWD,
			bundle: Boolean(metadata.externalDependencies),
			define: {
				"process.env.NODE_ENV": isProduction
					? '"production"'
					: '"development"',
			},
			entryPoints: [metadata.source],
			external: metadata.externalDependencies,
			format,
			logLevel: "silent",
			metafile: true,
			minify: isProduction,
			outfile,
			plugins: [jsxPlugin(metadata.allDependencies, tsOptions)],
			platform: metadata.platform,
			sourcemap: true,
			target: tsOptions?.target || "esnext",
			watch: isWatchMode && {
				async onRebuild(bundleError) {
					let error: Error | null = bundleError as Error;

					// @note: early return => if there's already a build error,
					// no need to run a heavy typing generation process until the error is fixed
					if (error) {
						onWatch(error);

						return;
					}

					if (isTypingMode) {
						try {
							await generateTyping();
						} catch (typingError) {
							error = typingError as Error;
						}
					}

					onWatch(error);
				},
			},
		});

		await Promise.all([pBuild, pTyping]);

		return outfile;
	};
};
