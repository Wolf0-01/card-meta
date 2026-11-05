"use client";

import { Search } from "lucide-react";

import Input from "@/components/ui/Input";

interface CardSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function CardSearchInput({
  value,
  onChange,
  placeholder = "Search cards...",
}: CardSearchInputProps) {
  return (
    <div className="relative">
      <Search
        size={20}
        className="
          pointer-events-none
          absolute
          left-4
          top-1/2
          -translate-y-1/2
          text-zinc-500
        "
      />

      <Input
        type="text"
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        className="pl-12"
      />
    </div>
  );
}