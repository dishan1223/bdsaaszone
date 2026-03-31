// src/lib/sendPushNotification.js
// Sends a Web Push notification to all active subscriptions for a given founderId.
// Called fire-and-forget from createNotification — never throws.

import webpush from "web-push";
import clientPromise from "@/lib/mongodb";

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);

/**
 * @param {string} founderId
 * @param {{ title: string, body: string, url: string, tag?: string }} payload
 */
export async function sendPushNotification(founderId, payload) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB);

    const subscriptions = await db
      .collection("pushSubscriptions")
      .find({ userId: founderId })
      .toArray();

    if (!subscriptions.length) return;

    const message = JSON.stringify({
      title: payload.title,
      body:  payload.body,
      url:   payload.url,
      icon:  "/logo.svg",
      tag:   payload.tag ?? "bdsaaszone",
    });

    // Send to all devices in parallel — remove expired/invalid subscriptions
    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(sub.subscription, message)
      )
    );

    // Clean up subscriptions that are no longer valid (410 Gone / 404)
    const toDelete = [];
    results.forEach((result, i) => {
      if (result.status === "rejected") {
        const status = result.reason?.statusCode;
        if (status === 410 || status === 404) {
          toDelete.push(subscriptions[i]._id);
        }
      }
    });

    if (toDelete.length > 0) {
      await db.collection("pushSubscriptions").deleteMany({
        _id: { $in: toDelete },
      });
    }
  } catch (err) {
    console.error("[sendPushNotification] silently failed:", err?.message);
  }
}