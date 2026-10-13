import { Icon } from "./Icon";
import { Button } from "./Button";
import { es } from "@/lib/i18n/es";

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-danger/30 bg-danger/5 px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-danger/10 text-danger">
        <Icon.alert width={26} height={26} />
      </div>
      <h3 className="text-[15px] font-semibold text-foreground">{es.common.errorState.title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{es.common.errorState.body}</p>
      <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry}>
        {es.common.errorState.retry}
      </Button>
    </div>
  );
}
