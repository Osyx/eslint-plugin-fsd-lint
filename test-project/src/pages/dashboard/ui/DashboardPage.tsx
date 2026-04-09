import React from "react";

// ✅ VALID: Import from widgets via public API
import { Header } from "@widgets/header";

// ✅ VALID: Import from features via public API
import { LoginForm } from "@features/auth";

// ✅ VALID: Import from entities via public API
import { User } from "@entities/user";

// ✅ VALID: Import from entities custom segment (NEW)
import { userService } from "@entities/user/services";
import { validateEmail } from "@entities/user/validators";
import { formatUserName } from "@entities/user/helpers";

// ✅ VALID: Import from shared
import { Button } from "@shared/ui/Button";

// ✅ VALID: Relative import within same slice
import { DashboardStats } from "./components/DashboardStats";
import { useDashboardData } from "../hooks/useDashboardData";

// ❌ INVALID Examples (commented out):
// import { LoginPage } from '@pages/login'; // Cross-slice dependency in same layer
// import { userSlice } from '@entities/user/model/slice'; // Public API sidestep
// import { UserService } from '@entities/user/services/UserService'; // Direct file access within segment
// import { store } from '@app/store'; // Import from higher layer

export const DashboardPage: React.FC = () => {
  const { data, loading } = useDashboardData();
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    userService.fetchUser("123").then(setUser);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <Header user={user} />
      <main>
        <h1>Dashboard</h1>
        {user && <p>Welcome, {formatUserName(user)}!</p>}
        {validateEmail(user?.email || "") && <p>Email is valid</p>}
        <DashboardStats data={data} />
        <Button onClick={() => console.log("Test")}>Action</Button>
      </main>
    </div>
  );
};
