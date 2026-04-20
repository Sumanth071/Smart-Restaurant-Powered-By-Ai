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
          <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">
            AI Support
          </div>
          <h1 className="font-display text-4xl font-bold text-white md:text-5xl">Customer Support Chatbot</h1>
          <p className="mx-auto mt-4 max-w-3xl text-slate-300">
            An AI-powered demo chatbot for restaurant support, food discovery, and booking help.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <SectionCard title="Support Highlights" subtitle="A few polished talking points for your project presentation.">
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
                  title: "Presentation Friendly",
                  text: "The module is simple enough for a college demo while still feeling modern and practical.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-3xl border border-slate-200 p-5">
                  <item.icon className="h-6 w-6 text-amber-500" />
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
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-amber-300 hover:text-amber-600"
                >
                  {faq}
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Live Chatbot" subtitle="Try a few sample messages to demonstrate the AI support flow.">
            <div className="rounded-[28px] bg-slate-950 p-4">
              <div className="mb-4 h-[420px] space-y-3 overflow-y-auto pr-2">
                {conversation.map((entry, index) => (
                  <div key={`${entry.from}-${index}`} className={`flex ${entry.from === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                        entry.from === "user" ? "bg-amber-500 text-white" : "bg-white/10 text-slate-100"
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
