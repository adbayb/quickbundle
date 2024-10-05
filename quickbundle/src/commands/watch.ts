import { helpers } from "termost";
import type { Termost } from "termost";

import { BUNDLER_OPTIONS } from "../constants";
import { createBundlerCommand } from "../helpers";

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
					await helpers.exec(
						createBundlerCommand([...BUNDLER_OPTIONS, "--watch"]),
					);
				} catch (error) {
					console.error(
						"❌ An error occurred while watching files",
						error,
					);
				}
			},
		});
};
