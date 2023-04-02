import { Termost, helpers } from "termost";
import { build } from "../../bundler";
import { ProgramContext } from "../types";

type WatchCommandContext = {
	port: number;
	serve: string | undefined;
	callbacks: {
		onError: (message: string) => void;
		onSuccess: () => void;
	};
};

export const createWatchCommand = (program: Termost<ProgramContext>) => {
	program
		.command<WatchCommandContext>({
			name: "watch",
			description:
				"Watch and rebuild on any code change (development mode)",
		})
		.option({
			key: "serve",
			description:
				"Set the HTML entrypoint to enable and open a live reloadable client",
			name: "serve",
			defaultValue: undefined,
		})
		.task({
			key: "callbacks",
			label: "Setup watcher",
			async handler(context) {
				const callbacks: WatchCommandContext["callbacks"] = {
					onError() {},
					onSuccess() {},
				};

				build({
					isFast: context.noCheck,
					isProduction: false,
					/*onWatch(error) {
						if (error) {
							callbacks.onError(String(error));
						} else {
							callbacks.onSuccess();
						}
					},
					serveEntryPoint: context.serve,*/
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

					if (context.serve) {
						helpers.message("Live reload enabled");
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
