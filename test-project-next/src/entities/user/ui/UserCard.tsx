import type { User } from "../model/types";

import { Button } from "@/shared/ui/Button";

export function UserCard({ user }: { user: User }) {
  return (
    <article>
      <strong>{user.name}</strong>
      <Button>Open</Button>
    </article>
  );
}
