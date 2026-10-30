import { NextRequest, NextResponse } from "next/server";

const pushSubscriptions = new Map<string, any>();

export async function POST(req: NextRequest) {
  try {
    const { endpoint } = await req.json();
    if (!endpoint) {
      return NextResponse.json({ error: "endpoint is required" }, { status: 400 });
    }

    pushSubscriptions.delete(endpoint);
    return NextResponse.json({ success: true, unsubscribed: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Push unsubscription failed" },
      { status: 500 }
    );
  }
}