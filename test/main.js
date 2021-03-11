const test = require("ava");
const fs = require("fs");
const path = require("path");
const withPage = require("./_withPage");
const svelteiconifysvg = require("../index");
const spawnSync = require("child_process").spawnSync;

test("test1 fn - basic working", async (t) => {
    await svelteiconifysvg(["test/fixtures/test1"], "test/outputs/test1/icons.js", { commonJs: true });
    const test1 = require("../test/outputs/test1/icons.js");
    t.snapshot(test1);
});

test("test1b fn - basic working with no options (without CommonJs)", async (t) => {
    await svelteiconifysvg(["test/fixtures/test1"], "test/outputs/test1/icons2.js");
    const test1b = await import("../test/outputs/test1/icons2.js");
    t.snapshot(test1b);
});

test("test2 fn - basic wrong input directory returns empty object", async (t) => {
    await svelteiconifysvg(["test/fixtures/test22"], "test/outputs/test2/icons.js", { commonJs: true });
    const test2 = require("../test/outputs/test2/icons.js");
    t.snapshot(test2);
});

test("test3 fn - basic input string, not array", async (t) => {
    await svelteiconifysvg("test/fixtures/test1", "test/outputs/test3/icons.js", { commonJs: true });
    const test3 = require("../test/outputs/test3/icons.js");
    t.snapshot(test3);
});

test("test4 fn - multiple inputs", async (t) => {
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

test("test9 fn - typo in icon names should log but not fail", async (t) => {
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

/*
// temporarily removed due to circleci error: EACCES: permission denied, mkdir \'/test/outputs/test10\'
test("test 10b fn - if icon file exists but is not a module or object", async (t) => {
    const filepath = "/test/outputs/test10/icons10b.js";
    await svelteiconifysvg(["test/fixtures/test1"], filepath, {
        commonJs: true,
    });
    const test10b = require("../test/outputs/test10/icons10b.js");
    t.snapshot(test10b);
});*/

test("test 10c fn - if icon list is same as saved don't resave it if alwaysSave is false", async (t) => {
    const filepath = "/test/outputs/test10/icons10c.js";
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

//test original deep directories node bin/svelte-iconify-svg -i 'test' 'test2' -o 'test/test2/test3/icons.js'
//test CLI not just fn

test("test5 cli - basic working - no options, all defaults", async (t) => {
    spawnSync("node", ["bin/svelte-iconify-svg"]);
    const test5 = require("../src/icons.js");
    t.snapshot(test5);
});

test("test6 cli - basic working - single input, single output", async (t) => {
    const result = spawnSync("node", [
        "bin/svelte-iconify-svg",
        "-i",
        "'test/fixtures/test1'",
        "-o",
        "'test/outputs/test6/icons.js'",
    ]);
    const test6 = require("../test/outputs/test6/icons.js");
    t.snapshot(test6);
});

test("test7 cli - basic working - multiple input", async (t) => {
    const result = spawnSync("node", [
        "bin/svelte-iconify-svg",
        "-i",
        "'test/fixtures/test1'",
        "'test/fixtures/test4'",
        "-o",
        "'test/outputs/test7/icons.js'",
    ]);
    const test7 = require("../test/outputs/test7/icons.js");
    t.snapshot(test7);
});

test("test8 cli - basic working - single input, single output, commonJs", async (t) => {
    const result = spawnSync("node", [
        "bin/svelte-iconify-svg",
        "-i",
        "'test/fixtures/test1'",
        "-o",
        "'test/outputs/test8/icons.js'",
        "-cjs",
    ]);
    const test8 = require("../test/outputs/test8/icons.js");
    t.snapshot(test8);
});

test("test9 cli - typo in icon names should log but not fail", async (t) => {
    const result = spawnSync("node", [
        "bin/svelte-iconify-svg",
        "-i",
        "'test/fixtures/test9'",
        "-o",
        "'test/outputs/test9/icons.js'",
        "-cjs",
    ]);
    const test9cli = require("../test/outputs/test9/icons.js");
    t.snapshot(test9cli);
});

test("test 10a cli - intitial missing icon file should continue and save, not error", async (t) => {
    const result = spawnSync("node", [
        "bin/svelte-iconify-svg",
        "-i",
        "'test/fixtures/test1'",
        "-o",
        "'test/outputs/test10/icons10a.js'",
        "-cjs",
    ]);
    const test10acli = require("../test/outputs/test10/icons10a.js");
    t.snapshot(test10acli);
});

test("test 10b cli - if icon file exists but is not a module or object", async (t) => {
    const filepath = "test/outputs/test10/icons10b.js";
    fs.writeFileSync(filepath, "//not a module", "utf8");
    const result = spawnSync("node", [
        "bin/svelte-iconify-svg",
        "-i",
        "'test/fixtures/test1'",
        "-o",
        "'" + filepath + "'",
        "-cjs",
    ]);

    const test10bcli = require("../test/outputs/test10/icons10b.js");
    t.snapshot(test10bcli);
});

test("test 10c cli - if icon list is same as saved don't resave it if alwaysSave is false or missing", async (t) => {
    const filepath = "./test/outputs/test10/icons10c.js";
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
    const filepath = "test/outputs/test10/icons10e.js";
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
