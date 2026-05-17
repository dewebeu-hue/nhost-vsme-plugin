import { redirect } from "next/navigation";

type PricingRedirectProps = {
  searchParams?: Promise<{
    billing?: string;
  }>;
};

export default async function PricingRedirectPage({ searchParams }: PricingRedirectProps) {
  const params = await searchParams;
  redirect(params?.billing === "annual" ? "/en/pricing?billing=annual" : "/en/pricing");
}
