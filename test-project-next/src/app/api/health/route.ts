import { getHealth } from "@/shared/api/health";

export async function GET() {
  return Response.json(getHealth());
}
