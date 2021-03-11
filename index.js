"use strict";

const mkdirp = require("mkdirp");
const fs = require("fs");
const getDirName = require("path").dirname;
const { Collection } = require("@iconify/json-tools");

async function svelteiconifysvg(inputDirectoryArray, outputFilePath, options) {
    console.log("\r\nsvelteiconifysvg");

    inputDirectoryArray = Array.isArray(inputDirectoryArray) ? inputDirectoryArray : [inputDirectoryArray];

    let dirFilesObjArr = getFilesInDirectory(inputDirectoryArray);
    let text = getContentsOfAllFiles(dirFilesObjArr, outputFilePath);
    if (options && options.outputSVGfiles) {
        let iconsList = getIconNamesFromTextUsingRegexV2(text);
        await getFilesFromIconList(iconsList, async (code, filename) => {
            let dash = outputFilePath.endsWith("/") ? "" : "/";
            let fullpath = outputFilePath + dash + filename;
            console.log("fullpath", fullpath);
            await saveCodeToFile(fullpath, code, iconsList.length, iconsList.length);
        });
    } else {
        let iconsList = getIconNamesFromTextUsingRegex(text);
        if ((options && options.alwaysSave) || !options) {
            //alwaysSave = false is default
            let iconListHasChanged = await getWhetherIconListHasChanged(iconsList, outputFilePath);
            if (iconListHasChanged) {
                let { code, count } = getCodeFromIconList(iconsList, options);
                await saveCodeToFile(outputFilePath, code, count, iconsList.length);
            } else {
                console.log("- Skipped getting & saving icons - current list is already saved");
            }
        } else {
            let { code, count } = getCodeFromIconList(iconsList, options);
            await saveCodeToFile(outputFilePath, code, count, iconsList.length);
        }
    }
}

//----------------------------------------------------------------------------

async function getWhetherIconListHasChanged(iconsList, outputFilePath) {
    // returning true represents needing the iconsList to be resaved
    try {
        const data = fs.readFileSync(outputFilePath, "utf8");
        let savedIconsList = require(outputFilePath);
        if (savedIconsList && typeof savedIconsList === "object") {
            return (
                iconsList.length === savedIconsList.length &&
                savedIconsList.filter((icon_name) => iconsList.includes(icon_name)).length === savedIconsList.length
            );
        } else {
        return true;
    }
    } catch (error) {
        return true;
    }
}

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
                html += getContentsOfOneFile(dirFilesObj.dir + "/" + fileName);
            }
        });
    });
    return html;
}

function getContentsOfOneFile(file) {
    try {
        return fs.readFileSync(file, "utf8");
    } catch (err) {
        //console.error(err);
        return "";
    }
}

function getIconNamesFromTextUsingRegex(str, options) {
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
        if ((options && options.duplicates) || !results.includes(a[0])) results.push(a[0]);
    });
    if (!(options && options.suppress_log)) console.log("- Found the following icon references:", results.sort());
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
    let count = 0;
    let errors = "";
    let code = `/*
This file was generated directly by 'https://github.com/Swiftaff/svelte-iconify-svg' 
or via the rollup plugin 'https://github.com/Swiftaff/rollup-plugin-iconify-svg'.
*/

${exportText} {
  `;

    icons.forEach((origName) => {
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
        let loaded = collection.loadIconifyCollection(prefix);
        if (!loaded) {
            let this_error =
                "x ERROR no such icon prefix '" +
                prefix +
                ":' - in these icon names (" +
                filtered[prefix].map((f) => "'" + f.origName + "'").join(",") +
                ")";

            errors += this_error + "\r\n";
            console.error(this_error);
        } else {
            filtered[prefix].map((iconObj) => {
                let data = collection.getIconData(iconObj.name);
                if (data) {
                    console.log("- Generating SVG for: '" + iconObj.origName + "'");
                    code +=
                        '"' +
                        iconObj.origName +
                        '": `' +
                        getSVGHtmlFromData(data) +
                        "`," +
                        `
    `;
                    count++;
                } else {
                    let this_error = "x ERROR no such icon name   '" + iconObj.origName + "'";
                    errors += this_error + "\r\n";
                    console.error(this_error);
                }
            });
        }
    });
    code += `}
`;
    code = errors.length ? `/*\r\n${errors}*/\r\n\r\n${code}` : code;
    return { code, count };
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

async function saveCodeToFile(output, code, iconCount, iconTotal) {
    let dirname = getDirName(output);
    const made = mkdirp.sync(dirname);
    if (made) console.log("- mkdirp had to create some of these directories ", made);
    fs.writeFileSync(output, code, "utf8");
    console.log(
        "- Saved " + iconCount + " of " + iconTotal + " icons bundle to",
        output,
        " (" + code.length + " bytes)"
    );
}

module.exports = svelteiconifysvg;
