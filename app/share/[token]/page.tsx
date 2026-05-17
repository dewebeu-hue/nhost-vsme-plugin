import { redirect } from "next/navigation";

type ShareRedirectProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function ShareRedirectPage({ params }: ShareRedirectProps) {
  const { token } = await params;
  redirect(`/en/share/${token}`);
}
