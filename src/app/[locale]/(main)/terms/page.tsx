import { redirect } from "next/navigation";

type Props = { params: Promise<{ locale: string }> };

export default async function TermsShortLinkPage({ params }: Props) {
  const { locale } = await params;
  redirect(`/${locale}/terms-and-conditions`);
}
