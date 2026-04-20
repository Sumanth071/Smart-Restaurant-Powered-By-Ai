import "../config/loadEnv.js";

import connectDB from "../config/db.js";
import Booking from "../models/Booking.js";
import MenuItem from "../models/MenuItem.js";
import Order from "../models/Order.js";
import Reservation from "../models/Reservation.js";
import Restaurant from "../models/Restaurant.js";
import Table from "../models/Table.js";
import User from "../models/User.js";
import { roles } from "../config/constants.js";
import { restaurantSeed } from "./seedData.js";
import { generateOrderNumber } from "../services/orderService.js";

const seedDatabase = async () => {
  await connectDB();

  await Promise.all([
    Booking.deleteMany(),
    Order.deleteMany(),
    Reservation.deleteMany(),
    Table.deleteMany(),
    MenuItem.deleteMany(),
    User.deleteMany(),
    Restaurant.deleteMany(),
  ]);

  const createdRestaurants = await Restaurant.insertMany(restaurantSeed);
  const [urbanBites, coastalSpice] = createdRestaurants;
  const defaultPassword = process.env.SEED_DEFAULT_PASSWORD || "password123";

  const users = await User.create([
    {
      name: "Suhana Kapoor",
      email: "superadmin@smartdine.ai",
      password: defaultPassword,
      phone: "+91 99999 11001",
      role: roles.SUPER_ADMIN,
      status: "active",
      permissions: ["all-access", "reports", "ai-insights"],
    },
    {
      name: "Arjun Mehta",
      email: "admin@urbanbites.com",
      password: defaultPassword,
      phone: "+91 99999 11002",
      role: roles.RESTAURANT_ADMIN,
      restaurant: urbanBites._id,
      status: "active",
      permissions: ["staff-management", "menu", "orders"],
    },
    {
      name: "Nisha Rao",
      email: "admin@coastalspice.com",
      password: defaultPassword,
      phone: "+91 99999 11003",
      role: roles.RESTAURANT_ADMIN,
      restaurant: coastalSpice._id,
      status: "active",
      permissions: ["staff-management", "menu", "orders"],
    },
    {
      name: "Rohit Das",
      email: "staff@urbanbites.com",
      password: defaultPassword,
      phone: "+91 99999 11004",
      role: roles.STAFF,
      restaurant: urbanBites._id,
      status: "active",
      permissions: ["bookings", "orders", "tables"],
    },
    {
      name: "Keerthi N",
      email: "staff@coastalspice.com",
      password: defaultPassword,
      phone: "+91 99999 11005",
      role: roles.STAFF,
      restaurant: coastalSpice._id,
      status: "active",
      permissions: ["bookings", "orders", "tables"],
    },
    {
      name: "Aisha Khan",
      email: "guest@example.com",
      password: defaultPassword,
      phone: "+91 99999 11006",
      role: roles.GUEST,
      status: "active",
    },
  ]);

  const guestUser = users.find((user) => user.role === roles.GUEST);

  const menuItems = await MenuItem.insertMany([
    {
      restaurant: urbanBites._id,
      name: "Truffle Paneer Tikka",
      category: "Starters",
      description: "Smoky paneer cubes glazed with truffle yogurt and charred peppers.",
      price: 320,
      isVeg: true,
      spiceLevel: "Medium",
      prepTime: 18,
      tags: ["signature", "smoky", "veg"],
      popularityScore: 92,
      image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
    },
    {
      restaurant: urbanBites._id,
      name: "Creamy Alfredo Pasta",
      category: "Main Course",
      description: "House-made pasta in a creamy parmesan sauce with herbs.",
      price: 410,
      isVeg: true,
      spiceLevel: "Mild",
      prepTime: 22,
      tags: ["pasta", "comfort"],
      popularityScore: 88,
      image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=800&q=80",
    },
    {
      restaurant: urbanBites._id,
      name: "Smash Burger Combo",
      category: "Combos",
      description: "Double patty burger with peri fries and a chilled beverage.",
      price: 499,
      isVeg: false,
      spiceLevel: "Medium",
      prepTime: 16,
      tags: ["combo", "bestseller"],
      popularityScore: 96,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    },
    {
      restaurant: urbanBites._id,
      name: "Cold Coffee Float",
      category: "Beverages",
      description: "Espresso blended cold coffee finished with vanilla ice cream.",
      price: 190,
      isVeg: true,
      spiceLevel: "Mild",
      prepTime: 8,
      tags: ["beverage", "cold"],
      popularityScore: 79,
      image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80",
    },
    {
      restaurant: coastalSpice._id,
      name: "Mangalorean Prawn Ghee Roast",
      category: "Main Course",
      description: "Fiery coastal prawns tossed in a rich roasted masala and ghee.",
      price: 620,
      isVeg: false,
      spiceLevel: "Hot",
      prepTime: 24,
      tags: ["seafood", "signature"],
      popularityScore: 94,
      image: "https://images.unsplash.com/photo-1625944525533-473f1b3d54b2?auto=format&fit=crop&w=800&q=80",
    },
    {
      restaurant: coastalSpice._id,
      name: "Coconut Lemon Fish Bowl",
      category: "Combos",
      description: "Grilled fish served with coconut rice, lemon butter, and slaw.",
      price: 560,
      isVeg: false,
      spiceLevel: "Medium",
      prepTime: 20,
      tags: ["healthy", "bowl"],
      popularityScore: 87,
      image: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=800&q=80",
    },
    {
      restaurant: coastalSpice._id,
      name: "Neer Dosa Platter",
      category: "Main Course",
      description: "Soft neer dosas served with vegetable curry and chutney trio.",
      price: 280,
      isVeg: true,
      spiceLevel: "Mild",
      prepTime: 14,
      tags: ["traditional", "veg"],
      popularityScore: 76,
      image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80",
    },
    {
      restaurant: coastalSpice._id,
      name: "Tender Coconut Cooler",
      category: "Beverages",
      description: "Chilled coconut water with mint, basil seeds, and lime.",
      price: 160,
      isVeg: true,
      spiceLevel: "Mild",
      prepTime: 6,
      tags: ["refreshing", "summer"],
      popularityScore: 72,
      image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
    },
  ]);

  const tables = await Table.insertMany([
    { restaurant: urbanBites._id, tableNumber: "UB-01", capacity: 2, zone: "Window", floor: "Ground", status: "available", isAvailable: true },
    { restaurant: urbanBites._id, tableNumber: "UB-02", capacity: 4, zone: "Main Hall", floor: "Ground", status: "reserved", isAvailable: true },
    { restaurant: urbanBites._id, tableNumber: "UB-03", capacity: 6, zone: "Family Bay", floor: "First", status: "occupied", isAvailable: false },
    { restaurant: urbanBites._id, tableNumber: "UB-04", capacity: 8, zone: "Celebration", floor: "First", status: "available", isAvailable: true },
    { restaurant: coastalSpice._id, tableNumber: "CS-01", capacity: 2, zone: "Patio", floor: "Ground", status: "available", isAvailable: true },
    { restaurant: coastalSpice._id, tableNumber: "CS-02", capacity: 4, zone: "Sea View", floor: "Ground", status: "reserved", isAvailable: true },
    { restaurant: coastalSpice._id, tableNumber: "CS-03", capacity: 6, zone: "Family Bay", floor: "First", status: "available", isAvailable: true },
    { restaurant: coastalSpice._id, tableNumber: "CS-04", capacity: 8, zone: "Private Deck", floor: "First", status: "cleaning", isAvailable: false },
  ]);

  const today = new Date();
  const bookingDateA = new Date(today);
  bookingDateA.setDate(today.getDate() + 1);
  const bookingDateB = new Date(today);
  bookingDateB.setDate(today.getDate() + 2);
  const bookingDateC = new Date(today);
  bookingDateC.setDate(today.getDate() + 3);

  await Booking.insertMany([
    {
      restaurant: urbanBites._id,
      table: tables[1]._id,
      guestUser: guestUser._id,
      guestName: "Aisha Khan",
      guestEmail: "guest@example.com",
      guestPhone: "+91 99999 11006",
      bookingDate: bookingDateA,
      timeSlot: "19:30",
      guestCount: 4,
      occasion: "Birthday Dinner",
      specialRequest: "Window-side table with cake support",
      status: "confirmed",
      source: "web",
    },
    {
      restaurant: urbanBites._id,
      table: tables[3]._id,
      guestName: "Rahul Shetty",
      guestEmail: "rahul@example.com",
      guestPhone: "+91 99999 44001",
      bookingDate: bookingDateB,
      timeSlot: "20:00",
      guestCount: 6,
      occasion: "Team Dinner",
      specialRequest: "Projector preferred",
      status: "pending",
      source: "phone",
    },
    {
      restaurant: coastalSpice._id,
      table: tables[5]._id,
      guestName: "Mira Dsouza",
      guestEmail: "mira@example.com",
      guestPhone: "+91 99999 44002",
      bookingDate: bookingDateA,
      timeSlot: "13:00",
      guestCount: 2,
      occasion: "Lunch Date",
      specialRequest: "Sea-view table",
      status: "confirmed",
      source: "web",
    },
  ]);

  await Reservation.insertMany([
    {
      restaurant: urbanBites._id,
      guestUser: guestUser._id,
      guestName: "Aisha Khan",
      guestEmail: "guest@example.com",
      guestPhone: "+91 99999 11006",
      reservationDate: bookingDateC,
      timeSlot: "18:30",
      guestCount: 3,
      areaPreference: "Indoor",
      specialRequest: "Quiet corner seating",
      status: "confirmed",
    },
    {
      restaurant: coastalSpice._id,
      guestName: "Sanjay Pai",
      guestEmail: "sanjay@example.com",
      guestPhone: "+91 99999 44003",
      reservationDate: bookingDateB,
      timeSlot: "21:00",
      guestCount: 5,
      areaPreference: "Patio",
      specialRequest: "Anniversary decor",
      status: "pending",
    },
  ]);

  const orderDates = [0, 1, 2, 3, 4, 5].map((daysAgo) => {
    const date = new Date(today);
    date.setDate(today.getDate() - daysAgo);
    date.setHours(12 + daysAgo, 20, 0, 0);
    return date;
  });

  await Order.insertMany([
    {
      orderNumber: generateOrderNumber(),
      restaurant: urbanBites._id,
      table: tables[2]._id,
      guestUser: guestUser._id,
      customerName: "Aisha Khan",
      customerEmail: "guest@example.com",
      customerPhone: "+91 99999 11006",
      items: [
        { menuItem: menuItems[2]._id, name: menuItems[2].name, quantity: 1, price: 499 },
        { menuItem: menuItems[3]._id, name: menuItems[3].name, quantity: 2, price: 190 },
      ],
      orderType: "dine-in",
      status: "served",
      paymentStatus: "paid",
      discount: 40,
      totalAmount: 839,
      notes: "Extra peri seasoning",
      placedAt: orderDates[0],
    },
    {
      orderNumber: generateOrderNumber(),
      restaurant: urbanBites._id,
      customerName: "Campus Club",
      customerEmail: "club@example.com",
      customerPhone: "+91 99999 55001",
      items: [
        { menuItem: menuItems[0]._id, name: menuItems[0].name, quantity: 3, price: 320 },
        { menuItem: menuItems[1]._id, name: menuItems[1].name, quantity: 2, price: 410 },
      ],
      orderType: "delivery",
      status: "ready",
      paymentStatus: "paid",
      totalAmount: 1780,
      placedAt: orderDates[1],
    },
    {
      orderNumber: generateOrderNumber(),
      restaurant: coastalSpice._id,
      table: tables[5]._id,
      customerName: "Mira Dsouza",
      customerEmail: "mira@example.com",
      customerPhone: "+91 99999 44002",
      items: [
        { menuItem: menuItems[4]._id, name: menuItems[4].name, quantity: 1, price: 620 },
        { menuItem: menuItems[7]._id, name: menuItems[7].name, quantity: 2, price: 160 },
      ],
      orderType: "dine-in",
      status: "served",
      paymentStatus: "paid",
      totalAmount: 940,
      placedAt: orderDates[2],
    },
    {
      orderNumber: generateOrderNumber(),
      restaurant: coastalSpice._id,
      customerName: "Ocean Hub",
      customerEmail: "ocean@example.com",
      customerPhone: "+91 99999 55002",
      items: [
        { menuItem: menuItems[5]._id, name: menuItems[5].name, quantity: 2, price: 560 },
        { menuItem: menuItems[6]._id, name: menuItems[6].name, quantity: 1, price: 280 },
      ],
      orderType: "takeaway",
      status: "preparing",
      paymentStatus: "pending",
      totalAmount: 1400,
      placedAt: orderDates[3],
    },
  ]);

  console.log("Seed completed successfully.");
  console.log("Demo accounts:");
  console.log("Super Admin: superadmin@smartdine.ai / password123");
  console.log("Restaurant Admin: admin@urbanbites.com / password123");
  console.log("Staff: staff@urbanbites.com / password123");
  console.log("Guest: guest@example.com / password123");

  process.exit(0);
};

seedDatabase().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
