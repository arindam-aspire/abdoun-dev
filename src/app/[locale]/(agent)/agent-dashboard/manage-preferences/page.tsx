import { redirect } from "next/navigation";

type ManagePreferencesRedirectPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ManagePreferencesRedirectPage({
  params,
}: ManagePreferencesRedirectPageProps) {
  const { locale } = await params;
  redirect(`/${locale}/under-development`);
}
