import { run } from "@adbayb/terminal-kit";
import { BundleFormat, createBundler } from "../entities/bundler";
import { createProject } from "../entities/project";

const main = async () => {
	const project = createProject();
	const bundle = await createBundler(project);
	const formats: BundleFormat[] = ["cjs", "esm"];

	for (const format of formats) {
		// @todo: isProduction true for build command and false for watch command:
		await run(`Building ${format} 👷‍♂️`, bundle(format, false));
	}
};

main();
