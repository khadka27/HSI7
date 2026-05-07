import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Registration is disabled - only admin login is allowed
  return NextResponse.json(
    {
      error:
        "Registration is disabled. Admin users can only be created via the database seed.",
    },
    { status: 403 },
  );
}
