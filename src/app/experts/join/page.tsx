"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EXPERT_CATEGORIES } from "@/lib/types";
import type { ExpertCategory } from "@/lib/types";

const HOW_IT_WORKS = [
  {
    step: 1,
    title: "AI Does the Heavy Lifting",
    description:
      "When a client books a session with you, our AI council has already analyzed their question from 14 different perspectives — legal, financial, technical, market, risk, growth, and 8 principled viewpoints. You receive the full analysis packet before the session. You arrive informed, not cold.",
  },
  {
    step: 2,
    title: "You Validate and Advise",
    description:
      "Join a 30-minute video session with the client. The AI did the research. You bring the judgment, experience, and professional credibility that AI cannot. You're not educating from scratch. You're validating, course-correcting, and adding the human insight that makes the difference.",
  },
  {
    step: 3,
    title: "Get Paid on Your Terms",
    description:
      "Set your own rate for 30-minute sessions. We handle billing, scheduling, and client acquisition. You get paid per session. No monthly commitments. Consult when it fits your schedule.",
  },
];

const WHY_JOIN = [
  {
    title: "Clients arrive prepared.",
    description:
      "The AI council pre-analyzes every question. No more spending the first 15 minutes understanding the problem.",
  },
  {
    title: "Set your own rate.",
    description:
      "You decide what your expertise is worth. We suggest ranges by category but you set the final number.",
  },
  {
    title: "No client acquisition.",
    description: "We bring the clients. You bring the expertise.",
  },
  {
    title: "Flexible schedule.",
    description:
      "Accept sessions when available. Decline when you're not. No quotas.",
  },
  {
    title: "Build your reputation.",
    description:
      "Your expert card is visible on the platform. Great sessions lead to more bookings.",
  },
];

const AVAILABILITY_OPTIONS = [
  { value: "weekday_mornings", label: "Weekday mornings" },
  { value: "weekday_afternoons", label: "Weekday afternoons" },
  { value: "weekday_evenings", label: "Weekday evenings" },
  { value: "weekends", label: "Weekends" },
];

const categoryEntries = Object.entries(EXPERT_CATEGORIES) as [
  ExpertCategory,
  { name: string; description: string },
][];

