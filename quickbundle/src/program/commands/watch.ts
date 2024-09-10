import { helpers } from "termost";
import type { Termost } from "termost";

import { watch } from "../../bundler";

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
			key: "callbacks",
			label: "Setup watcher",
			handler() {
				const callbacks: WatchCommandContext["callbacks"] = {
					onError() {
						// No op
					},
					onLoading() {
						// No op
					},
					onSuccess() {
						// No op
					},
				};

				void watch((type, error) => {
					if (type === "loading") {
						callbacks.onLoading();

						return;
					}

					if (error) {
						callbacks.onError(String(error));
					} else {
						callbacks.onSuccess();
					}
				});

				return callbacks;
			},
		})
		.task({
			handler(context) {
				const onNotify = (
					type: "error" | "loading" | "success",
					message?: string,
				) => {
					console.clear();

					if (type === "loading") {
						helpers.message(`Waiting for the build to be done...`, {
							type: "information",
						});

						return;
					}

					helpers.message(
						`Last update at ${new Date().toLocaleTimeString()}\n${
							message ? `\n${message}\n` : ""
						}`,
						{ type },
					);
				};

				context.callbacks.onSuccess = () => {
					onNotify("success");
				};
				context.callbacks.onError = (error) => {
					onNotify("error", error);
				};
				context.callbacks.onLoading = () => {
					onNotify("loading");
				};
			},
		});
};
