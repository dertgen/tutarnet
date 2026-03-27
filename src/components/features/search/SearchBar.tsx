"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, TrendingUp, Package, Folder, Tag, Loader2, ArrowRight } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface SearchSuggestion {
  id: string;
  name: string;
  type: "product" | "category" | "brand" | "popular";
  url?: string;
}

// Demo suggestions
const demoSuggestions: SearchSuggestion[] = [
  { id: "1", name: "iPhone 15 Pro", type: "product", url: "/urun/apple-iphone-15-pro-256gb" },
  { id: "2", name: "iPhone 15", type: "product", url: "/urun/apple-iphone-15-128gb" },
  { id: "3", name: "iPhone 14", type: "product", url: "/urun/apple-iphone-14-128gb" },
  { id: "4", name: "Telefon", type: "category", url: "/kategori/telefon" },
  { id: "5", name: "Apple", type: "brand", url: "/kategori/telefon/apple" },
  { id: "6", name: "Samsung Galaxy S24", type: "product", url: "/urun/samsung-galaxy-s24" },
  { id: "7", name: "Samsung", type: "brand", url: "/kategori/telefon/samsung" },
  { id: "8", name: "MacBook Air", type: "product", url: "/urun/macbook-air-m3" },
];

const popularSearches = [
  { name: "iPhone 15", icon: TrendingUp },
  { name: "Samsung Galaxy S24", icon: TrendingUp },
  { name: "MacBook Pro", icon: TrendingUp },
  { name: "AirPods Pro", icon: TrendingUp },
  { name: "PlayStation 5", icon: TrendingUp },
];

export function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const filtered = demoSuggestions.filter((s) =>
        s.name.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectSuggestion = useCallback(
    (suggestion: SearchSuggestion) => {
      if (suggestion.url) {
        router.push(suggestion.url);
      } else {
        setQuery(suggestion.name);
        router.push(`/ara?q=${encodeURIComponent(suggestion.name)}`);
      }
      setIsOpen(false);
    },
    [router]
  );

  const handleSubmit = (val: string) => {
    if (val.trim()) {
      router.push(`/ara?q=${encodeURIComponent(val)}`);
      setIsOpen(false);
    }
  };

  const getTypeIcon = (type: SearchSuggestion["type"]) => {
    switch (type) {
      case "product":
        return <Package className="w-4 h-4" />;
      case "category":
        return <Folder className="w-4 h-4" />;
      case "brand":
        return <Tag className="w-4 h-4" />;
      case "popular":
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: SearchSuggestion["type"]) => {
    switch (type) {
      case "product":
        return "Ürün";
      case "category":
        return "Kategori";
      case "brand":
        return "Marka";
      case "popular":
        return "Popüler";
      default:
        return type;
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={`relative z-50 transition-all ${isOpen ? "shadow-lg rounded-2xl bg-background border" : ""}`}>
        <Command
          className={`rounded-full overflow-visible bg-transparent border-transparent ${isOpen ? "rounded-b-none" : ""}`}
          shouldFilter={false} // We handle filtering manually to allow API calls
        >
          <CommandInput
            placeholder="Ürün, marka veya model ara..."
            value={query}
            onValueChange={(val) => {
              setQuery(val);
              if (!isOpen && val.trim()) setIsOpen(true);
            }}
            onFocus={() => {
              if (query.trim() || popularSearches.length > 0) setIsOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                // Let Command default behavior handle selection if an item is active
                // but if they hit enter with a query string, just search it.
                // Wait, Command native behavior prevents default on Enter. We capture it here:
                if (query.trim()) {
                  // Actually, Command will trigger onSelect for the active item.
                }
              }
            }}
            className="h-12 text-base md:text-sm pl-4 pr-12 focus:ring-0 border-none bg-muted/50 focus:bg-background rounded-full"
          />
          {isLoading && (
            <Loader2 className="absolute right-4 top-3.5 w-5 h-5 text-muted-foreground animate-spin" />
          )}

          {isOpen && (
            <div className="absolute top-full left-0 right-0 border-t bg-background rounded-b-2xl overflow-hidden shadow-xl">
              <CommandList className="max-h-[300px] overflow-y-auto w-full">
                <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                  <Search className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                  &quot;{query}&quot; için sonuç bulunamadı.
                </CommandEmpty>

                {query.trim().length > 0 ? (
                  <CommandGroup heading="Sonuçlar" className="px-2">
                    {suggestions.map((suggestion) => (
                      <CommandItem
                        key={suggestion.id}
                        value={suggestion.name}
                        onSelect={() => handleSelectSuggestion(suggestion)}
                        className="flex items-center gap-3 px-3 py-2 cursor-pointer rounded-lg"
                      >
                        <span className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                          {getTypeIcon(suggestion.type)}
                        </span>
                        <div className="flex-1 flex flex-col">
                          <span className="font-medium text-foreground">{suggestion.name}</span>
                          <span className="text-xs text-muted-foreground">{getTypeLabel(suggestion.type)}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground/50" />
                      </CommandItem>
                    ))}
                    {suggestions.length > 0 && (
                      <CommandItem
                        onSelect={() => handleSubmit(query)}
                        className="mt-1 flex items-center justify-center py-2 text-primary font-medium cursor-pointer"
                      >
                        Tüm sonuçları gör
                      </CommandItem>
                    )}
                  </CommandGroup>
                ) : (
                  <CommandGroup heading="Popüler Aramalar" className="px-2">
                    {popularSearches.map((search) => (
                      <CommandItem
                        key={search.name}
                        value={search.name}
                        onSelect={(val) => {
                          setQuery(search.name);
                          handleSubmit(search.name);
                        }}
                        className="flex items-center gap-3 px-3 py-2 cursor-pointer rounded-lg"
                      >
                        <span className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary">
                          <search.icon className="w-4 h-4" />
                        </span>
                        <span className="font-medium">{search.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </div>
          )}
        </Command>
      </div>
    </div>
  );
}
