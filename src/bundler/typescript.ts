import { dirname, resolve } from "path";
import { helpers } from "termost";
import { CWD } from "../constants";

export type TypeScriptConfiguration = {
	target: string;
	jsxImportSource: string | undefined;
	hasJsxRuntime: boolean;
};

export const getTypeScriptConfiguration =
	async (): Promise<TypeScriptConfiguration | null> => {
		try {
			const ts = await import("typescript"); // @note: lazy load typescript only if necessary
			const { jsx, jsxImportSource, target } =
				ts.parseJsonConfigFileContent(
					// eslint-disable-next-line @typescript-eslint/no-var-requires
					require(resolve(CWD, "tsconfig.json")),
					ts.sys,
					CWD
				).options;

			// @note: convert ts target value to esbuild ones (latest value is not supported)
			const esbuildTarget =
				!target ||
				[ts.ScriptTarget.ESNext, ts.ScriptTarget.Latest].includes(
					target
				)
					? "esnext"
					: ts.ScriptTarget[target]?.toLowerCase();

			const hasJsxRuntime =
				jsx !== undefined &&
				[ts.JsxEmit["ReactJSX"], ts.JsxEmit["ReactJSXDev"]].includes(
					jsx
				);

			return {
				target: esbuildTarget,
				jsxImportSource,
				hasJsxRuntime,
			};
		} catch (error) {
			return null;
		}
	};

export const generateTypeScriptDeclaration = async (outfile: string) => {
	const outdir = dirname(outfile);

	try {
		await helpers.exec(
			`tsc --declaration --emitDeclarationOnly --incremental --removeComments false --outDir ${outdir}`,
			{ cwd: CWD }
		);

		return outdir;
	} catch (error) {
		throw new Error(`Type generation failed:\n${error}`);
	}
};

export const hasTypeScript = (
	tsConfig: TypeScriptConfiguration | null
): tsConfig is TypeScriptConfiguration => {
	return Boolean(tsConfig);
};
