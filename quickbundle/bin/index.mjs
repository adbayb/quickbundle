#!/usr/bin/env node

import { createRequire } from "node:module";

const package_ = createRequire(import.meta.url)("../package.json");

import(new URL(`../${package_.exports["."].default}`, import.meta.url));
