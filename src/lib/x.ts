import { demoFollowerHandles } from "./demo-data";

type XFollowerResult = {
  mode: "demo" | "live";
  handles: string[];
  warning?: string;
};

export async function getXFollowers(userId?: string, maxResults = 100): Promise<XFollowerResult> {
  const fallback = (warning?: string): XFollowerResult => ({
    mode: "demo",
    handles: demoFollowerHandles.slice(0, maxResults),
    warning,
  });

  const bearer = process.env.X_BEARER_TOKEN;
  if (!bearer || !userId) return fallback();

  const url = new URL(`https://api.x.com/2/users/${userId}/followers`);
  url.searchParams.set("max_results", String(Math.min(1000, maxResults)));
  url.searchParams.set("user.fields", "username,name,profile_image_url");

  try {
    const res = await fetch(url, { headers: { authorization: `Bearer ${bearer}` }, cache: "no-store" });
    if (!res.ok) return fallback(`X follower lookup returned ${res.status}; using demo-safe followers.`);
    const json = await res.json();
    const handles = Array.isArray(json.data) ? json.data.map((user: { username: string }) => user.username).filter(Boolean) : [];
    return { mode: "live", handles };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown X API error";
    return fallback(`X follower lookup failed (${message}); using demo-safe followers.`);
  }
}
