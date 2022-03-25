import { Program } from "termost";
import { bundle } from "../../bundler";
import { ProgramContext } from "../types";

type WatchCommandContext = {
	callbacks: {
		onError: (message: string) => void;
		onSuccess: () => void;
	};
};

export const createWatchCommand = (program: Program<ProgramContext>) => {
	program
		.command<WatchCommandContext>({
			name: "watch",
			description:
				"Watch and rebuild on any code change (development mode)",
		})
		.task({
			key: "callbacks",
			label: "Setup watcher",
			async handler({ values }) {
				const callbacks: WatchCommandContext["callbacks"] = {
					onError() {},
					onSuccess() {},
				};

				bundle({
					isFast: values.noCheck,
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
