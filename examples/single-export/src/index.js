import fs from "node:fs";
import path from "node:path";
import { Spinner } from "picospinner";

const spinner = new Spinner("Loading…");

spinner.start();

setTimeout(() => {
	console.log(
		fs.readFileSync(path.join(process.cwd(), "package.json"), {
			encoding: "utf8",
		}),
	);
	spinner.succeed("Finished.");
}, 3000);

export { Spinner };
