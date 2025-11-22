"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, Building2, Users, Sparkles, Shield } from "lucide-react";

export default function PricingPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const pricingTiers = [
    {
      id: "individual",
      name: "Individual",
      icon: Users,
      tagline: "For personal use",
      price: { monthly: 0, annual: 0 },
      description: "Perfect for individual investors and personal finance tracking",
      features: [
        "Portfolio Tracker - Real-time stock prices",
        "Basic Document Analysis - Up to 10 docs/month",
        "Market Data & Alerts",
        "Personal Dashboard",
        "Mobile Access",
        "Email Support",
      ],
      limitations: [
        "10 documents/month limit",
        "Single user only",
        "Basic AI features",
      ],
      cta: "Get Started Free",
      popular: false,
      color: "blue",
    },
    {
      id: "professional",
      name: "Professional",
      icon: Building2,
      tagline: "For small teams",
      price: { monthly: 79, annual: 790 },
      description: "Ideal for small financial firms and growing teams",
      features: [
        "Everything in Individual, plus:",
        "Team Collaboration - Up to 5 users",
        "Advanced Document Analysis - 100 docs/month",
        "All AI Tools (Fraud Detection, Semantic Search)",
        "Predictive Analytics & Forecasting",
        "Compliance & Governance Tools",
        "Priority Email Support",
        "Custom Alerts & Workflows",
      ],
      cta: "Start 14-Day Trial",
      popular: true,
      color: "indigo",
    },
    {
      id: "business",
      name: "Business",
      icon: Building2,
      tagline: "For growing companies",
      price: { monthly: 399, annual: 3990 },
      description: "Complete solution for mid-size financial operations",
      features: [
        "Everything in Professional, plus:",
        "Unlimited Team Members",
        "Unlimited Document Analysis",
        "Custom AI Agent Workflows",
        "Advanced Security & SSO",
        "API Access & Integrations",
        "Dedicated Account Manager",
        "Priority Phone & Chat Support",
        "Custom Reporting & Analytics",
        "Audit Trails & Compliance Exports",
      ],
      cta: "Start 14-Day Trial",
      popular: false,
      color: "purple",
    },
    {
      id: "enterprise",
      name: "Enterprise",
      icon: Sparkles,
      tagline: "For large organizations",
      price: { monthly: null, annual: null },
      description: "Tailored solutions for enterprise financial operations",
      features: [
        "Everything in Business, plus:",
        "Custom Deployment (Cloud/On-Premise)",
        "Unlimited Everything",
        "White-Label Options",
        "Custom AI Model Training",
        "Dedicated Infrastructure",
        "24/7 Premium Support",
        "SLA Guarantees (99.9% uptime)",
        "Custom Integrations & Development",
        "On-site Training & Onboarding",
        "HIPAA/SOC2 Compliance Certification",
      ],
      cta: "Contact Sales",
      popular: false,
      color: "pink",
    },
  ];

  const getPrice = (tier: typeof pricingTiers[0]) => {
    if (tier.price.monthly === null) return "Custom";
    if (tier.price.monthly === 0) return "Free";
    const price = billingCycle === "monthly" ? tier.price.monthly : tier.price.annual;
    return billingCycle === "monthly"
      ? `$${price}/mo`
      : `$${price}/yr`;
  };

  const getSavings = (tier: typeof pricingTiers[0]) => {
    if (tier.price.monthly === null || tier.price.monthly === 0) return null;
    const monthlyCost = tier.price.monthly * 12;
    const annualCost = tier.price.annual;
    const savings = monthlyCost - annualCost;
    return Math.round((savings / monthlyCost) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-indigo-600" />
            <div>
              <h1 className="text-xl font-bold">FinSight X</h1>
              <p className="text-xs text-muted-foreground">AI Financial Guardian</p>
            </div>
          </div>
          <Button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
            B2B Financial Intelligence Platform
          </Badge>
          <h1 className="text-5xl font-bold mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Start free, scale as you grow. Built for financial professionals and teams.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className={billingCycle === "monthly" ? "font-semibold" : "text-muted-foreground"}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                billingCycle === "annual" ? "bg-indigo-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  billingCycle === "annual" ? "translate-x-7" : ""
                }`}
              />
            </button>
            <span className={billingCycle === "annual" ? "font-semibold" : "text-muted-foreground"}>
              Annual
            </span>
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              Save up to 17%
            </Badge>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {pricingTiers.map((tier) => {
            const Icon = tier.icon;
            const savings = getSavings(tier);

            return (
              <Card
                key={tier.id}
                className={`relative ${
                  tier.popular
                    ? "border-2 border-indigo-500 shadow-xl scale-105"
                    : "border-2 hover:border-gray-300"
                } transition-all`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-indigo-600 text-white px-4 py-1">
                      MOST POPULAR
                    </Badge>
                  </div>
                )}

                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-${tier.color}-500 to-${tier.color}-600 flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{tier.tagline}</p>

                  <div className="mt-4">
                    <div className="text-4xl font-bold">
                      {getPrice(tier)}
                    </div>
                    {billingCycle === "annual" && savings && (
                      <Badge variant="secondary" className="mt-2 bg-green-100 text-green-700">
                        Save {savings}%
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{tier.description}</p>

                  <Button
                    className={`w-full ${
                      tier.popular
                        ? "bg-indigo-600 hover:bg-indigo-700"
                        : ""
                    }`}
                    variant={tier.popular ? "default" : "outline"}
                    onClick={() => {
                      if (tier.id === "individual") {
                        router.push("/dashboard");
                      } else if (tier.id === "enterprise") {
                        router.push("/contact-sales");
                      } else {
                        router.push("/signup?tier=" + tier.id);
                      }
                    }}
                  >
                    {tier.cta} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  <div className="space-y-3 pt-4 border-t">
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Feature Comparison */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">Feature Comparison</h2>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Features</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Individual</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Professional</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Business</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="px-6 py-4 text-sm">Portfolio Tracker</td>
                    <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm">Documents/Month</td>
                    <td className="px-6 py-4 text-center text-sm">10</td>
                    <td className="px-6 py-4 text-center text-sm">100</td>
                    <td className="px-6 py-4 text-center text-sm">Unlimited</td>
                    <td className="px-6 py-4 text-center text-sm">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm">Team Members</td>
                    <td className="px-6 py-4 text-center text-sm">1</td>
                    <td className="px-6 py-4 text-center text-sm">5</td>
                    <td className="px-6 py-4 text-center text-sm">Unlimited</td>
                    <td className="px-6 py-4 text-center text-sm">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm">AI Tools</td>
                    <td className="px-6 py-4 text-center text-sm">Basic</td>
                    <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm">API Access</td>
                    <td className="px-6 py-4 text-center">-</td>
                    <td className="px-6 py-4 text-center">-</td>
                    <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm">Support</td>
                    <td className="px-6 py-4 text-center text-sm">Email</td>
                    <td className="px-6 py-4 text-center text-sm">Priority Email</td>
                    <td className="px-6 py-4 text-center text-sm">Phone & Chat</td>
                    <td className="px-6 py-4 text-center text-sm">24/7 Premium</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm">SLA</td>
                    <td className="px-6 py-4 text-center">-</td>
                    <td className="px-6 py-4 text-center">-</td>
                    <td className="px-6 py-4 text-center">-</td>
                    <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Can I change plans later?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Do you offer a free trial?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, Professional and Business tiers include a 14-day free trial. No credit card required to start.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-sm text-muted-foreground">
                We accept all major credit cards, ACH transfers, and wire transfers for annual plans. Enterprise customers can arrange custom payment terms.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Is my data secure?</h3>
              <p className="text-sm text-muted-foreground">
                Absolutely. We use bank-level encryption, SOC 2 compliance, and follow industry best practices for data security. Enterprise customers can opt for on-premise deployment.
              </p>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <Card className="p-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-lg mb-8 opacity-90">
              Join hundreds of financial professionals using FinSight X to streamline their operations
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => router.push("/dashboard")}
              >
                Start Free Trial
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 text-white border-white hover:bg-white/20"
                onClick={() => router.push("/contact-sales")}
              >
                Contact Sales
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
