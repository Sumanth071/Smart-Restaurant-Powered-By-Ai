import { ArrowRight, Bot, ChartColumnBig, Sparkles, Table2, UtensilsCrossed } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../../api/client";
import SectionCard from "../../components/ui/SectionCard";
import { formatCurrency } from "../../utils/helpers";

const GuestHomePage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const loadPublicData = async () => {
      const [restaurantResponse, menuResponse, recommendationResponse] = await Promise.all([
        api.get("/restaurants"),
        api.get("/menu-items"),
        api.post("/ai/recommendations", { preference: "signature" }),
      ]);

      setRestaurants(restaurantResponse.data);
      setMenuItems(menuResponse.data.slice(0, 4));
      setRecommendations(recommendationResponse.data.recommendations);
    };

    loadPublicData().catch(() => undefined);
  }, []);

  return (
    <div>
      <section className="px-6 py-12 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 xl:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">
              Final Year Project Demo
            </div>
            <h1 className="font-display text-5xl font-bold leading-tight text-white md:text-6xl">
              AI-Powered Smart Restaurant <span className="text-gradient">Management System</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-300">
              A full MERN stack web application with role-based access, CRUD operations, AI recommendations, chatbot support, and operational analytics for modern restaurant workflows.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/book-table" className="btn-primary">
                Book a Table
              </Link>
              <Link to="/order-online" className="btn-secondary bg-white/95">
                Order Food
              </Link>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                { icon: Table2, title: "Bookings", note: "Table booking and reservation workflow" },
                { icon: UtensilsCrossed, title: "Ordering", note: "Menu management and online food orders" },
                { icon: Bot, title: "AI Layer", note: "Recommendations, chatbot, and analytics" },
              ].map((feature) => (
                <div key={feature.title} className="glass-card p-5">
                  <feature.icon className="h-6 w-6 text-amber-300" />
                  <p className="mt-4 font-semibold text-white">{feature.title}</p>
                  <p className="mt-2 text-sm text-slate-300">{feature.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="rounded-[28px] bg-white p-6 text-slate-900 shadow-soft">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-500">Live Highlights</p>
                  <h2 className="mt-2 font-display text-2xl font-bold">Smart dashboard preview</h2>
                </div>
                <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                  <ChartColumnBig className="h-5 w-5" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl bg-slate-950 p-5 text-white">
                  <p className="text-sm text-slate-400">Multi-role architecture</p>
                  <h3 className="mt-4 text-3xl font-bold">4 Roles</h3>
                  <p className="mt-2 text-sm text-slate-300">Super Admin, Restaurant Admin, Staff, and Guest User.</p>
                </div>
                <div className="rounded-3xl bg-gradient-to-br from-amber-50 to-rose-50 p-5">
                  <p className="text-sm text-slate-500">AI modules</p>
                  <h3 className="mt-4 text-3xl font-bold text-slate-900">3 Modules</h3>
                  <p className="mt-2 text-sm text-slate-600">Recommendations, chatbot support, and busy-hour analytics.</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {recommendations.slice(0, 3).map((item) => (
                  <div key={item._id} className="flex items-center gap-4 rounded-3xl border border-slate-200 p-3">
                    <img src={item.image} alt={item.name} className="h-20 w-20 rounded-2xl object-cover" />
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-500">{item.reason}</p>
                      <p className="mt-2 text-sm font-semibold text-amber-600">{formatCurrency(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-12 md:px-10 md:pb-20">
        <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <SectionCard title="Featured Restaurants" subtitle="Two demo branches with polished cards and dummy operational data.">
            <div className="grid gap-6 md:grid-cols-2">
              {restaurants.map((restaurant) => (
                <article key={restaurant._id} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
                  <img src={restaurant.heroImage} alt={restaurant.name} className="h-56 w-full object-cover" />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{restaurant.name}</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {restaurant.address?.city}, {restaurant.address?.state}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {restaurant.rating}/5
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">{restaurant.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {restaurant.cuisineTypes?.map((cuisine) => (
                        <span key={cuisine} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {cuisine}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Guest Favorites" subtitle="A clean menu teaser to support your homepage demo.">
            <div className="space-y-4">
              {menuItems.map((item) => (
                <div key={item._id} className="flex items-center gap-4 rounded-3xl border border-slate-200 p-3">
                  <img src={item.image} alt={item.name} className="h-20 w-20 rounded-2xl object-cover" />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-500">{item.category}</p>
                    <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                  </div>
                  <p className="font-semibold text-amber-600">{formatCurrency(item.price)}</p>
                </div>
              ))}
            </div>
            <Link to="/order-online" className="btn-primary mt-6 w-full">
              Explore Full Menu
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </SectionCard>
        </div>
      </section>
    </div>
  );
};

export default GuestHomePage;
