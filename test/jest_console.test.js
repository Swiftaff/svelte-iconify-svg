const svelteiconifysvg = require("../index");
const path = require("path");
const del = require("del");

test("test 12a fn - option logging='all' by default", async () => {
    console.log = jest.fn();
    let output = "/outputs/test12/icons12a.js";
    const filepath = path.join(__dirname, output);
    await del([filepath]);

    await svelteiconifysvg(["test/fixtures/test1"], filepath, { commonJs: true });

    //stupid naming just to line up easier for readability
    let res = console.log.mock.calls;
    let ___res = console.log.mock.calls;
    let js = JSON.stringify;
    expect(___res[0][0]).toBe("\r\nsvelteiconifysvg v2.2.2");
    expect(___res[1][0]).toBe("- Found 1 file");
    expect(js(res[2][0])).toBe('[{"dir":"test/fixtures/test1","files":["test1.svelte"]}]');
    expect(___res[3][0]).toBe("- alwaysSave: output path doesn't exist so saving anyway");
    expect(___res[4][0]).toBe("- Generating SVG for: 'fa:random'");
    expect(___res[5][0]).toBe("- Saved 1 of 1 icons bundle to");
});

test("test 12b fn - option logging='all'", async () => {
    console.log = jest.fn();
    let output = "/outputs/test12/icons12b.js";
    const filepath = path.join(__dirname, output);
    await del([filepath]);

    await svelteiconifysvg(["test/fixtures/test1"], filepath, {
        commonJs: true,
        logging: "all",
    });

    //stupid naming just to line up easier for readability
    let res = console.log.mock.calls;
    let ___res = console.log.mock.calls;
    let js = JSON.stringify;
    expect(___res[0][0]).toBe("\r\nsvelteiconifysvg v2.2.2");
    expect(___res[1][0]).toBe("- Found 1 file");
    expect(js(res[2][0])).toBe('[{"dir":"test/fixtures/test1","files":["test1.svelte"]}]');
    expect(___res[3][0]).toBe("- alwaysSave: output path doesn't exist so saving anyway");
    expect(___res[4][0]).toBe("- Generating SVG for: 'fa:random'");
    expect(___res[5][0]).toBe("- Saved 1 of 1 icons bundle to");
});

test("test 12c fn - option logging=true", async () => {
    console.log = jest.fn();
    let output = "/outputs/test12/icons12c.js";
    const filepath = path.join(__dirname, output);
    await del([filepath]);

    await svelteiconifysvg(["test/fixtures/test1"], filepath, {
        commonJs: true,
        logging: true,
    });

    //stupid naming just to line up easier for readability
    let res = console.log.mock.calls;
    let ___res = console.log.mock.calls;
    let js = JSON.stringify;
    expect(___res[0][0]).toBe("\r\nsvelteiconifysvg v2.2.2");
    expect(___res[1][0]).toBe("- Found 1 file");
    expect(js(res[2][0])).toBe('[{"dir":"test/fixtures/test1","files":["test1.svelte"]}]');
    expect(___res[3][0]).toBe("- alwaysSave: output path doesn't exist so saving anyway");
    expect(___res[4][0]).toBe("- Generating SVG for: 'fa:random'");
    expect(___res[5][0]).toBe("- Saved 1 of 1 icons bundle to");
});

test("test 12d fn - option logging='some'", async () => {
    console.log = jest.fn();
    let output = "/outputs/test12/icons12d.js";
    const filepath = path.join(__dirname, output);
    try {
        await del([filepath]);
    } catch (e) {
        console.error(e);
    }
    try {
        await svelteiconifysvg(["test/fixtures/test1"], filepath, {
            commonJs: true,
            logging: "some",
        });
    } catch (e) {
        console.error(e);
    }

    //stupid naming just to line up easier for readability
    let res = console.log.mock.calls;
    let ___res = console.log.mock.calls;
    let js = JSON.stringify;
    expect(___res[0][0]).toBe("\r\nsvelteiconifysvg v2.2.2");
    expect(___res[1][0]).toBe("- Found 1 file");
    expect(___res[2][0]).toBe("- Saved 1 of 1 icons bundle to");
});

test("test 12e fn - option logging='none'", async () => {
    console.log = jest.fn();
    let output = "/outputs/test12/icons12e.js";
    const filepath = path.join(__dirname, output);
    await del([filepath]);

    await svelteiconifysvg(["test/fixtures/test1"], filepath, {
        commonJs: true,
        logging: "none",
    });
    expect(console.log.mock.calls.length).toBe(0); // i.e. no console logging
});

test("test 12f fn - option logging=false", async () => {
    console.log = jest.fn();
    let output = "/outputs/test12/icons12f.js";
    const filepath = path.join(__dirname, output);
    await del([filepath]);

    await svelteiconifysvg(["test/fixtures/test1"], filepath, {
        commonJs: true,
        logging: false,
    });
    expect(console.log.mock.calls.length).toBe(0); // i.e. no console logging
});
