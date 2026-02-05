"use client";

import dynamic from "next/dynamic";

const Web3Provider = dynamic(
  () => import("@/providers/web3-provider").then((m) => m.Web3Provider),
  { ssr: false }
);

const Header = dynamic(
  () => import("@/components/layout/header").then((m) => m.Header),
  { ssr: false }
);

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Web3Provider>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </Web3Provider>
  );
}
