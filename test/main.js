const test = require("ava");
const fs = require("fs");
const path = require("path");
const svelteiconifysvg = require("../index");
const spawnSync = require("child_process").spawnSync;

test("test 1 fn - basic working", async (t) => {
    await svelteiconifysvg(["test/fixtures/test1"], "test/outputs/test1/icons.js", { commonJs: true });
    const test1 = require("../test/outputs/test1/icons.js");
    t.snapshot(test1);
});

test("test 1b fn - basic working with no options (without CommonJs)", async (t) => {
    await svelteiconifysvg(["test/fixtures/test1"], "test/outputs/test1/icons2.js");
    const test1b = await import("../test/outputs/test1/icons2.js");
    t.snapshot(test1b);
});

test("test 2 fn - basic wrong input directory returns empty object", async (t) => {
    await svelteiconifysvg(["test/fixtures/test22"], "test/outputs/test2/icons.js", { commonJs: true });
    const test2 = require("../test/outputs/test2/icons.js");
    t.snapshot(test2);
});

test("test 3 fn - basic input string, not array", async (t) => {
    await svelteiconifysvg("test/fixtures/test1", "test/outputs/test3/icons.js", { commonJs: true });
    const test3 = require("../test/outputs/test3/icons.js");
    t.snapshot(test3);
});

test("test 4 fn - multiple inputs", async (t) => {
    await svelteiconifysvg(
        ["test/fixtures/test1", "test/fixtures/test4", "test/fixtures/test4/test4b"],
        "test/outputs/test4/icons.js",
        {
            commonJs: true,
        }
    );
    const test4 = require("../test/outputs/test4/icons.js");
    t.snapshot(test4);
});

test("test 9 fn - typo in icon names should log but not fail", async (t) => {
    await svelteiconifysvg(["test/fixtures/test9"], "test/outputs/test9/icons.js", {
        commonJs: true,
    });
    const test9 = require("../test/outputs/test9/icons.js");
    t.snapshot(test9);
});

//testing getWhetherIconListHasChanged
test("test 10a fn - intitial missing icon file should continue and save, not error", async (t) => {
    await svelteiconifysvg(["test/fixtures/test1"], "test/outputs/test10/icons10a.js", {
        commonJs: true,
    });
    const test10a = require("../test/outputs/test10/icons10a.js");
    t.snapshot(test10a);
});

test("test 10b fn - if icon file exists but is not a module or object", async (t) => {
    const filepath = path.join(__dirname, "/outputs/test10/icons10b.js");
    //await del([filepath]);
    await svelteiconifysvg(["test/fixtures/test1"], filepath, {
        commonJs: true,
    });
    const test10b = require(filepath);
    t.snapshot(test10b);
});

test("test 10c fn - if icon list is same as saved don't resave it if alwaysSave is false", async (t) => {
    const filepath = path.join(__dirname, "/outputs/test10/icons10c.js");
    await svelteiconifysvg(["test/fixtures/test1"], filepath, {
        commonJs: true,
        alwaysSave: true,
    });
    const stats1 = fs.statSync(filepath);
    const modified1 = stats1.mtime;
    await svelteiconifysvg(["test/fixtures/test1"], filepath, {
        commonJs: true,
        alwaysSave: false,
    });
    const stats2 = fs.statSync(filepath);
    const modified2 = stats2.mtime;
    t.snapshot({ test10c: modified1 === modified2 });
});

test("test 10d fn - as above, since alwaysSave = false should be default if not supplied in options", async (t) => {
    const filepath = "test/outputs/test10/icons10d.js";
    await svelteiconifysvg(["test/fixtures/test1"], filepath, {
        commonJs: true,
    });
    const stats1 = fs.statSync(filepath);
    const modified1 = stats1.mtime;
    await svelteiconifysvg(["test/fixtures/test1"], filepath, {
        commonJs: true,
    });
    const stats2 = fs.statSync(filepath);
    const modified2 = stats2.mtime;
    t.snapshot({ test10d: modified1 === modified2 });
});

test("test 10e fn - if icon list is same as saved - DO save if alwaysSave is true", async (t) => {
    const filepath = "test/outputs/test10/icons10e.js";
    await svelteiconifysvg(["test/fixtures/test1"], filepath, {
        commonJs: true,
        alwaysSave: true,
    });
    const stats1 = fs.statSync(filepath);
    const modified1 = stats1.mtime;
    await svelteiconifysvg(["test/fixtures/test1"], filepath, {
        commonJs: true,
        alwaysSave: true,
    });
    const stats2 = fs.statSync(filepath);
    const modified2 = stats2.mtime;
    t.snapshot({ test10e: modified1 !== modified2 });
});

