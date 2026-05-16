import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DocumentsToolbarProps = {
  filters: {
    types: readonly string[];
    statuses: readonly string[];
    folders: readonly string[];
  };
};

export function DocumentsToolbar({ filters }: DocumentsToolbarProps) {
  return (
    <section className="supplier-surface flex flex-col gap-3 rounded-2xl border-0 p-4 xl:flex-row xl:items-center">
      <Input
        placeholder="Search documents by name, tag or answer..."
        className="h-11 flex-1 rounded-xl bg-slate-50 px-4"
      />
      <div className="grid gap-3 sm:grid-cols-3 xl:flex xl:items-center">
        <FilterSelect values={filters.types} />
        <FilterSelect values={filters.statuses} />
        <FilterSelect values={filters.folders} />
      </div>
      <Button variant="outline" size="icon" aria-label="Open document table settings">
        <SlidersHorizontal />
      </Button>
    </section>
  );
}

function FilterSelect({ values }: { values: readonly string[] }) {
  return (
    <Select defaultValue={values[0]}>
      <SelectTrigger className="h-11 w-full rounded-xl bg-white px-3 xl:w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {values.map((value) => (
            <SelectItem key={value} value={value}>
              {value}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
