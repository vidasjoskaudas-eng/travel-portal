"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  // Check if we're on the home page (for transparent navbar)
  const isHomePage = pathname === "/";
  const navBg = isHomePage
    ? "bg-black/30 backdrop-blur-md border-white/10"
    : "bg-white border-gray-200";
  const textColor = isHomePage ? "text-white" : "text-gray-700";
  const logoColor = isHomePage ? "text-white" : "text-blue-600";

  return (
    <nav className={`border-b ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main nav */}
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className={`text-xl font-bold ${logoColor}`}>
                ✈️ TravelPortal
              </span>
            </Link>

            {/* Desktop nav links */}
            {status === "authenticated" && (
              <div className="hidden md:flex md:ml-10 md:space-x-4">
                <Link
                  href="/dashboard"
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium ${textColor} hover:text-blue-500`}
                >
                  Pradžia
                </Link>
                <Link
                  href="/trips"
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium ${textColor} hover:text-blue-500`}
                >
                  Kelionės
                </Link>
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center">
            {status === "loading" ? (
              <div className="h-8 w-8 animate-pulse bg-gray-200/50 rounded-full" />
            ) : status === "authenticated" ? (
              <div className="flex items-center space-x-4">
                <span className={`hidden md:block text-sm ${textColor}`}>
                  {session.user?.name || session.user?.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                >
                  Atsijungti
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={isHomePage ? "text-white hover:bg-white/10" : ""}
                  >
                    Prisijungti
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" size="sm">
                    Registruotis
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            {status === "authenticated" && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`md:hidden ml-4 p-2 ${textColor} hover:bg-white/10`}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && status === "authenticated" && (
          <div className={`md:hidden py-2 border-t ${isHomePage ? "border-white/10" : "border-gray-100"}`}>
            <Link
              href="/dashboard"
              className={`block px-3 py-2 text-base font-medium ${textColor} hover:bg-white/10`}
              onClick={() => setIsMenuOpen(false)}
            >
              Pradžia
            </Link>
            <Link
              href="/trips"
              className={`block px-3 py-2 text-base font-medium ${textColor} hover:bg-white/10`}
              onClick={() => setIsMenuOpen(false)}
            >
              Kelionės
            </Link>
            <button
              type="button"
              className={`block w-full text-left px-3 py-2 text-base font-medium ${textColor} hover:bg-white/10`}
              onClick={() => {
                setIsMenuOpen(false);
                handleSignOut();
              }}
            >
              Atsijungti
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
