#!/usr/bin/env node

const svelteiconifysvg = require("../index.js");
const yargs = require("yargs");

const descriptions = {
    i:
        'Directories to search. Provide them as a space separated list of strings. Default is "src" *FULL PATHS ONLY AT THE MOMENT*',
    o: 'FilePath to save. Default is "src/icons.js"',
    f: "Outputs as individual svg files. Default is a single JS object of all icons SVG code",
    c:
        'outputs the JS object as commonJs "module.exports = ", instead of the default ES6 export syntax "export const icons = "',
    s:
        "forces the iconify API network call and re-save of the icons file, instead of the default which will skip these if the icons list has not changed",
    r:
        "recursively searches within each input directory, instead of the default which will only search within the first level of input directories",
};

const helpText = `
1. syntax: svelte-iconify-svg -i inputDirectoryArray -o outputFilePath -f -c -s
All flags are optional with these defaults...
-i ${descriptions.i}
-o ${descriptions.o} 
-f ${descriptions.f} 
-c ${descriptions.c}
-s ${descriptions.s}
-r ${descriptions.r}
    
2. purpose: Converts iconify icon names to SVG
Intended for use in svelte projects to avoid dependencies on full font libraries, especially if you only need a few icons.
Automatically searches your source files so you can simply call this script before your build step to auto-generate the iconify icons you are referencing.

3. how it works: It checks the contents of all files in the 'input' directories supplied in 'inputDirectoryArray'
for any references to 'iconify' icons, i.e. any text in the format 'alphanumericordashes colon alphanumericordashes' such as 'fa:random' or 'si-glyph:pin-location-2'
It will then save it as a .js file which exports an object of all iconify files found in your project.

4. basic usage
a) add to the package.json, and run it as part of your dev or build step, or use via the rollup-plugin https://github.com/Swiftaff/rollup-plugin-iconify-svg

"scripts": {
  "svelteiconifysvg": "node svelte-iconify-svg"
}

b) in svelte
//example.svelte
<script>
import icons from "./icons.js";
</script>
{@html icons["fa:random"]}
<!-- note, so if this example.svelte file is in one of the input directories, the "fa:random" text above would have been found, and the icon auto-generated! -->
`;

const argv = yargs
    .option("input", {
        alias: "i",
        description: descriptions.i,
        type: "array",
    })
    .option("output", {
        alias: "o",
        description: descriptions.o,
        type: "string",
    })
    .option("outputsvgfiles", {
        alias: "f",
        description: descriptions.f,
        type: "boolean",
    })
    .option("cjs", {
        alias: "c",
        description: descriptions.c,
        type: "boolean",
    })
    .option("alwaysSave", {
        alias: "s",
        description: descriptions.s,
        type: "boolean",
    })
    .option("recursive", {
        alias: "r",
        description: descriptions.r,
        type: "boolean",
    })

    .help(true, helpText)
    .alias("help", "h").argv;

let inputDirectoryArray = argv.input || ["src"];

let outputFilePath = argv.output || "src/icons.js";

let options = {
    outputSVGfiles: typeof argv.outputsvgfiles !== "undefined",
    commonJs: typeof argv.cjs !== "undefined",
    alwaysSave: typeof argv.alwaysSave !== "undefined",
    recursive: typeof argv.recursive !== "undefined",
};

svelteiconifysvg(inputDirectoryArray, outputFilePath, options);
