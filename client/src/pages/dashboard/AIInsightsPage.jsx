import { Bot, Sparkles, WandSparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import api from "../../api/client";
import BusyHourChart from "../../components/charts/BusyHourChart";
import PageHeader from "../../components/layout/PageHeader";
import SectionCard from "../../components/ui/SectionCard";
import StatCard from "../../components/ui/StatCard";
import LoadingScreen from "../../components/ui/LoadingScreen";
import { formatCurrency } from "../../utils/helpers";

const AIInsightsPage = () => {
  const [insights, setInsights] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [recommendationForm, setRecommendationForm] = useState({
    restaurant: "",
    preference: "",
    budget: "",
    isVeg: false,
    spiceLevel: "",
  });
  const [recommendationResult, setRecommendationResult] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi! I can help with food recommendations, restaurant timings, bookings, and support queries.",
    },
  ]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [insightResponse, restaurantResponse] = await Promise.all([api.get("/ai/insights"), api.get("/restaurants")]);
        setInsights(insightResponse.data);
        setRestaurants(restaurantResponse.data);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Unable to load AI insights.");
      }
    };

    loadData();
  }, []);

  const quickCards = useMemo(
    () => [
      { title: "AI Modules", value: 3, subtitle: "Recommendations, chatbot, and busy-hour analytics", icon: Sparkles },
      { title: "Insight Cards", value: insights?.insights?.length || 0, subtitle: "Generated from live demo data", icon: WandSparkles },
      { title: "Suggested Actions", value: insights?.suggestions?.length || 0, subtitle: "Operational improvements to present", icon: Bot },
    ],
    [insights]
  );

  const handleRecommendationChange = (event) => {
    const { name, value, type, checked } = event.target;
    setRecommendationForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const handleRecommendationSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post("/ai/recommendations", {
        ...recommendationForm,
        budget: recommendationForm.budget ? Number(recommendationForm.budget) : undefined,
      });
      setRecommendationResult(response.data.recommendations);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to generate recommendations.");
    }
  };

  const handleChatSubmit = async (event) => {
    event.preventDefault();

    if (!chatInput.trim()) {
      return;
    }

    const userMessage = { from: "user", text: chatInput };
    setMessages((current) => [...current, userMessage]);
    setChatInput("");

    try {
      const response = await api.post("/ai/chatbot", { message: userMessage.text });
      setMessages((current) => [...current, { from: "bot", text: response.data.reply }]);
    } catch (requestError) {
      setMessages((current) => [
        ...current,
        { from: "bot", text: requestError.response?.data?.message || "Sorry, the chatbot is temporarily unavailable." },
      ]);
    }
  };

  if (!insights && !error) {
    return <LoadingScreen label="Loading AI modules..." />;
  }

  return (
    <div>
      <PageHeader
        eyebrow="AI Modules"
        title="Food Recommendation, Chatbot, and Analytics"
        description="A clean AI showcase for your final-year project demo with actionable insights and interactive modules."
      />

      {error ? (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>
      ) : null}

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {quickCards.map((card) => (
          <StatCard key={card.title} title={card.title} value={card.value} subtitle={card.subtitle} icon={card.icon} />
        ))}
      </div>

      {insights ? (
        <>
          <div className="mb-6 grid gap-6 xl:grid-cols-[1.3fr_1fr]">
            <SectionCard title="Busy Hour Intelligence" subtitle="Peak demand model generated from live operational activity.">
              <BusyHourChart data={insights.busyHours} />
            </SectionCard>
            <SectionCard title="AI Narrative" subtitle="Auto-generated operational observations.">
              <div className="space-y-4">
                {insights.insights.map((item) => (
                  <div key={item.title} className="rounded-3xl border border-slate-200 p-4">
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-2 text-sm text-slate-500">{item.detail}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <SectionCard title="AI Food Recommendation System" subtitle="Suggest dishes using guest preferences, budget, and spice profile.">
              <form onSubmit={handleRecommendationSubmit} className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Restaurant</span>
                  <select
                    name="restaurant"
                    value={recommendationForm.restaurant}
                    onChange={handleRecommendationChange}
                    className="input-shell"
                  >
                    <option value="">All Restaurants</option>
                    {restaurants.map((restaurant) => (
                      <option key={restaurant._id} value={restaurant._id}>
                        {restaurant.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Preference</span>
                  <input
                    name="preference"
                    value={recommendationForm.preference}
                    onChange={handleRecommendationChange}
                    className="input-shell"
                    placeholder="signature, spicy, seafood"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Budget</span>
                  <input
                    name="budget"
                    type="number"
                    value={recommendationForm.budget}
                    onChange={handleRecommendationChange}
                    className="input-shell"
                    placeholder="500"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Spice Level</span>
                  <select
                    name="spiceLevel"
                    value={recommendationForm.spiceLevel}
                    onChange={handleRecommendationChange}
                    className="input-shell"
                  >
                    <option value="">Any</option>
                    <option value="Mild">Mild</option>
                    <option value="Medium">Medium</option>
                    <option value="Hot">Hot</option>
                  </select>
                </label>
                <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 md:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Vegetarian only</span>
                  <input
                    name="isVeg"
                    type="checkbox"
                    checked={recommendationForm.isVeg}
                    onChange={handleRecommendationChange}
                    className="h-5 w-5 rounded border-slate-300 text-amber-500 focus:ring-amber-300"
                  />
                </label>
                <button type="submit" className="btn-primary md:col-span-2">
                  Generate Recommendations
                </button>
              </form>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {recommendationResult.map((item) => (
                  <div key={item._id} className="overflow-hidden rounded-3xl border border-slate-200">
                    <img src={item.image} alt={item.name} className="h-40 w-full object-cover" />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{item.name}</p>
                          <p className="text-sm text-slate-500">{item.restaurant}</p>
                        </div>
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{item.spiceLevel}</span>
                      </div>
                      <p className="mt-3 text-sm text-slate-600">{item.reason}</p>
                      <p className="mt-3 font-semibold text-amber-600">{formatCurrency(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Customer Support Chatbot" subtitle="Rule-based chatbot module that answers common guest questions.">
              <div className="mb-4 space-y-3 rounded-3xl bg-slate-950 p-4">
                {messages.map((message, index) => (
                  <div key={`${message.from}-${index}`} className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                        message.from === "user" ? "bg-amber-500 text-white" : "bg-white/10 text-slate-100"
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleChatSubmit} className="flex gap-3">
                <input
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  className="input-shell flex-1"
                  placeholder="Ask about bookings, menu, timings, or recommendations..."
                />
                <button type="submit" className="btn-primary px-4">
                  Send
                </button>
              </form>

              <div className="mt-6 space-y-3">
                {insights.suggestions.map((suggestion) => (
                  <div key={suggestion} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    {suggestion}
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default AIInsightsPage;
