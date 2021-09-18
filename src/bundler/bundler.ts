import { build } from "esbuild";
import { CWD } from "../constants";
import { Project } from "./metadata";
import { jsxPlugin } from "./plugins";
import { getTypeScriptOptions } from "./typescript";

type BundlerOptions = {
	isProduction: boolean;
	isWatchMode: boolean;
	onWatch: (error: Error | null) => void;
};

export const createBundler = async (
	project: Project,
	{
		isProduction = false,
		isWatchMode = false,
		onWatch,
	}: Partial<BundlerOptions>
) => {
	const tsOptions = await getTypeScriptOptions();

	return async (format: "esm" | "cjs") => {
		const outfile = project.destination[format];

		if (!outfile) {
			return Promise.reject(
				"Unknown `destination` for the given `format`"
			);
		}

		await build({
			absWorkingDir: CWD,
			bundle: true,
			define: {
				"process.env.NODE_ENV": isProduction
					? '"production"'
					: '"development"',
			},
			entryPoints: [project.source],
			external: project.externalDependencies,
			format,
			metafile: true,
			minify: isProduction,
			outfile,
			plugins: [jsxPlugin(project, tsOptions)],
			platform: project.platform,
			sourcemap: true,
			target: tsOptions?.target || "esnext",
			watch: isWatchMode && {
				onRebuild: onWatch,
			},
		});

		return outfile;
	};
};
