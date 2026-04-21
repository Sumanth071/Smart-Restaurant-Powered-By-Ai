import { Minus, Plus, Search, ShoppingBag } from "lucide-react";
import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "../../api/client";
import SectionCard from "../../components/ui/SectionCard";
import { useAuth } from "../../context/AuthContext";
import { useApiQuery, useQueryClient } from "../../context/QueryClientContext";
import { useToast } from "../../context/ToastContext";
import { formatCurrency } from "../../utils/helpers";

const getOrderDefaults = (user) => ({
  customerName: user?.name || "",
  customerEmail: user?.email || "",
  customerPhone: user?.phone || "",
  orderType: "delivery",
});

const resolveRequestMessage = (error, fallback) => error?.response?.data?.message || error?.message || fallback;

const resolveRestaurants = (restaurants = [], menuItems = []) => {
  if (restaurants.length) {
    return restaurants;
  }

  return menuItems.reduce((collection, item) => {
    const restaurant = item.restaurant;
    const restaurantId = String(restaurant?._id || restaurant || "");

    if (!restaurantId || collection.some((entry) => String(entry._id) === restaurantId)) {
      return collection;
    }

    return [
      ...collection,
      {
        _id: restaurantId,
        name: restaurant?.name || "Restaurant",
      },
    ];
  }, []);
};

