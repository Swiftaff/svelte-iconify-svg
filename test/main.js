const test = require("ava");
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
