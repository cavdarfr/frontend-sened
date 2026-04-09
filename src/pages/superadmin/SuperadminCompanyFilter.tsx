import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { superadminService } from "@/services/api";
import type { SuperadminCompanySummary } from "@/types";
import { cn } from "@/lib/utils";

type Props = {
  value: SuperadminCompanySummary | null;
  onChange: (company: SuperadminCompanySummary | null) => void;
};

const SEARCH_DEBOUNCE_MS = 250;
export function SuperadminCompanyFilter({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<SuperadminCompanySummary[]>([]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await superadminService.searchCompanies(search);
        setOptions(response.companies);
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [open, search]);

  const displayOptions = useMemo(() => {
    if (!value) {
      return options;
    }

    const hasSelected = options.some((company) => company.id === value.id);
    return hasSelected ? options : [value, ...options];
  }, [options, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">
            {value
              ? `${value.name}${value.siren ? ` · ${value.siren}` : ""}`
              : "Toutes les entreprises"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder="Rechercher une entreprise..."
          />
          <CommandList>
            <CommandItem
              value="all-companies"
              onSelect={() => {
                onChange(null);
                setOpen(false);
              }}
            >
              <Check
                className={cn(
                  "h-4 w-4",
                  value === null ? "opacity-100" : "opacity-0",
                )}
              />
              Toutes les entreprises
            </CommandItem>
            {loading ? (
              <div className="flex items-center gap-2 px-3 py-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Recherche des entreprises...
              </div>
            ) : displayOptions.length === 0 ? (
              <CommandEmpty>
                <div className="flex items-center justify-center gap-2">
                  <Search className="h-4 w-4" />
                  Aucune entreprise trouvee.
                </div>
              </CommandEmpty>
            ) : (
              displayOptions.map((company) => (
                <CommandItem
                  key={company.id}
                  value={`${company.name} ${company.siren || ""}`}
                  onSelect={() => {
                    onChange(company);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "h-4 w-4",
                      value?.id === company.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="min-w-0">
                    <div className="truncate font-medium">{company.name}</div>
                    {company.siren && (
                      <div className="truncate text-xs text-muted-foreground">
                        {company.siren}
                      </div>
                    )}
                  </div>
                </CommandItem>
              ))
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
