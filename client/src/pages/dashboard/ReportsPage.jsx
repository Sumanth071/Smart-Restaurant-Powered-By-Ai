import { useEffect, useState } from "react";

import api from "../../api/client";
import BusyHourChart from "../../components/charts/BusyHourChart";
import DonutStatusChart from "../../components/charts/DonutStatusChart";
import LineSalesChart from "../../components/charts/LineSalesChart";
import PageHeader from "../../components/layout/PageHeader";
import SectionCard from "../../components/ui/SectionCard";
import StatCard from "../../components/ui/StatCard";
import LoadingScreen from "../../components/ui/LoadingScreen";

const ReportsPage = () => {
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReport = async () => {
      try {
        const response = await api.get("/reports/overview");
        setReport(response.data);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Unable to load reports.");
      }
    };

    loadReport();
  }, []);

  if (!report && !error) {
    return <LoadingScreen label="Generating reports and analytics..." />;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Reports"
        title="Reports and Analytics"
        description="A polished reporting surface for revenue, category mix, top restaurants, and busy-hour intelligence."
      />

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>
      ) : null}

      {report ? (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {report.cards.map((card) => (
              <StatCard key={card.title} title={card.title} value={card.value} subtitle={card.subtitle} />
            ))}
          </div>

          <div className="mb-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <SectionCard title="Revenue Performance" subtitle="Seven-day revenue and order activity trend.">
              <LineSalesChart data={report.salesTrend} />
            </SectionCard>
            <SectionCard title="Category Mix" subtitle="How the menu is distributed across key categories.">
              <DonutStatusChart data={report.categoryMix} />
            </SectionCard>
          </div>

          <div className="mb-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <SectionCard title="Busy Hour Heat" subtitle="AI-ready peak demand signal for operational planning.">
              <BusyHourChart data={report.busyHours} />
            </SectionCard>
            <SectionCard title="Narrative Summary" subtitle="Short insights you can present during the final-year project demo.">
              <div className="space-y-4">
                {report.narrative.map((line) => (
                  <div key={line} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    {line}
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
            <SectionCard title="Top Restaurants" subtitle="Revenue and booking performance by branch.">
              <div className="space-y-4">
                {report.topRestaurants.map((restaurant, index) => (
                  <div key={restaurant.name} className="flex items-center justify-between rounded-3xl border border-slate-200 p-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Branch #{index + 1}</p>
                      <p className="mt-1 font-semibold text-slate-900">{restaurant.name}</p>
                      <p className="text-sm text-slate-500">
                        {restaurant.bookings} bookings · Rating {restaurant.rating}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-amber-600">INR {restaurant.revenue.toLocaleString("en-IN")}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Top Items" subtitle="Best dishes to highlight in promotion banners.">
              <div className="space-y-4">
                {report.topItems.map((item, index) => (
                  <div key={item.name} className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Item #{index + 1}</p>
                    <p className="mt-1 font-semibold text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-500">{item.orders} portions ordered</p>
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

export default ReportsPage;
