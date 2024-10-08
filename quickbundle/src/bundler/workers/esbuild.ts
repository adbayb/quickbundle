import { build } from "esbuild";
import { expose } from "threads/worker";

import { getConfigs } from "../configs";

expose(async (format: "cjs" | "esm") => {
	const { esbuild, pkg } = getConfigs({
		isProduction: true,
	});

	const outfile = pkg.destination[format];

	if (!outfile) return null;

	await build(esbuild({ format, outfile }));

	return outfile;
});
