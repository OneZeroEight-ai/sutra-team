import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const data = await req.json();

  // Validate required fields
  const required = [
    "name",
    "email",
    "linkedin",
    "category",
    "credentials",
    "experience",
    "rate",
    "bio",
  ];
  for (const field of required) {
    if (!data[field]) {
      return NextResponse.json(
        { error: `Missing required field: ${field}` },
        { status: 400 },
      );
    }
  }

  // For now, log to console and return success
  // Production: store in database + send notification email
  console.log("Expert application received:", JSON.stringify(data, null, 2));

  // TODO: Send notification email to JB
  // TODO: Store in database
  // TODO: Auto-respond with confirmation email

  return NextResponse.json({
    success: true,
    message:
      "Application received. We'll review and get back to you within 48 hours.",
  });
}
