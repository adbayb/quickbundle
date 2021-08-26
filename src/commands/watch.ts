import { createBundler } from "../bundler";
import { createProject } from "../bundler/metadata";
import { program } from "./program";

program
	.command({
		name: "watch",
		description: "Watch and rebuild on any code change",
	})
	.task({
		key: "callbacks",
		label: "Setup watcher",
		async handler() {
			const project = createProject();
			const callbacks = { onError() {}, onSuccess() {} };
			const bundle = await createBundler(project, {
				isProduction: false,
				isWatchMode: true,
				onWatch(error) {
					if (error) {
						callbacks.onError();

						throw error;
					} else {
						callbacks.onSuccess();
					}
				},
			});

			// @todo: By default, pick module target for watch mode and if not available main field (ie. cjs build)
			bundle("esm");

			return callbacks;
		},
	})
	.message({
		handler({ values }, helpers) {
			const onNotify = (type: "error" | "success") => {
				console.clear();
				helpers.print(
					`Last update at ${new Date().toLocaleTimeString()} 🔎\n`,
					{ type }
				);
			};

			values.callbacks.onSuccess = () => onNotify("success");
			values.callbacks.onError = () => onNotify("error");

			values.callbacks.onSuccess();
		},
	});
