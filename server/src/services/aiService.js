import MenuItem from "../models/MenuItem.js";

export const getFoodRecommendations = async ({ restaurant, preference, budget, isVeg, spiceLevel }) => {
  const filter = { isAvailable: true };

  if (restaurant) {
    filter.restaurant = restaurant;
  }

  if (typeof isVeg === "boolean") {
    filter.isVeg = isVeg;
  }

  if (spiceLevel) {
    filter.spiceLevel = spiceLevel;
  }

  if (budget) {
    filter.price = { $lte: Number(budget) };
  }

  if (preference) {
    filter.$or = [
      { name: { $regex: preference, $options: "i" } },
      { category: { $regex: preference, $options: "i" } },
      { tags: { $elemMatch: { $regex: preference, $options: "i" } } },
      { description: { $regex: preference, $options: "i" } },
    ];
  }

  const items = await MenuItem.find(filter).populate("restaurant", "name").sort({ popularityScore: -1, price: 1 }).limit(5);

  return items.map((item) => ({
    _id: item._id,
    name: item.name,
    category: item.category,
    price: item.price,
    isVeg: item.isVeg,
    spiceLevel: item.spiceLevel,
    image: item.image,
    restaurant: item.restaurant?.name,
    reason: item.isVeg
      ? "Strong match for light and vegetarian preferences."
      : "Popular crowd-favorite with strong repeat demand.",
  }));
};

export const generateChatbotReply = (message = "") => {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("book") || normalizedMessage.includes("table")) {
    return "You can book a table from the Book Table page. Choose the restaurant, date, time, and guest count, then our system will create the reservation instantly.";
  }

  if (normalizedMessage.includes("menu") || normalizedMessage.includes("food")) {
    return "The Order Online page shows the full live menu. You can filter dishes by restaurant and place an order in just a few clicks.";
  }

  if (normalizedMessage.includes("timing") || normalizedMessage.includes("open")) {
    return "Most branches operate from 10:00 AM to 11:00 PM. Exact timings are shown on each restaurant card.";
  }

  if (normalizedMessage.includes("recommend")) {
    return "Try the recommendation engine on the AI Insights page or the guest homepage. It suggests dishes based on preference, spice level, and budget.";
  }

  return "I can help with bookings, menu browsing, ordering, and restaurant information. Ask about table availability, popular dishes, support, or branch timings.";
};
