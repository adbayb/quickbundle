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
			async handler() {
				process.env.NODE_ENV ??= "development";

				await helpers.exec(
					createBundlerCommand([...BUNDLER_OPTIONS, "--watch"]),
					{
						hasLiveOutput: true,
					},
				);
			},
		});
};
