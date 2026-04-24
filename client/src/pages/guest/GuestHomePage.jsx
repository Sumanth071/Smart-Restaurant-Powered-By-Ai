import { ArrowRight, Bot, ChartColumnBig, Clock3, Table2, UtensilsCrossed } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "../../api/client";
import SectionCard from "../../components/ui/SectionCard";
import { developerShowcase } from "../../data/developerShowcase";
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
      { label: "AI picks", value: recommendations.length || "--", note: "Personalized dishes suggested from live operating data" },
    ],
    [menuItems.length, recommendations.length, restaurants.length]
  );

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top_left,rgba(244,123,32,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,214,181,0.36),transparent_24%)]" />
      <section className="relative px-6 py-12 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 xl:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-brand-100 bg-white/92 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-600 shadow-sm">
              Hospitality Operating System
            </div>
            <h1 className="max-w-4xl font-display text-5xl font-bold leading-[0.96] text-stone-900 md:text-7xl">
              Premium restaurant operations with a guest experience to match
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-600">
              Smart Dine brings together reservations, ordering, menu control, guest assistance, and analytics in one refined digital product built for modern restaurant brands.
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
                { icon: Table2, title: "Guest reservations", note: "Guests reserve tables, manage requests, and follow status without calling the branch." },
                { icon: UtensilsCrossed, title: "Digital ordering", note: "Menu browsing and food ordering stay connected to branch availability." },
                { icon: Bot, title: "Decision support", note: "Recommendations, chatbot assistance, and peak-hour insights help teams move faster." },
              ].map((feature) => (
                <div key={feature.title} className="glass-card relative overflow-hidden p-5">
                  <div className="absolute right-[-2rem] top-[-2rem] h-20 w-20 rounded-full bg-brand-100/70 blur-2xl" />
                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-100 bg-white text-brand-600 shadow-sm">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <p className="mt-4 font-semibold text-stone-900">{feature.title}</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{feature.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="rounded-[30px] border border-brand-100/70 bg-gradient-to-br from-white via-[#fffaf5] to-[#fff0e2] p-6 text-slate-900 shadow-[0_24px_60px_rgba(108,54,16,0.08)]">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-600">Service Snapshot</p>
                  <h2 className="mt-2 font-display text-2xl font-bold">What the platform is handling right now</h2>
                </div>
                <div className="rounded-2xl border border-brand-100 bg-white/92 p-3 text-brand-700 shadow-sm">
                  <ChartColumnBig className="h-5 w-5" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {operatingSnapshot.map((item) => (
                  <div key={item.label} className="rounded-[24px] border border-brand-100 bg-white/90 p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600">{item.label}</p>
                    <h3 className="mt-3 font-display text-4xl font-semibold text-stone-900">{item.value}</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">{item.note}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[24px] border border-brand-100 bg-[#fff4ea] p-5 text-stone-900">
                <div className="flex items-center gap-3">
                  <Clock3 className="h-5 w-5 text-brand-700" />
                  <div>
                    <p className="text-sm uppercase tracking-[0.22em] text-brand-600">Operating note</p>
                    <p className="mt-1 text-sm text-stone-600">
                      Peak-hour analytics, recommendations, and support replies are all driven by the same live dataset used across orders, tables, and reservations.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {recommendations.slice(0, 3).map((item) => (
                  <div key={item._id} className="flex items-center gap-4 rounded-3xl border border-brand-100 bg-white/88 p-3 shadow-sm">
                    <img src={item.image} alt={item.name} className="h-20 w-20 rounded-2xl object-cover" />
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-500">{item.reason}</p>
                      <p className="mt-2 text-sm font-semibold text-brand-700">{formatCurrency(item.price)}</p>
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
          <SectionCard title="Branches in Service" subtitle="Each location keeps its own identity and operating data while staying connected to one platform.">
            <div className="grid gap-6 md:grid-cols-2">
              {restaurants.map((restaurant) => (
                <article key={restaurant._id} className="overflow-hidden rounded-[30px] border border-brand-100 bg-white shadow-[0_22px_50px_rgba(108,54,16,0.08)]">
                  <div className="relative">
                    <img src={restaurant.heroImage} alt={restaurant.name} className="h-56 w-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/45 to-transparent" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{restaurant.name}</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {restaurant.address?.city}, {restaurant.address?.state}
                        </p>
                      </div>
                      <span className="rounded-full border border-brand-100 bg-[#fff5eb] px-3 py-1 text-xs font-semibold text-brand-700">
                        {restaurant.rating}/5
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">{restaurant.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {restaurant.cuisineTypes?.map((cuisine) => (
                        <span key={cuisine} className="rounded-full border border-brand-100 bg-white px-3 py-1 text-xs font-semibold text-stone-600">
                          {cuisine}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Popular Right Now" subtitle="A cleaner public menu view that feels like a real ordering surface.">
            <div className="space-y-4">
              {menuItems.map((item) => (
                <div key={item._id} className="flex items-center gap-4 rounded-3xl border border-brand-100 bg-white/90 p-3 shadow-sm">
                  <img src={item.image} alt={item.name} className="h-20 w-20 rounded-2xl object-cover" />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-500">{item.category}</p>
                    <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                  </div>
                  <p className="font-semibold text-brand-700">{formatCurrency(item.price)}</p>
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

      <section className="px-6 pb-12 md:px-10 md:pb-20">
        <div className="mx-auto max-w-7xl">
          <SectionCard
            title="Meet the Project Team"
            subtitle="A dedicated showcase for the core team behind the software, created for demos, reviews, and client presentations."
          >
            <div className="grid gap-6 lg:grid-cols-3">
              {developerShowcase.map((developer) => (
                <article
                  key={developer.id}
                  className="overflow-hidden rounded-[30px] border border-brand-100 bg-white shadow-[0_24px_55px_rgba(108,54,16,0.08)]"
                >
                  <div className="relative p-4 pb-0">
                    <div className="relative h-[24rem] overflow-hidden rounded-[28px] border border-brand-100/80 bg-gradient-to-b from-[#fff2e5] via-[#fff8f2] to-white shadow-[0_20px_45px_rgba(108,54,16,0.10)]">
                      <img
                        src={developer.image}
                        alt={developer.name}
                        className={`h-full w-full object-cover transition ${developer.imageClassName ?? "object-top"}`}
                      />
                      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>
                    <div className="absolute left-9 top-9 rounded-full border border-white/65 bg-white/88 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-700 backdrop-blur-sm">
                      Core Team
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="text-center">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-600">{developer.role}</p>
                      <h3 className="mt-3 font-display text-3xl font-semibold text-stone-900">{developer.name}</h3>
                    </div>

                    <p className="mt-4 text-sm leading-7 text-stone-600">{developer.contribution}</p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {developer.highlights.map((highlight) => (
                        <span key={highlight} className="rounded-full border border-brand-100 bg-[#fff7ef] px-3 py-1 text-xs font-semibold text-brand-700">
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </SectionCard>
        </div>
      </section>
    </div>
  );
};

export default GuestHomePage;
