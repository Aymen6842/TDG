"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import retrieveUsers from "@/modules/users/services/extraction/users";
import { UserType } from "@/modules/users/types/users";

interface Props {
  value: string;
  onChange: (userId: string, name: string) => void;
  placeholder?: string;
}

export default function UserSearchInput({ value, onChange, placeholder = "Search users..." }: Props) {
  const [search, setSearch] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const { data, isFetching, isError } = useQuery({
    queryKey: ["users-search", search],
    queryFn: async () => {
      const result = await retrieveUsers({ page: 1, limit: 20, search: search || undefined, searchBy: search ? "name" : undefined });
      if (!result) throw new Error("Failed to fetch users");
      return result;
    },
    enabled: open,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const users: UserType[] = data?.data ?? [];

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (user: UserType) => {
    setSearch(user.name);
    setOpen(false);
    onChange(user.id, user.name);
  };

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={search}
        onChange={(e) => { setSearch(e.target.value); onChange("", ""); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {isFetching && (
        <Loader2 className="absolute right-3 top-2.5 size-4 animate-spin text-muted-foreground" />
      )}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          {users.length === 0 && !isFetching ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              {isError ? "Failed to load users." : "No users found."}
            </p>
          ) : (
            <ul className="max-h-52 overflow-y-auto py-1">
              {users.map((user) => (
                <li
                  key={user.id}
                  className={cn("flex cursor-pointer flex-col px-3 py-2 hover:bg-accent", value === user.id && "bg-accent")}
                  onMouseDown={(e) => { e.preventDefault(); handleSelect(user); }}
                >
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
