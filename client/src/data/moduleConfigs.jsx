import StatusBadge from "../components/ui/StatusBadge";
import { formatCurrency, formatDate, formatTime, safeJoin, splitList, toDateInput } from "../utils/helpers";

const restaurantStatuses = ["active", "inactive", "maintenance"];
const bookingStatuses = ["pending", "confirmed", "checked-in", "completed", "cancelled"];
const orderStatuses = ["pending", "preparing", "ready", "served", "cancelled"];
const paymentStatuses = ["pending", "paid", "refunded"];
const reservationStatuses = ["pending", "confirmed", "seated", "completed", "cancelled"];
const orderTypes = ["dine-in", "takeaway", "delivery"];
const tableStatuses = ["available", "reserved", "occupied", "cleaning"];

const selectOptions = (values) => values.map((value) => ({ label: value, value }));

const parseOrderItems = (text = "", menuItems = []) =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(.*?)(?:\s*x(\d+))?$/i);
      const rawName = match?.[1]?.trim() || line;
      const quantity = Number(match?.[2] || 1);
      const catalogItem = menuItems.find((item) => item.name.toLowerCase() === rawName.toLowerCase());

      return {
        menuItem: catalogItem?._id,
        name: catalogItem?.name || rawName,
        quantity,
        price: catalogItem?.price || 0,
      };
    });