const GuestOrderPage = () => {
  const { user } = useAuth();
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [cart, setCart] = useState([]);
  const [orderForm, setOrderForm] = useState(getOrderDefaults(user));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const deferredSearch = useDeferredValue(searchTerm.trim().toLowerCase());

  const restaurantsQuery = useApiQuery({
    queryKey: ["guest", "restaurants"],
    url: "/restaurants",
    staleTime: 60000,
  });
  const menuItemsQuery = useApiQuery({
    queryKey: ["guest", "menu-items"],
    url: "/menu-items",
    staleTime: 45000,
  });

  const restaurants = useMemo(
    () => resolveRestaurants(restaurantsQuery.data ?? [], menuItemsQuery.data ?? []),
    [menuItemsQuery.data, restaurantsQuery.data]
  );
  const menuItems = menuItemsQuery.data ?? [];
  const isLoading = restaurantsQuery.isLoading || menuItemsQuery.isLoading;
  const isRefreshing = restaurantsQuery.isFetching || menuItemsQuery.isFetching;
  const loadError = !restaurants.length && !menuItems.length ? "Unable to load the guest ordering menu right now. Please retry." : "";

  useEffect(() => {
    if (!user) {
      return;
    }

    setOrderForm((current) => ({
      customerName: current.customerName || user.name || "",
      customerEmail: current.customerEmail || user.email || "",
      customerPhone: current.customerPhone || user.phone || "",
      orderType: current.orderType || "delivery",
    }));
  }, [user]);

  useEffect(() => {
    setSelectedRestaurant((current) => {
      if (current && restaurants.some((restaurant) => String(restaurant._id) === String(current))) {
        return current;
      }

      return menuItems[0]?.restaurant?._id || restaurants[0]?._id || "";
    });
  }, [menuItems, restaurants]);

  const filteredMenu = useMemo(
    () =>
      menuItems.filter((item) => {
        const restaurantMatches = !selectedRestaurant || String(item.restaurant?._id || item.restaurant) === String(selectedRestaurant);
        const searchableText = [item.name, item.category, item.description, ...(item.tags || [])]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        const searchMatches = !deferredSearch || searchableText.includes(deferredSearch);

        return restaurantMatches && searchMatches;
      }),
    [deferredSearch, menuItems, selectedRestaurant]
  );

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0), [cart]);

  const addToCart = (item) => {
    setCart((current) => {
      const existing = current.find((cartItem) => cartItem._id === item._id);

      if (existing) {
        return current.map((cartItem) =>
          cartItem._id === item._id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      }

      return [...current, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId, delta) => {
    setCart((current) =>
      current
        .map((item) => (item._id === itemId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const retryLoad = async () => {
    setError("");
    setMessage("");

    const results = await Promise.allSettled([restaurantsQuery.refetch(), menuItemsQuery.refetch()]);

    if (results.every((result) => result.status === "rejected")) {
      pushToast({
        tone: "error",
        title: "Refresh failed",
        message: "The guest ordering menu is still unavailable. Please retry in a moment.",
      });
      return;
    }

    pushToast({
      tone: "info",
      title: "Menu refreshed",
      message: "The latest restaurant and menu data has been loaded.",
      duration: 2200,
    });
  };

  const submitOrder = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!cart.length) {
      setError("Add at least one menu item before placing the order.");
      return;
    }

    if (!String(orderForm.customerName).trim() || !String(orderForm.customerEmail).trim() || !String(orderForm.customerPhone).trim()) {
      setError("Enter the customer name, email, and phone before placing the order.");
      return;
    }

    const restaurantId = selectedRestaurant || cart[0]?.restaurant?._id || cart[0]?.restaurant;

    if (!restaurantId) {
      setError("Choose a restaurant before placing the order.");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post("/orders", {
        restaurant: restaurantId,
        customerName: String(orderForm.customerName).trim(),
        customerEmail: String(orderForm.customerEmail).trim(),
        customerPhone: String(orderForm.customerPhone).trim(),
        orderType: orderForm.orderType,
        items: cart.map((item) => ({
          menuItem: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        notes: "Created from guest ordering page",
      });

      queryClient.invalidateQueries("orders");
      pushToast({
        tone: "success",
        title: "Order placed",
        message: "The order was sent to the restaurant team successfully.",
      });
      setMessage("Order placed successfully. It is now visible in the orders workspace.");
      startTransition(() => {
        setCart([]);
        setOrderForm(getOrderDefaults(user));
      });
    } catch (requestError) {
      const messageText = resolveRequestMessage(requestError, "Unable to place the order.");
      setError(messageText);
      pushToast({
        tone: "error",
        title: "Order failed",
        message: messageText,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="px-6 py-12 md:px-10 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex rounded-full border border-brand-100 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-600 shadow-sm">
            Online Ordering
          </div>
          <h1 className="font-display text-4xl font-bold text-stone-900 md:text-5xl">Order Food from the Guest Portal</h1>
          <p className="mx-auto mt-4 max-w-3xl text-stone-600">
            A clear ordering flow with strong dish cards, quantity controls, and direct integration with restaurant operations.
          </p>
          {user?.role === "guest" ? (
            <Link to="/my-activity" className="mt-5 inline-flex rounded-full border border-brand-100 bg-white px-4 py-2 text-sm font-semibold text-brand-700 shadow-sm">
              Manage My Orders
            </Link>
          ) : null}
        </div>

        {message ? <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">{message}</div> : null}
        {error || loadError ? (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-600 md:flex-row md:items-center md:justify-between">
            <span>{error || loadError || "Unable to load the guest ordering menu right now. Please retry."}</span>
            <button
              type="button"
              onClick={retryLoad}
              className="rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-600"
            >
              Retry
            </button>
          </div>
        ) : null}

        <div className="mb-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_300px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="input-shell pl-11"
              placeholder="Search dishes, categories, or tags"
            />
          </label>
          <select value={selectedRestaurant} onChange={(event) => setSelectedRestaurant(event.target.value)} className="input-shell">
            {restaurants.map((restaurant) => (
              <option key={restaurant._id} value={restaurant._id}>
                {restaurant.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6 flex items-center justify-between gap-4 text-sm text-stone-500">
          <p>{filteredMenu.length} dishes ready for the current restaurant view.</p>
          <p>{isRefreshing ? "Refreshing menu..." : "Live menu synced with restaurant operations."}</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <SectionCard title="Menu Catalogue" subtitle="Browse dishes and build the cart with a clean guest ordering flow.">
            {isLoading ? (
              <div className="grid gap-5 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
                    <div className="h-52 animate-pulse bg-slate-100" />
                    <div className="space-y-3 p-5">
                      <div className="h-5 w-2/3 animate-pulse rounded-full bg-slate-100" />
                      <div className="h-4 w-1/3 animate-pulse rounded-full bg-slate-100" />
                      <div className="h-4 w-full animate-pulse rounded-full bg-slate-100" />
                      <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredMenu.length ? (
              <div className="grid gap-5 md:grid-cols-2">
                {filteredMenu.map((item) => (
                  <article key={item._id} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-52 w-full object-cover" />
                    ) : (
                      <div className="flex h-52 items-center justify-center bg-gradient-to-br from-brand-100 via-white to-brand-50 px-6 text-center">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-600">{item.category}</p>
                          <p className="mt-3 font-display text-3xl text-stone-900">{item.name}</p>
                        </div>
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                          <p className="text-sm text-slate-500">{item.category}</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {item.isVeg ? "Veg" : "Non-Veg"}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-slate-600">{item.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-lg font-bold text-amber-600">{formatCurrency(item.price)}</p>
                        <button type="button" onClick={() => addToCart(item)} className="btn-primary px-4 py-2 text-sm" aria-label={`Add ${item.name} to cart`}>
                          Add
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
                <p className="text-lg font-semibold text-slate-900">No menu items are available for this restaurant.</p>
                <p className="mt-2 text-sm text-slate-500">Choose another restaurant or retry the catalogue refresh.</p>
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Your Cart"
            subtitle="Review order details before sending them to the operations team."
            action={
              <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
                <ShoppingBag className="h-5 w-5" />
              </div>
            }
          >
            <div className="space-y-4">
              {cart.length ? (
                cart.map((item) => (
                  <div key={item._id} className="rounded-3xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-500">{formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2">
                        <button type="button" onClick={() => updateQuantity(item._id, -1)} aria-label={`Decrease quantity for ${item.name}`}>
                          <Minus className="h-4 w-4 text-slate-600" />
                        </button>
                        <span className="text-sm font-semibold text-slate-900">{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item._id, 1)} aria-label={`Increase quantity for ${item.name}`}>
                          <Plus className="h-4 w-4 text-slate-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
                  <p className="font-semibold text-slate-900">Your cart is empty.</p>
                  <p className="mt-2 text-sm text-slate-500">Add one or more dishes from the menu to start an order.</p>
                </div>
              )}

              <div className="rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 p-5 text-white">
                <p className="text-sm text-orange-100">Cart Total</p>
                <h3 className="mt-2 text-3xl font-bold">{formatCurrency(cartTotal)}</h3>
              </div>

              <form onSubmit={submitOrder} className="space-y-4">
                <input
                  value={orderForm.customerName}
                  onChange={(event) => setOrderForm((current) => ({ ...current, customerName: event.target.value }))}
                  className="input-shell"
                  placeholder="Customer name"
                />
                <input
                  type="email"
                  value={orderForm.customerEmail}
                  onChange={(event) => setOrderForm((current) => ({ ...current, customerEmail: event.target.value }))}
                  className="input-shell"
                  placeholder="Customer email"
                />
                <input
                  value={orderForm.customerPhone}
                  onChange={(event) => setOrderForm((current) => ({ ...current, customerPhone: event.target.value }))}
                  className="input-shell"
                  placeholder="Customer phone"
                />
                <select
                  value={orderForm.orderType}
                  onChange={(event) => setOrderForm((current) => ({ ...current, orderType: event.target.value }))}
                  className="input-shell"
                >
                  <option value="delivery">Delivery</option>
                  <option value="takeaway">Takeaway</option>
                  <option value="dine-in">Dine-in</option>
                </select>
                <button type="submit" className="btn-primary w-full">
                  {isSubmitting ? "Placing Order..." : "Place Order"}
                </button>
              </form>
            </div>
          </SectionCard>
        </div>
      </div>
    </section>
  );
};

export default GuestOrderPage;
