"use strict";

const mkdirp = require("mkdirp");
const fs = require("fs");
const readRecursive = require("fs-readdir-recursive");
const path = require("path");
const getDirName = path.dirname;
const { Collection } = require("@iconify/json-tools");
const { version } = require("./package.json");

async function svelteiconifysvg(inputDirectoryArray, outputFilePath, options) {
    //console.log(options); //for testing cli
    if (logit("primary", options)) console.log("\r\nsvelteiconifysvg v" + version);

    inputDirectoryArray = Array.isArray(inputDirectoryArray) ? inputDirectoryArray : [inputDirectoryArray];

    let dirFilesObjArr = getFilesInDirectory(inputDirectoryArray, options);
    let text = getContentsOfAllFiles(dirFilesObjArr, outputFilePath, options);
    if (options && options.outputSVGfiles) {
        let iconsList = getIconNamesFromTextUsingRegexV2(text, options);
        await getFilesFromIconList(
            iconsList,
            async (code, filename) => {
                let dash = outputFilePath.endsWith("/") ? "" : "/";
                let fullpath = outputFilePath + dash + filename;
                if (logit("secondary", options)) console.log("fullpath " + fullpath);
                await saveCodeToFile(fullpath, code, iconsList.length, iconsList.length, options);
            },
            options
        );
    } else {
        let iconsList = getIconNamesFromTextUsingRegex(text);
        if ((options && !options.alwaysSave) || !options) {
            //alwaysSave = false is default
            let iconListHasChanged = await getWhetherIconListHasChanged(iconsList, outputFilePath, options);
            if (iconListHasChanged) {
                let { code, count } = getCodeFromIconList(iconsList, options);
                await saveCodeToFile(outputFilePath, code, count, iconsList.length, options);
            } else {
                if (logit("primary", options))
                    console.log("- Skipped getting & saving icons - current list is already saved");
            }
        } else {
            let { code, count } = getCodeFromIconList(iconsList, options);
            await saveCodeToFile(outputFilePath, code, count, iconsList.length, options);
        }
    }
}

//----------------------------------------------------------------------------

async function getWhetherIconListHasChanged(iconsList, outputFilePath, options) {
    // returning true represents needing the iconsList to be resaved
    const actualpath = await path.resolve(outputFilePath);

    // try to read current icons file
    try {
        const data = fs.readFileSync(actualpath, "utf8");
    } catch (e) {
        if (logit("secondary", options)) console.log("- alwaysSave: output path doesn't exist so saving anyway");
        return true;
    }

    // try to get icons list from icons file
    let contents = getContentsOfOneFile(actualpath, options);
    let savedIconsList = getIconNamesFromTextUsingRegex(contents, { suppress_log: true, duplicates: true });
    if (savedIconsList && Array.isArray(savedIconsList)) {
        let sameLength = iconsList.length === savedIconsList.length;
        let doesNotIncludeAllIcons =
            savedIconsList.filter((icon_name) => iconsList.includes(icon_name)).length !== savedIconsList.length;
        return !sameLength || doesNotIncludeAllIcons;
    } else {
        if (logit("secondary", options)) console.log("- alwaysSave: new icons found so saving anyway");
        return true;
    }
}

function getFilesInDirectory(dirsArr, options) {
    let ret = [];
    dirsArr.forEach((dir) => {
        try {
            if (options && options.recursive) {
                // recursive = true (make this the default)
                ret.push({ dir, files: readRecursive(dir) });
            } else {
                ret.push({ dir, files: fs.readdirSync(dir, "utf8") });
            }
        } catch (err) {
            if (logit("primary", options)) console.log("- Error getting files in directory");
            if (logit("secondary", options)) console.error(err);
        }
    });
    if (logit("secondary", options)) console.log("- Found " + ret.length + " file" + (ret.length > 1 ? "s" : ""));
    if (logit("secondary", options)) console.log(ret);
    return ret;
}

function getContentsOfAllFiles(dirFilesObjArr, output, options) {
    let html = "";
    dirFilesObjArr.forEach((dirFilesObj) => {
        dirFilesObj.files.map((fileName) => {
            if (
                (fileName.endsWith(".svelte") || fileName.endsWith(".js")) &&
                dirFilesObj.dir + "/" + fileName !== output
            ) {
                html += getContentsOfOneFile(dirFilesObj.dir + "/" + fileName, options);
            }
        });
    });
    return html;
}

