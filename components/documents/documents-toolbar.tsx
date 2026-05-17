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
import { defaultDocumentsLabels, type DocumentsLabels } from "@/lib/workspace-labels";

type DocumentsToolbarProps = {
  filters: {
    types: readonly string[];
    statuses: readonly string[];
    folders: readonly string[];
  };
  labels?: DocumentsLabels;
};

export function DocumentsToolbar({
  filters,
  labels = defaultDocumentsLabels,
}: DocumentsToolbarProps) {
  return (
    <section className="supplier-surface flex flex-col gap-3 rounded-2xl border-0 p-4 xl:flex-row xl:items-center">
      <Input
        placeholder={labels.searchPlaceholder}
        className="h-11 flex-1 rounded-xl bg-slate-50 px-4"
      />
      <div className="grid gap-3 sm:grid-cols-3 xl:flex xl:items-center">
        <FilterSelect values={filters.types} labels={labels} kind="type" />
        <FilterSelect values={filters.statuses} labels={labels} kind="status" />
        <FilterSelect values={filters.folders} labels={labels} kind="folder" />
      </div>
      <Button variant="outline" size="icon" aria-label="Open document table settings">
        <SlidersHorizontal />
      </Button>
    </section>
  );
}

function FilterSelect({
  values,
  labels,
  kind,
}: {
  values: readonly string[];
  labels: DocumentsLabels;
  kind: "type" | "status" | "folder";
}) {
  return (
    <Select defaultValue={values[0]}>
      <SelectTrigger className="h-11 w-full rounded-xl bg-white px-3 xl:w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {values.map((value) => (
            <SelectItem key={value} value={value}>
              {translateFilterValue(value, labels, kind)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function translateFilterValue(value: string, labels: DocumentsLabels, kind: "type" | "status" | "folder") {
  if (value === "All types") return labels.allTypes;
  if (value === "All status") return labels.allStatus;
  if (value === "All folders") return labels.allFolders;

  if (kind === "type") {
    return labels.documentTypes[value as keyof typeof labels.documentTypes] ?? value;
  }

  if (kind === "status") {
    return labels.statuses[value as keyof typeof labels.statuses] ?? value;
  }

  return labels.sections[value] ?? value;
}
