const svelteiconifysvg = require("../index");
const path = require("path");
const del = require("del");
const spawnSync = require("child_process").spawnSync;

test("test 12a fn - option logging='all' by default, not already saved", async () => {
    console.log = jest.fn();
    let output = "/outputs/test12/icons12a.js";
    const filepath = path.join(__dirname, output);
    await del([filepath]); //only need to delete output file in test 12a

    await svelteiconifysvg(["test/fixtures/test12/a"], filepath, { commonJs: true });

    //stupid naming just to line up easier for readability
    let res = console.log.mock.calls;
    let ___res = console.log.mock.calls;
    let js = JSON.stringify;
    expect(___res[0][0]).toBe("\r\nsvelteiconifysvg v2.3.0");
    expect(___res[1][0]).toBe("- Found 1 file");
    expect(js(res[2][0])).toBe('[{"dir":"test/fixtures/test12/a","files":["test1.svelte"]}]');
    expect(___res[3][0]).toBe("- alwaysSave: output path doesn't exist so saving anyway");
    expect(___res[4][0]).toBe("- Generating SVG for: 'fa:random'");
    expect(___res[5][0]).toBe("- Saved 1 of 1 icons bundle to");
});

test("test 12b fn - option logging='all' for presaved file", async () => {
    console.log = jest.fn();
    let output = "/outputs/test12/icons12b.js";
    const filepath = path.join(__dirname, output);

    await svelteiconifysvg(["test/fixtures/test12/b"], filepath, {
        commonJs: true,
        logging: "all",
    });

    //stupid naming just to line up easier for readability
    let res = console.log.mock.calls;
    let ___res = console.log.mock.calls;
    let js = JSON.stringify;
    expect(___res[0][0]).toBe("\r\nsvelteiconifysvg v2.3.0");
    expect(___res[1][0]).toBe("- Found 1 file");
    expect(js(res[2][0])).toBe('[{"dir":"test/fixtures/test12/b","files":["test1.svelte"]}]');
    expect(___res[3][0]).toBe("- Skipped getting & saving icons - current list is already saved");
});

test("test 12c fn - option logging=true for presaved file", async () => {
    console.log = jest.fn();
    let output = "/outputs/test12/icons12c.js";
    const filepath = path.join(__dirname, output);

    await svelteiconifysvg(["test/fixtures/test12/c"], filepath, {
        commonJs: true,
        logging: true,
    });

    //stupid naming just to line up easier for readability
    let res = console.log.mock.calls;
    let ___res = console.log.mock.calls;
    let js = JSON.stringify;
    expect(___res[0][0]).toBe("\r\nsvelteiconifysvg v2.3.0");
    expect(___res[1][0]).toBe("- Found 1 file");
    expect(js(res[2][0])).toBe('[{"dir":"test/fixtures/test12/c","files":["test1.svelte"]}]');
    expect(___res[3][0]).toBe("- Skipped getting & saving icons - current list is already saved");
});

test("test 12d fn - option logging='some' for presaved file", async () => {
    console.log = jest.fn();
    let output = "/outputs/test12/icons12d.js";
    const filepath = path.join(__dirname, output);

    await svelteiconifysvg(["test/fixtures/test12/d"], filepath, {
        commonJs: true,
        logging: "some",
    });

    //stupid naming just to line up easier for readability
    let res = console.log.mock.calls;
    let ___res = console.log.mock.calls;
    let js = JSON.stringify;
    expect(___res[0][0]).toBe("\r\nsvelteiconifysvg v2.3.0");
    expect(___res[1][0]).toBe("- Skipped getting & saving icons - current list is already saved");
});

test("test 12e fn - option logging='none' for presaved file", async () => {
    console.log = jest.fn();
    let output = "/outputs/test12/icons12e.js";
    const filepath = path.join(__dirname, output);

    await svelteiconifysvg(["test/fixtures/test12/e"], filepath, {
        commonJs: true,
        logging: "none",
    });
    expect(console.log.mock.calls.length).toBe(0); // i.e. no console logging
});

test("test 12f fn - option logging=false for presaved file", async () => {
    console.log = jest.fn();
    let output = "/outputs/test12/icons12f.js";
    const filepath = path.join(__dirname, output);

    await svelteiconifysvg(["test/fixtures/test12/f"], filepath, {
        commonJs: true,
        logging: false,
    });
    expect(console.log.mock.calls.length).toBe(0); // i.e. no console logging
});

