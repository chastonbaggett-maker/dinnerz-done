"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Snowflake, UtensilsCrossed } from "lucide-react";
import type { DailyMenu } from "@/lib/types";
import { getOrderWindowBadgeState } from "@/lib/dates";
import { OrderWindowBadge } from "@/components/menu/order-window-badge";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MENU_ITEM_IMAGES } from "@/lib/menu-images";

const HOME_HERO_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=90&auto=format&fit=crop";

const FREEZEY_MENU_ITEMS = [
  {
    name: "Chili",
    image: MENU_ITEM_IMAGES["f1000000-0000-4000-8000-000000000001"],
  },
  {
    name: "Soup",
    image: MENU_ITEM_IMAGES["f1000000-0000-4000-8000-000000000002"],
  },
  {
    name: "Pasta bake",
    image: MENU_ITEM_IMAGES["f1000000-0000-4000-8000-000000000003"],
  },
] as const;

const HOW_IT_WORKS = [
  {
    title: "Pick tomorrow's menu",
    description:
      "We publish a fresh dinner menu each day. Browse what's cooking and choose the meals you want.",
  },
  {
    title: "Make it yours",
    description:
      "Customize sides and options when available. Add Freezey Lunches to your delivery for easy meals all week.",
  },
  {
    title: "Order by 8:00 PM",
    description:
      "Place your order the day before delivery, Monday through Thursday. When the window is open, you'll see a countdown on the menu.",
  },
  {
    title: "Delivered tomorrow",
    description:
      "Pick a delivery window at checkout. We bring dinner to your door — hot, fresh, and ready to enjoy.",
  },
] as const;

const FAQ = [
  {
    question: "When can I place an order?",
    answer:
      "Ordering opens the day before delivery, Monday through Thursday, until 8:00 PM. You'll see an Open to Order badge and countdown when it's time.",
  },
  {
    question: "Can I order ahead for later in the week?",
    answer:
      "Yes — browse upcoming menus anytime. Add buttons activate on the correct order day, so you know exactly when each menu opens.",
  },
  {
    question: "What are Freezey Lunches?",
    answer:
      "Freezer-ready add-on meals at $7.99 each. Add them to any dinner delivery for easy lunches you can heat and eat all week.",
  },
  {
    question: "How do I track my delivery?",
    answer:
      "After checkout, open Track in the bottom nav to follow your order from the kitchen to your doorstep.",
  },
] as const;

function useScrollActiveStep(stepCount: number) {
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const ratios = new Map<number, number>();

    const updateActiveStep = () => {
      let bestIndex = 0;
      let bestRatio = -1;

      for (let index = 0; index < stepCount; index++) {
        const ratio = ratios.get(index) ?? 0;
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestIndex = index;
        }
      }

      setActiveStep(bestIndex);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number(entry.target.getAttribute("data-step-index"));
          ratios.set(index, entry.intersectionRatio);
        }
        updateActiveStep();
      },
      {
        rootMargin: "-35% 0px -35% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    for (const step of stepRefs.current) {
      if (step) observer.observe(step);
    }

    return () => observer.disconnect();
  }, [stepCount]);

  return { activeStep, stepRefs };
}

interface HomeViewProps {
  menu: DailyMenu | null;
  timezone: string;
  frozenEnabled: boolean;
}

