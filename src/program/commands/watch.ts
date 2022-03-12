import { Termost } from "termost";
import { bundle } from "../../bundler";

interface WatchContext {
	callbacks: {
		onError: (message: string) => void;
		onSuccess: () => void;
	};
}

export const createWatchCommand = (program: Termost<WatchContext>) => {
	program
		.command({
			name: "watch",
			description: "Watch and rebuild on any code change",
		})
		.task({
			key: "callbacks",
			label: "Setup watcher",
			async handler() {
				const callbacks: WatchContext["callbacks"] = {
					onError() {},
					onSuccess() {},
				};

				bundle({
					isProduction: false,
					onWatch(error) {
						if (error) {
							callbacks.onError(String(error));
						} else {
							callbacks.onSuccess();
						}
					},
				})
					.then(() => callbacks.onSuccess())
					.catch((error) => {
						callbacks.onError(String(error));

						throw error;
					});

				return callbacks;
			},
		})
		.message({
			handler({ values }, helpers) {
				const onNotify = (
					type: "error" | "success" | "loading",
					message?: string
				) => {
					console.clear();

					if (type === "loading") {
						helpers.print(`Waiting for first build to be done...`, {
							type: "information",
						});

						return;
					}

					helpers.print(
						`Last update at ${new Date().toLocaleTimeString()}\n${
							message ? `\n${message}\n` : ""
						}`,
						{ type }
					);
				};

				values.callbacks.onSuccess = () => onNotify("success");
				values.callbacks.onError = (error) => onNotify("error", error);

				onNotify("loading");
			},
		});
};
