'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui";
import { ProfileTab } from "./ProfileTab";
import { PreferencesTab } from "./PreferencesTab";
import { SecurityTab } from "./SecurityTab";

type Tab = "profile" | "preferences" | "security";

const tabs: { key: Tab; label: string; icon: typeof Icon.user }[] = [
  { key: "profile", label: "Perfil", icon: Icon.user },
  { key: "preferences", label: "Preferencias", icon: Icon.settings },
  { key: "security", label: "Seguridad", icon: Icon.shield },
];

function isTab(v: string | null): v is Tab {
  return v === "profile" || v === "preferences" || v === "security";
}

export function SettingsScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = isTab(searchParams.get("tab")) ? (searchParams.get("tab") as Tab) : "profile";

  return (
    <div className="mx-auto max-w-4xl px-5 py-6 sm:px-6">
      <div className="mb-6 flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => router.push(`/settings?tab=${t.key}`)}
            className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${tab === t.key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            <t.icon width={16} height={16} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "profile" && <ProfileTab />}
      {tab === "preferences" && <PreferencesTab />}
      {tab === "security" && <SecurityTab />}
    </div>
  );
}
