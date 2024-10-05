import { helpers } from "termost";
import type { Termost } from "termost";

import { BUNDLER_OPTIONS } from "../constants";
import { createBundlerCommand } from "../helpers";

export const createBuildCommand = (program: Termost) => {
	program
		.command({
			name: "build",
			description: "Build the source code (production mode)",
		})
		.task({
			label: "Bundle assets 📦",
			async handler() {
				process.env.NODE_ENV ??= "development";

				try {
					await helpers.exec(createBundlerCommand(BUNDLER_OPTIONS));
				} catch (error) {
					console.error(
						"❌ An error occurred while building files",
						error,
					);
				}
			},
		});
};
