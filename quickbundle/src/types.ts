import type { Termost } from "termost";

export type CommandFactory = (program: Termost) => void;
export type ModuleFormat = "cjs" | "esm";
