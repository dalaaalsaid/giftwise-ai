"use client";

import { usePathname } from "next/navigation";
import HomeHeader from "./HomeHeader";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const hideStoreHeader =
    pathname.startsWith("/admin") ||
    pathname === "/login" ||
    pathname === "/register";

  return (
    <>
      {!hideStoreHeader && <HomeHeader />}
      {children}
    </>
  );
}