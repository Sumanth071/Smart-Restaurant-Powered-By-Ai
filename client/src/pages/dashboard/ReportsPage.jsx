import { Download, FileText, Printer } from "lucide-react";

import BusyHourChart from "../../components/charts/BusyHourChart";
import DonutStatusChart from "../../components/charts/DonutStatusChart";
import LineSalesChart from "../../components/charts/LineSalesChart";
import PageHeader from "../../components/layout/PageHeader";
import SectionCard from "../../components/ui/SectionCard";
import StatCard from "../../components/ui/StatCard";
import LoadingScreen from "../../components/ui/LoadingScreen";
import { useApiQuery } from "../../context/QueryClientContext";
import { useToast } from "../../context/ToastContext";
import { downloadCsv, openPrintWindow } from "../../utils/helpers";

const ReportsPage = () => {
  const { pushToast } = useToast();
  const { data: report, error, isLoading } = useApiQuery({
    queryKey: ["reports-overview"],
    url: "/reports/overview",
    staleTime: 45000,
  });

  const exportCsv = () => {
    if (!report) {
      return;
    }

    downloadCsv("smart-restaurant-report.csv", [
      ["Card", "Value", "Subtitle"],
      ...report.cards.map((card) => [card.title, card.value, card.subtitle]),
      [],
      ["Top Restaurant", "Revenue", "Bookings", "Rating"],
      ...report.topRestaurants.map((restaurant) => [restaurant.name, restaurant.revenue, restaurant.bookings, restaurant.rating]),
      [],
      ["Top Item", "Orders", "Revenue"],
      ...report.topItems.map((item) => [item.name, item.orders, item.revenue]),
    ]);

    pushToast({
      tone: "success",
      title: "CSV exported",
      message: "The current report snapshot has been downloaded.",
    });
  };

  const exportPdf = () => {
    if (!report) {
      return;
    }

    openPrintWindow({
      title: "Smart Restaurant Performance Report",
      sections: [
        `<p>${report.narrative.join(" ")}</p>`,
        `<h2>Summary Cards</h2>
         <table>
           <thead><tr><th>Card</th><th>Value</th><th>Subtitle</th></tr></thead>
           <tbody>
             ${report.cards.map((card) => `<tr><td>${card.title}</td><td>${card.value}</td><td>${card.subtitle}</td></tr>`).join("")}
           </tbody>
         </table>`,
        `<h2>Top Restaurants</h2>
         <table>
           <thead><tr><th>Branch</th><th>Revenue</th><th>Bookings</th><th>Rating</th></tr></thead>
           <tbody>
             ${report.topRestaurants
               .map((restaurant) => `<tr><td>${restaurant.name}</td><td>${restaurant.revenue}</td><td>${restaurant.bookings}</td><td>${restaurant.rating}</td></tr>`)
               .join("")}
           </tbody>
         </table>`,
        `<h2>Top Items</h2>
         <table>
           <thead><tr><th>Dish</th><th>Orders</th><th>Revenue</th></tr></thead>
           <tbody>
             ${report.topItems.map((item) => `<tr><td>${item.name}</td><td>${item.orders}</td><td>${item.revenue}</td></tr>`).join("")}
           </tbody>
         </table>`,
      ],
    });

    pushToast({
      tone: "success",
      title: "PDF view opened",
      message: "Use the print dialog to save the report as PDF.",
    });
  };

  if (isLoading && !report) {
    return <LoadingScreen label="Generating reports and analytics..." />;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Reports"
        title="Performance Reporting"
        description="Track revenue, branch output, menu movement, and service pressure from a reporting workspace that feels operational instead of academic."
        action={
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={exportCsv} className="btn-secondary">
              <Download className="mr-2 h-4 w-4" />
              CSV
            </button>
            <button type="button" onClick={exportPdf} className="btn-primary">
              <Printer className="mr-2 h-4 w-4" />
              PDF
            </button>
          </div>
        }
      />

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>
      ) : null}

      {report ? (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {report.cards.map((card) => (
              <StatCard key={card.title} title={card.title} value={card.value} subtitle={card.subtitle} icon={FileText} />
            ))}
          </div>

          <div className="mb-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <SectionCard title="Revenue Performance" subtitle="Seven-day revenue and order activity trend.">
              <LineSalesChart data={report.salesTrend} />
            </SectionCard>
            <SectionCard title="Category Mix" subtitle="See where demand is landing across the menu so merchandising and prep stay aligned.">
              <DonutStatusChart data={report.categoryMix} />
            </SectionCard>
          </div>

          <div className="mb-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <SectionCard title="Busy Hour Heat" subtitle="Peak demand signals to support staffing, prep, and table turnover decisions.">
              <BusyHourChart data={report.busyHours} />
            </SectionCard>
            <SectionCard title="Narrative Summary" subtitle="Plain-language observations a manager can present in seconds during review.">
              <div className="space-y-4">
                {report.narrative.map((line) => (
                  <div key={line} className="rounded-[24px] border border-stone-200 bg-stone-50 p-4 text-sm leading-6 text-stone-600">
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
                        {restaurant.bookings} bookings - Rating {restaurant.rating}
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
