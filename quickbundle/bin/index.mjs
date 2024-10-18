#!/usr/bin/env node

import { createRequire } from "node:module";
import { join } from "node:path";

const pkg = createRequire(import.meta.url)("../package.json");

import(join("..", pkg.exports["."].default));
