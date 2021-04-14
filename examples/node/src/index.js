import fs from "fs";
import path from "path";
import ora from "ora";

const spinner = ora("Loading file").start();

setTimeout(() => {
	spinner.stop();
	console.log(
		fs.readFileSync(path.join(process.cwd(), "package.json"), {
			encoding: "utf-8",
		})
	);
}, 3000);
