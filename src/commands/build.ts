import { run } from "@adbayb/terminal-kit";
import gzipSize from "gzip-size";
import { BundleFormat, createBundler } from "../entities/bundler";
import { createProject } from "../entities/project";
import { coloredText, readFile } from "../helpers";

const main = async () => {
	const project = createProject();
	// @todo: isProduction true for build command and false for watch command:
	const bundle = await createBundler(project, false);
	const formats: BundleFormat[] = ["cjs", "esm"];
	let output = "";

	for (const format of formats) {
		const outfile = await run(`Building ${format} 👷‍♂️`, bundle(format));
		const content = await readFile(outfile);
		const gzSize = await gzipSize(content);

		output += `📦 ${outfile}\n\traw (B): ${coloredText(
			content.byteLength.toString().padStart(6),
			"green"
		)}\n\tgz  (B): ${coloredText(
			gzSize.toString().padStart(6),
			"green"
		)}\n`;
	}

	console.log(`\n${output}`);
};

main();
