import { Project } from "../entities/project";

export type BuildContext = {
	setup: {
		project: Project;
		targets: Array<"esm" | "cjs">;
	};
	sizes: Array<{ filename: string; raw: number; gzip: number }>;
	outfiles: Array<string>;
};

export type WatchContext = {
	callbacks: {
		onError: () => void;
		onSuccess: () => void;
	};
};
