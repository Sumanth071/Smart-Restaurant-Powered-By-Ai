import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "../../api/client";
import SectionCard from "../../components/ui/SectionCard";
import { useAuth } from "../../context/AuthContext";
import { formatCurrency } from "../../utils/helpers";

const getOrderDefaults = (user) => ({
  customerName: user?.name || "",
  customerEmail: user?.email || "",
  customerPhone: user?.phone || "",
  orderType: "delivery",
});

const GuestOrderPage = () => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [cart, setCart] = useState([]);
  const [orderForm, setOrderForm] = useState(getOrderDefaults(user));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const [restaurantResponse, menuResponse] = await Promise.all([api.get("/restaurants"), api.get("/menu-items")]);
      setRestaurants(restaurantResponse.data);
      setMenuItems(menuResponse.data);
      setSelectedRestaurant(menuResponse.data[0]?.restaurant?._id || restaurantResponse.data[0]?._id || "");
    };

    loadData().catch(() => setError("Unable to load the guest ordering menu."));
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    setOrderForm((current) => ({ ...getOrderDefaults(user), ...current }));
  }, [user]);

  const filteredMenu = useMemo(
    () => menuItems.filter((item) => !selectedRestaurant || String(item.restaurant?._id || item.restaurant) === String(selectedRestaurant)),
    [menuItems, selectedRestaurant]
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

  const submitOrder = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!cart.length) {
      setError("Add at least one menu item before placing the order.");
      return;
    }

    try {
      await api.post("/orders", {
        restaurant: selectedRestaurant || cart[0]?.restaurant?._id,
        customerName: orderForm.customerName,
        customerEmail: orderForm.customerEmail,
        customerPhone: orderForm.customerPhone,
        orderType: orderForm.orderType,
        items: cart.map((item) => ({
          menuItem: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        notes: "Created from guest ordering page",
      });

      setMessage("Order placed successfully. It is now visible in the orders workspace.");
      setCart([]);
      setOrderForm(getOrderDefaults(user));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to place the order.");
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
        {error ? <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div> : null}

        <div className="mb-6 flex justify-center">
          <select value={selectedRestaurant} onChange={(event) => setSelectedRestaurant(event.target.value)} className="input-shell max-w-md">
            {restaurants.map((restaurant) => (
              <option key={restaurant._id} value={restaurant._id}>
                {restaurant.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <SectionCard title="Menu Catalogue" subtitle="Browse dishes and build the cart with a clean guest ordering flow.">
            <div className="grid gap-5 md:grid-cols-2">
              {filteredMenu.map((item) => (
                <article key={item._id} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
                  <img src={item.image} alt={item.name} className="h-52 w-full object-cover" />
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
                      <button type="button" onClick={() => addToCart(item)} className="btn-primary px-4 py-2 text-sm">
                        Add
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
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
              {cart.map((item) => (
                <div key={item._id} className="rounded-3xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-500">{formatCurrency(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2">
                      <button type="button" onClick={() => updateQuantity(item._id, -1)}>
                        <Minus className="h-4 w-4 text-slate-600" />
                      </button>
                      <span className="text-sm font-semibold text-slate-900">{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item._id, 1)}>
                        <Plus className="h-4 w-4 text-slate-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

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
                  Place Order
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
