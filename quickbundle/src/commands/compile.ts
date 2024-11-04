import type { Termost } from "termost";

import { createConfigurations } from "../bundler/config";
import { build } from "../bundler/build";

export const createCompileCommand = (program: Termost) => {
	return program
		.command({
			name: "compile",
			description: "Compiles the source code into a self-contained executable",
		})
		.task({
			async handler() {
				await build(
					createConfigurations({
						minification: true,
						sourceMaps: false,
						standalone: true,
					}),
				);
			},
		});
};
