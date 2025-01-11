import { describe, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

vi.mock("./ArmView/Arm3d", () => {
    console.log("Mocked Arm3D");
    return {
        default: () => <div>Mocked Arm3D</div>,
    };
});

describe("App", () => {
    it("renders the App component", () => {
        render(<App />);

        screen.debug(); // prints out the jsx in the App component unto the command line
    });
});
