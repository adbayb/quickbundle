#!/usr/bin/env node

import { join } from "node:path";
import { createRequire } from "node:module";

const pkg = createRequire(import.meta.url)("../package.json");

import(join("..", pkg.exports["."].default));
