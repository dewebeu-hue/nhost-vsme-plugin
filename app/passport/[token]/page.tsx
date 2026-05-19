import { redirect } from "next/navigation";

type PassportRedirectPageProps = {
  params: Promise<{ token: string }>;
};

export default async function PassportRedirectPage({ params }: PassportRedirectPageProps) {
  const { token } = await params;

  redirect(`/en/passport/${encodeURIComponent(token)}`);
}
