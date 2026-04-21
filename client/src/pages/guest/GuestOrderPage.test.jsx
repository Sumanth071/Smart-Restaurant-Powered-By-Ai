import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { QueryClientProvider } from "../../context/QueryClientContext";
import GuestOrderPage from "./GuestOrderPage";

const { apiMock, authMock, toastMock } = vi.hoisted(() => ({
  apiMock: {
    get: vi.fn(),
    post: vi.fn(),
  },
  authMock: {
    user: {
      role: "guest",
      name: "Guest Tester",
      email: "guest@example.com",
      phone: "+91 99999 12345",
    },
  },
  toastMock: {
    pushToast: vi.fn(),
  },
}));

vi.mock("../../api/client", () => ({
  default: apiMock,
}));

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => authMock,
}));

vi.mock("../../context/ToastContext", () => ({
  useToast: () => toastMock,
}));

const restaurants = [{ _id: "rest-1", name: "Urban Bites" }];
const menuItems = [
  {
    _id: "menu-1",
    restaurant: { _id: "rest-1", name: "Urban Bites" },
    name: "Paneer Bowl",
    category: "Main Course",
    description: "Signature bowl",
    price: 299,
    isVeg: true,
    tags: ["signature"],
    image: "",
  },
];

const renderPage = () =>
  render(
    <MemoryRouter>
      <QueryClientProvider>
        <GuestOrderPage />
      </QueryClientProvider>
    </MemoryRouter>
  );

describe("GuestOrderPage", () => {
  beforeEach(() => {
    apiMock.get.mockReset();
    apiMock.post.mockReset();
    toastMock.pushToast.mockReset();
    authMock.user = {
      role: "guest",
      name: "Guest Tester",
      email: "guest@example.com",
      phone: "+91 99999 12345",
    };
  });

  it("loads the guest menu and submits an order", async () => {
    apiMock.get.mockImplementation((url) => {
      if (url === "/restaurants") {
        return Promise.resolve({ data: restaurants });
      }

      if (url === "/menu-items") {
        return Promise.resolve({ data: menuItems });
      }

      return Promise.reject(new Error(`Unexpected GET ${url}`));
    });
    apiMock.post.mockResolvedValueOnce({ data: { _id: "order-1" } });
    const user = userEvent.setup();

    renderPage();

    await screen.findByRole("button", { name: /add paneer bowl to cart/i });
    await user.click(screen.getByRole("button", { name: /add paneer bowl to cart/i }));
    await user.click(screen.getByRole("button", { name: /place order/i }));

    await waitFor(() => {
      expect(apiMock.post).toHaveBeenCalledWith(
        "/orders",
        expect.objectContaining({
          restaurant: "rest-1",
          customerName: "Guest Tester",
          customerEmail: "guest@example.com",
          orderType: "delivery",
          items: [
            expect.objectContaining({
              menuItem: "menu-1",
              quantity: 1,
            }),
          ],
        })
      );
    });

    expect(await screen.findByText(/Order placed successfully/i)).toBeInTheDocument();
    expect(toastMock.pushToast).toHaveBeenCalledWith(
      expect.objectContaining({
        tone: "success",
        title: "Order placed",
      })
    );
  });

  it("shows a retry message when the menu cannot be loaded", async () => {
    apiMock.get.mockRejectedValue(new Error("Network offline"));

    renderPage();

    expect(await screen.findByText(/Unable to load the guest ordering menu/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });
});
