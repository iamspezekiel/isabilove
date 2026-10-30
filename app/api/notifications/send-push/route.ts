import { NextRequest, NextResponse } from "next/server";

const pushSubscriptions = new Map<string, any>();

export async function POST(req: NextRequest) {
  try {
    const { title, body, icon, tag, url, data } = await req.json();
    if (!title || !body) {
      return NextResponse.json(
        { error: "title and body are required" },
        { status: 400 }
      );
    }

    const notificationPayload = {
      title,
      body,
      icon: icon || "/images/avatar_partner_1792816163693.jpg",
      tag: tag || "isabilove-notification",
      data: data || {},
      ...(url ? { url } : {}),
    };

    const results = await Promise.allSettled(
      Array.from(pushSubscriptions.values()).map(async (sub: any) => {
        console.log("Would send push to:", sub.endpoint, notificationPayload);
        return { endpoint: sub.endpoint, status: "simulated" };
      })
    );

    return NextResponse.json({
      success: true,
      sent: results.length,
      results,
      dispatchedAt: new Date().toISOString(),
      simulated: true,
      note:
        "Push notifications require VAPID keys for production delivery. Currently simulated.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Push send failed" },
      { status: 500 }
    );
  }
}