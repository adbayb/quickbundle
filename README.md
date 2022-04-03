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
-   JavaScript, TypeScript, JSX, CSS, JSON, Image and Text support following [esbuild support](https://esbuild.github.io/content-types/)
-   Support of multiple module formats including `cjs` & `esm`
-   Bundling can be done for several platform targets including `browser` or `node`
-   Optimized build such as `peerDependencies` not bundled in the final output
-   Serve and live reload support for `html` entrypoint

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
	"main": "./dist/lib.cjs", // CommonJS output file
	"module": "./dist/lib.cjs.js", // ESM output file
	"types": "./dist/lib.d.ts", // Typing output file
	"platform": "node", // Platform target (optional, by default "browser")
	"scripts": {
		"build": "quickbundle build", // Production mode (optimizes bundle)
		"watch": "quickbundle watch", // Development mode (watches each file change)
		"serve": "quickbundle watch --serve public/index.html", // Serve an html entrypoint with live reload capabilities (for more details, check examples folder)
		"build:fast": "quickbundle build --no-check", // Production mode with fast transpilation time. This mode disables TypeScript type checking (ie. not using `tsc`) and, consequently, the `types` asset is no more managed by the tool
		"watch:fast": "quickbundle watch --no-check" // Development mode with fast transpilation time
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

-   [@adbayb/scripts](https://github.com/adbayb/stack) My opinionated toolbox for JavaScript/TypeScript projects

Contribution welcomed! 🤗

<br>

## 💙 Acknowledgements

-   The backend powered by [ESBuild](https://github.com/evanw/esbuild) to make blazing fast builds. A special shoutout to its author [Evan Wallace](https://github.com/evanw) and [all contributors](https://github.com/evanw/esbuild/graphs/contributors).
-   The zero-configuration approach was inspired by [microbundle](https://github.com/developit/microbundle). A special shoutout to its author [Jason Miller](https://github.com/developit) and [all contributors](https://github.com/developit/microbundle/graphs/contributors).

<br>

## 📖 License

[MIT](./LICENSE "License MIT")
