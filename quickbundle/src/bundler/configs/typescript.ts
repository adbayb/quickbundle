import { resolve } from "node:path";
import ts from "typescript";

import { CWD } from "../../constants";

export type TSConfig = {
	hasJsxRuntime: boolean;
	jsxImportSource: string | undefined;
	target: string;
};

const TSCONFIG_PATH = resolve(CWD, "tsconfig.json");

export const getTSConfig = (): TSConfig | null => {
	try {
		const { jsx, jsxImportSource, target } = ts.parseJsonConfigFileContent(
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			require(TSCONFIG_PATH),
			ts.sys,
			CWD,
		).options;

		// Convert ts target value to esbuild ones (latest value is not supported)
		const esbuildTarget =
			!target ||
			[ts.ScriptTarget.ESNext, ts.ScriptTarget.Latest].includes(target)
				? "esnext"
				: ts.ScriptTarget[target].toLowerCase();

		const hasJsxRuntime =
			jsx !== undefined &&
			[ts.JsxEmit.ReactJSX, ts.JsxEmit.ReactJSXDev].includes(jsx);

		return {
			hasJsxRuntime,
			jsxImportSource,
			target: esbuildTarget,
		};
	} catch (error) {
		return null;
	}
};
