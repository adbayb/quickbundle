import { Termost, helpers } from "termost";
import { watch } from "../../bundler";

type WatchCommandContext = {
	callbacks: {
		onError: (message: string) => void;
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
			async handler() {
				const callbacks: WatchCommandContext["callbacks"] = {
					onError() {},
					onSuccess() {},
				};

				watch((error) => {
					if (error) {
						callbacks.onError(String(error));
					} else {
						callbacks.onSuccess();
					}
				})
					.then(() => callbacks.onSuccess())
					.catch((error) => {
						callbacks.onError(String(error));

						throw error;
					});

				return callbacks;
			},
		})
		.task({
			handler(context) {
				const onNotify = (
					type: "error" | "success" | "loading",
					message?: string
				) => {
					console.clear();

					if (type === "loading") {
						helpers.message(
							`Waiting for first build to be done...`,
							{
								type: "information",
							}
						);

						return;
					}

					helpers.message(
						`Last update at ${new Date().toLocaleTimeString()}\n${
							message ? `\n${message}\n` : ""
						}`,
						{ type }
					);
				};

				context.callbacks.onSuccess = () => onNotify("success");
				context.callbacks.onError = (error) => onNotify("error", error);

				onNotify("loading");
			},
		});
};
