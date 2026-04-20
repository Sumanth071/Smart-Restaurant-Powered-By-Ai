import { ArrowRight, Bot, ChartColumnBig, Clock3, Table2, UtensilsCrossed } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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

  const operatingSnapshot = useMemo(
    () => [
      { label: "Active branches", value: restaurants.length || "--", note: "Locations available for bookings and orders" },
      { label: "Menu items", value: menuItems.length || "--", note: "Curated dishes surfaced for the public journey" },
      { label: "AI picks", value: recommendations.length || "--", note: "Personalized dishes suggested from live demo data" },
    ],
    [menuItems.length, recommendations.length, restaurants.length]
  );

  return (
    <div>
      <section className="px-6 py-12 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 xl:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-200">
              Hospitality Operating System
            </div>
            <h1 className="font-display text-5xl font-bold leading-tight text-white md:text-6xl">
              Designed for guests out front and service teams behind the scenes
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-300">
              Smart Dine brings together bookings, ordering, menu control, service support, and decision-ready analytics in one restaurant platform that feels polished enough for a real launch.
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
                { icon: Table2, title: "Guest reservations", note: "Guests can reserve tables, manage requests, and follow booking status without calling the branch." },
                { icon: UtensilsCrossed, title: "Digital ordering", note: "Menu browsing and food ordering stay connected to branch availability and service operations." },
                { icon: Bot, title: "Decision support", note: "Recommendations, chatbot assistance, and peak-hour insights help teams move faster during service." },
              ].map((feature) => (
                <div key={feature.title} className="glass-card p-5">
                  <feature.icon className="h-6 w-6 text-brand-200" />
                  <p className="mt-4 font-semibold text-white">{feature.title}</p>
                  <p className="mt-2 text-sm leading-6 text-stone-300">{feature.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="rounded-[28px] bg-white p-6 text-slate-900 shadow-soft">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-600">Service Snapshot</p>
                  <h2 className="mt-2 font-display text-2xl font-bold">What the platform is handling right now</h2>
                </div>
                <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
                  <ChartColumnBig className="h-5 w-5" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {operatingSnapshot.map((item) => (
                  <div key={item.label} className="rounded-[24px] border border-stone-200 bg-stone-50 p-4">
                    <p className="text-sm text-stone-500">{item.label}</p>
                    <h3 className="mt-3 font-display text-4xl font-semibold text-stone-900">{item.value}</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">{item.note}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[24px] bg-stone-950 p-5 text-white">
                <div className="flex items-center gap-3">
                  <Clock3 className="h-5 w-5 text-brand-200" />
                  <div>
                    <p className="text-sm uppercase tracking-[0.22em] text-stone-400">Operating note</p>
                    <p className="mt-1 text-sm text-stone-200">
                      Peak-hour analytics, recommendations, and support replies are all driven by the same live dataset used across orders, tables, and reservations.
                    </p>
                  </div>
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
          <SectionCard title="Branches in Service" subtitle="Each location carries its own identity, cuisine mix, and operating data while staying connected to one platform.">
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

          <SectionCard title="Popular Right Now" subtitle="A lighter public menu view that feels like a real ordering surface rather than a project placeholder.">
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