test("test 11a fn - no recursive file finding by default", async (t) => {
    await svelteiconifysvg("test/fixtures/test11", "test/outputs/test11/icons11a.js", {
        commonJs: true,
    });
    const test11 = require("../test/outputs/test11/icons11a.js");
    t.snapshot(test11);
});

test("test 11b fn - recursive file finding with option", async (t) => {
    await svelteiconifysvg("test/fixtures/test11", "test/outputs/test11/icons11b.js", {
        commonJs: true,
        recursive: true,
    });
    const test11 = require("../test/outputs/test11/icons11b.js");
    t.snapshot(test11);
});

test("test 13a fn - option transform [default=false] - check that g transform is NOT included for fa hFLip and vFlip examples by default", async (t) => {
    await svelteiconifysvg(["test/fixtures/test13"], "test/outputs/test13/icons13a.js", {
        commonJs: true,
        alwaysSave: true,
    });
    const test = require("../test/outputs/test13/icons13a.js");
    t.snapshot(test);
});

test("test 13b fn - option transform = false - check that g transform is NOT included for fa hFLip and vFlip examples", async (t) => {
    await svelteiconifysvg(["test/fixtures/test13"], "test/outputs/test13/icons13b.js", {
        commonJs: true,
        alwaysSave: true,
        transform: false,
    });
    const test = require("../test/outputs/test13/icons13b.js");
    t.snapshot(test);
});

test("test 13c fn - option transform = true - check that g transform IS included for fa hFLip and vFlip examples", async (t) => {
    await svelteiconifysvg(["test/fixtures/test13"], "test/outputs/test13/icons13c.js", {
        commonJs: true,
        alwaysSave: true,
        transform: true,
    });
    const test = require("../test/outputs/test13/icons13c.js");
    console.log(test);
    t.snapshot(test);
});

test("test 14a fn - option getCodeFromIconList [default=null] - check that it is just like test 1", async (t) => {
    await svelteiconifysvg(["test/fixtures/test1"], "test/outputs/test14/icons_a.js", { commonJs: true });
    const test14a = require("../test/outputs/test14/icons_a.js");
    t.snapshot(test14a);
});

test("test 14b fn - option getCodeFromIconList = Function(iconsList, options)=>{ code, count } - check that a valid function works on 4b multiple icons example", async (t) => {
    const getCodeFromIconList = (iconsList, options) => {
        let count = 0;
        code = "module.exports = '";
        for (icon of iconsList) {
            console.log("icon", icon);
            code += icon + ", ";
            count++;
        }
        code += "';";
        return { code, count };
    };
    const expected = "emojione:hear-no-evil-monkey, emojione:see-no-evil-monkey, emojione:speak-no-evil-monkey, ";
    await svelteiconifysvg(["test/fixtures/test4/test4b"], "test/outputs/test14/icons_b.js", {
        commonJs: true,
        getCodeFromIconList,
    });
    const test14b = require("../test/outputs/test14/icons_b.js");
    console.log(test14b);
    console.log(expected);
    t.snapshot({ test14b, matches: test14b === expected });
});

test("test 14c fn - option getCodeFromIconList = AsyncFunction(iconsList, options)=>{ code, count } - check that a valid async function works on 4b multiple icons example", async (t) => {
    function resolveAfter1Second() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve("resolved");
            }, 1000);
        });
    }
    const getCodeFromIconList = async (iconsList, options) => {
        let count = 0;
        code = "module.exports = '";
        for (icon of iconsList) {
            await resolveAfter1Second();
            console.log("icon", icon);
            code += icon + ", ";
            count++;
        }
        code += "';";
        return { code, count };
    };
    const expected = "emojione:hear-no-evil-monkey, emojione:see-no-evil-monkey, emojione:speak-no-evil-monkey, ";
    await svelteiconifysvg(["test/fixtures/test4/test4b"], "test/outputs/test14/icons_c.js", {
        commonJs: true,
        getCodeFromIconList,
    });
    const test14c = require("../test/outputs/test14/icons_c.js");
    t.snapshot({ test14c, matches: test14c === expected });
});
//
// test CLI not just fn
//

