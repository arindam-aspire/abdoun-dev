import { redirect } from "next/navigation";

export default async function AgentDealsRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/under-development`);
}
