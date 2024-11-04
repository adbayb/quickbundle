import process from "node:process";
import path from "node:path";
import fs from "node:fs";

import ora from "ora";

const spinner = ora("Loading file").start();

setTimeout(() => {
	spinner.stop();
	console.log(
		fs.readFileSync(path.join(process.cwd(), "package.json"), {
			encoding: "utf-8",
		}),
	);
}, 3000);

export { ora };