test("test 5 cli - basic working - no options, all defaults", async (t) => {
    spawnSync("node", ["bin/svelte-iconify-svg"]);
    const test5 = require("../src/icons.js");
    t.snapshot(test5);
});

test("test 6 cli - basic working - single input, single output", async (t) => {
    const result = spawnSync("node", [
        "bin/svelte-iconify-svg",
        "-i",
        "'test/fixtures/test1'",
        "-o",
        "'test/outputs/test6/icons_cli.js'",
    ]);
    const test6 = require("../test/outputs/test6/icons_cli.js");
    t.snapshot(test6);
});

test("test 7 cli - basic working - multiple input", async (t) => {
    const result = spawnSync("node", [
        "bin/svelte-iconify-svg",
        "-i",
        "'test/fixtures/test1'",
        "'test/fixtures/test4'",
        "-o",
        "'test/outputs/test7/icons_cli.js'",
    ]);
    const test7 = require("../test/outputs/test7/icons_cli.js");
    t.snapshot(test7);
});

test("test 8 cli - basic working - single input, single output, commonJs", async (t) => {
    const result = spawnSync("node", [
        "bin/svelte-iconify-svg",
        "-i",
        "'test/fixtures/test1'",
        "-o",
        "'test/outputs/test8/icons_cli.js'",
        "-cjs",
    ]);
    const test8 = require("../test/outputs/test8/icons_cli.js");
    t.snapshot(test8);
});

test("test 9 cli - typo in icon names should log but not fail", async (t) => {
    const result = spawnSync("node", [
        "bin/svelte-iconify-svg",
        "-i",
        "'test/fixtures/test9'",
        "-o",
        "'test/outputs/test9/icons_cli.js'",
        "-cjs",
    ]);
    const test9cli = require("../test/outputs/test9/icons_cli.js");
    t.snapshot(test9cli);
});

test("test 10a cli - intitial missing icon file should continue and save, not error", async (t) => {
    const result = spawnSync("node", [
        "bin/svelte-iconify-svg",
        "-i",
        "'test/fixtures/test1'",
        "-o",
        "'test/outputs/test10/icons10a_cli.js'",
        "-cjs",
    ]);
    const test10acli = require("../test/outputs/test10/icons10a_cli.js");
    t.snapshot(test10acli);
});

test("test 10b cli - if icon file exists but is not a module or object", async (t) => {
    const filepath = "test/outputs/test10/icons10b_cli.js";
    fs.writeFileSync(filepath, "//not a module", "utf8");
    const result = spawnSync("node", [
        "bin/svelte-iconify-svg",
        "-i",
        "'test/fixtures/test1'",
        "-o",
        "'" + filepath + "'",
        "-cjs",
    ]);

    const test10bcli = require("../test/outputs/test10/icons10b_cli.js");
    t.snapshot(test10bcli);
});

test("test 10c cli - if icon list is same as saved don't resave it if alwaysSave is false or missing", async (t) => {
    const filepath = "./test/outputs/test10/icons10c_cli.js";
    const result1 = spawnSync("node", [
        "bin/svelte-iconify-svg",
        "-i",
        "'test/fixtures/test1'",
        "-o",
        "'" + filepath + "'",
        "-c",
        "-s",
    ]);

    const stats1 = fs.statSync(filepath);
    const modified1 = stats1.mtime;
    const result2 = spawnSync("node", [
        "bin/svelte-iconify-svg",
        "-i",
        "'test/fixtures/test1'",
        "-o",
        "'" + filepath + "'",
        "-c",
    ]);
    const stats2 = fs.statSync(filepath);
    const modified2 = stats2.mtime;
    t.snapshot({ test10c: modified1 === modified2 });
});

test("test 10e cli - if icon list is same as saved - DO save if alwaysSave is set", async (t) => {
    const filepath = "test/outputs/test10/icons10e_cli.js";
    const result1 = spawnSync("node", [
        "bin/svelte-iconify-svg",
        "-i",
        "'test/fixtures/test1'",
        "-o",
        "'" + filepath + "'",
        "-c",
        "-s",
    ]);

    const stats1 = fs.statSync(filepath);
    const modified1 = stats1.mtime;
    const result2 = spawnSync("node", [
        "bin/svelte-iconify-svg",
        "-i",
        "'test/fixtures/test1'",
        "-o",
        "'" + filepath + "'",
        "-c",
        "-s",
    ]);
    const stats2 = fs.statSync(filepath);
    const modified2 = stats2.mtime;
    t.snapshot({ test10e: modified1 !== modified2 });
});

