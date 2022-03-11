import { Termost } from "termost";
import { createBundler, getMetadata } from "../../bundler";

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
				const bundle = await createBundler(getMetadata(), {
					isProduction: false,
					onWatch(error) {
						if (error) {
							callbacks.onError(String(error));
						} else {
							callbacks.onSuccess();
						}
					},
				});

				// @todo: By default, pick module target for watch mode and if not available main field (ie. cjs build)
				bundle("esm")
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
					type: "error" | "success",
					message?: string
				) => {
					console.clear();
					helpers.print(
						`Last update at ${new Date().toLocaleTimeString()} 🔎\n${
							message ? `\n${message}\n` : ""
						}`,
						{ type }
					);
				};

				values.callbacks.onSuccess = () => onNotify("success");
				values.callbacks.onError = (error) => onNotify("error", error);

				values.callbacks.onSuccess();
			},
		});
};
