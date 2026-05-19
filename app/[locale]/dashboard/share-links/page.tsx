import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

type ShareLinksPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ShareLinksPage({ params }: ShareLinksPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  redirect(`/${locale}/dashboard/share`);
}
