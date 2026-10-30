import { NextRequest, NextResponse } from "next/server";

const pushSubscriptions = new Map<string, any>();

export async function POST(req: NextRequest) {
  try {
    const { endpoint, keys } = await req.json();
    if (!endpoint) {
      return NextResponse.json({ error: "endpoint is required" }, { status: 400 });
    }

    pushSubscriptions.set(endpoint, { endpoint, keys });
    return NextResponse.json({ success: true, subscribed: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Push subscription failed" },
      { status: 500 }
    );
  }
}