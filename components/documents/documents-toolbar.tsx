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
  };
  searchQuery: string;
  selectedType: string;
  selectedStatus: string;
  onSearchQueryChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  labels?: DocumentsLabels;
};

export function DocumentsToolbar({
  filters,
  searchQuery,
  selectedType,
  selectedStatus,
  onSearchQueryChange,
  onTypeChange,
  onStatusChange,
  labels = defaultDocumentsLabels,
}: DocumentsToolbarProps) {
  return (
    <section className="supplier-surface flex flex-col gap-3 rounded-2xl border-0 p-4 xl:flex-row xl:items-center">
      <Input
        id="documents-search"
        name="documentsSearch"
        value={searchQuery}
        onChange={(event) => onSearchQueryChange(event.target.value)}
        placeholder={labels.searchPlaceholder}
        className="h-11 flex-1 rounded-xl bg-slate-50 px-4"
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:flex xl:items-center">
        <FilterSelect
          value={selectedType}
          values={filters.types}
          labels={labels}
          kind="type"
          onValueChange={onTypeChange}
        />
        <FilterSelect
          value={selectedStatus}
          values={filters.statuses}
          labels={labels}
          kind="status"
          onValueChange={onStatusChange}
        />
      </div>
    </section>
  );
}

function FilterSelect({
  values,
  labels,
  kind,
  value,
  onValueChange,
}: {
  values: readonly string[];
  labels: DocumentsLabels;
  kind: "type" | "status";
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <Select
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue) {
          onValueChange(nextValue);
        }
      }}
    >
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

function translateFilterValue(value: string, labels: DocumentsLabels, kind: "type" | "status") {
  if (value === "All types") return labels.allTypes;
  if (value === "All status") return labels.allStatus;

  if (kind === "type") {
    return labels.documentTypes[value as keyof typeof labels.documentTypes] ?? value;
  }

  return labels.statuses[value as keyof typeof labels.statuses] ?? value;
}
