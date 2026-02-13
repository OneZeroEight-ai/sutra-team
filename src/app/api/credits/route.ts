import { auth } from "@clerk/nextjs/server";
import { getUserCreditInfo } from "@/lib/credits";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }
  const info = await getUserCreditInfo(userId);
  return Response.json(info);
}
