<br>
<div align="center">
    <h1>📦 Quickbundle</h1>
    <strong>The zero-configuration bundler powered by ESBuild</strong>
</div>
<br>
<br>

## ✨ Features

Quickbundle allows you to bundle a library with ease:

-   Fast build thanks to [ESBuild bundler](https://github.com/evanw/esbuild)
-   `package.json` as a first-class citizen to define your project build configurations
-   `CJS` & `ESM` output format support
-   Browser & Node.JS platform target support
-   Peer dependencies support (excluded automatically from the build output)
-   Quick development build support with a watch mode
-   Production build support with optimized output
-   TypeScript support
-   JSX support

<br>

## 🚀 Quickstart

1️⃣ Install by running:

```bash
# NPM
npm install quickbundle
# Yarn
yarn add quickbundle
```

2️⃣ Set up your package configuration (`package.json`):

```jsonc
{
	"name": "lib", // Package name
	"source": "src/index.ts", // Source code entrypoint
	"main": "./dist/lib.cjs", // CommonJS bundle output
	"module": "./dist/lib.cjs.js", // ESM bundle output
	"types": "./dist/lib.d.ts", // Typing output (not yet supported: coming soon...)
	"platform": "node", // Platform target (optional, by default "browser")
	"scripts": {
		"prod": "quickbundle build", // Production mode (optimized bundles)
		"dev": "quickbundle watch" // Development mode (watch mode on each file change)
	}
}
```

3️⃣ Try it by running:

```bash
# NPM
npm run prod
# Yarn
yarn prod
```

<br>

## 🤩 Used by

Contribution welcomed! 🤗