//
// test CLI not just fn
//

test("test 12a cli - option logging='all' by default, not already saved", async () => {
    let output = "/outputs/test12/icons_12a_cli.js";
    const filepath = path.join(__dirname, output);
    await del([filepath]); //only need to delete output file in test 12a_cli
    const result = spawnSync(
        "node",
        ["bin/svelte-iconify-svg", "-i", "'test/fixtures/test12/a'", "-o", filepath, "-c"],
        { cwd: process.cwd(), env: process.env, stdio: "pipe", encoding: "utf-8" }
    );
    const expected_result =
        "\r\n" +
        "svelteiconifysvg v2.3.0\n" +
        "- Found 1 file\n" +
        "[ { dir: 'test/fixtures/test12/a', files: [ 'test1.svelte' ] } ]\n" +
        "- alwaysSave: output path doesn't exist so saving anyway\n" +
        "- Generating SVG for: 'fa:random'\n" +
        "- Saved 1 of 1 icons";
    expect(result.output[1].split(" bundle to")[0]).toBe(expected_result);
});

test("test 12b_cl_short fn - option logging='all' (-l all) for presaved file", async () => {
    let output = "/outputs/test12/icons12b_cli_short.js";
    const filepath = path.join(__dirname, output);
    const result = spawnSync(
        "node",
        ["bin/svelte-iconify-svg", "-i", "'test/fixtures/test12/b'", "-o", filepath, "-c", "-l", "all"],
        { cwd: process.cwd(), env: process.env, stdio: "pipe", encoding: "utf-8" }
    );
    const expected_result =
        "\r\n" +
        "svelteiconifysvg v2.3.0\n" +
        "- Found 1 file\n" +
        "[ { dir: 'test/fixtures/test12/b', files: [ 'test1.svelte' ] } ]\n" +
        "- Skipped getting & saving icons - current list is already saved\n";
    expect(result.output[1]).toBe(expected_result);
});

test("test 12b_cli_long fn - option logging='all' (--logging all) for presaved file", async () => {
    let output = "/outputs/test12/icons12b_cli_long.js";
    const filepath = path.join(__dirname, output);
    const result = spawnSync(
        "node",
        ["bin/svelte-iconify-svg", "-i", "'test/fixtures/test12/b'", "-o", filepath, "-c", "--logging", "all"],
        { cwd: process.cwd(), env: process.env, stdio: "pipe", encoding: "utf-8" }
    );
    console.log(result.output);
    const expected_result =
        "\r\n" +
        "svelteiconifysvg v2.3.0\n" +
        "- Found 1 file\n" +
        "[ { dir: 'test/fixtures/test12/b', files: [ 'test1.svelte' ] } ]\n" +
        "- Skipped getting & saving icons - current list is already saved\n";
    expect(result.output[1]).toBe(expected_result);
});

test("test 12c fn - option logging=true (-l true) for presaved file", async () => {
    let output = "/outputs/test12/icons12c_cli_short.js";
    const filepath = path.join(__dirname, output);
    const result = spawnSync(
        "node",
        ["bin/svelte-iconify-svg", "-i", "'test/fixtures/test12/c'", "-o", filepath, "-c", "-l", "true"],
        { cwd: process.cwd(), env: process.env, stdio: "pipe", encoding: "utf-8" }
    );
    const expected_result =
        "\r\n" +
        "svelteiconifysvg v2.3.0\n" +
        "- Found 1 file\n" +
        "[ { dir: 'test/fixtures/test12/c', files: [ 'test1.svelte' ] } ]\n" +
        "- Skipped getting & saving icons - current list is already saved\n";
    expect(result.output[1]).toBe(expected_result);
});

