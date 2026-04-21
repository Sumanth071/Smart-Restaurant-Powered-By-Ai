import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import RouteErrorBoundary from "./RouteErrorBoundary";

const ProblemScreen = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error("Boom");
  }

  return <div>Recovered Screen</div>;
};

const BoundaryHarness = () => {
  const [shouldThrow, setShouldThrow] = useState(true);

  return (
    <MemoryRouter>
      <button type="button" onClick={() => setShouldThrow(false)}>
        Heal Screen
      </button>
      <RouteErrorBoundary>
        <ProblemScreen shouldThrow={shouldThrow} />
      </RouteErrorBoundary>
    </MemoryRouter>
  );
};

describe("RouteErrorBoundary", () => {
  const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  let suppressExpectedError;

  beforeEach(() => {
    suppressExpectedError = (event) => {
      if (event.error?.message === "Boom") {
        event.preventDefault();
      }
    };

    window.addEventListener("error", suppressExpectedError);
  });

  afterEach(() => {
    consoleErrorSpy.mockClear();
    window.removeEventListener("error", suppressExpectedError);
  });

  it("shows a recovery screen and can retry after the problem is removed", async () => {
    const user = userEvent.setup();

    render(<BoundaryHarness />);

    expect(await screen.findByText(/This screen ran into an error/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /heal screen/i }));
    await user.click(screen.getByRole("button", { name: /retry route/i }));

    expect(await screen.findByText("Recovered Screen")).toBeInTheDocument();
  });
});
