import { execa } from "execa";
import type { Termost } from "termost";

import { BUNDLER_OPTIONS } from "../constants";

export const createBuildCommand = (program: Termost) => {
	program
		.command({
			name: "build",
			description: "Build the source code (production mode)",
		})
		.task({
			label: "Bundle assets 📦",
			// eslint-disable-next-line @typescript-eslint/no-misused-promises
			async handler() {
				process.env.NODE_ENV ??= "development";

				try {
					await execa("rollup", BUNDLER_OPTIONS, {
						stdio: "inherit",
					});
				} catch (error) {
					console.error(
						"❌ An error occurred while bundling files",
						error,
					);

					process.exit(1);
				}
			},
		});
};
