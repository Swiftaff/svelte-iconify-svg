#!/usr/bin/env node

const svelteiconifysvg = require("../index.js");
const yargs = require("yargs");

const helpText = `
1. syntax: svelte-iconify-svg -i inputDirectoryArray -o outputFilePath
If you don't supply the optional i or o parameters it uses these defaults...
*FULL PATHS ONLY AT THE MOMENT*
inputDirectoryArray = "src"
outputFilePath = "src/icons.js"
    
2. purpose: Converts iconify icon names to SVG
Intended for use in svelte projects to avoid dependencies on full font libraries, especially if you only need a few icons.
Automatically searches your source files so you can simply call this script before your build step to auto-generate the iconify icons you are referencing.

3. how it works: It checks the contents of all files in the 'input' directories supplied in 'inputDirectoryArray'
for any references to 'iconify' icons, i.e. any text in the format 'alphanumericordashes colon alphanumericordashes' such as 'fa:random' or 'si-glyph:pin-location-2'
It will then save it as a .js file which exports an object of all iconify files found in your project.

4. Basic usage
a) add to the package.json, and run it as part of your dev or build step

"scripts": {
  "svelteiconifysvg": "node svelte-iconify-svg"
}

b) in svelte
//example.svelte
<script>
import { icons } from "./icons.js";
</script>
{@html icons["fa:random"]}
<!-- note, so if this example.svelte file is in one of the input directories, the "fa:random" text above would have been found, and the icon auto-generated! -->
`;
//module.exports = function() {
const argv = yargs
    .option("input", {
        alias: "i",
        description: 'Directories to search. Provide them as a space separated list of strings. Default is "src"',
        type: "array",
    })
    .option("output", {
        alias: "o",
        description: 'filePath to save, default is "src/icons.js"',
        type: "string",
    })
    .help(true, helpText)
    .alias("help", "h").argv;

let inputDirectoryArray = argv.input || ["src"];

let outputFilePath = argv.output || "src/icons.js";

let thePath = process.argv[1];

svelteiconifysvg(inputDirectoryArray, outputFilePath);
