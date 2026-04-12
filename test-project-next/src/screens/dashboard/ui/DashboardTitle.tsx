import { selectDashboardTitle } from "../model/selectors";

export function DashboardTitle() {
  return <h1>{selectDashboardTitle()}</h1>;
}
