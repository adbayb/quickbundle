<br>
<div align="center">
    <h1>📦 Quickbundle</h1>
    <strong>The zero-configuration bundler powered by ESBuild</strong>
</div>
<br>
<br>

## ✨ Features

Quickbundle allows you to bundle a library in a **quick**, **fast** and **easy** way:

-   Fast build and watch mode thanks to [esbuild](https://esbuild.github.io/)
-   Zero configuration: define the build artifacts in your `package.json` and you're all set!
-   Support of multiple module formats including `cjs` & `esm`
-   JavaScript, TypeScript, JSX, CSS, JSON, Image and Text support following [esbuild support](https://esbuild.github.io/content-types/)
-   TypeScript declaration file (`.d.ts`) generation with bundling support
-   Optimized build with automatic dependency inclusion (`peerDependencies` and `dependencies` are not bundled in the final output)

<br>

## 🚀 Quickstart

1️⃣ Install by running:

```bash
# Npm
npm install quickbundle
# Pnpm
pnpm add quickbundle
# Yarn
yarn add quickbundle
```

2️⃣ Set up your package configuration (`package.json`):

```jsonc
{
	"name": "lib", // Package name
	"exports": {
		".": {
			"source": "src/index.ts(x)?", // Source code entrypoint
			"types": "./dist/index.d.ts", // Typing output file (if defined, can increase build time)
			"import": "./dist/index.mjs", // ESM output file
			"require": "./dist/index.cjs" // CommonJS output file
		}
	}
	"scripts": {
		"build": "quickbundle build", // Production mode (optimizes bundle)
		"watch": "quickbundle watch", // Development mode (watches each file change)
	},
	// ...
}
```

3️⃣ Try it by running:

```bash
# Npm
npm run build
# Pnpm
pnpm build
# Yarn
yarn build
```

<br>

## 🤩 Used by

-   [@adbayb/scripts](https://github.com/adbayb/stack) My opinionated toolbox for JavaScript/TypeScript projects

Contribution welcomed! 🤗

<br>

## 💙 Acknowledgements

-   The backend is powered by [ESBuild](https://github.com/evanw/esbuild) to make blazing-fast builds. A special shoutout to its author [Evan Wallace](https://github.com/evanw) and [all contributors](https://github.com/evanw/esbuild/graphs/contributors).
-   The zero-configuration approach was inspired by [microbundle](https://github.com/developit/microbundle). A special shoutout to its author [Jason Miller](https://github.com/developit) and [all contributors](https://github.com/developit/microbundle/graphs/contributors).

<br>

## 📖 License

[MIT](./LICENSE "License MIT")
