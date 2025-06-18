import React, { useState } from "react";
import { SearchResultItem } from "@/hooks/useNavSearch";
import * as Icons from "lucide-react";

type IconName = keyof typeof Icons;

interface SearchResultsProps {
  results: SearchResultItem[];
  isSearching: boolean;
  onSelect: (path: string) => void;
  searchQuery: string;
}

export function SearchResults({
  results,
  isSearching,
  onSelect,
  searchQuery,
}: SearchResultsProps) {
  const hasResults = results.length > 0;

  // Group results by category
  const groupedResults = React.useMemo(() => {
    return results.reduce<Record<string, SearchResultItem[]>>((acc, result) => {
      if (!acc[result.category]) {
        acc[result.category] = [];
      }
      acc[result.category].push(result);
      return acc;
    }, {});
  }, [results]);

  // Render dynamic icon
  const renderIcon = (iconName: string | undefined) => {
    if (!iconName) return null;

    const IconComponent = Icons[iconName as IconName] as any;
    return IconComponent ? (
      <IconComponent className="h-4 w-4 mr-2 text-blue-400" />
    ) : null;
  };

  // If no query, show empty state
  if (!searchQuery.trim()) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-1 z-50 overflow-hidden shadow-lg bg-white border-blue-200 dark:bg-[#0a1033] dark:border-blue-900/40 border rounded-md animate-in fade-in-50 slide-in-from-top-5 max-h-[calc(100vh-120px)] overflow-y-auto">
      {isSearching ? (
        <div className="p-4 text-center text-blue-300">
          <Icons.Loader className="h-5 w-5 mx-auto animate-spin text-blue-400 mb-2" />
          <p>Searching...</p>
        </div>
      ) : (
        <>
          {!hasResults && searchQuery.length > 0 ? (
            <div className="p-4 text-center">
              <Icons.SearchX className="h-6 w-6 mx-auto mb-2 text-blue-400/70" />
              <p className="text-blue-300">
                No results found for "{searchQuery}"
              </p>
            </div>
          ) : (
            <div className="py-2">
              {Object.entries(groupedResults).map(([category, items]) => (
                <div key={category} className="mb-2">
                  <h3 className="text-xs font-medium text-blue-400 px-4 py-1">
                    {category}
                  </h3>
                  {items.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-start py-2 px-3 cursor-pointer hover:bg-blue-800/30 text-blue-100"
                      onClick={() => onSelect(result.path)}
                    >
                      <div className="flex items-center">
                        {renderIcon(result.icon)}
                        <div>
                          <div className="text-sm font-medium">
                            {result.title}
                          </div>
                          {result.description && (
                            <div className="text-xs text-blue-400/80">
                              {result.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
