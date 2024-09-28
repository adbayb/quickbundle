import { execa } from "execa";
import type { Termost } from "termost";

import { BUNDLER_OPTIONS } from "../constants";

type WatchCommandContext = {
	callbacks: {
		onError: (message: string) => void;
		onLoading: () => void;
		onSuccess: () => void;
	};
};

export const createWatchCommand = (program: Termost) => {
	program
		.command<WatchCommandContext>({
			name: "watch",
			description:
				"Watch and rebuild on any code change (development mode)",
		})
		.task({
			label: "Watch and rebuild assets 🔎",
			// eslint-disable-next-line @typescript-eslint/no-misused-promises
			async handler() {
				process.env.NODE_ENV ??= "development";

				try {
					await execa("rollup", [...BUNDLER_OPTIONS, "--watch"], {
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
