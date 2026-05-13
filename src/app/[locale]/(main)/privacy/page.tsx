import { redirect } from "next/navigation";

type Props = { params: Promise<{ locale: string }> };

export default async function PrivacyShortLinkPage({ params }: Props) {
  const { locale } = await params;
  redirect(`/${locale}/privacy-policy`);
}
