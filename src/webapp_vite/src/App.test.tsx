import { describe, it, vi, expect, beforeAll } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";

import { getHubPort } from "./testHelpers/globalContext";

// import { sendHubStateUpdate } from "./util/hubMessages";

import App from "./App";

vi.mock("./ArmView/Arm3d", () => {
    console.log("Mocked Arm3D");
    return {
        default: () => <div>Mocked Arm3D</div>,
    };
});

async function renderApp() {
    const hubPort = getHubPort();
    console.log("App.test.tsx", { hubPort });
    // autoReconnect is set to false to prevent the app from throwing an error on teardown
    render(<App hubPort={hubPort} autoReconnect={false} />);
    await waitFor(() => screen.getByText(/online/i));
}

describe("App", () => {
    beforeAll(async () => {});

    it("renders the App component", async () => {
        await renderApp();
        screen.getByText(/Menu Root/i);
        screen.getAllByText("Arm Angles");
    });

    it("renders the Arm Config menu", async () => {
        await renderApp();
        // const armConfigButton = await waitFor(() =>
        //     screen.getByText(/Arm Config/i)
        // );
        const armConfigButton = screen.getByText(/Arm Config/i);
        act(() => armConfigButton.click());
        await waitFor(() => screen.getByText(/select arm config/i));

        const expectedSelected = screen.getByText(
            /4dof-no-effector-test.json/i
        );
        expect(expectedSelected.className).toContain("selected");

        const otherConfig = screen.getByText(/4dof-iphone-test.json/i);
        expect(otherConfig.className).not.toContain("selected");

        act(() => otherConfig.click());
        // we need to wait for the state to update which should happen within 100ms
        await new Promise((r) => setTimeout(r, 100));
        const newlySelected = await waitFor(() =>
            screen.getByText(/4dof-iphone-test.json/i)
        );
        expect(newlySelected.className).toContain("selected");

        // screen.debug(); // prints out the jsx in the App component unto the command line
    });
});
