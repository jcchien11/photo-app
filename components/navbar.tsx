"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Search, Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onSearch?: (query: string) => void;
  searchVisible?: boolean;
}

export function Navbar({ onSearch, searchVisible = false }: NavbarProps) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHome = pathname === "/";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-100">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link href="/" className="flex flex-col leading-none">
            <span className="font-serif text-xl text-neutral-900 tracking-tight">
              Folio
            </span>
            <span className="text-[9px] font-sans tracking-[0.2em] uppercase text-neutral-400 mt-0.5">
              Photo Manager
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className={cn(
                "text-sm font-sans tracking-wide transition-colors",
                isHome
                  ? "text-neutral-900 border-b border-neutral-900 pb-0.5"
                  : "text-neutral-500 hover:text-neutral-900"
              )}
            >
              Albums
            </Link>
            <Link
              href="/photos"
              className="text-sm font-sans tracking-wide text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              All Photos
            </Link>
            <Link
              href="/shared"
              className="text-sm font-sans tracking-wide text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              Shared
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="hidden md:flex items-center">
              {searchOpen ? (
                <form
                  onSubmit={handleSearch}
                  className="flex items-center gap-2"
                >
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      onSearch?.(e.target.value);
                    }}
                    placeholder="Search albums, tags..."
                    className="w-56 text-sm font-sans border-b border-neutral-300 bg-transparent px-0 py-1 focus:border-neutral-900 focus:outline-none placeholder:text-neutral-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery("");
                      onSearch?.("");
                    }}
                    className="text-neutral-400 hover:text-neutral-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </form>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchOpen(true)}
                  className="text-neutral-500"
                >
                  <Search className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* User avatar (mock) */}
            <button className="h-8 w-8 rounded-full bg-warm-700 flex items-center justify-center text-white text-xs font-sans tracking-wide hover:bg-warm-800 transition-colors">
              JC
            </button>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden text-neutral-700"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-neutral-100 bg-white">
          <nav className="flex flex-col px-6 py-4 gap-4">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-sans text-neutral-700"
            >
              Albums
            </Link>
            <Link
              href="/photos"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-sans text-neutral-500"
            >
              All Photos
            </Link>
            <Link
              href="/shared"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-sans text-neutral-500"
            >
              Shared
            </Link>
            <div className="pt-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  onSearch?.(e.target.value);
                }}
                placeholder="Search albums, tags..."
                className="w-full text-sm font-sans border-b border-neutral-300 bg-transparent px-0 py-1 focus:border-neutral-900 focus:outline-none placeholder:text-neutral-400"
              />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