test("test 11a cli - no recursive file finding by default", async (t) => {
    const filepath = "test/outputs/test11/icons11a_cli.js";
    const result = spawnSync("node", [
        "bin/svelte-iconify-svg",
        "-i",
        "'test/fixtures/test11'",
        "-o",
        "'" + filepath + "'",
        "-cjs",
    ]);

    const test11acli = require("../test/outputs/test11/icons11a_cli.js");
    t.snapshot(test11acli);
});

test("test 11b cli - recursive file finding with option", async (t) => {
    const filepath = "test/outputs/test11/icons11b_cli.js";
    const result = spawnSync("node", [
        "bin/svelte-iconify-svg",
        "-i",
        "'test/fixtures/test11'",
        "-o",
        "'" + filepath + "'",
        "-cjs",
        "-r",
    ]);

    const test11acli = require("../test/outputs/test11/icons11b_cli.js");
    t.snapshot(test11acli);
});

test("test 13a cli - option transform [default=false] - check that g transform is NOT included for fa hFLip and vFlip examples by default", async (t) => {
    const filepath = "test/outputs/test13/icons13a_cli.js";
    const result = spawnSync("node", [
        "bin/svelte-iconify-svg",
        "-i",
        "'test/fixtures/test13'",
        "-o",
        "'" + filepath + "'",
        "-cjs",
        "-s",
    ]);

    const test = require("../test/outputs/test13/icons13a_cli.js");
    t.snapshot(test);
});

test("test 13b cli short - option transform = false - check that g transform is NOT included for fa hFLip and vFlip examples", async (t) => {
    const filepath = "test/outputs/test13/icons13b_cli_short.js";
    const result = spawnSync("node", [
        "bin/svelte-iconify-svg",
        "-i",
        "'test/fixtures/test13'",
        "-o",
        "'" + filepath + "'",
        "-cjs",
        "-s",
        "-t",
        "false",
    ]);

    const test = require("../test/outputs/test13/icons13b_cli_short.js");
    t.snapshot(test);
});

test("test 13b cli long - option transform = false - check that g transform is NOT included for fa hFLip and vFlip examples", async (t) => {
    const filepath = "test/outputs/test13/icons13b_cli_long.js";
    const result = spawnSync("node", [
        "bin/svelte-iconify-svg",
        "-i",
        "'test/fixtures/test13'",
        "-o",
        "'" + filepath + "'",
        "-cjs",
        "-s",
        "--transform",
        "false",
    ]);

    const test = require("../test/outputs/test13/icons13b_cli_long.js");
    t.snapshot(test);
});

test("test 13c cli short - option transform = true - check that g transform IS included for fa hFLip and vFlip examples", async (t) => {
    const filepath = "test/outputs/test13/icons13c_cli_short.js";
    const result = spawnSync("node", [
        "bin/svelte-iconify-svg",
        "-i",
        "'test/fixtures/test13'",
        "-o",
        "'" + filepath + "'",
        "-cjs",
        "-s",
        "-t",
        "true",
    ]);

    const test = require("../test/outputs/test13/icons13c_cli_short.js");
    t.snapshot(test);
});

test("test 13c cli shorter - option transform = true - check that g transform IS included for fa hFLip and vFlip examples", async (t) => {
    const filepath = "test/outputs/test13/icons13c_cli_shorter.js";
    const result = spawnSync("node", [
        "bin/svelte-iconify-svg",
        "-i",
        "'test/fixtures/test13'",
        "-o",
        "'" + filepath + "'",
        "-cjs",
        "-s",
        "-t",
    ]);

    const test = require("../test/outputs/test13/icons13c_cli_shorter.js");
    t.snapshot(test);
});

test("test 13c cli long - option transform = true - check that g transform IS included for fa hFLip and vFlip examples", async (t) => {
    const filepath = "test/outputs/test13/icons13c_cli_long.js";
    const result = spawnSync("node", [
        "bin/svelte-iconify-svg",
        "-i",
        "'test/fixtures/test13'",
        "-o",
        "'" + filepath + "'",
        "-cjs",
        "-s",
        "--transform",
        "true",
    ]);

    const test = require("../test/outputs/test13/icons13c_cli_long.js");
    t.snapshot(test);
});
