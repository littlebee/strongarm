// this setup script is run before each test file.
//

import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

afterEach(() => {
    // cleanup after each test, reset mocks, etc
    cleanup();
});
