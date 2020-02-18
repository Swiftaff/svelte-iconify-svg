# Svelte Iconify SVG (Markup Exporter)

[![github-package.json-version](https://img.shields.io/github/package-json/v/Swiftaff/svelte-iconify-svg?style=social&logo=github)](https://github.com/user/repo) [![The MIT License](https://img.shields.io/badge/license-MIT-orange.svg?style=flat-square)](http://opensource.org/licenses/MIT)

## Purpose

Converts [iconify](https://iconify.design) icon names to SVG markup.
Intended for use in svelte projects to avoid dependencies on full font libraries, especially if you only need a few icons.
Automatically searches your source files so you can simply call this script before your build step to auto-generate the iconify icons you are referencing.

## How it works

Checks the contents of all your files in the supplied 'input' directories for any references to 'iconify' icons.
i.e. any text in the format 'alphanumericordashes colon alphanumericordashes' such as `fa:random` or `si-glyph:pin-location-2`
It will then save a .js file which exports an `icons` object of all iconify files found in your project.

## Installation

```
npm install svelte-iconify-svg --save-dev
```

## Usage (of this script)

Add to your package.json, and run it as part of your dev or build step

```
"scripts": {
  "svelteiconifysvg": "node svelte-iconify-svg -i 'input/directory1' 'input/directory2' -o 'output/filePath.js'"
}
```

### Options

-   -i or --input [default = "src"]
    provide a space separated list of strings for all folder paths you wish to search

-   -o --output [default = "src/icons.js"]
    provide a single string path/filename to save the output to

## Usage (in svelte)

It's a bit hacky, but the simplest way is to use the svelte @html feature

```
//example.svelte
<script>
import { icons } from "./src/icons.js";
</script>
{@html icons["fa:random"]}
<!-- note, so if this example.svelte file is in one of the input directories, the "fa:random" text above would have been found, and the icon auto-generated! -->
```

## License

This project is licensed under the MIT License.
