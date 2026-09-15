import type { ReactNode } from "react";
import { StoreProvider } from "@/src/store";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return <StoreProvider>{children}</StoreProvider>;
}