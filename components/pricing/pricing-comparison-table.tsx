import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function PricingComparisonTable() {
  const t = useTranslations("pricing.comparison");
  const rows = t.raw("rows") as Array<{
    feature: string;
    starter: string;
    pro: string;
    partner: string;
    buyer: string;
  }>;

  return (
    <section className="px-6 py-14 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-600">
            {t("description")}
          </p>
        </div>
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80">
                <TableHead className="pl-6">{t("columns.feature")}</TableHead>
                <TableHead>{t("columns.starter")}</TableHead>
                <TableHead>{t("columns.pro")}</TableHead>
                <TableHead>{t("columns.partner")}</TableHead>
                <TableHead className="pr-6">{t("columns.buyer")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.feature} className="border-slate-100">
                  <TableCell className="min-w-56 py-4 pl-6 font-semibold text-slate-950">
                    {row.feature}
                  </TableCell>
                  <TableCell className="text-slate-600">{row.starter}</TableCell>
                  <TableCell className="font-semibold text-blue-700">{row.pro}</TableCell>
                  <TableCell className="text-slate-600">{row.partner}</TableCell>
                  <TableCell className="pr-6 text-slate-600">{row.buyer}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
