import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import LoginPage from "./LoginPage";

const { authMock, toastMock } = vi.hoisted(() => ({
  authMock: {
    user: null,
    login: vi.fn(),
    register: vi.fn(),
  },
  toastMock: {
    pushToast: vi.fn(),
  },
}));

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => authMock,
}));

vi.mock("../../context/ToastContext", () => ({
  useToast: () => toastMock,
}));

describe("LoginPage", () => {
  beforeEach(() => {
    authMock.user = null;
    authMock.login.mockReset();
    authMock.register.mockReset();
    toastMock.pushToast.mockReset();
  });

  it("signs in and redirects to the dashboard", async () => {
    authMock.login.mockResolvedValueOnce({ role: "super-admin" });
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<div>Dashboard Landing</div>} />
          <Route path="/book-table" element={<div>Guest Booking</div>} />
        </Routes>
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/email/i), "superadmin@smartdine.ai");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /enter workspace/i }));

    await screen.findByText("Dashboard Landing");
    expect(authMock.login).toHaveBeenCalledWith({
      email: "superadmin@smartdine.ai",
      password: "password123",
    });
    expect(toastMock.pushToast).toHaveBeenCalledWith(
      expect.objectContaining({
        tone: "success",
        title: "Signed in",
      })
    );
  });

  it("shows a helpful message when authentication fails", async () => {
    authMock.login.mockRejectedValueOnce({
      response: {
        data: {
          message: "Invalid email or password",
        },
      },
    });
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/email/i), "superadmin@smartdine.ai");
    await user.type(screen.getByLabelText(/password/i), "wrong-password");
    await user.click(screen.getByRole("button", { name: /enter workspace/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid email or password")).toBeInTheDocument();
    });
    expect(toastMock.pushToast).toHaveBeenCalledWith(
      expect.objectContaining({
        tone: "error",
        title: "Sign-in failed",
      })
    );
  });
});
