// src/lib/createNotification.js
import clientPromise from "@/lib/mongodb";
import { sendPushNotification } from "@/lib/sendPushNotification";

/**
 * Fire-and-forget: saves a notification to DB and triggers a web push.
 * Never throws — all failures are caught silently.
 */
export async function createNotification(payload) {
  if (payload.founderId === payload.actorId) return;

  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    await db.collection("notifications").insertOne({
      founderId:   payload.founderId,
      actorId:     payload.actorId,
      actorName:   payload.actorName,
      actorImage:  payload.actorImage ?? null,
      type:        payload.type,
      startupId:   payload.startupId,
      startupName: payload.startupName,
      startupSlug: payload.startupSlug,
      preview:     payload.preview ?? null,
      seen:        false,
      createdAt:   now,
      expiresAt,
    });

    // Build human-readable push body
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const startupUrl = `${siteUrl}/startups/${payload.startupSlug}`;
    const pushBody =
      payload.type === "like"
        ? `${payload.actorName} liked your startup ${payload.startupName}`
        : payload.type === "reply"
        ? `${payload.actorName} replied to a comment on ${payload.startupName}`
        : `${payload.actorName} commented on ${payload.startupName}`;

    // Fire-and-forget push (not awaited — never blocks caller)
    sendPushNotification(payload.founderId, {
      title: "BD SaaS Zone",
      body:  pushBody,
      url:   startupUrl,
      tag:   `${payload.type}-${payload.startupId}`,
    });
  } catch (err) {
    console.error("[createNotification] silently failed:", err?.message);
  }
}