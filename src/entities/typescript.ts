/* eslint-disable @typescript-eslint/no-var-requires */
import { resolve } from "path";
import { CWD } from "../constants";

type TypeScriptConfiguration = {
	target?: string;
	hasJsxRuntime?: boolean;
};

export const getTypeScriptOptions = async (): Promise<TypeScriptConfiguration | null> => {
	try {
		const ts = await import("typescript"); // @note: lazy load typescript only if necessary
		const { jsx, target } = ts.parseJsonConfigFileContent(
			require(resolve(CWD, "tsconfig.json")),
			ts.sys,
			CWD
		).options;

		// @todo: prevent issues if no typescript or tsconfig provided
		// @note: convert ts target value to esbuild ones (latest value is not supported)
		const esbuildTarget =
			!target ||
			[ts.ScriptTarget.ESNext, ts.ScriptTarget.Latest].includes(target)
				? "esnext"
				: ts.ScriptTarget[target]?.toLowerCase();

		return {
			target: esbuildTarget,
			hasJsxRuntime:
				jsx !== undefined &&
				[ts.JsxEmit["ReactJSX"], ts.JsxEmit["ReactJSXDev"]].includes(
					jsx
				),
		};
	} catch (error) {
		return null;
	}
};
