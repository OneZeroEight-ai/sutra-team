"use client";

import { useState } from "react";

interface CostModel {
  pricing: Record<string, number>;
  estimated_costs_per_session: Record<
    string,
    { min: number; max: number; note?: string }
  >;
  margin_analysis: Record<
    string,
    { revenue: number; margin: number; [key: string]: any }
  >;
  alert_thresholds: Record<string, number>;
}

export default function CostDashboard() {
  const [costModel, setCostModel] = useState<CostModel | null>(null);
  const [error, setError] = useState<string>("");
  const [adminKey, setAdminKey] = useState("");
  const [loaded, setLoaded] = useState(false);

  const loadCosts = async () => {
    try {
      const res = await fetch("/api/costs", {
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      if (!res.ok) throw new Error("Unauthorized — check admin key");
      const data = await res.json();
      setCostModel(data);
      setLoaded(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatCurrency = (n: number) => `$${n.toFixed(2)}`;
  const formatSmallCurrency = (n: number) => `$${n.toFixed(4)}`;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-2">Sutra.team Cost Dashboard</h1>
      <p className="text-white/60 mb-8">
        Internal provisioning cost tracking and margin analysis
      </p>

      {!loaded && (
        <div className="max-w-md">
          <label className="block text-sm text-white/60 mb-2">
            Admin API Key
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="flex-1 bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
              placeholder="Enter admin key"
            />
            <button
              onClick={loadCosts}
              className="bg-white text-black px-4 py-2 rounded font-medium hover:bg-white/90"
            >
              Load
            </button>
          </div>
          {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
        </div>
      )}

      {costModel && (
        <div className="space-y-8">
          {/* Service Pricing */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-white/80">
              Service Pricing
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(costModel.pricing).map(([key, value]) => (
                <div
                  key={key}
                  className="bg-white/5 border border-white/10 rounded-lg p-4"
                >
                  <p className="text-sm text-white/50 font-mono">{key}</p>
                  <p className="text-2xl font-bold mt-1">
                    {formatSmallCurrency(value)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Per-Session Costs */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-white/80">
              Estimated Cost Per Session
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-2 text-white/60">Session Type</th>
                    <th className="py-2 text-white/60">Min Cost</th>
                    <th className="py-2 text-white/60">Max Cost</th>
                    <th className="py-2 text-white/60">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(costModel.estimated_costs_per_session).map(
                    ([key, val]) => (
                      <tr key={key} className="border-b border-white/5">
                        <td className="py-2 font-mono text-sm">{key}</td>
                        <td className="py-2">{formatCurrency(val.min)}</td>
                        <td className="py-2">{formatCurrency(val.max)}</td>
                        <td className="py-2 text-white/40 text-sm">
                          {val.note || ""}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Margin Analysis */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-white/80">
              Margin Analysis by Tier
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(costModel.margin_analysis).map(([tier, data]) => (
                <div
                  key={tier}
                  className={`border rounded-lg p-4 ${
                    data.margin < 0
                      ? "bg-red-500/10 border-red-500/30"
                      : data.margin < 10
                        ? "bg-yellow-500/10 border-yellow-500/30"
                        : "bg-green-500/10 border-green-500/30"
                  }`}
                >
                  <p className="text-sm text-white/50 uppercase font-mono">
                    {tier}
                  </p>
                  <div className="flex justify-between mt-2">
                    <span className="text-white/60">Revenue</span>
                    <span className="font-bold">
                      {formatCurrency(data.revenue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Margin</span>
                    <span
                      className={`font-bold ${
                        data.margin < 0
                          ? "text-red-400"
                          : data.margin < 10
                            ? "text-yellow-400"
                            : "text-green-400"
                      }`}
                    >
                      {formatCurrency(data.margin)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Alert Thresholds */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-white/80">
              Alert Thresholds
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(costModel.alert_thresholds).map(
                ([key, value]) => (
                  <div
                    key={key}
                    className="bg-white/5 border border-white/10 rounded-lg p-4"
                  >
                    <p className="text-sm text-white/50 font-mono">{key}</p>
                    <p className="text-2xl font-bold mt-1 text-amber-400">
                      {formatCurrency(value)}
                    </p>
                  </div>
                ),
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
