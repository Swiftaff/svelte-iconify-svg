"use strict";

const path = require("path");
const yargs = require("yargs");
const fs = require("fs");
const { Collection } = require("@iconify/json-tools");
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
        type: "array"
    })
    .option("output", {
        alias: "o",
        description: 'filePath to save, default is "src/icons.js"',
        type: "string"
    })
    .help(true, helpText)
    .alias("help", "h").argv;

let inputDirectoryArray = argv.input || ["src"];

let outputFilePath = argv.output || "src/icons.js";

let thePath = process.argv[1];
console.log(thePath);

main(inputDirectoryArray, outputFilePath);
//};

function main(inputDirectoryArray, outputFilePath) {
    let dirFilesObjArr = getFilesInDirectory(inputDirectoryArray);
    let text = getContentsOfAllFiles(dirFilesObjArr, outputFilePath);
    let iconsList = getIconNamesFromTextUsingRegex(text);
    let iconCode = getCodeFromIconList(iconsList);
    saveCodeToFile(outputFilePath, iconCode);
    console.log("Saved " + iconsList.length + " icons bundle to", outputFilePath, " (" + iconCode.length + " bytes)");
}

//----------------------------------------------------------------------------

function getFilesInDirectory(dirsArr) {
    let ret = [];
    dirsArr.forEach(dir => {
        //const directoryPath = path.join(__dirname, dir);
        try {
            ret.push({ dir, files: fs.readdirSync(dir, "utf8") });
        } catch (err) {
            console.log(err);
        }
    });
    console.log("Found the following files:", ret);
    return ret;
}

function getContentsOfAllFiles(dirFilesObjArr, output) {
    let html = "";
    dirFilesObjArr.forEach(dirFilesObj => {
        //const directoryPath = path.join(__dirname, dirFilesObj.dir);
        dirFilesObj.files.map(fileName => {
            if (
                (fileName.endsWith(".svelte") || fileName.endsWith(".js")) &&
                dirFilesObj.dir + "/" + fileName !== output
            ) {
                try {
                    const data = fs.readFileSync(dirFilesObj.dir + "/" + fileName, "utf8");
                    html += data;
                } catch (err) {
                    console.error(err);
                }
            }
        });
    });
    return html;
}

function getIconNamesFromTextUsingRegex(str) {
    //iconify icon names are in the format of alphanumeric:alphanumeric, where text can also contain dashes e.g.
    //fa:random
    //si-glyph:pin-location-2
    //https://regex101.com
    //(?<=")                must start with, but don't capture "
    //(?!(bind|on|svelte))  must not start with these words, they're not icons but follow the same format!
    //[a-zA-Z0-9-]+         any characters for first part of icon name (alphanumeric or a dash)
    //:                     colon between words
    //[a-zA-Z0-9-]+         as above
    //(?=")                 must end with, but don't capture "
    const regexp = /(?<=("|'))(?!(bind|on|svelte))[a-zA-Z0-9-]+:[a-zA-Z0-9-]+(?=("|'))/g;
    let arr = [...str.matchAll(regexp)]; //note requires node 12
    let results = [];
    arr.forEach(a => {
        if (!results.includes(a[0])) results.push(a[0]);
    });
    console.log("Found the following icons:", results.sort());
    return results.sort();
}

function getCodeFromIconList(icons) {
    // Sort icons by collections: filtered[prefix][array of icons]
    let filtered = {};
    let code = `/*
  This file was generated by 'svelte-iconify-svg'.
  It should be set to run before each build in the package.json

  It will check the contents of all files in the 'input' directories supplied  for any references to 'iconify' icons
  i.e. anything in quotes of the format alphanumericordashes:alphanumericordashes, e.g. "fa:random" or 'si-glyph:pin-location-2' />'
  and generate a list of those iconify icon references.
  
  It will then create an object containing the SVG code for all these icons.
  
  The 'IconSVG' component can then refer to each svg icon and generate a separate svelte component as required.
  This is done in a hacky way but it works, using {@html 'generatedHtmlCodeForEachSVG'}
  */
 
  export const icons = {
  `;

    icons.forEach(origName => {
        console.log("Generating SVG for: '" + origName + "'");
        let icon = origName;
        let parts = origName.split(":"),
            prefix;

        if (parts.length > 1) {
            prefix = parts.shift();
            icon = parts.join(":");
        } else {
            parts = icon.split("-");
            prefix = parts.shift();
            icon = parts.join("-");
        }
        if (filtered[prefix] === void 0) {
            filtered[prefix] = [];
        }
        if (filtered[prefix].indexOf(icon) === -1) {
            filtered[prefix].push({ name: icon, origName });
        }
    });

    // Parse each collection
    Object.keys(filtered).forEach(prefix => {
        let collection = new Collection();
        if (!collection.loadIconifyCollection(prefix)) {
            console.error("Error loading collection", prefix);
            return;
        }
        filtered[prefix].map(iconObj => {
            let data = collection.getIconData(iconObj.name);
            code +=
                '"' +
                iconObj.origName +
                '": `' +
                getSVGHtmlFromData(data) +
                "`," +
                `
    `;
        });
    });
    code += `}
`;
    return code;
}

function getSVGHtmlFromData(d) {
    return `
xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink"
aria-hidden="true"
focusable="false"
style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg);
transform: rotate(360deg);"
preserveAspectRatio="xMidYMid meet"
viewBox="${d.left} ${d.top} ${d.width} ${d.height}">
${d.body}
<rect x="${d.left}" y="${d.top}" width="${d.width}" height="${d.height}" fill="rgba(0, 0, 0, 0)" />
</svg>`;
}

function saveCodeToFile(output, code) {
    fs.writeFileSync(output, code, "utf8");
}