export default function ExpertJoinPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    linkedin: "",
    category: "",
    credentials: "",
    experience: "",
    rate: "",
    bio: "",
    whyJoin: "",
    availability: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Earnings calculator
  const [sessionsPerWeek, setSessionsPerWeek] = useState(4);
  const [calcRate, setCalcRate] = useState(60);
  const monthlyEarnings = sessionsPerWeek * calcRate * 4;

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleAvailability(value: string) {
    setForm((prev) => ({
      ...prev,
      availability: prev.availability.includes(value)
        ? prev.availability.filter((v) => v !== value)
        : [...prev.availability, value],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch("/api/experts/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ success: false, message: data.error || "Submission failed" });
      } else {
        setResult({ success: true, message: data.message });
      }
    } catch {
      setResult({ success: false, message: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-sutra-text">
            Join the Sutra Expert Network
          </h1>
          <p className="mt-6 text-lg text-sutra-muted max-w-2xl mx-auto">
            Get paid for 30-minute consultations — with AI that does the prep
            work for you.
          </p>
          <div className="mt-8">
            <Button
              variant="primary"
              href="#apply"
              className="text-base px-8 py-3"
            >
              Apply Now
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 border-t border-sutra-border">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-sutra-text text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((item) => (
              <Card key={item.step}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-sutra-accent text-white text-sm font-bold shrink-0">
                    {item.step}
                  </span>
                  <h3 className="text-base font-semibold text-sutra-text">
                    {item.title}
                  </h3>
                </div>
                <p className="text-sm text-sutra-muted leading-relaxed">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Experts Join */}
      <section className="py-16 border-t border-sutra-border bg-sutra-surface/30">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-sutra-text text-center mb-12">
            Why Experts Join
          </h2>
          <div className="space-y-4">
            {WHY_JOIN.map((item) => (
              <Card key={item.title}>
                <h3 className="text-sm font-semibold text-sutra-text">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-sutra-muted">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 border-t border-sutra-border">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-sutra-text text-center mb-4">
            Expert Categories
          </h2>
          <p className="text-center text-sutra-muted mb-12">
            We're recruiting across 14 professional categories
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryEntries.map(([key, cat]) => (
              <Card key={key} hover>
                <h3 className="text-sm font-semibold text-sutra-text">
                  {cat.name}
                </h3>
                <p className="mt-1 text-xs text-sutra-muted">
                  {cat.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Earnings Calculator */}
      <section className="py-16 border-t border-sutra-border bg-sutra-surface/30">
        <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-sutra-text text-center mb-4">
            What Could You Earn?
          </h2>
          <p className="text-center text-sutra-muted mb-8 text-sm">
            Most experts do 2-6 sessions per week alongside their primary
            practice.
          </p>
          <Card>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-sutra-text mb-2">
                  Sessions per week: {sessionsPerWeek}
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={sessionsPerWeek}
                  onChange={(e) => setSessionsPerWeek(Number(e.target.value))}
                  className="w-full accent-[#a78bfa]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-sutra-text mb-2">
                  Your rate per session: ${calcRate}
                </label>
                <input
                  type="range"
                  min={30}
                  max={200}
                  step={5}
                  value={calcRate}
                  onChange={(e) => setCalcRate(Number(e.target.value))}
                  className="w-full accent-[#a78bfa]"
                />
              </div>
              <div className="text-center pt-4 border-t border-sutra-border">
                <p className="text-sm text-sutra-muted">
                  Estimated monthly earnings
                </p>
                <p className="text-4xl font-bold text-sutra-accent mt-1">
                  ${monthlyEarnings.toLocaleString()}
                </p>
                <p className="text-xs text-sutra-muted mt-2">
                  {sessionsPerWeek} sessions/week &times; ${calcRate}/session
                  &times; 4 weeks ={" "}
                  {Math.round((sessionsPerWeek * 30) / 60)} hours/month
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="py-16 border-t border-sutra-border">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-sutra-text text-center mb-4">
            Apply to Join
          </h2>
          <p className="text-center text-sutra-muted mb-8 text-sm">
            We review every application and respond within 48 hours.
          </p>

          {result?.success ? (
            <Card>
              <div className="text-center py-8">
                <p className="text-lg font-semibold text-sutra-accent">
                  Application Submitted
                </p>
                <p className="text-sm text-sutra-muted mt-2">
                  {result.message}
                </p>
              </div>
            </Card>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-sutra-text mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="w-full rounded-lg border border-sutra-border bg-sutra-surface px-3 py-2 text-sm text-sutra-text placeholder:text-sutra-muted/50 focus:border-sutra-accent focus:outline-none"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-sutra-text mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full rounded-lg border border-sutra-border bg-sutra-surface px-3 py-2 text-sm text-sutra-text placeholder:text-sutra-muted/50 focus:border-sutra-accent focus:outline-none"
                />
              </div>

              {/* LinkedIn */}
              <div>
                <label className="block text-sm font-medium text-sutra-text mb-1">
                  LinkedIn Profile URL *
                </label>
                <input
                  type="url"
                  required
                  value={form.linkedin}
                  onChange={(e) => updateField("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full rounded-lg border border-sutra-border bg-sutra-surface px-3 py-2 text-sm text-sutra-text placeholder:text-sutra-muted/50 focus:border-sutra-accent focus:outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-sutra-text mb-1">
                  Professional Category *
                </label>
                <select
                  required
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  className="w-full rounded-lg border border-sutra-border bg-sutra-surface px-3 py-2 text-sm text-sutra-text focus:border-sutra-accent focus:outline-none"
                >
                  <option value="">Select category...</option>
                  {categoryEntries.map(([key, cat]) => (
                    <option key={key} value={key}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Credentials */}
              <div>
                <label className="block text-sm font-medium text-sutra-text mb-1">
                  Credentials / Licenses *
                </label>
                <input
                  type="text"
                  required
                  value={form.credentials}
                  onChange={(e) => updateField("credentials", e.target.value)}
                  placeholder='e.g., "CPA, California" or "JD, admitted NY bar"'
                  className="w-full rounded-lg border border-sutra-border bg-sutra-surface px-3 py-2 text-sm text-sutra-text placeholder:text-sutra-muted/50 focus:border-sutra-accent focus:outline-none"
                />
              </div>

              {/* Years of Experience */}
              <div>
                <label className="block text-sm font-medium text-sutra-text mb-1">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={form.experience}
                  onChange={(e) => updateField("experience", e.target.value)}
                  className="w-full rounded-lg border border-sutra-border bg-sutra-surface px-3 py-2 text-sm text-sutra-text placeholder:text-sutra-muted/50 focus:border-sutra-accent focus:outline-none"
                />
              </div>

              {/* Rate */}
              <div>
                <label className="block text-sm font-medium text-sutra-text mb-1">
                  Preferred Rate for 30-Min Session ($) *
                </label>
                <input
                  type="number"
                  required
                  min={20}
                  value={form.rate}
                  onChange={(e) => updateField("rate", e.target.value)}
                  placeholder="e.g., 60"
                  className="w-full rounded-lg border border-sutra-border bg-sutra-surface px-3 py-2 text-sm text-sutra-text placeholder:text-sutra-muted/50 focus:border-sutra-accent focus:outline-none"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-sutra-text mb-1">
                  Brief Bio (150 words max) *
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.bio}
                  onChange={(e) => updateField("bio", e.target.value)}
                  placeholder="This becomes your expert card description..."
                  className="w-full rounded-lg border border-sutra-border bg-sutra-surface px-3 py-2 text-sm text-sutra-text placeholder:text-sutra-muted/50 focus:border-sutra-accent focus:outline-none resize-none"
                />
              </div>

              {/* Why Join (optional) */}
              <div>
                <label className="block text-sm font-medium text-sutra-text mb-1">
                  Why do you want to join? (optional)
                </label>
                <textarea
                  rows={2}
                  value={form.whyJoin}
                  onChange={(e) => updateField("whyJoin", e.target.value)}
                  className="w-full rounded-lg border border-sutra-border bg-sutra-surface px-3 py-2 text-sm text-sutra-text placeholder:text-sutra-muted/50 focus:border-sutra-accent focus:outline-none resize-none"
                />
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium text-sutra-text mb-2">
                  Availability
                </label>
                <div className="flex flex-wrap gap-3">
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={form.availability.includes(opt.value)}
                        onChange={() => toggleAvailability(opt.value)}
                        className="rounded border-sutra-border accent-[#a78bfa]"
                      />
                      <span className="text-sm text-sutra-muted">
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {result && !result.success && (
                <p className="text-sm text-red-400">{result.message}</p>
              )}

              <Button
                variant="primary"
                className="w-full py-3"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
