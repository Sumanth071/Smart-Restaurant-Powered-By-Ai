import { spawn } from "child_process";
import { setTimeout as delay } from "timers/promises";

const baseUrl = process.env.SMOKE_BASE_URL || "http://127.0.0.1:8080/api";
const workspace = process.cwd();

const decodeJwtPayload = (token) => JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));

const requestRaw = async (path, { token, method = "GET", body } = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  return { response, data, text };
};

const request = async (path, options = {}) => {
  const { response, data, text } = await requestRaw(path, options);

  if (!response.ok) {
    const message = data?.message || text || response.statusText;
    throw new Error(`${options.method || "GET"} ${path} failed: ${message}`);
  }

  return data;
};

const expectFailure = async (path, { status, includes, ...options }) => {
  const { response, data, text } = await requestRaw(path, options);
  const message = data?.message || text || response.statusText;

  if (response.ok) {
    throw new Error(`Expected ${options.method || "GET"} ${path} to fail with ${status}, but it succeeded`);
  }

  if (response.status !== status) {
    throw new Error(`Expected ${options.method || "GET"} ${path} to fail with ${status}, received ${response.status}`);
  }

  if (includes && !String(message).toLowerCase().includes(String(includes).toLowerCase())) {
    throw new Error(`Expected ${options.method || "GET"} ${path} to include "${includes}", received "${message}"`);
  }
};

const waitForServer = async () => {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      await request("/health");
      return;
    } catch (error) {
      await delay(500);
    }
  }

  throw new Error("Server did not become ready in time");
};

const ensureJwtLifetime = (token) => {
  const payload = decodeJwtPayload(token);
  const durationSeconds = Number(payload.exp || 0) - Number(payload.iat || 0);
  const expectedSeconds = 30 * 24 * 60 * 60;

  if (durationSeconds < expectedSeconds - 1800 || durationSeconds > expectedSeconds + 1800) {
    throw new Error(`Expected a 30-day JWT, received ${durationSeconds} seconds`);
  }
};

const maybeSpawnServer = async () => {
  try {
    await request("/health");
    return null;
  } catch (error) {
    const child = spawn(process.execPath, ["server/src/server.js"], {
      cwd: workspace,
      stdio: "inherit",
    });

    await waitForServer();
    return child;
  }
};

