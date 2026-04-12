import { DashboardTitle } from "./DashboardTitle";

import { Header } from "@/widgets/header";
import { LoginButton } from "@/features/auth";
import { UserCard } from "@/entities/user";
import { Button } from "@/shared/ui/Button";

export function DashboardScreen() {
  const user = { id: "1", name: "Ada" };

  return (
    <main>
      <Header />
      <DashboardTitle />
      <LoginButton />
      <UserCard user={user} />
      <Button>Refresh</Button>
    </main>
  );
}
