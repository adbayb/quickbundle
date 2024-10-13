import type { LogHandlerWithDefault } from "rollup";

export const onLog: LogHandlerWithDefault = (_, log) => {
	if (log.message.includes("Generated an empty chunk")) return;
};
