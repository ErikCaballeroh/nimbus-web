import type { ReactNode } from "react";
import { ThemeProvider } from "@/src/components/providers/ThemeProvider";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return <ThemeProvider>{children}</ThemeProvider>;
}
