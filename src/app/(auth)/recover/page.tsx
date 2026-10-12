import { AuthShell } from "@/src/features/auth/components/AuthShell";
import { RecoverForm } from "@/src/features/auth/components/RecoverForm";

export default function RecoverPage() {
    return (
        <AuthShell>
            <RecoverForm />
        </AuthShell>
    );
}
