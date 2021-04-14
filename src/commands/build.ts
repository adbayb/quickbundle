import { run } from "@adbayb/terminal-kit";
import gzipSize from "gzip-size";
import { createBundler } from "../entities/bundler";
import { createProject } from "../entities/project";
import { readFile, text } from "../helpers";

const calculateBundleSize = async (filename: string) => {
	const content = await readFile(filename);
	const gzSize = await gzipSize(content);

	return {
		raw: content.byteLength,
		gzip: gzSize,
	};
};

const formatAllBundleSizes = async (filenames: string[]) => {
	let output = "";

	for (const filename of filenames) {
		const size = await calculateBundleSize(filename);

		output += `📦 ${filename}\n${text(
			size.raw.toString().padStart(11) + " B",
			{ color: "green" }
		)} raw\n${text(size.gzip.toString().padStart(11) + " B", {
			color: "green",
		})}  gz\n`;
	}

	return output;
};

const main = async () => {
	const project = createProject();
	const bundle = await createBundler(project, {
		isProduction: true,
	});
	const outfiles: string[] = [];

	for (const target of Object.keys(project.destination) as Array<
		"cjs" | "esm"
	>) {
		outfiles.push(await run(`Building ${target} 👷‍♂️`, bundle(target)));
	}

	const sizeOutput = await run<string>(
		`Calculating bundle size 📐`,
		formatAllBundleSizes(outfiles)
	);

	console.info(`\n${sizeOutput}`);
};

main();
