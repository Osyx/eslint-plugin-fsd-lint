import React from "react";
import ReactDOM from "react-dom/client";

// ✅ VALID: Relative import within app layer
import { withRedux } from "./providers/with-redux";

// ✅ VALID: App can import from any lower layer
import { DashboardPage } from "@pages/dashboard";
import { LoginPage } from "@pages/login";
import { Header } from "@widgets/header";
import { LoginForm } from "@features/auth";
import { User } from "@entities/user";
import { Button } from "@shared/ui/Button";

// ✅ VALID: Import from custom segments
import { userService } from "@entities/user/services";
import { validateEmail } from "@entities/user/validators";

const App = () => {
  return (
    <div>
      <LoginPage />
    </div>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

root.render(<React.StrictMode>{withRedux(App)()}</React.StrictMode>);
