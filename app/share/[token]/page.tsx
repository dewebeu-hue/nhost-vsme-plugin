import { notFound } from "next/navigation";
import { PublicSharePage } from "@/components/passport/public-share-page";
import { publicSharePassport } from "@/lib/mock-data";

type SharePageProps = {
  params: Promise<{
    token: string;
  }>;
};

export function generateStaticParams() {
  return [{ token: publicSharePassport.token }];
}

export async function generateMetadata({ params }: SharePageProps) {
  const { token } = await params;

  if (token !== publicSharePassport.token) {
    return {
      title: "Shared Passport Not Found",
    };
  }

  return {
    title: `${publicSharePassport.company.name} | Supplier Passport`,
    description: "Secure read-only Supplier Passport shared with a buyer.",
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params;

  if (token !== publicSharePassport.token) {
    notFound();
  }

  return <PublicSharePage passport={publicSharePassport} />;
}
