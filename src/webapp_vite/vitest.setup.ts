// this setup script is run before each test file.
//

import { expect, afterAll, afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

import { promisify } from "node:util";
import child_process from "node:child_process";
const execAsync = promisify(child_process.exec);

import getPort from "get-port";

expect.extend(matchers);

// before all test in each single test file
beforeAll(async () => {
    const port = await getPort();
    const threadId = process.env.VITEST_POOL_ID;

    globalThis.hubPort = port;
    console.log("vitest.setup.ts beforeAll: starting services");
    const { stdout, stderr } = await execAsync(
        `cd ../.. && STRONGARM_ENV=test STRONGARM_FILE_APPEND=${threadId} HUB_PORT=${port} ./start.sh`
    );
    console.log(`vitest.setup.ts beforeAll start.sh stdout: ${stdout}`);
    console.error(`vitest.setup.ts beforeAll start.sh stderr: ${stderr}`);
});

afterEach(() => {
    // cleanup after each test, reset mocks, etc
    cleanup();
});

// after all test in a test file
afterAll(async () => {
    console.log("After all tests: stopping central_hub.py");
    const threadId = process.env.VITEST_POOL_ID;
    const { stderr, stdout } = await execAsync(
        `cd ../.. && STRONGARM_ENV=test STRONGARM_FILE_APPEND=${threadId} ./stop.sh`
    );
    console.log(`vitest.setup.ts afterAll stdout: ${stdout}`);
    if (stderr) console.log(`vitest.setup.ts afterAll stderr: ${stderr}`);

    delete globalThis.hubPort;
});
