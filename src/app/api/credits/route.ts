import { auth } from "@clerk/nextjs/server";
import { getUserCreditInfo } from "@/lib/credits";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ credits: 0, tier: "free" });
    }
    const info = await getUserCreditInfo(userId);
    return Response.json(info);
  } catch {
    return Response.json({ credits: 0, tier: "free" });
  }
}
