import { randomUUID } from "crypto";

import { roles } from "../config/constants.js";

const collectionKeys = {
  User: "users",
  Restaurant: "restaurants",
  MenuItem: "menuItems",
  Table: "tables",
  Booking: "bookings",
  Reservation: "reservations",
  Order: "orders",
};

const getCollectionKey = (modelName) => collectionKeys[modelName];

const createId = () => randomUUID();

const clone = (value) => JSON.parse(JSON.stringify(value));

const nowIso = () => new Date().toISOString();

const getNestedValue = (source, path) => path.split(".").reduce((accumulator, key) => accumulator?.[key], source);

const compareValue = (actual, expected) => {
  const actualValue = actual && typeof actual === "object" && "_id" in actual ? actual._id : actual;
  const expectedValue = expected && typeof expected === "object" && "_id" in expected ? expected._id : expected;
  return String(actualValue) === String(expectedValue);
};

const matchesFilter = (item, filter = {}) => {
  if (!filter || !Object.keys(filter).length) {
    return true;
  }

  if (filter.$and) {
    return filter.$and.every((entry) => matchesFilter(item, entry));
  }

  if (filter.$or) {
    return filter.$or.some((entry) => matchesFilter(item, entry));
  }

  return Object.entries(filter).every(([key, expected]) => {
    if (key === "$and" || key === "$or") {
      return true;
    }

    const actual = getNestedValue(item, key);

    if (expected && typeof expected === "object" && expected.$regex !== undefined) {
      return new RegExp(expected.$regex, expected.$options || "").test(String(actual || ""));
    }

    return compareValue(actual, expected);
  });
};

const buildListFilter = (queryParams = {}, searchFields = []) => {
  const filter = {};
  const searchTerm = queryParams.q;

  Object.entries(queryParams).forEach(([key, value]) => {
    if (["q", "page", "limit", "sort"].includes(key) || value === "" || value === undefined || value === null || value === "all") {
      return;
    }

    filter[key] = value === "true" ? true : value === "false" ? false : value;
  });

  if (searchTerm && searchFields.length) {
    filter.$or = searchFields.map((field) => ({
      [field]: { $regex: searchTerm, $options: "i" },
    }));
  }

  return filter;
};

const buildScopeFilter = (req, modelName) => {
  if (!req.user) {
    return {};
  }

  const { role, restaurant, email, _id } = req.user;
  const restaurantId = restaurant?._id || restaurant;

  if (role === roles.SUPER_ADMIN) {
    return {};
  }

  if (role === roles.RESTAURANT_ADMIN || role === roles.STAFF) {
    if (modelName === "Restaurant") {
      return restaurantId ? { _id: restaurantId } : { _id: "__none__" };
    }

    if (modelName === "User") {
      return restaurantId ? { $or: [{ restaurant: restaurantId }, { role: roles.GUEST }] } : { _id: "__none__" };
    }

    if (["MenuItem", "Table", "Booking", "Reservation", "Order"].includes(modelName)) {
      return restaurantId ? { restaurant: restaurantId } : { _id: "__none__" };
    }
  }

  if (role === roles.GUEST) {
    if (modelName === "Booking") {
      return { $or: [{ guestUser: _id }, { guestEmail: email }] };
    }

    if (modelName === "Reservation") {
      return { $or: [{ guestUser: _id }, { guestEmail: email }] };
    }

    if (modelName === "Order") {
      return { $or: [{ guestUser: _id }, { customerEmail: email }] };
    }

    if (["Restaurant", "MenuItem"].includes(modelName)) {
      return {};
    }

    return { _id: "__none__" };
  }

  return {};
};

const scopePayloadToUser = (req, modelName, payload) => {
  if (!req.user) {
    return { ...payload };
  }

  const scopedPayload = { ...payload };
  const restaurantId = req.user.restaurant?._id || req.user.restaurant;

  if ((req.user.role === roles.RESTAURANT_ADMIN || req.user.role === roles.STAFF) && restaurantId) {
    if (["MenuItem", "Table", "Booking", "Reservation", "Order"].includes(modelName)) {
      scopedPayload.restaurant = restaurantId;
    }

    if (modelName === "User" && !scopedPayload.restaurant) {
      scopedPayload.restaurant = restaurantId;
    }
  }

  if (req.user.role === roles.GUEST) {
    if (modelName === "Booking") {
      scopedPayload.guestUser = req.user._id;
      scopedPayload.guestEmail = req.user.email;
      scopedPayload.guestName = scopedPayload.guestName || req.user.name;
      scopedPayload.guestPhone = scopedPayload.guestPhone || req.user.phone;
    }

    if (modelName === "Reservation") {
      scopedPayload.guestUser = req.user._id;
      scopedPayload.guestEmail = req.user.email;
      scopedPayload.guestName = scopedPayload.guestName || req.user.name;
      scopedPayload.guestPhone = scopedPayload.guestPhone || req.user.phone;
    }

    if (modelName === "Order") {
      scopedPayload.guestUser = req.user._id;
      scopedPayload.customerEmail = req.user.email;
      scopedPayload.customerName = scopedPayload.customerName || req.user.name;
      scopedPayload.customerPhone = scopedPayload.customerPhone || req.user.phone;
    }
  }

  return scopedPayload;
};

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  const nextUser = clone(user);
  delete nextUser.password;
  return nextUser;
};

const store = {
  initialized: false,
  restaurants: [],
  users: [],
  menuItems: [],
  tables: [],
  bookings: [],
  reservations: [],
  orders: [],
};

const hydrate = (modelName, item) => {
  if (!item) {
    return null;
  }

  const nextItem = clone(item);

  switch (modelName) {
    case "User":
      nextItem.restaurant = nextItem.restaurant ? hydrate("Restaurant", store.restaurants.find((entry) => entry._id === nextItem.restaurant)) : null;
      return sanitizeUser(nextItem);
    case "MenuItem":
      nextItem.restaurant = hydrate("Restaurant", store.restaurants.find((entry) => entry._id === nextItem.restaurant));
      return nextItem;
    case "Table":
      nextItem.restaurant = hydrate("Restaurant", store.restaurants.find((entry) => entry._id === nextItem.restaurant));
      return nextItem;
    case "Booking":
      nextItem.restaurant = hydrate("Restaurant", store.restaurants.find((entry) => entry._id === nextItem.restaurant));
      nextItem.table = nextItem.table ? hydrate("Table", store.tables.find((entry) => entry._id === nextItem.table)) : null;
      nextItem.guestUser = nextItem.guestUser ? hydrate("User", store.users.find((entry) => entry._id === nextItem.guestUser)) : null;
      return nextItem;
    case "Reservation":
      nextItem.restaurant = hydrate("Restaurant", store.restaurants.find((entry) => entry._id === nextItem.restaurant));
      nextItem.guestUser = nextItem.guestUser ? hydrate("User", store.users.find((entry) => entry._id === nextItem.guestUser)) : null;
      return nextItem;
    case "Order":
      nextItem.restaurant = hydrate("Restaurant", store.restaurants.find((entry) => entry._id === nextItem.restaurant));
      nextItem.table = nextItem.table ? hydrate("Table", store.tables.find((entry) => entry._id === nextItem.table)) : null;
      nextItem.guestUser = nextItem.guestUser ? hydrate("User", store.users.find((entry) => entry._id === nextItem.guestUser)) : null;
      nextItem.items = (nextItem.items || []).map((orderItem) => ({
        ...orderItem,
        menuItem: orderItem.menuItem ? store.menuItems.find((entry) => entry._id === orderItem.menuItem) || null : null,
      }));
      return nextItem;
    default:
      return nextItem;
  }
};

