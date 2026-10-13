import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../lib/auth/dal";
import { getTeamForUser } from "../../../features/team/queries";
import { TeamGrid } from "../../../features/members/components/TeamGrid";

export default async function TeamPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const team = await getTeamForUser(user.id);
    return <TeamGrid team={team} />;
}
