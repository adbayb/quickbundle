import fs from "node:fs";
import path from "node:path";
import { Spinner } from "picospinner";

export { Spinner } from "picospinner";

const spinner = new Spinner("Loading…");

spinner.start();

setTimeout(() => {
	const packageJsonPath = path.join(process.cwd(), "package.json");

	console.log(
		fs.readFileSync(packageJsonPath, {
			encoding: "utf8",
		}),
	);

	spinner.succeed("Finished.");
}, 3000);
