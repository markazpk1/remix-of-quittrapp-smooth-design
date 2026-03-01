import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How does the free trial work?",
    a: "You get full access to all Pro features for 14 days. No credit card required. After the trial, you can downgrade to Starter or upgrade to Pro.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes, you can cancel your subscription at any time. You'll keep access until the end of your billing period.",
  },
  {
    q: "Do you offer refunds?",
    a: "We offer a 30-day money-back guarantee. If you're not satisfied, contact support for a full refund.",
  },
  {
    q: "What integrations do you support?",
    a: "We integrate with 50+ tools including GitHub, Slack, Notion, Jira, Linear, Figma, and more. We also offer a REST API and webhooks.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. We're SOC 2 Type II certified, use end-to-end encryption, and all data is stored in encrypted databases with daily backups.",
  },
  {
    q: "Do you offer custom enterprise plans?",
    a: "Yes! Contact our sales team for custom pricing, SLAs, SSO/SAML, and dedicated support options.",
  },
];

export default function FAQ() {
  return (
    <section className="py-24" id="faq">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-scroll-in">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Frequently asked <span className="text-gradient-purple">questions</span>
          </h2>
        </div>

        <div className="max-w-2xl mx-auto animate-scroll-in">
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="glass-card px-6 border-border/30 rounded-xl overflow-hidden"
              >
                <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
