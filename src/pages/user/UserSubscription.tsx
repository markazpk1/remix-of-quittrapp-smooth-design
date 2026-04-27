import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, CheckCircle, ArrowRight, CreditCard, Shield, Zap, Check } from "lucide-react";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    current: false,
    features: ["Basic lessons (5)", "Community access", "Daily check-in", "1 sound track"],
    missing: ["AI Companion", "All lessons", "Sound library", "Priority support"],
    icon: Star,
    color: "border-border/40",
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "/month",
    current: true,
    features: ["All lessons (100+)", "Full sound library", "AI Companion", "Community access", "Progress analytics", "Priority support"],
    missing: ["Custom plan", "Dedicated coach"],
    icon: Zap,
    color: "border-primary/40 ring-1 ring-primary/20",
  },
  {
    name: "Lifetime",
    price: "$149",
    period: "one-time",
    current: false,
    features: ["Everything in Pro", "Lifetime access", "Custom recovery plan", "1-on-1 coaching session", "Early access features", "Exclusive community"],
    missing: [],
    icon: Crown,
    color: "border-yellow-500/30",
  },
];

const invoices = [
  { date: "Feb 1, 2026", amount: "$9.99", status: "Paid" },
  { date: "Jan 1, 2026", amount: "$9.99", status: "Paid" },
  { date: "Dec 1, 2025", amount: "$9.99", status: "Paid" },
];

export default function UserSubscription() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Subscription</h1>
        <p className="text-sm text-muted-foreground">Manage your plan and billing.</p>
      </div>

      {/* Current Plan Banner */}
      <Card className="bg-gradient-to-r from-primary/10 to-card/60 border-primary/20">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">You're on the <strong>Pro</strong> plan</div>
              <div className="text-xs text-muted-foreground">Next billing: March 1, 2026 · $9.99/month</div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="border-border/30 text-xs text-muted-foreground">Cancel Plan</Button>
        </CardContent>
      </Card>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <Card key={plan.name} className={`bg-card/60 ${plan.color} relative`}>
            {plan.current && (
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground text-[10px]">Current Plan</Badge>
              </div>
            )}
            <CardContent className="p-5 pt-6">
              <div className="flex items-center gap-2 mb-3">
                <plan.icon className={`w-5 h-5 ${plan.name === "Lifetime" ? "text-yellow-400" : "text-primary"}`} />
                <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                <span className="text-sm text-muted-foreground ml-1">{plan.period}</span>
              </div>
              <div className="space-y-2 mb-4">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-3.5 h-3.5 text-green-400 shrink-0" /> {f}
                  </div>
                ))}
                {plan.missing.map((m) => (
                  <div key={m} className="flex items-center gap-2 text-sm text-muted-foreground line-through opacity-50">
                    <Check className="w-3.5 h-3.5 shrink-0" /> {m}
                  </div>
                ))}
              </div>
              {plan.current ? (
                <Button variant="outline" className="w-full border-primary/30 text-primary text-xs" disabled>Current</Button>
              ) : (
                <Button className={`w-full text-xs ${plan.name === "Lifetime" ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white" : "bg-primary text-primary-foreground"}`}>
                  {plan.name === "Free" ? "Downgrade" : "Upgrade"}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Billing History */}
      <Card className="bg-card/60 border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground">Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {invoices.map((inv, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                <span className="text-sm text-foreground">{inv.date}</span>
                <span className="text-sm text-foreground font-medium">{inv.amount}</span>
                <Badge variant="outline" className="text-[10px] bg-green-500/20 text-green-400 border-green-500/30">{inv.status}</Badge>
                <Button variant="ghost" size="sm" className="text-xs text-primary">Download</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
