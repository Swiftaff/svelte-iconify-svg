"use strict";

const mkdirp = require("mkdirp");
const fs = require("fs");
const getDirName = require("path").dirname;
const { Collection } = require("@iconify/json-tools");

async function svelteiconifysvg(inputDirectoryArray, outputFilePath, options) {
    console.log("svelteiconifysvg");

    inputDirectoryArray = Array.isArray(inputDirectoryArray) ? inputDirectoryArray : [inputDirectoryArray];

    let dirFilesObjArr = getFilesInDirectory(inputDirectoryArray);
    let text = getContentsOfAllFiles(dirFilesObjArr, outputFilePath);
    if (options && options.outputSVGfiles) {
        let iconsList = getIconNamesFromTextUsingRegexV2(text);
        await getFilesFromIconList(iconsList, async (code, filename) => {
            let dash = outputFilePath.endsWith("/") ? "" : "/";
            let fullpath = outputFilePath + dash + filename;
            console.log("fullpath", fullpath);
            await saveCodeToFile(fullpath, code, iconsList);
        });
    } else {
        let iconsList = getIconNamesFromTextUsingRegex(text);
        let iconCode = getCodeFromIconList(iconsList, options);
        await saveCodeToFile(outputFilePath, iconCode, iconsList);
    }
}

//----------------------------------------------------------------------------

function getFilesInDirectory(dirsArr) {
    let ret = [];
    dirsArr.forEach((dir) => {
        try {
            ret.push({ dir, files: fs.readdirSync(dir, "utf8") });
        } catch (err) {
            console.log(err);
        }
    });
    console.log("- Found the following files:", ret);
    return ret;
}

function getContentsOfAllFiles(dirFilesObjArr, output) {
    let html = "";
    dirFilesObjArr.forEach((dirFilesObj) => {
        dirFilesObj.files.map((fileName) => {
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
    arr.forEach((a) => {
        if (!results.includes(a[0])) results.push(a[0]);
    });
    console.log("- Found the following icons:", results.sort());
    return results.sort();
}

function getIconNamesFromTextUsingRegexV2(str) {
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
    const regexp = /(?<=iconify#)[a-zA-Z0-9-]+(?=#iconify)/g;
    let arr = [...str.matchAll(regexp)]; //note requires node 12
    let results = [];
    arr.forEach((a) => {
        if (!results.includes(a[0])) results.push(a[0]);
    });
    console.log("- Found the following icons:", results.sort());
    return results.sort();
}

function getFilesFromIconList(icons, callback) {
    // Sort icons by collections: filtered[prefix][array of icons]
    let filtered = {};
    icons.forEach((origNameWithFirstDash) => {
        let origName = origNameWithFirstDash.replace("-", ":");
        console.log("origName", origName, origNameWithFirstDash);

        console.log("- Generating SVG for: '" + origName + "'");
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
    Object.keys(filtered).forEach((prefix) => {
        let collection = new Collection();
        if (!collection.loadIconifyCollection(prefix)) {
            console.error("- Error loading collection", prefix);
            return;
        }
        filtered[prefix].map((iconObj) => {
            let data = collection.getIconData(iconObj.name);
            let code =
                `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">` +
                getSVGHtmlFromData(data);
            let filename = iconObj.origName.replace(":", "-") + ".svg";
            callback(code, filename);
        });
    });
}

function getCodeFromIconList(icons, options) {
    // Sort icons by collections: filtered[prefix][array of icons]
    let filtered = {};
    let exportText = options && options.commonJs ? "module.exports = " : "export default";

    let code = `/*
This file was generated directly by 'https://github.com/Swiftaff/svelte-iconify-svg' 
or via the rollup plugin 'https://github.com/Swiftaff/rollup-plugin-iconify-svg'.

You can import this file to create an object of all 'iconify' icons which were found in your project.

You can then include, e.g. {@html 'icons["fa:random]'} in your svelte file to display the icon.
it's a bit hacky, and this file will get large for large amounts of icons.
But it may be preferrable to using the standard iconify scripts to pull in the icons each time.

You can regenerate this file using the packages named above which will check the contents of all files in the 'input' directories supplied  for any references to 'iconify' icons
i.e. anything in quotes of the format alphanumericordashes:alphanumericordashes, e.g. "fa:random" or 'si-glyph:pin-location-2' />'
and generate this file containine a list of those iconify icon references with their SVG markup.
*/

${exportText} {
  `;

    icons.forEach((origName) => {
        console.log("- Generating SVG for: '" + origName + "'");
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
    Object.keys(filtered).forEach((prefix) => {
        let collection = new Collection();
        if (!collection.loadIconifyCollection(prefix)) {
            console.error("- Error loading collection", prefix);
            return;
        }
        filtered[prefix].map((iconObj) => {
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
    return `<svg
width="100%" 
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

async function saveCodeToFile(output, code, iconsList) {
    let dirname = getDirName(output);
    const made = mkdirp.sync(dirname);
    if (made) console.log("- mkdirp had to create some of these directories ", made);
    fs.writeFileSync(output, code, "utf8");
    console.log("- Saved " + iconsList.length + " icons bundle to", output, " (" + code.length + " bytes)");
}

module.exports = svelteiconifysvg;