test("test 12c fn - option logging=true (--logging true) for presaved file", async () => {
    let output = "/outputs/test12/icons12c_cli_long.js";
    const filepath = path.join(__dirname, output);
    const result = spawnSync(
        "node",
        ["bin/svelte-iconify-svg", "-i", "'test/fixtures/test12/c'", "-o", filepath, "-c", "-l", "true"],
        { cwd: process.cwd(), env: process.env, stdio: "pipe", encoding: "utf-8" }
    );
    const expected_result =
        "\r\n" +
        "svelteiconifysvg v2.3.0\n" +
        "- Found 1 file\n" +
        "[ { dir: 'test/fixtures/test12/c', files: [ 'test1.svelte' ] } ]\n" +
        "- Skipped getting & saving icons - current list is already saved\n";
    expect(result.output[1]).toBe(expected_result);
});

test("test 12d_cli_short fn - option logging='some' (-l some) for presaved file", async () => {
    let output = "/outputs/test12/icons12d_cli_short.js";
    const filepath = path.join(__dirname, output);

    const result = spawnSync(
        "node",
        ["bin/svelte-iconify-svg", "-i", "'test/fixtures/test12/c'", "-o", filepath, "-c", "-l", "some"],
        { cwd: process.cwd(), env: process.env, stdio: "pipe", encoding: "utf-8" }
    );
    const expected_result =
        "\r\n" + "svelteiconifysvg v2.3.0\n" + "- Skipped getting & saving icons - current list is already saved\n";
    expect(result.output[1]).toBe(expected_result);
});

test("test 12d_cli_long fn - option logging='some' (--logging some) for presaved file", async () => {
    let output = "/outputs/test12/icons12d_cli_long.js";
    const filepath = path.join(__dirname, output);

    const result = spawnSync(
        "node",
        ["bin/svelte-iconify-svg", "-i", "'test/fixtures/test12/c'", "-o", filepath, "-c", "--logging", "some"],
        { cwd: process.cwd(), env: process.env, stdio: "pipe", encoding: "utf-8" }
    );
    const expected_result =
        "\r\n" + "svelteiconifysvg v2.3.0\n" + "- Skipped getting & saving icons - current list is already saved\n";
    expect(result.output[1]).toBe(expected_result);
});

test("test 12e_cli_short fn - option logging='none' (-l none) for presaved file", async () => {
    let output = "/outputs/test12/icons12e_cli_short.js";
    const filepath = path.join(__dirname, output);

    const result = spawnSync(
        "node",
        ["bin/svelte-iconify-svg", "-i", "'test/fixtures/test12/c'", "-o", filepath, "-c", "-l", "none"],
        { cwd: process.cwd(), env: process.env, stdio: "pipe", encoding: "utf-8" }
    );
    const expected_result = "";
    expect(result.output[1]).toBe(expected_result);
});

test("test 12e_cli_long fn - option logging='none' (--logging none) for presaved file", async () => {
    let output = "/outputs/test12/icons12e_cli_long.js";
    const filepath = path.join(__dirname, output);

    const result = spawnSync(
        "node",
        ["bin/svelte-iconify-svg", "-i", "'test/fixtures/test12/c'", "-o", filepath, "-c", "--logging", "none"],
        { cwd: process.cwd(), env: process.env, stdio: "pipe", encoding: "utf-8" }
    );
    const expected_result = "";
    expect(result.output[1]).toBe(expected_result);
});

test("test 12e_cli_long_2 fn - option logging='none' (--logging false) for presaved file", async () => {
    let output = "/outputs/test12/icons12e_cli_long_2.js";
    const filepath = path.join(__dirname, output);

    const result = spawnSync(
        "node",
        ["bin/svelte-iconify-svg", "-i", "'test/fixtures/test12/c'", "-o", filepath, "-c", "--logging", "false"],
        { cwd: process.cwd(), env: process.env, stdio: "pipe", encoding: "utf-8" }
    );
    const expected_result = "";
    expect(result.output[1]).toBe(expected_result);
});

test("test 12e_cli_short_2 fn - option logging='none' (-l false) for presaved file", async () => {
    let output = "/outputs/test12/icons12e_cli_short_2.js";
    const filepath = path.join(__dirname, output);

    const result = spawnSync(
        "node",
        ["bin/svelte-iconify-svg", "-i", "'test/fixtures/test12/c'", "-o", filepath, "-c", "-l", "false"],
        { cwd: process.cwd(), env: process.env, stdio: "pipe", encoding: "utf-8" }
    );
    const expected_result = "";
    expect(result.output[1]).toBe(expected_result);
});
