import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url, payload } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "Webhook URL is required" }, { status: 400 });
    }

    if (url.startsWith("https://") || url.startsWith("http://")) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "IsabiLove-Reminder-Dispatcher/1.0",
          },
          body: JSON.stringify(payload),
        });
        const respText = await response.text();
        return NextResponse.json({
          success: response.ok,
          status: response.status,
          response: respText.slice(0, 500),
          dispatchedAt: new Date().toISOString(),
        });
      } catch (networkErr: any) {
        return NextResponse.json({
          success: false,
          status: 502,
          error: networkErr.message || "Failed to reach target webhook URL",
          simulated: false,
          dispatchedAt: new Date().toISOString(),
        });
      }
    } else {
      return NextResponse.json({
        success: true,
        status: 200,
        response: "Simulated webhook delivery acknowledged (test channel)",
        simulated: true,
        dispatchedAt: new Date().toISOString(),
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Webhook delivery failed" },
      { status: 500 }
    );
  }
}