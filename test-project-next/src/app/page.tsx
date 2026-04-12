import Link from "next/link";

import { DashboardScreen } from "@/screens/dashboard";
import { Header } from "@/widgets/header";

export default function Page() {
  return (
    <>
      <Header />
      <DashboardScreen />
      <Link href="/profile">Profile</Link>
    </>
  );
}
