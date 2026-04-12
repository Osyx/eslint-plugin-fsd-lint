import type { User } from "@/entities/user";

import { formatDate } from "@/shared/lib/date";

export function startSession(user: User) {
  return `${user.id}:${formatDate(new Date())}`;
}
