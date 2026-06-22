// Securely fetches Google reviews for Cross Hammer Gym.
// The API key lives ONLY in a Netlify environment variable (GOOGLE_API_KEY),
// never in the front-end, so it is never exposed to visitors.

const PLACE_ID = "ChIJMWiFnqSVyzsRJ7_HDBfPn4g"; // Cross Hammer Gym

// Simple in-memory cache so we don't call Google on every single page load.
let cache = { at: 0, data: null };
const TTL_MS = 1000 * 60 * 60 * 6; // refresh at most every 6 hours

exports.handler = async function () {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) {
    return json(500, { error: "Server not configured: missing GOOGLE_API_KEY." });
  }

  // Serve cached data if still fresh
  if (cache.data && Date.now() - cache.at < TTL_MS) {
    return json(200, cache.data, true);
  }

  try {
    // Places API (New) — Place Details. Ask only for the fields we need
    // (rating, total count, and reviews) to keep billing minimal.
    const url =
      "https://places.googleapis.com/v1/places/" +
      PLACE_ID +
      "?fields=rating,userRatingCount,googleMapsUri,reviews&languageCode=en";

    const resp = await fetch(url, {
      headers: {
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri,reviews",
      },
    });

    if (!resp.ok) {
      const text = await resp.text();
      return json(502, { error: "Google API error", status: resp.status, detail: text.slice(0, 300) });
    }

    const data = await resp.json();

    const reviews = (data.reviews || []).map((r) => ({
      author: r.authorAttribution?.displayName || "Google user",
      photo: r.authorAttribution?.photoUri || "",
      profileUrl: r.authorAttribution?.uri || "",
      rating: r.rating || 5,
      text: (r.text?.text || r.originalText?.text || "").trim(),
      relativeTime: r.relativePublishTimeDescription || "",
    }));

    const payload = {
      rating: data.rating || 4.9,
      total: data.userRatingCount || 0,
      mapsUri: data.googleMapsUri || "",
      reviews,
    };

    cache = { at: Date.now(), data: payload };
    return json(200, payload);
  } catch (e) {
    // If Google fails but we have an old cache, serve it rather than break the page
    if (cache.data) return json(200, cache.data, true);
    return json(500, { error: "Failed to fetch reviews", detail: String(e).slice(0, 200) });
  }
};

function json(status, body, stale) {
  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=1800", // browser/CDN cache 30 min
      "Access-Control-Allow-Origin": "*",
      ...(stale ? { "X-Cache": "stale-or-cached" } : {}),
    },
    body: JSON.stringify(body),
  };
}
