# Svelte Iconify SVG (Markup Exporter)

[![github-package.json-version](https://img.shields.io/github/package-json/v/Swiftaff/svelte-iconify-svg?style=social&logo=github)](https://github.com/Swiftaff/svelte-iconify-svg) [![The MIT License](https://img.shields.io/badge/license-MIT-orange.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![CircleCI](https://circleci.com/gh/Swiftaff/svelte-iconify-svg.svg?style=svg)](https://circleci.com/gh/Swiftaff/svelte-iconify-svg)

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
  "svelteiconifysvg": "svelte-iconify-svg -i 'input/directory1' 'input/directory2' -o 'output/filePath.js'"
}
```

### Flags

-   -i or --input [default = "src"]<br>
    Directories to search. Provide them as a space separated list of strings. _FULL PATHS ONLY AT THE MOMENT_

-   -o --output [default = "src/icons.js"]<br>
    FilePath to save

-   -f --outputsvgfiles [default = false]<br>
    Outputs as individual svg files. Default is a single JS object of all icons SVG code

-   -c --cjs [default = false]<br>
    outputs the JS object as commonJs "module.exports = ", instead of the default ES6 export syntax "export const icons = "

-   -s --alwaysSave [default = false]<br>
    forces the iconify API network call and re-save of the icons file, instead of the default which will skip these if the icons list has not changed

-   -r --recursive [default = false]<br>
    recursively searches within each input directory, instead of the default which will only search within the first level of input directories

-   -l --logging [default = true]<br>
    controls the amount of console.logs. Leave it on for to help with debugging, or reduce if it's getting too noisy for your workflow, options are "all"|true, "some", "none"|false

-   -t --transform [default = false]<br>
    fix for when some of your font awesome icons are reversed. Default is false. Set to true to enabled vertical or horizontal flipping for a small subset of fa icons such as fa:chevron-right and fa:arrow-circle-down.

## Or use the script indirectly, via the rollup plugin

https://github.com/Swiftaff/rollup-plugin-iconify-svg

## Usage (in svelte)

It's a bit hacky, but the simplest way is to use the svelte @html feature

```
//example.svelte
<script>
import icons from "./src/icons.js";
</script>
{@html icons["fa:random"]}
<!-- note, so if this example.svelte file is in one of the input directories, the "fa:random" text above would have been found, and the icon auto-generated! -->
```

## Usage (in plain JavaScript)

```
const svelteiconifysvg = require("svelte-iconify-svg");
const src = "src";
const dest = "src/icons.js";
const options = {
    commonJs: true,   //default false
    alwaysSave: true, //default false
    recursive: true,  //default false
    logging: true,    //default true or "all". Other options are:
                      //"some"
                      //false or "none"
    transform: true   //default false
};
const icons = svelteiconifysvg(src, dest, options);
console.log(icons);
/*
Do with the resulting object what you will...
icons = {
  "fa:random": "...svg markup for this icon",
  ... other icons
}
*/
```

## License

This project is licensed under the MIT License.