const run = async () => {
  const serverProcess = await maybeSpawnServer();
  const createdIds = {};
  let superToken = "";
  let guestToken = "";

  try {
    const superAuth = await request("/auth/login", {
      method: "POST",
      body: { email: "superadmin@smartdine.ai", password: "password123" },
    });
    superToken = superAuth.token;
    guestToken = (
      await request("/auth/login", {
        method: "POST",
        body: { email: "guest@example.com", password: "password123" },
      })
    ).token;

    ensureJwtLifetime(superToken);
    ensureJwtLifetime(guestToken);

    await expectFailure("/auth/login", {
      method: "POST",
      status: 400,
      includes: "email is required",
      body: { email: "", password: "password123" },
    });
    await expectFailure("/auth/login", {
      method: "POST",
      status: 401,
      includes: "invalid email or password",
      body: { email: "superadmin@smartdine.ai", password: "wrong-password" },
    });

    const restaurants = await request("/restaurants");
    const menuItems = await request("/menu-items");
    const baseRestaurantId = restaurants[0]?._id;
    const baseMenuItem = menuItems[0];

    if (!baseRestaurantId || !baseMenuItem) {
      throw new Error("Seed data is missing required restaurants or menu items");
    }

    await request("/auth/me", { token: superToken });
    await request("/dashboard/summary", { token: superToken });
    await request("/reports/overview", { token: superToken });
    await request("/ai/insights", { token: superToken });
    await request("/ai/chatbot", { method: "POST", body: { message: "book a table" } });
    await request("/ai/recommendations", { method: "POST", body: { preference: "signature" } });
    await expectFailure("/bookings", {
      token: guestToken,
      method: "POST",
      status: 400,
      includes: "guest count",
      body: {
        restaurant: baseRestaurantId,
        guestName: "Guest Smoke Test",
        guestEmail: "guest@example.com",
        guestPhone: "+91 90000 20000",
        bookingDate: "2030-01-15",
        timeSlot: "19:30",
        guestCount: 0,
      },
    });
    await expectFailure("/orders", {
      token: guestToken,
      method: "POST",
      status: 400,
      includes: "at least one menu item",
      body: {
        restaurant: baseRestaurantId,
        customerName: "Guest Smoke Test",
        customerEmail: "guest@example.com",
        customerPhone: "+91 90000 20000",
        orderType: "delivery",
        items: [],
      },
    });
    await expectFailure("/orders", {
      token: guestToken,
      method: "POST",
      status: 400,
      includes: "discount cannot exceed order subtotal",
      body: {
        restaurant: baseRestaurantId,
        customerName: "Guest Smoke Test",
        customerEmail: "guest@example.com",
        customerPhone: "+91 90000 20000",
        orderType: "delivery",
        discount: 99999,
        items: [
          {
            menuItem: baseMenuItem._id,
            name: baseMenuItem.name,
            quantity: 1,
            price: baseMenuItem.price,
          },
        ],
      },
    });

    const uniqueSuffix = Date.now();

    const restaurant = await request("/restaurants", {
      token: superToken,
      method: "POST",
      body: {
        name: `Test Bistro ${uniqueSuffix}`,
        code: `TB-${uniqueSuffix}`,
        email: `test-bistro-${uniqueSuffix}@example.com`,
        phone: "+91 90000 10000",
        description: "Smoke test restaurant",
        openingHours: "9:00 AM - 10:00 PM",
        status: "active",
        cuisineTypes: ["Cafe", "Continental"],
        totalTables: 8,
        totalStaff: 6,
        rating: 4.4,
        address: {
          line: "1 Test Street",
          city: "Bengaluru",
          state: "Karnataka",
          country: "India",
          pincode: "560001",
        },
      },
    });
    createdIds.restaurantId = restaurant._id;

    await request(`/restaurants/${restaurant._id}`, {
      token: superToken,
      method: "PUT",
      body: { rating: 4.8, totalTables: 10 },
    });

    const table = await request("/tables", {
      token: superToken,
      method: "POST",
      body: {
        restaurant: restaurant._id,
        tableNumber: `T-${uniqueSuffix}`,
        capacity: 4,
        zone: "Window",
        floor: "Ground",
        status: "available",
        isAvailable: true,
      },
    });
    createdIds.tableId = table._id;

    await request(`/tables/${table._id}`, {
      token: superToken,
      method: "PUT",
      body: {
        capacity: 6,
        zone: "Courtyard",
      },
    });

    const menuItem = await request("/menu-items", {
      token: superToken,
      method: "POST",
      body: {
        restaurant: restaurant._id,
        name: `Test Dish ${uniqueSuffix}`,
        category: "Main Course",
        description: "Smoke test menu item",
        price: 299,
        prepTime: 14,
        spiceLevel: "Medium",
        isVeg: true,
        isAvailable: true,
        popularityScore: 78,
        image: "",
        tags: ["test", "signature"],
      },
    });
    createdIds.menuItemId = menuItem._id;

    await request(`/menu-items/${menuItem._id}`, {
      token: superToken,
      method: "PUT",
      body: {
        price: 349,
        popularityScore: 84,
      },
    });

    const booking = await request("/bookings", {
      token: guestToken,
      method: "POST",
      body: {
        restaurant: baseRestaurantId,
        guestName: "Guest Smoke Test",
        guestEmail: "guest@example.com",
        guestPhone: "+91 90000 20000",
        bookingDate: "2030-01-15",
        timeSlot: "19:30",
        guestCount: 2,
        occasion: "Smoke Test",
        specialRequest: "Quiet booth",
      },
    });
    createdIds.bookingId = booking._id;

    await request(`/bookings/${booking._id}`, {
      token: guestToken,
      method: "PUT",
      body: {
        guestCount: 3,
        occasion: "Updated Smoke Test",
      },
    });

    const reservation = await request("/reservations", {
      token: guestToken,
      method: "POST",
      body: {
        restaurant: baseRestaurantId,
        guestName: "Guest Smoke Test",
        guestEmail: "guest@example.com",
        guestPhone: "+91 90000 20000",
        reservationDate: "2030-01-18",
        timeSlot: "20:00",
        guestCount: 4,
        areaPreference: "Indoor",
        specialRequest: "Near the live counter",
      },
    });
    createdIds.reservationId = reservation._id;

    await request(`/reservations/${reservation._id}`, {
      token: guestToken,
      method: "PUT",
      body: {
        guestCount: 5,
        areaPreference: "Patio",
      },
    });

    const order = await request("/orders", {
      token: guestToken,
      method: "POST",
      body: {
        restaurant: baseRestaurantId,
        customerName: "Guest Smoke Test",
        customerEmail: "guest@example.com",
        customerPhone: "+91 90000 20000",
        orderType: "delivery",
        items: [
          {
            menuItem: baseMenuItem._id,
            name: baseMenuItem.name,
            quantity: 1,
            price: baseMenuItem.price,
          },
        ],
        notes: "Smoke test order",
      },
    });
    createdIds.orderId = order._id;

    await request(`/orders/${order._id}`, {
      token: guestToken,
      method: "PUT",
      body: {
        items: [
          {
            menuItem: baseMenuItem._id,
            name: baseMenuItem.name,
            quantity: 2,
            price: baseMenuItem.price,
          },
        ],
        notes: "Updated smoke test order",
      },
    });
    await request(`/orders/${order._id}`, {
      token: guestToken,
      method: "PUT",
      body: {
        status: "cancelled",
      },
    });
    await expectFailure(`/orders/${order._id}`, {
      token: guestToken,
      method: "PUT",
      status: 400,
      includes: "discount cannot exceed order subtotal",
      body: {
        discount: 99999,
      },
    });

    const user = await request("/users", {
      token: superToken,
      method: "POST",
      body: {
        name: "Smoke Test User",
        email: `smoke-user-${uniqueSuffix}@example.com`,
        password: "password123",
        phone: "+91 90000 30000",
        role: "staff",
        restaurant: restaurant._id,
        status: "active",
        permissions: ["reports"],
      },
    });
    createdIds.userId = user._id;

    await request(`/users/${user._id}`, {
      token: superToken,
      method: "PUT",
      body: {
        name: "Smoke Test User Updated",
        email: user.email,
        password: "",
        phone: user.phone,
        role: user.role,
        restaurant: restaurant._id,
        status: "active",
        permissions: ["reports", "menu"],
      },
    });

    await request("/auth/login", {
      method: "POST",
      body: { email: user.email, password: "password123" },
    });

    await request(`/orders/${order._id}`, { token: guestToken, method: "DELETE" });
    delete createdIds.orderId;
    await request(`/reservations/${reservation._id}`, { token: guestToken, method: "DELETE" });
    delete createdIds.reservationId;
    await request(`/bookings/${booking._id}`, { token: guestToken, method: "DELETE" });
    delete createdIds.bookingId;
    await request(`/users/${user._id}`, { token: superToken, method: "DELETE" });
    delete createdIds.userId;
    await request(`/menu-items/${menuItem._id}`, { token: superToken, method: "DELETE" });
    delete createdIds.menuItemId;
    await request(`/tables/${table._id}`, { token: superToken, method: "DELETE" });
    delete createdIds.tableId;
    await request(`/restaurants/${restaurant._id}`, { token: superToken, method: "DELETE" });
    delete createdIds.restaurantId;

    console.log("API smoke test passed.");
    console.log(
      "Verified: 30-day JWT, auth, validation failures, dashboard, reports, AI, restaurant/menu/table CRUD, guest booking/reservation/order CRUD, and user CRUD."
    );
  } finally {
    const cleanupOrder = [
      [createdIds.orderId, "/orders"],
      [createdIds.reservationId, "/reservations"],
      [createdIds.bookingId, "/bookings"],
      [createdIds.userId, "/users"],
      [createdIds.menuItemId, "/menu-items"],
      [createdIds.tableId, "/tables"],
      [createdIds.restaurantId, "/restaurants"],
    ];

    for (const [id, path] of cleanupOrder) {
      if (!id || !superToken) {
        continue;
      }

      try {
        await request(`${path}/${id}`, { token: superToken, method: "DELETE" });
      } catch (error) {
        // Best-effort cleanup for smoke artifacts.
      }
    }

    if (serverProcess) {
      serverProcess.kill("SIGTERM");
      await delay(250);
    }
  }
};

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
