import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type SearchBarProps = {
  placeholder?: string;
  onSearch: (query: string) => void;
};

export function SearchBar({ placeholder = "Search...", onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-10 bg-black/60 border-primary/30 text-white"
        data-testid="input-search"
      />
    </div>
  );
}