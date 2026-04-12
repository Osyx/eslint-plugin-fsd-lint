import Link from "next/link";

import { UserCard } from "@/entities/user";

export function Header() {
  return (
    <header>
      <Link href="/">Home</Link>
      <UserCard user={{ id: "1", name: "Ada" }} />
    </header>
  );
}
