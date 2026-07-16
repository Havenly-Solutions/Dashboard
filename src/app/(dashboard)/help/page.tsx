"use client";

import { useState } from "react";
import { HelpCircle, Mail, MessageSquare, ExternalLink, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Tile } from "@/components/ui/tile";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export default function HelpPage() {
  const { push } = useToast();
  const [loading, setLoading] = useState(false);

  const faqs = [
    { q: "How do I reset my password?", a: "You can reset your password from the Settings -> Security page, or by clicking 'Forgot Password' on the login screen." },
    { q: "What should I do if an SOS event is stale?", a: "Stale SOS events are automatically archived after 2 hours. If you need to manually resolve one, use the SOS Command Center." },
    { q: "How do I invite a new team member?", a: "Only Founders can invite new team members via the Team & Approvals page." },
    { q: "Where can I find my department's media assets?", a: "Media assets are located in the Media Portal -> Assets tab, filtered by your department by default." }
  ];

  const handleContact = () => {
    window.location.href = "mailto:Helpdesk@havenly.solutions";
  };

  const handleCreateTicket = () => {
    setLoading(true);
    // Mocking ticket creation for now as we'd need a hook
    setTimeout(() => {
      setLoading(false);
      push("Support ticket request sent. Our team will contact you via email.");
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Help & Support"
        description="Get assistance, read FAQs, or contact the Havenly solutions helpdesk."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Tile className="p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-secondary" />
          </div>
          <h3 className="text-display-xs font-bold text-on-surface mb-2">Email Support</h3>
          <p className="text-body-sm text-on-surface-variant mb-6">
            Lodge a ticket via email directly to our support team for complex technical issues.
          </p>
          <Button variant="outline" size="lg" onClick={handleContact} className="w-full">
            Contact Helpdesk
          </Button>
        </Tile>

        <Tile className="p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-display-xs font-bold text-on-surface mb-2">Internal Ticket</h3>
          <p className="text-body-sm text-on-surface-variant mb-6">
            Raise an internal priority ticket. We usually respond within 24 hours.
          </p>
          <Button size="lg" onClick={handleCreateTicket} loading={loading} className="w-full text-black">
            Open Support Ticket
          </Button>
        </Tile>
      </div>

      <h2 className="text-display-xs font-bold text-on-surface mb-4">Frequently Asked Questions</h2>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <Tile key={i} className="p-5">
            <details className="group">
              <summary className="list-none cursor-pointer flex items-center justify-between font-medium text-on-surface">
                {faq.q}
                <ChevronRight className="h-5 w-5 text-on-surface-variant group-open:rotate-90 transition-transform" />
              </summary>
              <p className="mt-3 text-body-sm text-on-surface-variant leading-relaxed">
                {faq.a}
              </p>
            </details>
          </Tile>
        ))}
      </div>

      <div className="mt-12 p-8 rounded-2xl bg-surface-container-high border border-outline-variant flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-display-xs font-bold text-on-surface mb-2">System Documentation</h3>
          <p className="text-body-sm text-on-surface-variant">
            Explore our comprehensive guides on mesh node maintenance, responder protocols, and portal management.
          </p>
        </div>
        <Button variant="ghost" className="shrink-0 gap-2">
          Read Docs <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