function getContentsOfOneFile(file, options) {
    try {
        return fs.readFileSync(file, "utf8");
    } catch (err) {
        if (logit("secondary", options)) console.log("- Error getting contents of file " + file);
        if (logit("secondary", options)) console.log(err);
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
    if (!(options && options.suppress_log) && logit("secondary", options))
        console.log("- Found the following icon references:", results.sort());
    return results.sort();
}

function getIconNamesFromTextUsingRegexV2(str, options) {
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
    if (logit("secondary", options))
        console.log("- Found " + results.length + " icon" + (results.length > 1 ? "s" : ""));
    if (logit("secondary", options)) console.log(results.sort());
    return results.sort();
}

function getFilesFromIconList(icons, callback, options) {
    // Sort icons by collections: filtered[prefix][array of icons]
    let filtered = {};
    icons.forEach((origNameWithFirstDash) => {
        let origName = origNameWithFirstDash.replace("-", ":");

        if (logit("secondary", options)) console.log("- Generating SVG for: '" + origName + "'");
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
            if (logit("secondary", options)) console.log("- Error loading collection");
            if (logit("secondary", options)) console.log(prefix);
            return;
        }
        filtered[prefix].map((iconObj) => {
            let data = collection.getIconData(iconObj.name);
            let code =
                `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">` +
                getSVGHtmlFromData(data, options);
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
            if (logit("secondary", options)) console.log(this_error);
        } else {
            filtered[prefix].map((iconObj) => {
                let data = collection.getIconData(iconObj.name);
                if (data) {
                    if (logit("secondary", options)) console.log("- Generating SVG for: '" + iconObj.origName + "'");
                    code +=
                        '"' +
                        iconObj.origName +
                        '": `' +
                        getSVGHtmlFromData(data, options) +
                        "`," +
                        `
    `;
                    count++;
                } else {
                    let this_error = "x ERROR no such icon name   '" + iconObj.origName + "'";
                    errors += this_error + "\r\n";
                    if (logit("secondary", options)) console.log(this_error);
                }
            });
        }
    });
    code += `}
`;
    code = errors.length ? `/*\r\n${errors}*/\r\n\r\n${code}` : code;
    return { code, count };
}

function getSVGHtmlFromData(d, options) {
    let body = getBodyAndFlipIfNeeded(d, options);
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
${body}
<rect x="${d.left}" y="${d.top}" width="${d.width}" height="${d.height}" fill="rgba(0, 0, 0, 0)" />
</svg>`;
}

function getBodyAndFlipIfNeeded(d, options) {
    let body = d.body;
    if ((!options || (options && options.transform)) && (d.hFlip || d.vFlip)) {
        let tw = d.hFlip ? d.width : 0;
        let th = d.vFlip ? d.height : 0;
        let sw = d.hFlip ? -1 : 1;
        let sh = d.vFlip ? -1 : 1;
        body = `<g transform="translate(${tw} ${th}) scale(${sw} ${sh})">${body}</g>`;
    }
    return body;
}

async function saveCodeToFile(output, code, iconCount, iconTotal, options) {
    let dirname = getDirName(output);
    const made = mkdirp.sync(dirname);
    if (made) {
        if (logit("secondary", options)) console.log("- mkdirp had to create some of these directories");
        if (logit("secondary", options)) console.log(made);
    }
    fs.writeFileSync(output, code, "utf8");
    if (logit("primary", options))
        console.log(
            "- Saved " + iconCount + " of " + iconTotal + " icons bundle to",
            output,
            " (" + code.length + " bytes)"
        );
}

function logit(level, options) {
    if (level === "primary") {
        return (
            options &&
            (options.logging === "all" ||
                options.logging === true ||
                options.logging === "true" ||
                typeof options.logging === "undefined" ||
                options.logging === "some")
        );
    } else if (level === "secondary") {
        return (
            options &&
            (options.logging === "all" ||
                options.logging == true ||
                options.logging == "true" ||
                typeof options.logging === "undefined")
        );
    }
}

module.exports = svelteiconifysvg;
