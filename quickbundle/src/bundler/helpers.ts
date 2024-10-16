import type { LogHandlerWithDefault } from "rollup";

export const onLog: LogHandlerWithDefault = (_, log) => {
	if (log.message.includes("Generated an empty chunk")) return;
};

export const isRecord = (value: unknown): value is Record<string, unknown> => {
	return typeof value === "object" && value !== null && !Array.isArray(value);
};
