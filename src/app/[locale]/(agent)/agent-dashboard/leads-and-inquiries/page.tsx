import { redirect } from "next/navigation";

type LeadsAndInquiriesRedirectPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LeadsAndInquiriesRedirectPage({
  params,
}: LeadsAndInquiriesRedirectPageProps) {
  const { locale } = await params;
  redirect(`/${locale}/under-development`);
}