export function HomeView({ menu, timezone, frozenEnabled }: HomeViewProps) {
  const badge = menu ? getOrderWindowBadgeState(menu.order_cutoff_at, timezone) : null;
  const { activeStep, stepRefs } = useScrollActiveStep(HOW_IT_WORKS.length);

  return (
    <>
      <div className="mx-auto w-full max-w-lg space-y-8 px-4 pb-10 pt-8">
        {menu ? (
          <div className="overflow-hidden rounded-2xl border bg-card">
            <div className="relative aspect-square w-full">
              <Image
                src={HOME_HERO_IMAGE}
                alt="Fresh home-cooked dinners ready to deliver"
                fill
                priority
                sizes="(max-width: 512px) 100vw, 512px"
                className="object-cover object-center"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/15"
                aria-hidden
              />
              <div className="absolute inset-x-0 bottom-0 z-10 space-y-2 p-5 text-white">
                <h1 className="text-3xl font-semibold leading-tight tracking-tight">
                  Dinner delivered.
                  <br />
                  Order Now for Tomorrow.
                </h1>
                <p className="text-sm leading-relaxed text-white/90">
                  Fresh home-cooked meals to your door — plus freezer-ready lunches you can add to
                  any order.
                </p>
              </div>
              {badge && (
                <div className="absolute top-3 right-3 z-10">
                  <OrderWindowBadge label={badge.label} tone={badge.tone} className="shadow-md" />
                </div>
              )}
            </div>
            <Link
              href="/menu"
              className="group flex items-center gap-4 rounded-b-2xl border border-primary bg-primary p-5 text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <div className="flex size-14 items-center justify-center rounded-xl bg-white/15 text-white">
                <UtensilsCrossed className="size-7" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold">Tomorrow&apos;s Dinner Menu</h2>
                <p className="text-sm text-primary-foreground/80">
                  Browse dinners, customize your order, and pick a delivery window.
                </p>
              </div>
              <ArrowRight className="size-5 text-primary-foreground/70 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        ) : (
          <section className="space-y-3">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight">
              Dinner delivered.
              <br />
              Order Now for Tomorrow.
            </h1>
            <p className="text-muted-foreground">
              Fresh home-cooked meals to your door — plus freezer-ready lunches you can add to any
              order.
            </p>
          </section>
        )}

        {frozenEnabled && (
          <section className="grid gap-4">
            <Link
              href="/freezey-lunches"
              className={cn(
                "group flex items-center gap-4 rounded-2xl border border-sky-200 bg-sky-50/50 p-5 transition-colors hover:bg-sky-50 dark:border-sky-900 dark:bg-sky-950/20",
                "animate-gentle-pulse-sky"
              )}
            >
              <div className="flex size-14 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-900">
                <Snowflake className="size-7" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold">Freezey Lunches</h2>
                  <Badge className="border-transparent bg-sky-600 px-2 py-0.5 text-xs font-semibold text-white">
                    Try it
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Easy Lunches — freezer-ready add-ons at $7.99. Buy 3+, save 30%.
                </p>
              </div>
              <ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          </section>
        )}
      </div>

      <div className="border-t border-primary/15 bg-gradient-to-b from-primary/10 via-primary/5 to-primary/5 dark:border-primary/25 dark:from-primary/15 dark:via-primary/10 dark:to-primary/10">
        <div className="mx-auto w-full max-w-lg space-y-16 px-4 py-12 pb-36">
          <section>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              How it works
            </p>
            <h2 className="mt-3 text-4xl font-semibold leading-[1.05] tracking-tight">
              Order today.
              <br />
              Eat tomorrow.
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
              Home-cooked dinners on your schedule — no subscription, order when you want.
            </p>

            <ol className="mt-12 divide-y divide-primary/15">
              {HOW_IT_WORKS.map((step, index) => {
                const isActive = activeStep === index;

                return (
                  <li
                    key={step.title}
                    ref={(element) => {
                      stepRefs.current[index] = element;
                    }}
                    data-step-index={index}
                    className="grid grid-cols-[4.5rem_1fr] gap-x-5 gap-y-1 py-9 first:pt-0 last:pb-0"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "text-6xl font-semibold leading-none tabular-nums transition-all duration-500 ease-out motion-reduce:transition-none",
                        isActive ? "scale-105 text-primary" : "text-primary/20"
                      )}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3
                        className={cn(
                          "text-3xl font-semibold leading-[1.08] tracking-tight transition-colors duration-500 ease-out motion-reduce:transition-none",
                          isActive ? "text-foreground" : "text-muted-foreground/70"
                        )}
                      >
                        {step.title}
                      </h3>
                      <p
                        className={cn(
                          "mt-4 text-xl leading-relaxed transition-colors duration-500 ease-out motion-reduce:transition-none",
                          isActive ? "text-muted-foreground" : "text-muted-foreground/45"
                        )}
                      >
                        {step.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          {frozenEnabled && (
            <section className="relative rounded-2xl border border-sky-200/80 bg-white p-6 shadow-sm dark:border-sky-900 dark:bg-white">
              <div
                aria-hidden
                className="absolute top-6 right-6 flex size-12 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-200"
              >
                <Snowflake className="size-6" />
              </div>

              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-300">
                Add-on
              </p>
              <h2 className="mt-3 max-w-[calc(100%-4rem)] text-4xl font-semibold leading-[1.05] tracking-tight">
                Freezey
                <br />
                Lunches
              </h2>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {FREEZEY_MENU_ITEMS.map((item) => (
                  <div key={item.name} className="min-w-0">
                    <div className="relative aspect-square overflow-hidden rounded-xl border border-sky-200/70 shadow-sm dark:border-sky-800">
                      <Image
                        src={item.image}
                        alt={`Freezey ${item.name} lunch`}
                        fill
                        sizes="(max-width: 512px) 28vw, 120px"
                        className="object-cover object-center"
                      />
                    </div>
                    <p className="mt-2 text-center text-xs font-medium text-muted-foreground">
                      {item.name}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-5xl font-semibold tracking-tight text-sky-600 dark:text-sky-300">
                $7.99
              </p>
              <p className="mt-2 text-lg text-muted-foreground">
                each · buy 3+, save 30% · ships with your dinner
              </p>
              <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
                Backup lunches for busy weeks. Add chili, soup, or pasta bake to tomorrow&apos;s
                delivery — heat when you need them.
              </p>
              <Link
                href="/freezey-lunches"
                className="mt-6 inline-flex items-center gap-2 text-lg font-semibold text-sky-700 hover:text-sky-800 dark:text-sky-300"
              >
                Browse Freezey Lunches
                <ArrowRight className="size-5" />
              </Link>
            </section>
          )}

          <section>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">FAQ</p>
            <h2 className="mt-3 text-5xl font-semibold leading-[1.02] tracking-tight">
              Common
              <br />
              questions
            </h2>

            <dl className="mt-14 divide-y divide-primary/15">
              {FAQ.map((item) => (
                <div key={item.question} className="py-10 first:pt-0 last:pb-0">
                  <dt className="text-3xl font-semibold leading-[1.1] tracking-tight">
                    {item.question}
                  </dt>
                  <dd className="mt-4 text-xl leading-relaxed text-muted-foreground">
                    {item.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {!menu && (
            <p className="text-center text-lg text-muted-foreground">
              No menu is available for ordering right now. Check back soon!
            </p>
          )}
        </div>
      </div>
    </>
  );
}
