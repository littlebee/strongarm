import getPort from "get-port";

import { promisify } from "node:util";
import child_process from "node:child_process";
const execAsync = promisify(child_process.exec);

export async function startServices() {
    const port = await getPort();

    const threadId = process.env.VITEST_POOL_ID;

    // @ts-expect-error globalThis is a global object injected by vitest
    globalThis.hubPort = port;

    const cmd = `cd ../.. && STRONGARM_ENV=test STRONGARM_FILE_APPEND=${threadId} HUB_PORT=${port} ./start.sh`;
    console.log(`startStop.ts: starting services with command '${cmd}'`);
    const { stdout, stderr } = await execAsync(cmd);
    console.log(`vitest.setup.ts beforeAll start.sh stdout: ${stdout}`);
    console.error(`vitest.setup.ts beforeAll start.sh stderr: ${stderr}`);
}

export async function stopServices() {
    console.log("After all tests: stopping services");
    const threadId = process.env.VITEST_POOL_ID;
    const { stderr, stdout } = await execAsync(
        `cd ../.. && STRONGARM_ENV=test STRONGARM_FILE_APPEND=${threadId} ./stop.sh`
    );
    console.log(`vitest.setup.ts afterAll stdout: ${stdout}`);
    if (stderr) console.log(`vitest.setup.ts afterAll stderr: ${stderr}`);

    // @ts-expect-error globalThis is a global object injected by vitest
    delete globalThis.hubPort;
}