export const moduleConfigs = {
  restaurants: {
    title: "Restaurant Management",
    subtitle: "Manage branch profiles, cuisine identity, and operating information from a single polished control panel.",
    endpoint: "/restaurants",
    buttonLabel: "Add Restaurant",
    searchPlaceholder: "Search branches by name, code, or city",
    emptyTitle: "No restaurants yet",
    emptyDescription: "Add your first branch to start populating menus, tables, and bookings.",
    columns: [
      {
        key: "name",
        label: "Restaurant",
        render: (item) => (
          <div>
            <p className="font-semibold text-slate-900">{item.name}</p>
            <p className="text-xs text-slate-500">{item.code}</p>
          </div>
        ),
      },
      {
        key: "location",
        label: "Location",
        render: (item) => `${item.address?.city || "-"}, ${item.address?.state || "-"}`,
      },
      {
        key: "cuisineTypes",
        label: "Cuisine",
        render: (item) => safeJoin(item.cuisineTypes) || "-",
      },
      {
        key: "status",
        label: "Status",
        render: (item) => <StatusBadge value={item.status} />,
      },
      {
        key: "rating",
        label: "Rating",
        render: (item) => `${item.rating || 0} / 5`,
      },
    ],
    fields: [
      { name: "name", label: "Restaurant Name", placeholder: "Urban Bites" },
      { name: "code", label: "Restaurant Code", placeholder: "URBAN-01" },
      { name: "email", label: "Official Email", type: "email", placeholder: "admin@restaurant.com" },
      { name: "phone", label: "Contact Number", placeholder: "+91 98765 43210" },
      { name: "description", label: "Short Description", type: "textarea", placeholder: "Describe the restaurant concept..." },
      { name: "heroImage", label: "Hero Image URL", type: "url", placeholder: "https://images.unsplash.com/..." },
      { name: "openingHours", label: "Opening Hours", placeholder: "10:00 AM - 11:00 PM" },
      { name: "status", label: "Status", type: "select", options: selectOptions(restaurantStatuses) },
      { name: "cuisineTypes", label: "Cuisine Tags", placeholder: "Indian, Cafe, Continental" },
      { name: "totalTables", label: "Total Tables", type: "number", placeholder: "18" },
      { name: "totalStaff", label: "Total Staff", type: "number", placeholder: "14" },
      { name: "rating", label: "Rating", type: "number", placeholder: "4.7" },
      { name: "addressLine", label: "Address Line", placeholder: "21 Tech Park Road" },
      { name: "city", label: "City", placeholder: "Bengaluru" },
      { name: "state", label: "State", placeholder: "Karnataka" },
      { name: "country", label: "Country", placeholder: "India" },
      { name: "pincode", label: "Pincode", placeholder: "560068" },
    ],
    toFormValues: (item) => ({
      ...item,
      cuisineTypes: safeJoin(item.cuisineTypes),
      addressLine: item.address?.line || "",
      city: item.address?.city || "",
      state: item.address?.state || "",
      country: item.address?.country || "",
      pincode: item.address?.pincode || "",
    }),
    fromFormValues: (values) => ({
      name: values.name,
      code: values.code,
      email: values.email,
      phone: values.phone,
      description: values.description,
      heroImage: values.heroImage,
      openingHours: values.openingHours,
      status: values.status,
      cuisineTypes: splitList(values.cuisineTypes),
      totalTables: Number(values.totalTables || 0),
      totalStaff: Number(values.totalStaff || 0),
      rating: Number(values.rating || 0),
      address: {
        line: values.addressLine,
        city: values.city,
        state: values.state,
        country: values.country,
        pincode: values.pincode,
      },
    }),
    getHighlights: (items) => [
      { title: "Total Branches", value: items.length, subtitle: "Live in the current workspace" },
      { title: "Active Branches", value: items.filter((item) => item.status === "active").length, subtitle: "Ready for service" },
      {
        title: "Average Rating",
        value: items.length ? (items.reduce((sum, item) => sum + Number(item.rating || 0), 0) / items.length).toFixed(1) : "0.0",
        subtitle: "Across all active branches",
      },
    ],
  },
  menu: {
    title: "Menu Management",
    subtitle: "Maintain dish catalogues, pricing, availability, and polished food cards.",
    endpoint: "/menu-items",
    enablePagination: true,
    pageSize: 8,
    defaultSort: "-popularityScore",
    filters: [
      { name: "category", label: "Category", options: selectOptions(["Starters", "Main Course", "Desserts", "Beverages", "Combos"]) },
      { name: "isAvailable", label: "Availability", options: [{ label: "All", value: "all" }, { label: "Available", value: "true" }, { label: "Hidden", value: "false" }] },
    ],
    buttonLabel: "Add Menu Item",
    searchPlaceholder: "Search dishes, categories, or descriptions",
    emptyTitle: "No menu items yet",
    emptyDescription: "Create dishes with pricing and category details to populate the guest ordering experience.",
    dependencies: [{ key: "restaurants", endpoint: "/restaurants" }],
    columns: [
      {
        key: "name",
        label: "Dish",
        render: (item) => (
          <div>
            <p className="font-semibold text-slate-900">{item.name}</p>
            <p className="text-xs text-slate-500">{item.category}</p>
          </div>
        ),
      },
      { key: "restaurant", label: "Restaurant", render: (item) => item.restaurant?.name || "-" },
      { key: "price", label: "Price", render: (item) => formatCurrency(item.price) },
      { key: "type", label: "Type", render: (item) => (item.isVeg ? "Veg" : "Non-Veg") },
      { key: "status", label: "Availability", render: (item) => <StatusBadge value={item.isAvailable ? "active" : "inactive"} /> },
    ],
    fields: [
      { name: "restaurant", label: "Restaurant", type: "select", optionsSource: "restaurants" },
      { name: "name", label: "Dish Name", placeholder: "Truffle Paneer Tikka" },
      {
        name: "category",
        label: "Category",
        type: "select",
        options: selectOptions(["Starters", "Main Course", "Desserts", "Beverages", "Combos"]),
      },
      { name: "description", label: "Description", type: "textarea", placeholder: "Add a short menu description..." },
      { name: "price", label: "Price", type: "number", placeholder: "320" },
      { name: "prepTime", label: "Preparation Time (mins)", type: "number", placeholder: "18" },
      { name: "spiceLevel", label: "Spice Level", type: "select", options: selectOptions(["Mild", "Medium", "Hot"]) },
      { name: "isVeg", label: "Vegetarian Item", type: "checkbox", helperText: "Toggle on for vegetarian dishes." },
      { name: "isAvailable", label: "Currently Available", type: "checkbox", helperText: "Hide unavailable dishes from guest ordering." },
      { name: "popularityScore", label: "Popularity Score", type: "number", placeholder: "92" },
      { name: "imageUpload", targetField: "image", label: "Dish Photo Upload", type: "file", accept: "image/*", helperText: "Upload a menu card image directly for demos and presentations." },
      { name: "image", label: "Image URL", type: "url", placeholder: "https://images.unsplash.com/..." },
      { name: "tags", label: "Tags", placeholder: "signature, smoky, spicy" },
    ],
    toFormValues: (item) => ({
      ...item,
      restaurant: item.restaurant?._id || item.restaurant || "",
      tags: safeJoin(item.tags),
    }),
    fromFormValues: (values) => ({
      restaurant: values.restaurant,
      name: values.name,
      category: values.category,
      description: values.description,
      price: Number(values.price || 0),
      prepTime: Number(values.prepTime || 0),
      spiceLevel: values.spiceLevel,
      isVeg: Boolean(values.isVeg),
      isAvailable: Boolean(values.isAvailable),
      popularityScore: Number(values.popularityScore || 0),
      image: values.image,
      tags: splitList(values.tags),
    }),
    getHighlights: (items) => [
      { title: "Menu Items", value: items.length, subtitle: "Across all branches" },
      { title: "Available Now", value: items.filter((item) => item.isAvailable).length, subtitle: "Visible to guests" },
      { title: "Avg. Price", value: items.length ? formatCurrency(items.reduce((sum, item) => sum + Number(item.price || 0), 0) / items.length) : formatCurrency(0), subtitle: "Based on menu pricing" },
    ],
  },
  tables: {
    title: "Table Management",
    subtitle: "Track seating zones, availability, and occupancy status with a quick operational view.",
    endpoint: "/tables",
    buttonLabel: "Add Table",
    searchPlaceholder: "Search tables, floors, or zones",
    emptyTitle: "No tables configured",
    emptyDescription: "Add table metadata to support live bookings and dine-in order tracking.",
    dependencies: [{ key: "restaurants", endpoint: "/restaurants" }],
    columns: [
      { key: "tableNumber", label: "Table", render: (item) => <span className="font-semibold text-slate-900">{item.tableNumber}</span> },
      { key: "restaurant", label: "Restaurant", render: (item) => item.restaurant?.name || "-" },
      { key: "capacity", label: "Capacity", render: (item) => `${item.capacity} Guests` },
      { key: "zone", label: "Zone", render: (item) => `${item.zone} / ${item.floor}` },
      { key: "status", label: "Status", render: (item) => <StatusBadge value={item.status} /> },
    ],
    fields: [
      { name: "restaurant", label: "Restaurant", type: "select", optionsSource: "restaurants" },
      { name: "tableNumber", label: "Table Number", placeholder: "UB-01" },
      { name: "capacity", label: "Capacity", type: "number", placeholder: "4" },
      { name: "zone", label: "Zone", placeholder: "Main Hall" },
      { name: "floor", label: "Floor", placeholder: "Ground" },
      { name: "status", label: "Status", type: "select", options: selectOptions(tableStatuses) },
      { name: "isAvailable", label: "Available for New Guests", type: "checkbox", helperText: "Switch off during maintenance or long seating." },
    ],
    toFormValues: (item) => ({
      ...item,
      restaurant: item.restaurant?._id || item.restaurant || "",
    }),
    fromFormValues: (values) => ({
      restaurant: values.restaurant,
      tableNumber: values.tableNumber,
      capacity: Number(values.capacity || 0),
      zone: values.zone,
      floor: values.floor,
      status: values.status,
      isAvailable: Boolean(values.isAvailable),
    }),
    getHighlights: (items) => [
      { title: "Total Tables", value: items.length, subtitle: "Mapped into the system" },
      { title: "Available Now", value: items.filter((item) => item.isAvailable).length, subtitle: "Open for allocation" },
      { title: "Occupied", value: items.filter((item) => item.status === "occupied").length, subtitle: "Currently serving guests" },
    ],
  },
  bookings: {
    title: "Table Bookings",
    subtitle: "Manage guest bookings, assign tables, and keep service slots organized for the day.",
    endpoint: "/bookings",
    enablePagination: true,
    pageSize: 8,
    defaultSort: "-bookingDate",
    filters: [
      { name: "status", label: "Status", options: [{ label: "All", value: "all" }, ...selectOptions(bookingStatuses)] },
      { name: "source", label: "Source", options: [{ label: "All", value: "all" }, ...selectOptions(["web", "phone", "walk-in"])] },
    ],
    buttonLabel: "Create Booking",
    searchPlaceholder: "Search guests, occasions, or booking status",
    emptyTitle: "No bookings found",
    emptyDescription: "Guest bookings will appear here as soon as the booking module starts receiving entries.",
    dependencies: [
      { key: "restaurants", endpoint: "/restaurants" },
      { key: "tables", endpoint: "/tables" },
    ],
    columns: [
      {
        key: "guestName",
        label: "Guest",
        render: (item) => (
          <div>
            <p className="font-semibold text-slate-900">{item.guestName}</p>
            <p className="text-xs text-slate-500">{item.guestEmail}</p>
          </div>
        ),
      },
      { key: "restaurant", label: "Restaurant", render: (item) => item.restaurant?.name || "-" },
      { key: "table", label: "Table", render: (item) => item.table?.tableNumber || "Auto Assign" },
      { key: "schedule", label: "Schedule", render: (item) => `${formatDate(item.bookingDate)} at ${formatTime(item.timeSlot)}` },
      { key: "status", label: "Status", render: (item) => <StatusBadge value={item.status} /> },
    ],
    fields: [
      { name: "restaurant", label: "Restaurant", type: "select", optionsSource: "restaurants" },
      {
        name: "table",
        label: "Table",
        type: "select",
        optionsSource: "tables",
        optionLabel: "tableNumber",
        filterOptions: (item, formValues) =>
          !formValues.restaurant || String(item.restaurant?._id || item.restaurant) === String(formValues.restaurant),
      },
      { name: "guestName", label: "Guest Name", placeholder: "Aisha Khan" },
      { name: "guestEmail", label: "Guest Email", type: "email", placeholder: "guest@example.com" },
      { name: "guestPhone", label: "Guest Phone", placeholder: "+91 99999 12345" },
      { name: "bookingDate", label: "Booking Date", type: "date" },
      { name: "timeSlot", label: "Time Slot", type: "time" },
      { name: "guestCount", label: "Guest Count", type: "number", placeholder: "4" },
      { name: "occasion", label: "Occasion", placeholder: "Birthday Dinner" },
      { name: "specialRequest", label: "Special Request", type: "textarea", placeholder: "Window-side table with cake support" },
      { name: "status", label: "Status", type: "select", options: selectOptions(bookingStatuses) },
    ],
    toFormValues: (item) => ({
      ...item,
      restaurant: item.restaurant?._id || item.restaurant || "",
      table: item.table?._id || item.table || "",
      bookingDate: toDateInput(item.bookingDate),
    }),
    fromFormValues: (values) => ({
      restaurant: values.restaurant,
      table: values.table || null,
      guestName: values.guestName,
      guestEmail: values.guestEmail,
      guestPhone: values.guestPhone,
      bookingDate: values.bookingDate,
      timeSlot: values.timeSlot,
      guestCount: Number(values.guestCount || 0),
      occasion: values.occasion,
      specialRequest: values.specialRequest,
      status: values.status,
      source: "web",
    }),
    getHighlights: (items) => [
      { title: "Total Bookings", value: items.length, subtitle: "Tracked in this workspace" },
      { title: "Confirmed", value: items.filter((item) => item.status === "confirmed").length, subtitle: "Ready for arrival" },
      { title: "Pending", value: items.filter((item) => item.status === "pending").length, subtitle: "Need follow-up action" },
    ],
  },
  orders: {
    title: "Food Ordering",
    subtitle: "Handle dine-in, takeaway, and delivery orders with flexible line-item editing and payment tracking.",
    endpoint: "/orders",
    enablePagination: true,
    pageSize: 8,
    defaultSort: "-placedAt",
    filters: [
      { name: "status", label: "Status", options: [{ label: "All", value: "all" }, ...selectOptions(orderStatuses)] },
      { name: "paymentStatus", label: "Payment", options: [{ label: "All", value: "all" }, ...selectOptions(paymentStatuses)] },
      { name: "orderType", label: "Channel", options: [{ label: "All", value: "all" }, ...selectOptions(orderTypes)] },
    ],
    buttonLabel: "Create Order",
    searchPlaceholder: "Search orders, customers, or statuses",
    emptyTitle: "No orders found",
    emptyDescription: "Orders from the guest portal and staff workflow will appear here once placed.",
    dependencies: [
      { key: "restaurants", endpoint: "/restaurants" },
      { key: "tables", endpoint: "/tables" },
      { key: "menuItems", endpoint: "/menu-items" },
    ],
    columns: [
      {
        key: "orderNumber",
        label: "Order",
        render: (item) => (
          <div>
            <p className="font-semibold text-slate-900">{item.orderNumber}</p>
            <p className="text-xs text-slate-500">{item.customerName}</p>
          </div>
        ),
      },
      { key: "restaurant", label: "Restaurant", render: (item) => item.restaurant?.name || "-" },
      { key: "orderType", label: "Type", render: (item) => item.orderType },
      { key: "totalAmount", label: "Amount", render: (item) => formatCurrency(item.totalAmount) },
      { key: "status", label: "Status", render: (item) => <StatusBadge value={item.status} /> },
    ],
    fields: [
      { name: "restaurant", label: "Restaurant", type: "select", optionsSource: "restaurants" },
      {
        name: "table",
        label: "Table",
        type: "select",
        optionsSource: "tables",
        optionLabel: "tableNumber",
        filterOptions: (item, formValues) =>
          !formValues.restaurant || String(item.restaurant?._id || item.restaurant) === String(formValues.restaurant),
      },
      { name: "customerName", label: "Customer Name", placeholder: "Aisha Khan" },
      { name: "customerEmail", label: "Customer Email", type: "email", placeholder: "guest@example.com" },
      { name: "customerPhone", label: "Customer Phone", placeholder: "+91 99999 12345" },
      { name: "orderType", label: "Order Type", type: "select", options: selectOptions(orderTypes) },
      { name: "status", label: "Status", type: "select", options: selectOptions(orderStatuses) },
      { name: "paymentStatus", label: "Payment Status", type: "select", options: selectOptions(paymentStatuses) },
      { name: "discount", label: "Discount", type: "number", placeholder: "40" },
      {
        name: "itemsText",
        label: "Order Items",
        type: "textarea",
        placeholder: "Smash Burger Combo x2\nCold Coffee Float x1",
        helperText: "Use one line per dish. Quantity can be added as x2, x3, and so on.",
      },
      { name: "notes", label: "Notes", type: "textarea", placeholder: "Extra peri seasoning" },
    ],
    toFormValues: (item) => ({
      ...item,
      restaurant: item.restaurant?._id || item.restaurant || "",
      table: item.table?._id || item.table || "",
      itemsText: (item.items || []).map((orderItem) => `${orderItem.name} x${orderItem.quantity}`).join("\n"),
    }),
    fromFormValues: (values, dependencies) => ({
      restaurant: values.restaurant,
      table: values.table || null,
      customerName: values.customerName,
      customerEmail: values.customerEmail,
      customerPhone: values.customerPhone,
      orderType: values.orderType,
      status: values.status,
      paymentStatus: values.paymentStatus,
      discount: Number(values.discount || 0),
      items: parseOrderItems(values.itemsText, dependencies.menuItems || []),
      notes: values.notes,
      placedAt: new Date().toISOString(),
    }),
    getHighlights: (items) => [
      { title: "Orders", value: items.length, subtitle: "Across all channels" },
      { title: "Paid", value: items.filter((item) => item.paymentStatus === "paid").length, subtitle: "Successfully closed" },
      { title: "Revenue", value: formatCurrency(items.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0)), subtitle: "Order collection total" },
    ],
  },
  reservations: {
    title: "Reservation Management",
    subtitle: "Track future guest reservations, area preferences, and seating readiness in one clear module.",
    endpoint: "/reservations",
    buttonLabel: "Create Reservation",
    searchPlaceholder: "Search reservations by guest, area, or status",
    emptyTitle: "No reservations yet",
    emptyDescription: "Create advance reservations for calls, walk-ins, or online demand.",
    dependencies: [{ key: "restaurants", endpoint: "/restaurants" }],
    columns: [
      {
        key: "guestName",
        label: "Guest",
        render: (item) => (
          <div>
            <p className="font-semibold text-slate-900">{item.guestName}</p>
            <p className="text-xs text-slate-500">{item.guestPhone}</p>
          </div>
        ),
      },
      { key: "restaurant", label: "Restaurant", render: (item) => item.restaurant?.name || "-" },
      { key: "areaPreference", label: "Area", render: (item) => item.areaPreference || "Indoor" },
      { key: "date", label: "Schedule", render: (item) => `${formatDate(item.reservationDate)} at ${formatTime(item.timeSlot)}` },
      { key: "status", label: "Status", render: (item) => <StatusBadge value={item.status} /> },
    ],
    fields: [
      { name: "restaurant", label: "Restaurant", type: "select", optionsSource: "restaurants" },
      { name: "guestName", label: "Guest Name", placeholder: "Sanjay Pai" },
      { name: "guestEmail", label: "Guest Email", type: "email", placeholder: "guest@example.com" },
      { name: "guestPhone", label: "Guest Phone", placeholder: "+91 99999 12345" },
      { name: "reservationDate", label: "Reservation Date", type: "date" },
      { name: "timeSlot", label: "Time Slot", type: "time" },
      { name: "guestCount", label: "Guest Count", type: "number", placeholder: "5" },
      { name: "areaPreference", label: "Area Preference", placeholder: "Patio" },
      { name: "specialRequest", label: "Special Request", type: "textarea", placeholder: "Anniversary decor" },
      { name: "status", label: "Status", type: "select", options: selectOptions(reservationStatuses) },
    ],
    toFormValues: (item) => ({
      ...item,
      restaurant: item.restaurant?._id || item.restaurant || "",
      reservationDate: toDateInput(item.reservationDate),
    }),
    fromFormValues: (values) => ({
      restaurant: values.restaurant,
      guestName: values.guestName,
      guestEmail: values.guestEmail,
      guestPhone: values.guestPhone,
      reservationDate: values.reservationDate,
      timeSlot: values.timeSlot,
      guestCount: Number(values.guestCount || 0),
      areaPreference: values.areaPreference,
      specialRequest: values.specialRequest,
      status: values.status,
    }),
    getHighlights: (items) => [
      { title: "Reservations", value: items.length, subtitle: "Advance bookings in queue" },
      { title: "Confirmed", value: items.filter((item) => item.status === "confirmed").length, subtitle: "Ready for seating" },
      { title: "Large Groups", value: items.filter((item) => Number(item.guestCount) >= 5).length, subtitle: "Require extra planning" },
    ],
  },
  users: {
    title: "User Management",
    subtitle: "Maintain super admin, restaurant admin, staff, and guest accounts with flexible role assignments.",
    endpoint: "/users",
    enablePagination: true,
    pageSize: 8,
    defaultSort: "-createdAt",
    filters: [
      { name: "role", label: "Role", options: [{ label: "All", value: "all" }, ...selectOptions(["super-admin", "restaurant-admin", "staff", "guest"])] },
      { name: "status", label: "Status", options: [{ label: "All", value: "all" }, ...selectOptions(["active", "inactive"])] },
    ],
    buttonLabel: "Add User",
    searchPlaceholder: "Search users by name, email, or role",
    emptyTitle: "No users available",
    emptyDescription: "Create operator accounts to complete the multi-role platform setup.",
    dependencies: [{ key: "restaurants", endpoint: "/restaurants" }],
    columns: [
      {
        key: "name",
        label: "User",
        render: (item) => (
          <div>
            <p className="font-semibold text-slate-900">{item.name}</p>
            <p className="text-xs text-slate-500">{item.email}</p>
          </div>
        ),
      },
      { key: "role", label: "Role", render: (item) => <StatusBadge value={item.role} /> },
      { key: "restaurant", label: "Restaurant", render: (item) => item.restaurant?.name || "Platform-wide" },
      { key: "phone", label: "Phone", render: (item) => item.phone || "-" },
      { key: "status", label: "Status", render: (item) => <StatusBadge value={item.status} /> },
    ],
    fields: [
      { name: "name", label: "Full Name", placeholder: "Arjun Mehta" },
      { name: "email", label: "Email", type: "email", placeholder: "admin@urbanbites.com" },
      { name: "password", label: "Password", type: "password", placeholder: "password123", helperText: "Leave blank while editing to keep the existing password." },
      { name: "phone", label: "Phone", placeholder: "+91 99999 12345" },
      { name: "role", label: "Role", type: "select", options: selectOptions(["super-admin", "restaurant-admin", "staff", "guest"]) },
      { name: "restaurant", label: "Restaurant", type: "select", optionsSource: "restaurants" },
      { name: "avatar", label: "Avatar URL", type: "url", placeholder: "https://images.unsplash.com/..." },
      { name: "status", label: "Status", type: "select", options: selectOptions(["active", "inactive"]) },
      { name: "permissions", label: "Permissions", placeholder: "reports, menu, bookings" },
    ],
    toFormValues: (item) => ({
      ...item,
      restaurant: item.restaurant?._id || item.restaurant || "",
      password: "",
      permissions: safeJoin(item.permissions),
    }),
    fromFormValues: (values) => ({
      name: values.name,
      email: values.email,
      password: values.password,
      phone: values.phone,
      role: values.role,
      restaurant: values.restaurant || null,
      avatar: values.avatar,
      status: values.status,
      permissions: splitList(values.permissions),
    }),
    getHighlights: (items) => [
      { title: "Users", value: items.length, subtitle: "Tracked in the current scope" },
      { title: "Staff Members", value: items.filter((item) => item.role === "staff").length, subtitle: "Operational team members" },
      { title: "Guests", value: items.filter((item) => item.role === "guest").length, subtitle: "Customer accounts" },
    ],
  },
};
