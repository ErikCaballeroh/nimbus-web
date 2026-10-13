import { AuthShell } from "@/features/auth/components/AuthShell";
import { RecoverForm } from "@/features/auth/components/RecoverForm";

export default function RecoverPage() {
    return (
        <AuthShell>
            <RecoverForm />
        </AuthShell>
    );
}
