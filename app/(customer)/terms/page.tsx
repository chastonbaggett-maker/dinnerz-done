import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Terms and Conditions · Dinnerz Done",
  description: "Terms and conditions for Dinnerz Done meal ordering.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6 pb-36">
      <article className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Terms and Conditions</h1>
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            By using Dinnerz Done and placing an order, you agree that meal orders are subject to
            menu availability, published cutoff times, and delivery windows selected at checkout.
          </p>
          <p>
            Prices, menu items, and delivery areas may change. Orders are generally non-refundable
            once prepared or out for delivery except where required by law or at our discretion for
            service issues.
          </p>
          <p>
            You are responsible for accurate delivery information and being available during your
            selected delivery window. We may update these terms as the service evolves; continued
            use after changes means you accept the updated terms.
          </p>
        </div>
        <Button variant="outline" render={<Link href="/" />} nativeButton={false}>
          Back to home
        </Button>
      </article>
    </div>
  );
}
