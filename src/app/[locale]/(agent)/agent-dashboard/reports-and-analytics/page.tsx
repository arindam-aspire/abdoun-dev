import { redirect } from "next/navigation";

type ReportsAndAnalyticsRedirectPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ReportsAndAnalyticsRedirectPage({
  params,
}: ReportsAndAnalyticsRedirectPageProps) {
  const { locale } = await params;
  redirect(`/${locale}/under-development`);
}
