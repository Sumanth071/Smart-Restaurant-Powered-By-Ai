import { BotMessageSquare, LifeBuoy, MessagesSquare } from "lucide-react";
import { useState } from "react";

import api from "../../api/client";
import SectionCard from "../../components/ui/SectionCard";

const faqs = [
  "How do I book a table for tonight?",
  "Can you recommend vegetarian dishes under INR 400?",
  "What are the restaurant opening hours?",
  "How do I track my online order?",
];

const SupportPage = () => {
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState([
    {
      from: "bot",
      text: "Hello! I am the Smart Dine AI assistant. Ask me about bookings, menu recommendations, timings, or support.",
    },
  ]);

  const askChatbot = async (input) => {
    if (!input.trim()) {
      return;
    }

    setConversation((current) => [...current, { from: "user", text: input }]);
    setMessage("");

    try {
      const response = await api.post("/ai/chatbot", { message: input });
      setConversation((current) => [...current, { from: "bot", text: response.data.reply }]);
    } catch (error) {
      setConversation((current) => [...current, { from: "bot", text: "The support bot is unavailable right now. Please try again shortly." }]);
    }
  };

  return (
    <section className="px-6 py-12 md:px-10 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex rounded-full border border-brand-100 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-600 shadow-sm">
            AI Support
          </div>
          <h1 className="font-display text-4xl font-bold text-stone-900 md:text-5xl">Customer Support Assistant</h1>
          <p className="mx-auto mt-4 max-w-3xl text-stone-600">
            A built-in support assistant for guest questions, menu discovery, booking help, and service guidance.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <SectionCard title="Support Highlights" subtitle="A few reasons this assistant fits naturally into a restaurant web product.">
            <div className="space-y-4">
              {[
                {
                  icon: BotMessageSquare,
                  title: "Smart Responses",
                  text: "The chatbot answers common guest questions about food, bookings, timings, and recommendations.",
                },
                {
                  icon: LifeBuoy,
                  title: "Always Available",
                  text: "Guests can get instant support from the website without waiting for manual assistance.",
                },
                {
                  icon: MessagesSquare,
                  title: "Client Ready",
                  text: "The interaction stays short, clear, and useful enough to feel like a real guest support layer.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-3xl border border-slate-200 p-5">
                  <item.icon className="h-6 w-6 text-brand-600" />
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-500">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              {faqs.map((faq) => (
                <button
                  key={faq}
                  type="button"
                  onClick={() => askChatbot(faq)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
                >
                  {faq}
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Live Chatbot" subtitle="Try a few sample messages to see how guest support feels in the product.">
            <div className="rounded-[28px] border border-brand-100 bg-[#fff7f0] p-4">
              <div className="mb-4 h-[420px] space-y-3 overflow-y-auto pr-2">
                {conversation.map((entry, index) => (
                  <div key={`${entry.from}-${index}`} className={`flex ${entry.from === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                        entry.from === "user"
                          ? "bg-brand-600 text-white"
                          : "border border-brand-100 bg-white text-stone-700"
                      }`}
                    >
                      {entry.text}
                    </div>
                  </div>
                ))}
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  askChatbot(message);
                }}
                className="flex gap-3"
              >
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="input-shell flex-1"
                  placeholder="Ask about menu, booking, timings, or recommendations..."
                />
                <button type="submit" className="btn-primary px-5">
                  Send
                </button>
              </form>
            </div>
          </SectionCard>
        </div>
      </div>
    </section>
  );
};

export default SupportPage;
