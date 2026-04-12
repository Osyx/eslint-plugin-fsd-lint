import { selectProfileTitle } from "../model/selectors";

export function ProfileScreen() {
  return <main>{selectProfileTitle()}</main>;
}
