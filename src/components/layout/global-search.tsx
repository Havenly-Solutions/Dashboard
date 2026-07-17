"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Ticket, LifeBuoy, Users, ChevronRight } from "lucide-react";
import { api } from "@/lib/api-client";
import { useDebounce } from "@/hooks/use-debounce";
import { useClickOutside } from "@/hooks/use-click-outside";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  type: "TICKET" | "SOS" | "MEMBER";
  title: string;
  subtitle: string;
  href: string;
}

export function GlobalSearch({ placeholder }: { placeholder: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setOpen(false));

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      try {
        const { results } = await api.get<{ results: SearchResult[] }>(`/search?q=${encodeURIComponent(debouncedQuery)}`);
        setResults(results);
        setOpen(true);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  const onSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery("");
    router.push(result.href);
  };

  const icons = {
    TICKET: Ticket,
    SOS: LifeBuoy,
    MEMBER: Users,
  };

  return (
    <div ref={containerRef} className="relative hidden max-w-sm flex-1 sm:block">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setOpen(true)}
          placeholder={placeholder}
          className="h-10 w-full rounded-full border border-outline-variant bg-surface-container-low pl-9 pr-4 text-body-sm text-on-surface placeholder:text-on-surface-variant focus:border-secondary focus:outline-none"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-on-surface-variant" />
        )}
      </div>

      {open && (results.length > 0 || debouncedQuery.length >= 2) && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full max-h-[400px] overflow-y-auto rounded-xl border border-outline-variant bg-surface-container-lowest p-2 shadow-tile-hover">
          {results.length === 0 ? (
            <div className="p-4 text-center text-body-sm text-on-surface-variant">
              No results found for "{debouncedQuery}"
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((r) => {
                const Icon = icons[r.type];
                return (
                  <button
                    key={r.id}
                    onClick={() => onSelect(r)}
                    className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-surface-container-low"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-surface-container-high">
                      <Icon className="h-4 w-4 text-on-surface-variant" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body-sm font-medium text-on-surface">{r.title}</p>
                      <p className="truncate text-label-md text-on-surface-variant">{r.subtitle}</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-on-surface-variant" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
