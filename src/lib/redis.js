import { createClient } from "redis";

let redis = null;

export async function getRedisClient() {
  // If connection previously failed, don't retry constantly
  if (redis === false) return null;

  if (!redis) {
    if (!process.env.REDIS_URL) {
      // console.warn("REDIS_URL missing");
      return null;
    }

    try {
      // Validate URL
      new URL(process.env.REDIS_URL);
      
      redis = createClient({ url: process.env.REDIS_URL });
      redis.on("error", (err) => {
        console.error("Redis Client Error", err);
        redis = false; 
      });
      await redis.connect();
    } catch (e) {
      console.error("Redis Connection Failed:", e.message);
      redis = false;
      return null;
    }
  }
  return redis;
}

// Helper to clear all startup list caches
export async function invalidateStartupsCache() {
  const client = await getRedisClient();
  if (!client) return;

  try {
    // scanIterator handles the loop internally
    for await (const key of client.scanIterator({
      MATCH: "startups:*", // scanIterator supports uppercase or lowercase depending on version, but lowercase is safer
      COUNT: 100
    })) {
      await client.del(key);
    }
    
    console.log("Cache invalidated");
  } catch (e) {
    console.error("Failed to invalidate cache", e);
  }
}