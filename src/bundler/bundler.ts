/* eslint-disable sonarjs/cognitive-complexity */
import path from "path";
import { build } from "esbuild";
import { spawn } from "child_process";
import { CWD } from "../constants";
import { ModuleFormat } from "../types";
import { getMetadata } from "./metadata";
import { jsxPlugin } from "./plugins";
import { getTypeScriptOptions } from "./typescript";

const exec = async (
	command: string,
	options: {
		cwd?: string;
	} = {}
) => {
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
				// @todo: fix on termost and remove code
				const errorStream = stderr || stdout;

				reject(errorStream.trim());
			} else {
				resolve(stdout.trim());
			}
		});
	});
};

type BundlerOptions = {
	isProduction: boolean;
	onWatch: (error: Error | null) => void;
};

export const bundle = async ({
	isProduction = false,
	onWatch,
}: Partial<BundlerOptions>) => {
	const {
		allDependencies,
		destination,
		externalDependencies,
		platform,
		source,
		types,
	} = getMetadata();
	const isWatchMode = typeof onWatch === "function";
	const isTypingMode = typeof types === "string";
	const tsOptions = await getTypeScriptOptions();

	const getType = async () => {
		const outfile = types;

		if (!outfile) {
			throw new Error("No typing output file has been set");
		}

		try {
			const typingDir = path.dirname(outfile);

			await exec(
				`tsc --declaration --emitDeclarationOnly --incremental --outDir ${typingDir}`,
				{ cwd: CWD }
			);
		} catch (error) {
			throw new Error(`Typing generation failed:\n${error}`);
		}

		return outfile;
	};

	const getJavaScript = async (format: ModuleFormat) => {
		const outfile = destination[format];

		if (!outfile) {
			throw new Error(
				`No output file has been set for \`${format}\` format`
			);
		}

		await build({
			absWorkingDir: CWD,
			bundle: Boolean(externalDependencies),
			define: {
				"process.env.NODE_ENV": isProduction
					? '"production"'
					: '"development"',
			},
			entryPoints: [source],
			external: externalDependencies,
			format,
			logLevel: "silent",
			metafile: true,
			minify: isProduction,
			outfile,
			plugins: [jsxPlugin(allDependencies, tsOptions)],
			platform,
			sourcemap: true,
			target: tsOptions?.target || "esnext",
			treeShaking: true,
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
							await getType();
						} catch (typingError) {
							error = typingError as Error;
						}
					}

					onWatch(error);
				},
			},
		});

		return outfile;
	};

	const promises = [
		// @todo: check if module is set. If not, do not call it and use only cjs one.
		getJavaScript("esm"),
		...(!isWatchMode ? [getJavaScript("cjs")] : []),
		...(isTypingMode ? [getType()] : []),
	];

	return Promise.all(promises);
};
