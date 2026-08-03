import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Privacy Policy · Dinnerz Done",
  description: "Privacy policy for Dinnerz Done meal ordering.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6 pb-36">
      <article className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Privacy Policy</h1>
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            Dinnerz Done collects account information (such as email via our sign-in provider),
            order details, delivery addresses, and payment metadata needed to fulfill your meals.
          </p>
          <p>
            Payment card data is handled by our payment processor — we do not store full card
            numbers on our servers. Push notification preferences and optional device subscriptions
            are stored to deliver alerts you opt into.
          </p>
          <p>
            We do not sell your personal information. We may update this notice as the product
            changes. Contact us through the app if you have privacy questions.
          </p>
        </div>
        <Button variant="outline" render={<Link href="/" />} nativeButton={false}>
          Back to home
        </Button>
      </article>
    </div>
  );
}
