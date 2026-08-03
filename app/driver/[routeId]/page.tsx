import { notFound } from "next/navigation";
import { getDriverRouteSummary } from "@/lib/db/routes";
import { DriverRouteView } from "@/components/driver/DriverRouteView";

interface PageProps {
  params: Promise<{ routeId: string }>;
}

export default async function DriverRoutePage({ params }: PageProps) {
  const { routeId } = await params;
  const summary = await getDriverRouteSummary(routeId);
  if (!summary) notFound();

  return <DriverRouteView summary={summary} />;
}