const initStore = () => {
  if (store.initialized) {
    return;
  }

  const time = nowIso();

  const urbanBitesId = createId();
  const coastalSpiceId = createId();

  store.restaurants = [
    {
      _id: urbanBitesId,
      name: "Urban Bites",
      code: "URBAN-01",
      email: "admin@urbanbites.com",
      phone: "+91 98765 41001",
      description: "A vibrant smart-casual dining branch built for quick family meals and premium college demo presentations.",
      heroImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
      cuisineTypes: ["Indian", "Continental", "Cafe"],
      openingHours: "10:00 AM - 11:00 PM",
      status: "active",
      totalTables: 18,
      totalStaff: 14,
      rating: 4.7,
      address: {
        line: "21 Tech Park Road",
        city: "Bengaluru",
        state: "Karnataka",
        country: "India",
        pincode: "560068",
      },
      createdAt: time,
      updatedAt: time,
    },
    {
      _id: coastalSpiceId,
      name: "Coastal Spice",
      code: "COAST-02",
      email: "admin@coastalspice.com",
      phone: "+91 98765 41002",
      description: "A premium seafood and grill concept with strong dine-in demand and polished multi-branch management workflows.",
      heroImage: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80",
      cuisineTypes: ["Seafood", "South Indian", "Grill"],
      openingHours: "11:00 AM - 11:30 PM",
      status: "active",
      totalTables: 12,
      totalStaff: 10,
      rating: 4.6,
      address: {
        line: "88 Marina View",
        city: "Mangaluru",
        state: "Karnataka",
        country: "India",
        pincode: "575001",
      },
      createdAt: time,
      updatedAt: time,
    },
  ];

  const superAdminId = createId();
  const urbanAdminId = createId();
  const coastalAdminId = createId();
  const urbanStaffId = createId();
  const coastalStaffId = createId();
  const guestId = createId();

  store.users = [
    { _id: superAdminId, name: "Suhana Kapoor", email: "superadmin@smartdine.ai", password: "password123", phone: "+91 99999 11001", role: roles.SUPER_ADMIN, restaurant: null, status: "active", permissions: ["all-access", "reports", "ai-insights"], avatar: "", lastActive: time, createdAt: time, updatedAt: time },
    { _id: urbanAdminId, name: "Arjun Mehta", email: "admin@urbanbites.com", password: "password123", phone: "+91 99999 11002", role: roles.RESTAURANT_ADMIN, restaurant: urbanBitesId, status: "active", permissions: ["staff-management", "menu", "orders"], avatar: "", lastActive: time, createdAt: time, updatedAt: time },
    { _id: coastalAdminId, name: "Nisha Rao", email: "admin@coastalspice.com", password: "password123", phone: "+91 99999 11003", role: roles.RESTAURANT_ADMIN, restaurant: coastalSpiceId, status: "active", permissions: ["staff-management", "menu", "orders"], avatar: "", lastActive: time, createdAt: time, updatedAt: time },
    { _id: urbanStaffId, name: "Rohit Das", email: "staff@urbanbites.com", password: "password123", phone: "+91 99999 11004", role: roles.STAFF, restaurant: urbanBitesId, status: "active", permissions: ["bookings", "orders", "tables"], avatar: "", lastActive: time, createdAt: time, updatedAt: time },
    { _id: coastalStaffId, name: "Keerthi N", email: "staff@coastalspice.com", password: "password123", phone: "+91 99999 11005", role: roles.STAFF, restaurant: coastalSpiceId, status: "active", permissions: ["bookings", "orders", "tables"], avatar: "", lastActive: time, createdAt: time, updatedAt: time },
    { _id: guestId, name: "Aisha Khan", email: "guest@example.com", password: "password123", phone: "+91 99999 11006", role: roles.GUEST, restaurant: null, status: "active", permissions: [], avatar: "", lastActive: time, createdAt: time, updatedAt: time },
  ];

  const urbanMenuOne = createId();
  const urbanMenuTwo = createId();
  const urbanMenuThree = createId();
  const urbanMenuFour = createId();
  const coastalMenuOne = createId();
  const coastalMenuTwo = createId();
  const coastalMenuThree = createId();
  const coastalMenuFour = createId();

  store.menuItems = [
    { _id: urbanMenuOne, restaurant: urbanBitesId, name: "Truffle Paneer Tikka", category: "Starters", description: "Smoky paneer cubes glazed with truffle yogurt and charred peppers.", price: 320, isVeg: true, isAvailable: true, spiceLevel: "Medium", prepTime: 18, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80", tags: ["signature", "smoky", "veg"], popularityScore: 92, createdAt: time, updatedAt: time },
    { _id: urbanMenuTwo, restaurant: urbanBitesId, name: "Creamy Alfredo Pasta", category: "Main Course", description: "House-made pasta in a creamy parmesan sauce with herbs.", price: 410, isVeg: true, isAvailable: true, spiceLevel: "Mild", prepTime: 22, image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=800&q=80", tags: ["pasta", "comfort"], popularityScore: 88, createdAt: time, updatedAt: time },
    { _id: urbanMenuThree, restaurant: urbanBitesId, name: "Smash Burger Combo", category: "Combos", description: "Double patty burger with peri fries and a chilled beverage.", price: 499, isVeg: false, isAvailable: true, spiceLevel: "Medium", prepTime: 16, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80", tags: ["combo", "bestseller"], popularityScore: 96, createdAt: time, updatedAt: time },
    { _id: urbanMenuFour, restaurant: urbanBitesId, name: "Cold Coffee Float", category: "Beverages", description: "Espresso blended cold coffee finished with vanilla ice cream.", price: 190, isVeg: true, isAvailable: true, spiceLevel: "Mild", prepTime: 8, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80", tags: ["beverage", "cold"], popularityScore: 79, createdAt: time, updatedAt: time },
    { _id: coastalMenuOne, restaurant: coastalSpiceId, name: "Mangalorean Prawn Ghee Roast", category: "Main Course", description: "Fiery coastal prawns tossed in a rich roasted masala and ghee.", price: 620, isVeg: false, isAvailable: true, spiceLevel: "Hot", prepTime: 24, image: "https://images.unsplash.com/photo-1625944525533-473f1b3d54b2?auto=format&fit=crop&w=800&q=80", tags: ["seafood", "signature"], popularityScore: 94, createdAt: time, updatedAt: time },
    { _id: coastalMenuTwo, restaurant: coastalSpiceId, name: "Coconut Lemon Fish Bowl", category: "Combos", description: "Grilled fish served with coconut rice, lemon butter, and slaw.", price: 560, isVeg: false, isAvailable: true, spiceLevel: "Medium", prepTime: 20, image: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=800&q=80", tags: ["healthy", "bowl"], popularityScore: 87, createdAt: time, updatedAt: time },
    { _id: coastalMenuThree, restaurant: coastalSpiceId, name: "Neer Dosa Platter", category: "Main Course", description: "Soft neer dosas served with vegetable curry and chutney trio.", price: 280, isVeg: true, isAvailable: true, spiceLevel: "Mild", prepTime: 14, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80", tags: ["traditional", "veg"], popularityScore: 76, createdAt: time, updatedAt: time },
    { _id: coastalMenuFour, restaurant: coastalSpiceId, name: "Tender Coconut Cooler", category: "Beverages", description: "Chilled coconut water with mint, basil seeds, and lime.", price: 160, isVeg: true, isAvailable: true, spiceLevel: "Mild", prepTime: 6, image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80", tags: ["refreshing", "summer"], popularityScore: 72, createdAt: time, updatedAt: time },
  ];

  const tableIds = Array.from({ length: 8 }, () => createId());

  store.tables = [
    { _id: tableIds[0], restaurant: urbanBitesId, tableNumber: "UB-01", capacity: 2, zone: "Window", floor: "Ground", status: "available", isAvailable: true, createdAt: time, updatedAt: time },
    { _id: tableIds[1], restaurant: urbanBitesId, tableNumber: "UB-02", capacity: 4, zone: "Main Hall", floor: "Ground", status: "reserved", isAvailable: true, createdAt: time, updatedAt: time },
    { _id: tableIds[2], restaurant: urbanBitesId, tableNumber: "UB-03", capacity: 6, zone: "Family Bay", floor: "First", status: "occupied", isAvailable: false, createdAt: time, updatedAt: time },
    { _id: tableIds[3], restaurant: urbanBitesId, tableNumber: "UB-04", capacity: 8, zone: "Celebration", floor: "First", status: "available", isAvailable: true, createdAt: time, updatedAt: time },
    { _id: tableIds[4], restaurant: coastalSpiceId, tableNumber: "CS-01", capacity: 2, zone: "Patio", floor: "Ground", status: "available", isAvailable: true, createdAt: time, updatedAt: time },
    { _id: tableIds[5], restaurant: coastalSpiceId, tableNumber: "CS-02", capacity: 4, zone: "Sea View", floor: "Ground", status: "reserved", isAvailable: true, createdAt: time, updatedAt: time },
    { _id: tableIds[6], restaurant: coastalSpiceId, tableNumber: "CS-03", capacity: 6, zone: "Family Bay", floor: "First", status: "available", isAvailable: true, createdAt: time, updatedAt: time },
    { _id: tableIds[7], restaurant: coastalSpiceId, tableNumber: "CS-04", capacity: 8, zone: "Private Deck", floor: "First", status: "cleaning", isAvailable: false, createdAt: time, updatedAt: time },
  ];

  const today = new Date();
  const datePlus = (days, hour = 18, minute = 0) => {
    const next = new Date(today);
    next.setDate(next.getDate() + days);
    next.setHours(hour, minute, 0, 0);
    return next.toISOString();
  };
  const dateMinus = (days, hour = 12, minute = 20) => {
    const next = new Date(today);
    next.setDate(next.getDate() - days);
    next.setHours(hour, minute, 0, 0);
    return next.toISOString();
  };

  store.bookings = [
    { _id: createId(), restaurant: urbanBitesId, table: tableIds[1], guestUser: guestId, guestName: "Aisha Khan", guestEmail: "guest@example.com", guestPhone: "+91 99999 11006", bookingDate: datePlus(1), timeSlot: "19:30", guestCount: 4, occasion: "Birthday Dinner", specialRequest: "Window-side table with cake support", status: "confirmed", source: "web", createdAt: time, updatedAt: time },
    { _id: createId(), restaurant: urbanBitesId, table: tableIds[3], guestUser: null, guestName: "Rahul Shetty", guestEmail: "rahul@example.com", guestPhone: "+91 99999 44001", bookingDate: datePlus(2), timeSlot: "20:00", guestCount: 6, occasion: "Team Dinner", specialRequest: "Projector preferred", status: "pending", source: "phone", createdAt: time, updatedAt: time },
    { _id: createId(), restaurant: coastalSpiceId, table: tableIds[5], guestUser: null, guestName: "Mira Dsouza", guestEmail: "mira@example.com", guestPhone: "+91 99999 44002", bookingDate: datePlus(1), timeSlot: "13:00", guestCount: 2, occasion: "Lunch Date", specialRequest: "Sea-view table", status: "confirmed", source: "web", createdAt: time, updatedAt: time },
  ];

  store.reservations = [
    { _id: createId(), restaurant: urbanBitesId, guestUser: guestId, guestName: "Aisha Khan", guestEmail: "guest@example.com", guestPhone: "+91 99999 11006", reservationDate: datePlus(3), timeSlot: "18:30", guestCount: 3, areaPreference: "Indoor", specialRequest: "Quiet corner seating", status: "confirmed", createdAt: time, updatedAt: time },
    { _id: createId(), restaurant: coastalSpiceId, guestUser: null, guestName: "Sanjay Pai", guestEmail: "sanjay@example.com", guestPhone: "+91 99999 44003", reservationDate: datePlus(2), timeSlot: "21:00", guestCount: 5, areaPreference: "Patio", specialRequest: "Anniversary decor", status: "pending", createdAt: time, updatedAt: time },
  ];

  store.orders = [
    {
      _id: createId(),
      orderNumber: `ORD-${Date.now()}-101`,
      restaurant: urbanBitesId,
      table: tableIds[2],
      guestUser: guestId,
      customerName: "Aisha Khan",
      customerEmail: "guest@example.com",
      customerPhone: "+91 99999 11006",
      items: [
        { menuItem: urbanMenuThree, name: "Smash Burger Combo", quantity: 1, price: 499 },
        { menuItem: urbanMenuFour, name: "Cold Coffee Float", quantity: 2, price: 190 },
      ],
      orderType: "dine-in",
      status: "served",
      paymentStatus: "paid",
      discount: 40,
      totalAmount: 839,
      notes: "Extra peri seasoning",
      placedAt: dateMinus(0, 19, 10),
      createdAt: time,
      updatedAt: time,
    },
    {
      _id: createId(),
      orderNumber: `ORD-${Date.now()}-102`,
      restaurant: urbanBitesId,
      table: null,
      guestUser: null,
      customerName: "Campus Club",
      customerEmail: "club@example.com",
      customerPhone: "+91 99999 55001",
      items: [
        { menuItem: urbanMenuOne, name: "Truffle Paneer Tikka", quantity: 3, price: 320 },
        { menuItem: urbanMenuTwo, name: "Creamy Alfredo Pasta", quantity: 2, price: 410 },
      ],
      orderType: "delivery",
      status: "ready",
      paymentStatus: "paid",
      discount: 0,
      totalAmount: 1780,
      notes: "",
      placedAt: dateMinus(1, 18, 25),
      createdAt: time,
      updatedAt: time,
    },
    {
      _id: createId(),
      orderNumber: `ORD-${Date.now()}-103`,
      restaurant: coastalSpiceId,
      table: tableIds[5],
      guestUser: null,
      customerName: "Mira Dsouza",
      customerEmail: "mira@example.com",
      customerPhone: "+91 99999 44002",
      items: [
        { menuItem: coastalMenuOne, name: "Mangalorean Prawn Ghee Roast", quantity: 1, price: 620 },
        { menuItem: coastalMenuFour, name: "Tender Coconut Cooler", quantity: 2, price: 160 },
      ],
      orderType: "dine-in",
      status: "served",
      paymentStatus: "paid",
      discount: 0,
      totalAmount: 940,
      notes: "",
      placedAt: dateMinus(2, 20, 15),
      createdAt: time,
      updatedAt: time,
    },
    {
      _id: createId(),
      orderNumber: `ORD-${Date.now()}-104`,
      restaurant: coastalSpiceId,
      table: null,
      guestUser: null,
      customerName: "Ocean Hub",
      customerEmail: "ocean@example.com",
      customerPhone: "+91 99999 55002",
      items: [
        { menuItem: coastalMenuTwo, name: "Coconut Lemon Fish Bowl", quantity: 2, price: 560 },
        { menuItem: coastalMenuThree, name: "Neer Dosa Platter", quantity: 1, price: 280 },
      ],
      orderType: "takeaway",
      status: "preparing",
      paymentStatus: "pending",
      discount: 0,
      totalAmount: 1400,
      notes: "",
      placedAt: dateMinus(3, 17, 45),
      createdAt: time,
      updatedAt: time,
    },
  ];

  const urbanStaffTwoId = createId();
  const coastalStaffTwoId = createId();
  const guestTwoId = createId();
  const guestThreeId = createId();
  const urbanMenuFive = createId();
  const urbanMenuSix = createId();
  const coastalMenuFive = createId();
  const coastalMenuSix = createId();
  const urbanTableFive = createId();
  const urbanTableSix = createId();
  const coastalTableFive = createId();
  const coastalTableSix = createId();

  store.users.push(
    {
      _id: urbanStaffTwoId,
      name: "Megha S",
      email: "operations@urbanbites.com",
      password: "password123",
      phone: "+91 99999 11007",
      role: roles.STAFF,
      restaurant: urbanBitesId,
      status: "active",
      permissions: ["bookings", "orders", "tables"],
      avatar: "",
      lastActive: time,
      createdAt: time,
      updatedAt: time,
    },
    {
      _id: coastalStaffTwoId,
      name: "Vikram Poojary",
      email: "operations@coastalspice.com",
      password: "password123",
      phone: "+91 99999 11008",
      role: roles.STAFF,
      restaurant: coastalSpiceId,
      status: "active",
      permissions: ["bookings", "orders", "tables"],
      avatar: "",
      lastActive: time,
      createdAt: time,
      updatedAt: time,
    },
    {
      _id: guestTwoId,
      name: "Riya Menon",
      email: "riya@example.com",
      password: "password123",
      phone: "+91 99999 11009",
      role: roles.GUEST,
      restaurant: null,
      status: "active",
      permissions: [],
      avatar: "",
      lastActive: time,
      createdAt: time,
      updatedAt: time,
    },
    {
      _id: guestThreeId,
      name: "Kabir Singh",
      email: "kabir@example.com",
      password: "password123",
      phone: "+91 99999 11010",
      role: roles.GUEST,
      restaurant: null,
      status: "active",
      permissions: [],
      avatar: "",
      lastActive: time,
      createdAt: time,
      updatedAt: time,
    }
  );

  store.menuItems.push(
    {
      _id: urbanMenuFive,
      restaurant: urbanBitesId,
      name: "Saffron Tres Leches",
      category: "Desserts",
      description: "Soft milk cake infused with saffron cream and pistachio crumble.",
      price: 240,
      isVeg: true,
      isAvailable: true,
      spiceLevel: "Mild",
      prepTime: 10,
      image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
      tags: ["dessert", "signature", "sweet"],
      popularityScore: 85,
      createdAt: time,
      updatedAt: time,
    },
    {
      _id: urbanMenuSix,
      restaurant: urbanBitesId,
      name: "Peri Peri Loaded Fries",
      category: "Starters",
      description: "Crisp fries with peri spice, cheese sauce, jalapenos, and herbs.",
      price: 260,
      isVeg: true,
      isAvailable: true,
      spiceLevel: "Hot",
      prepTime: 12,
      image: "https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=800&q=80",
      tags: ["starter", "spicy", "sharing"],
      popularityScore: 83,
      createdAt: time,
      updatedAt: time,
    },
    {
      _id: coastalMenuFive,
      restaurant: coastalSpiceId,
      name: "Charred Corn Pepper Fry",
      category: "Starters",
      description: "Roasted corn kernels tossed in pepper masala and curry leaves.",
      price: 230,
      isVeg: true,
      isAvailable: true,
      spiceLevel: "Medium",
      prepTime: 11,
      image: "https://images.unsplash.com/photo-1518013431117-eb1465fa5752?auto=format&fit=crop&w=800&q=80",
      tags: ["starter", "veg", "coastal"],
      popularityScore: 74,
      createdAt: time,
      updatedAt: time,
    },
    {
      _id: coastalMenuSix,
      restaurant: coastalSpiceId,
      name: "Filter Coffee Cheesecake",
      category: "Desserts",
      description: "Creamy baked cheesecake finished with a bold filter coffee glaze.",
      price: 260,
      isVeg: true,
      isAvailable: true,
      spiceLevel: "Mild",
      prepTime: 9,
      image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80",
      tags: ["dessert", "coffee", "premium"],
      popularityScore: 81,
      createdAt: time,
      updatedAt: time,
    }
  );

  store.tables.push(
    {
      _id: urbanTableFive,
      restaurant: urbanBitesId,
      tableNumber: "UB-05",
      capacity: 4,
      zone: "Atrium",
      floor: "Ground",
      status: "available",
      isAvailable: true,
      createdAt: time,
      updatedAt: time,
    },
    {
      _id: urbanTableSix,
      restaurant: urbanBitesId,
      tableNumber: "UB-06",
      capacity: 2,
      zone: "Bar Edge",
      floor: "Ground",
      status: "cleaning",
      isAvailable: false,
      createdAt: time,
      updatedAt: time,
    },
    {
      _id: coastalTableFive,
      restaurant: coastalSpiceId,
      tableNumber: "CS-05",
      capacity: 4,
      zone: "Deck",
      floor: "Ground",
      status: "occupied",
      isAvailable: false,
      createdAt: time,
      updatedAt: time,
    },
    {
      _id: coastalTableSix,
      restaurant: coastalSpiceId,
      tableNumber: "CS-06",
      capacity: 6,
      zone: "Chef Counter",
      floor: "Ground",
      status: "available",
      isAvailable: true,
      createdAt: time,
      updatedAt: time,
    }
  );

  store.bookings.push(
    {
      _id: createId(),
      restaurant: urbanBitesId,
      table: urbanTableFive,
      guestUser: guestTwoId,
      guestName: "Riya Menon",
      guestEmail: "riya@example.com",
      guestPhone: "+91 99999 11009",
      bookingDate: datePlus(4, 18, 45),
      timeSlot: "18:45",
      guestCount: 2,
      occasion: "Casual Catch-up",
      specialRequest: "Near the dessert counter",
      status: "confirmed",
      source: "web",
      createdAt: time,
      updatedAt: time,
    },
    {
      _id: createId(),
      restaurant: urbanBitesId,
      table: tableIds[0],
      guestUser: null,
      guestName: "Anjali Verma",
      guestEmail: "anjali@example.com",
      guestPhone: "+91 99999 44004",
      bookingDate: datePlus(5, 12, 30),
      timeSlot: "12:30",
      guestCount: 2,
      occasion: "Lunch Meeting",
      specialRequest: "Fast service preferred",
      status: "pending",
      source: "web",
      createdAt: time,
      updatedAt: time,
    },
    {
      _id: createId(),
      restaurant: coastalSpiceId,
      table: coastalTableSix,
      guestUser: guestThreeId,
      guestName: "Kabir Singh",
      guestEmail: "kabir@example.com",
      guestPhone: "+91 99999 11010",
      bookingDate: datePlus(4, 20, 15),
      timeSlot: "20:15",
      guestCount: 5,
      occasion: "Family Dinner",
      specialRequest: "Kids chair required",
      status: "confirmed",
      source: "web",
      createdAt: time,
      updatedAt: time,
    },
    {
      _id: createId(),
      restaurant: coastalSpiceId,
      table: tableIds[4],
      guestUser: null,
      guestName: "Devika Pai",
      guestEmail: "devika@example.com",
      guestPhone: "+91 99999 44005",
      bookingDate: datePlus(6, 19, 0),
      timeSlot: "19:00",
      guestCount: 3,
      occasion: "Weekend Dinner",
      specialRequest: "Less spicy suggestions",
      status: "checked-in",
      source: "walk-in",
      createdAt: time,
      updatedAt: time,
    }
  );

  store.reservations.push(
    {
      _id: createId(),
      restaurant: urbanBitesId,
      guestUser: null,
      guestName: "Pranav Iyer",
      guestEmail: "pranav@example.com",
      guestPhone: "+91 99999 44006",
      reservationDate: datePlus(5, 19, 15),
      timeSlot: "19:15",
      guestCount: 4,
      areaPreference: "Atrium",
      specialRequest: "Birthday candles",
      status: "confirmed",
      createdAt: time,
      updatedAt: time,
    },
    {
      _id: createId(),
      restaurant: urbanBitesId,
      guestUser: guestTwoId,
      guestName: "Riya Menon",
      guestEmail: "riya@example.com",
      guestPhone: "+91 99999 11009",
      reservationDate: datePlus(7, 18, 0),
      timeSlot: "18:00",
      guestCount: 2,
      areaPreference: "Indoor",
      specialRequest: "Quiet table",
      status: "pending",
      createdAt: time,
      updatedAt: time,
    },
    {
      _id: createId(),
      restaurant: coastalSpiceId,
      guestUser: guestThreeId,
      guestName: "Kabir Singh",
      guestEmail: "kabir@example.com",
      guestPhone: "+91 99999 11010",
      reservationDate: datePlus(5, 20, 30),
      timeSlot: "20:30",
      guestCount: 6,
      areaPreference: "Sea View",
      specialRequest: "High chair needed",
      status: "confirmed",
      createdAt: time,
      updatedAt: time,
    },
    {
      _id: createId(),
      restaurant: coastalSpiceId,
      guestUser: null,
      guestName: "Lalitha Shenoy",
      guestEmail: "lalitha@example.com",
      guestPhone: "+91 99999 44007",
      reservationDate: datePlus(8, 13, 30),
      timeSlot: "13:30",
      guestCount: 3,
      areaPreference: "Patio",
      specialRequest: "Anniversary flowers",
      status: "pending",
      createdAt: time,
      updatedAt: time,
    }
  );

  store.orders.push(
    {
      _id: createId(),
      orderNumber: "ORD-SEED-201",
      restaurant: urbanBitesId,
      table: urbanTableFive,
      guestUser: guestTwoId,
      customerName: "Riya Menon",
      customerEmail: "riya@example.com",
      customerPhone: "+91 99999 11009",
      items: [
        { menuItem: urbanMenuFive, name: "Saffron Tres Leches", quantity: 1, price: 240 },
        { menuItem: urbanMenuSix, name: "Peri Peri Loaded Fries", quantity: 1, price: 260 },
      ],
      orderType: "dine-in",
      status: "served",
      paymentStatus: "paid",
      discount: 0,
      totalAmount: 500,
      notes: "Serve dessert after mains",
      placedAt: dateMinus(0, 21, 5),
      createdAt: time,
      updatedAt: time,
    },
    {
      _id: createId(),
      orderNumber: "ORD-SEED-202",
      restaurant: urbanBitesId,
      table: null,
      guestUser: null,
      customerName: "Startup Lounge",
      customerEmail: "startup@example.com",
      customerPhone: "+91 99999 55003",
      items: [
        { menuItem: urbanMenuOne, name: "Truffle Paneer Tikka", quantity: 2, price: 320 },
        { menuItem: urbanMenuTwo, name: "Creamy Alfredo Pasta", quantity: 1, price: 410 },
        { menuItem: urbanMenuFour, name: "Cold Coffee Float", quantity: 3, price: 190 },
      ],
      orderType: "delivery",
      status: "served",
      paymentStatus: "paid",
      discount: 50,
      totalAmount: 1570,
      notes: "",
      placedAt: dateMinus(1, 14, 10),
      createdAt: time,
      updatedAt: time,
    },
    {
      _id: createId(),
      orderNumber: "ORD-SEED-203",
      restaurant: urbanBitesId,
      table: tableIds[3],
      guestUser: null,
      customerName: "Aria Events",
      customerEmail: "events@example.com",
      customerPhone: "+91 99999 55004",
      items: [
        { menuItem: urbanMenuThree, name: "Smash Burger Combo", quantity: 2, price: 499 },
        { menuItem: urbanMenuSix, name: "Peri Peri Loaded Fries", quantity: 2, price: 260 },
      ],
      orderType: "dine-in",
      status: "ready",
      paymentStatus: "paid",
      discount: 0,
      totalAmount: 1518,
      notes: "Table service priority",
      placedAt: dateMinus(2, 19, 40),
      createdAt: time,
      updatedAt: time,
    },
    {
      _id: createId(),
      orderNumber: "ORD-SEED-204",
      restaurant: coastalSpiceId,
      table: coastalTableFive,
      guestUser: guestThreeId,
      customerName: "Kabir Singh",
      customerEmail: "kabir@example.com",
      customerPhone: "+91 99999 11010",
      items: [
        { menuItem: coastalMenuOne, name: "Mangalorean Prawn Ghee Roast", quantity: 1, price: 620 },
        { menuItem: coastalMenuSix, name: "Filter Coffee Cheesecake", quantity: 1, price: 260 },
      ],
      orderType: "dine-in",
      status: "served",
      paymentStatus: "paid",
      discount: 0,
      totalAmount: 880,
      notes: "",
      placedAt: dateMinus(1, 21, 0),
      createdAt: time,
      updatedAt: time,
    },
    {
      _id: createId(),
      orderNumber: "ORD-SEED-205",
      restaurant: coastalSpiceId,
      table: null,
      guestUser: null,
      customerName: "Harbor Suites",
      customerEmail: "harbor@example.com",
      customerPhone: "+91 99999 55005",
      items: [
        { menuItem: coastalMenuTwo, name: "Coconut Lemon Fish Bowl", quantity: 3, price: 560 },
        { menuItem: coastalMenuFour, name: "Tender Coconut Cooler", quantity: 3, price: 160 },
      ],
      orderType: "delivery",
      status: "preparing",
      paymentStatus: "paid",
      discount: 80,
      totalAmount: 2080,
      notes: "Deliver to reception desk",
      placedAt: dateMinus(3, 13, 55),
      createdAt: time,
      updatedAt: time,
    },
    {
      _id: createId(),
      orderNumber: "ORD-SEED-206",
      restaurant: coastalSpiceId,
      table: tableIds[6],
      guestUser: null,
      customerName: "Lalitha Shenoy",
      customerEmail: "lalitha@example.com",
      customerPhone: "+91 99999 44007",
      items: [
        { menuItem: coastalMenuThree, name: "Neer Dosa Platter", quantity: 2, price: 280 },
        { menuItem: coastalMenuFive, name: "Charred Corn Pepper Fry", quantity: 1, price: 230 },
      ],
      orderType: "dine-in",
      status: "served",
      paymentStatus: "paid",
      discount: 0,
      totalAmount: 790,
      notes: "",
      placedAt: dateMinus(4, 20, 25),
      createdAt: time,
      updatedAt: time,
    },
    {
      _id: createId(),
      orderNumber: "ORD-SEED-207",
      restaurant: urbanBitesId,
      table: null,
      guestUser: null,
      customerName: "Byte Labs",
      customerEmail: "bytelabs@example.com",
      customerPhone: "+91 99999 55006",
      items: [
        { menuItem: urbanMenuOne, name: "Truffle Paneer Tikka", quantity: 1, price: 320 },
        { menuItem: urbanMenuFive, name: "Saffron Tres Leches", quantity: 4, price: 240 },
      ],
      orderType: "takeaway",
      status: "ready",
      paymentStatus: "paid",
      discount: 0,
      totalAmount: 1280,
      notes: "",
      placedAt: dateMinus(5, 16, 35),
      createdAt: time,
      updatedAt: time,
    },
    {
      _id: createId(),
      orderNumber: "ORD-SEED-208",
      restaurant: coastalSpiceId,
      table: null,
      guestUser: null,
      customerName: "Sunset Hostel",
      customerEmail: "sunset@example.com",
      customerPhone: "+91 99999 55007",
      items: [
        { menuItem: coastalMenuOne, name: "Mangalorean Prawn Ghee Roast", quantity: 2, price: 620 },
        { menuItem: coastalMenuTwo, name: "Coconut Lemon Fish Bowl", quantity: 1, price: 560 },
        { menuItem: coastalMenuSix, name: "Filter Coffee Cheesecake", quantity: 2, price: 260 },
      ],
      orderType: "delivery",
      status: "served",
      paymentStatus: "paid",
      discount: 100,
      totalAmount: 2220,
      notes: "",
      placedAt: dateMinus(6, 18, 50),
      createdAt: time,
      updatedAt: time,
    }
  );

  store.initialized = true;
};

const sortItems = (items, sort = { createdAt: -1 }) => {
  const [field, direction] = Object.entries(sort)[0] || ["createdAt", -1];
  return [...items].sort((left, right) => {
    const leftValue = getNestedValue(left, field);
    const rightValue = getNestedValue(right, field);
    if (leftValue === rightValue) return 0;
    return leftValue > rightValue ? -direction : direction;
  });
};

const prepareOrderPayload = (payload, existingItem = null) => {
  const nextPayload = { ...payload };
  const items = Array.isArray(nextPayload.items) ? nextPayload.items : [];

  nextPayload.items = items.map((item) => {
    const matchedMenuItem = item.menuItem
      ? store.menuItems.find((entry) => entry._id === item.menuItem)
      : store.menuItems.find((entry) => entry.name.toLowerCase() === String(item.name || "").toLowerCase());
    const quantity = Number(item.quantity || 1);
    const price = Number(item.price ?? matchedMenuItem?.price ?? 0);

    return {
      menuItem: item.menuItem || matchedMenuItem?._id || null,
      name: item.name || matchedMenuItem?.name || "Custom Item",
      quantity,
      price,
    };
  });

  nextPayload.orderNumber = existingItem?.orderNumber || nextPayload.orderNumber || `ORD-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;
  nextPayload.discount = Number(nextPayload.discount ?? existingItem?.discount ?? 0);
  nextPayload.paymentStatus = nextPayload.paymentStatus || existingItem?.paymentStatus || "pending";
  nextPayload.totalAmount = nextPayload.items.reduce((sum, item) => sum + item.quantity * item.price, 0) - nextPayload.discount;
  nextPayload.placedAt = existingItem?.placedAt || nextPayload.placedAt || nowIso();

  return nextPayload;
};

const normalizeForCollection = (modelName, payload, existingItem = null) => {
  if (modelName === "Order") {
    return prepareOrderPayload(payload, existingItem);
  }

  return payload;
};

const getScopedItems = (modelName, req, options = {}) => {
  initStore();
  const collection = store[getCollectionKey(modelName)] || [];
  const filter = buildListFilter(req.query || {}, options.searchFields || []);
  const scope = buildScopeFilter(req, modelName);
  return sortItems(collection.filter((item) => matchesFilter(item, filter) && matchesFilter(item, scope)), options.sort).map((item) =>
    hydrate(modelName, item)
  );
};

const getItemById = (modelName, id, req) => {
  initStore();
  const collection = store[getCollectionKey(modelName)] || [];
  const scope = buildScopeFilter(req, modelName);
  const item = collection.find((entry) => entry._id === id && matchesFilter(entry, scope));
  return item ? hydrate(modelName, item) : null;
};

const createItem = (modelName, payload, req) => {
  initStore();
  const collectionKey = getCollectionKey(modelName);
  const collection = store[collectionKey];
  let nextPayload = scopePayloadToUser(req, modelName, payload);
  nextPayload = normalizeForCollection(modelName, nextPayload);
  const time = nowIso();
  const item = {
    _id: createId(),
    ...nextPayload,
    createdAt: time,
    updatedAt: time,
  };
  collection.unshift(item);
  return hydrate(modelName, item);
};

const updateItem = (modelName, id, payload, req) => {
  initStore();
  const collectionKey = getCollectionKey(modelName);
  const collection = store[collectionKey];
  const scope = buildScopeFilter(req, modelName);
  const index = collection.findIndex((entry) => entry._id === id && matchesFilter(entry, scope));

  if (index === -1) {
    return null;
  }

  let nextPayload = scopePayloadToUser(req, modelName, payload);
  nextPayload = normalizeForCollection(modelName, nextPayload, collection[index]);

  collection[index] = {
    ...collection[index],
    ...nextPayload,
    updatedAt: nowIso(),
  };

  return hydrate(modelName, collection[index]);
};

const removeItem = (modelName, id, req) => {
  initStore();
  const collectionKey = getCollectionKey(modelName);
  const collection = store[collectionKey];
  const scope = buildScopeFilter(req, modelName);
  const index = collection.findIndex((entry) => entry._id === id && matchesFilter(entry, scope));

  if (index === -1) {
    return false;
  }

  collection.splice(index, 1);
  return true;
};

const login = async ({ email, password }) => {
  initStore();
  const user = store.users.find((entry) => entry.email.toLowerCase() === String(email).toLowerCase() && entry.password === password);

  if (user) {
    user.lastActive = nowIso();
    user.updatedAt = nowIso();
  }

  return user ? sanitizeUser(user) : null;
};

const register = async ({ name, email, password, phone }) => {
  initStore();
  const existingUser = store.users.find((entry) => entry.email.toLowerCase() === String(email).toLowerCase());

  if (existingUser) {
    throw new Error("A user with this email already exists");
  }

  const time = nowIso();
  const user = {
    _id: createId(),
    name,
    email: String(email).trim().toLowerCase(),
    password,
    phone,
    avatar: "",
    role: roles.GUEST,
    restaurant: null,
    status: "active",
    permissions: [],
    lastActive: time,
    createdAt: time,
    updatedAt: time,
  };

  store.users.unshift(user);
  return sanitizeUser(user);
};

const getUserById = async (id) => {
  initStore();
  return hydrate("User", store.users.find((entry) => entry._id === id));
};

const createOrUpdateUser = async (payload, existingId = null) => {
  initStore();

  if (existingId) {
    const index = store.users.findIndex((entry) => entry._id === existingId);
    if (index === -1) return null;
    store.users[index] = {
      ...store.users[index],
      ...payload,
      email: payload.email ? String(payload.email).trim().toLowerCase() : store.users[index].email,
      updatedAt: nowIso(),
    };
    return hydrate("User", store.users[index]);
  }

  const time = nowIso();
  const user = {
    _id: createId(),
    avatar: "",
    permissions: [],
    status: "active",
    lastActive: time,
    createdAt: time,
    updatedAt: time,
    ...payload,
    email: String(payload.email || "").trim().toLowerCase(),
  };
  store.users.unshift(user);
  return hydrate("User", user);
};

const findUserByEmail = (email) => {
  initStore();
  const normalizedEmail = String(email || "").trim().toLowerCase();
  return store.users.find((entry) => entry.email.toLowerCase() === normalizedEmail) || null;
};

const buildBreakdown = (items, key) => {
  const counts = items.reduce((accumulator, item) => {
    const bucket = item[key] || "unknown";
    accumulator[bucket] = (accumulator[bucket] || 0) + 1;
    return accumulator;
  }, {});
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
};

const buildSalesTrend = (orders) => {
  const today = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const key = date.toISOString().split("T")[0];
    const dayOrders = orders.filter((order) => String(order.placedAt).startsWith(key));
    return {
      key,
      label: date.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      sales: dayOrders.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0),
      orders: dayOrders.length,
    };
  });
};

const buildBusyHours = ({ bookings, reservations, orders }) => {
  const hours = Array.from({ length: 14 }, (_, index) => index + 9).map((hour) => ({
    hour,
    label: `${String(hour).padStart(2, "0")}:00`,
    traffic: 0,
    bookings: 0,
    reservations: 0,
    orders: 0,
  }));
  const byHour = Object.fromEntries(hours.map((item) => [item.hour, item]));

  bookings.forEach((booking) => {
    const hour = Number(String(booking.timeSlot || "0").split(":")[0]);
    if (byHour[hour]) {
      byHour[hour].bookings += 1;
      byHour[hour].traffic += 1;
    }
  });

  reservations.forEach((reservation) => {
    const hour = Number(String(reservation.timeSlot || "0").split(":")[0]);
    if (byHour[hour]) {
      byHour[hour].reservations += 1;
      byHour[hour].traffic += 1;
    }
  });

  orders.forEach((order) => {
    const hour = new Date(order.placedAt).getHours();
    if (byHour[hour]) {
      byHour[hour].orders += 1;
      byHour[hour].traffic += 1;
    }
  });

  return hours;
};

const getScopedCollections = (req) => ({
  restaurants: getScopedItems("Restaurant", req, { sort: { createdAt: -1 } }),
  menuItems: getScopedItems("MenuItem", req, { sort: { popularityScore: -1 } }),
  tables: getScopedItems("Table", req, { sort: { createdAt: -1 } }),
  bookings: getScopedItems("Booking", req, { sort: { bookingDate: -1 } }),
  reservations: getScopedItems("Reservation", req, { sort: { reservationDate: -1 } }),
  orders: getScopedItems("Order", req, { sort: { placedAt: -1 } }),
  users: getScopedItems("User", req, { sort: { createdAt: -1 } }),
});

const buildPopularItems = (orders) => {
  const bucket = {};

  orders.forEach((order) => {
    (order.items || []).forEach((item) => {
      if (!bucket[item.name]) {
        bucket[item.name] = { name: item.name, orders: 0, revenue: 0 };
      }
      bucket[item.name].orders += Number(item.quantity || 0);
      bucket[item.name].revenue += Number(item.quantity || 0) * Number(item.price || 0);
    });
  });

  return Object.values(bucket)
    .sort((left, right) => right.orders - left.orders)
    .slice(0, 6);
};

const getDashboardSummary = (req) => {
  const { restaurants, menuItems, tables, bookings, reservations, orders, users } = getScopedCollections(req);
  const revenue = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  const occupancyRate = tables.length ? Math.min(100, Math.round(((bookings.length + reservations.length) / tables.length) * 40)) : 0;

  return {
    stats: {
      totalRestaurants: restaurants.length,
      totalMenuItems: menuItems.length,
      totalTables: tables.length,
      totalBookings: bookings.length,
      totalOrders: orders.length,
      totalUsers: users.length,
      revenue,
      occupancyRate,
    },
    salesTrend: buildSalesTrend(orders),
    busyHours: buildBusyHours({ bookings, reservations, orders }),
    orderStatusBreakdown: buildBreakdown(orders, "status"),
    bookingStatusBreakdown: buildBreakdown(bookings, "status"),
    popularItems: buildPopularItems(orders),
    topRestaurants: restaurants.map((restaurant) => ({
      name: restaurant.name,
      revenue: orders.filter((order) => order.restaurant?._id === restaurant._id).reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
      bookings: bookings.filter((booking) => booking.restaurant?._id === restaurant._id).length,
      rating: restaurant.rating,
    })),
    recentOrders: orders.slice(0, 5),
    recentBookings: bookings.slice(0, 5),
  };
};

const getReportsOverview = (req) => {
  const { restaurants, menuItems, tables, bookings, reservations, orders } = getScopedCollections(req);
  const revenue = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  const occupancyRate = tables.length ? Math.min(100, Math.round(((bookings.length + reservations.length) / tables.length) * 40)) : 0;
  const topItems = buildPopularItems(orders);

  return {
    cards: [
      { title: "Revenue", value: `INR ${revenue.toLocaleString("en-IN")}`, subtitle: "Across all demo orders" },
      { title: "Occupancy", value: `${occupancyRate}%`, subtitle: "Based on bookings and reservations" },
      { title: "Restaurants", value: restaurants.length, subtitle: "Active branches in the system" },
      { title: "Menu Coverage", value: menuItems.length, subtitle: "Total menu items tracked" },
    ],
    salesTrend: buildSalesTrend(orders),
    busyHours: buildBusyHours({ bookings, reservations, orders }),
    categoryMix: buildBreakdown(menuItems, "category"),
    topRestaurants: restaurants.map((restaurant) => ({
      name: restaurant.name,
      revenue: orders.filter((order) => order.restaurant?._id === restaurant._id).reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
      bookings: bookings.filter((booking) => booking.restaurant?._id === restaurant._id).length,
      rating: restaurant.rating,
    })),
    topItems,
    narrative: [
      `Total tracked revenue is INR ${revenue.toLocaleString("en-IN")} with an average occupancy of ${occupancyRate}%.`,
      "Peak operational pressure is visible in evening dining windows, which is a good slot to demonstrate staff planning.",
      topItems[0]
        ? `${topItems[0].name} is the strongest seller right now, making it a strong candidate for promotional highlighting.`
        : "Menu demand is distributed fairly evenly in the current demo data.",
    ],
  };
};

const getAIInsights = (req) => {
  const { bookings, reservations, orders } = getScopedCollections(req);
  const busyHours = buildBusyHours({ bookings, reservations, orders });
  const topItems = buildPopularItems(orders).slice(0, 3);
  const peakHour = [...busyHours].sort((left, right) => right.traffic - left.traffic)[0];
  const lowHour = [...busyHours].sort((left, right) => left.traffic - right.traffic)[0];

  return {
    busyHours,
    insights: [
      { title: "Peak Service Window", detail: peakHour ? `${peakHour.label} drives the highest combined traffic in this demo dataset.` : "Traffic is evenly spread." },
      { title: "Opportunity Slot", detail: lowHour ? `${lowHour.label} is a good candidate for happy-hour or combo offers.` : "Every slot already shows healthy demand." },
      { title: "Best-Selling Dishes", detail: topItems.length ? `${topItems.map((item) => item.name).join(", ")} are currently leading order volume.` : "No dominant dish detected yet." },
    ],
    suggestions: [
      "Assign one extra staff member during the highest traffic window for smoother table turnover.",
      "Push promotional offers during low-traffic periods to improve average order value.",
      "Highlight top-selling dishes in the guest ordering portal to lift conversions during demos.",
    ],
  };
};

const getRecommendations = ({ restaurant, preference, budget, isVeg, spiceLevel }) => {
  initStore();
  return store.menuItems
    .filter((item) => !restaurant || item.restaurant === restaurant)
    .filter((item) => budget ? item.price <= Number(budget) : true)
    .filter((item) => typeof isVeg === "boolean" ? item.isVeg === isVeg : true)
    .filter((item) => spiceLevel ? item.spiceLevel === spiceLevel : true)
    .filter((item) => {
      if (!preference) return true;
      const haystack = [item.name, item.category, item.description, ...(item.tags || [])].join(" ").toLowerCase();
      return haystack.includes(String(preference).toLowerCase());
    })
    .sort((left, right) => right.popularityScore - left.popularityScore)
    .slice(0, 5)
    .map((item) => ({
      _id: item._id,
      name: item.name,
      category: item.category,
      price: item.price,
      isVeg: item.isVeg,
      spiceLevel: item.spiceLevel,
      image: item.image,
      restaurant: store.restaurants.find((entry) => entry._id === item.restaurant)?.name,
      reason: item.isVeg ? "Strong match for light and vegetarian preferences." : "Popular crowd-favorite with strong repeat demand.",
    }));
};

const chatbotReply = (message = "") => {
  const text = String(message).toLowerCase();

  if (text.includes("book") || text.includes("table")) {
    return "You can book a table from the Book Table page. Choose the restaurant, date, time, and guest count, then the system will create the booking instantly.";
  }

  if (text.includes("menu") || text.includes("food")) {
    return "The Order Online page shows the demo menu. You can filter dishes by restaurant and place a sample order in a few clicks.";
  }

  if (text.includes("timing") || text.includes("open")) {
    return "Most demo branches are configured from 10:00 AM to 11:00 PM. Each restaurant card shows its exact operating hours.";
  }

  if (text.includes("recommend")) {
    return "Use the AI recommendation form on the dashboard AI page or ask for vegetarian, spicy, or budget-friendly dishes from the guest portal.";
  }

  return "I can help with bookings, menu browsing, ordering, and restaurant information. Ask about table availability, popular dishes, or branch timings.";
};

export const demoStore = {
  initStore,
  list(modelName, req, options) {
    return getScopedItems(modelName, req, options);
  },
  getById(modelName, id, req) {
    return getItemById(modelName, id, req);
  },
  create(modelName, payload, req) {
    return createItem(modelName, payload, req);
  },
  update(modelName, id, payload, req) {
    return updateItem(modelName, id, payload, req);
  },
  remove(modelName, id, req) {
    return removeItem(modelName, id, req);
  },
  login,
  register,
  getUserById,
  createOrUpdateUser,
  findUserByEmail,
  getDashboardSummary,
  getReportsOverview,
  getAIInsights,
  getRecommendations,
  chatbotReply,
  sanitizeUser,
};
