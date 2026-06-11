"""
Live social integrations for The Nail Hubs
- Instagram feed & stories via the Instagram Graph API
- Google rating & reviews via the Google Places API (New)

All responses are cached in-memory with a TTL so the salon never hits
API rate limits, and every endpoint degrades gracefully (configured: False)
when credentials are missing so the frontend can fall back to embeds.
"""

import os
import time
from typing import Callable, Dict, List, Optional

import requests

INSTAGRAM_GRAPH_URL = "https://graph.instagram.com/v21.0"
PLACES_API_URL = "https://places.googleapis.com/v1/places"

FEED_CACHE_TTL = 30 * 60        # 30 minutes
STORIES_CACHE_TTL = 10 * 60     # 10 minutes (stories expire fast)
REVIEWS_CACHE_TTL = 6 * 60 * 60  # 6 hours
ERROR_CACHE_TTL = 2 * 60        # don't hammer APIs after a failure

_cache: Dict[str, tuple] = {}


def _cached(key: str, ttl: int, fetch: Callable[[], Dict]) -> Dict:
    """Return cached value if fresh, otherwise fetch and cache."""
    now = time.time()
    entry = _cache.get(key)
    if entry:
        cached_at, value = entry
        effective_ttl = ttl if not value.get("error") else ERROR_CACHE_TTL
        if now - cached_at < effective_ttl:
            return value

    value = fetch()
    _cache[key] = (now, value)
    return value


def _instagram_token() -> Optional[str]:
    return os.environ.get("INSTAGRAM_ACCESS_TOKEN") or None


def _instagram_user_id() -> str:
    return os.environ.get("INSTAGRAM_USER_ID", "me")


MEDIA_FIELDS = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp"


def _format_media(item: Dict) -> Dict:
    return {
        "id": item.get("id"),
        "caption": item.get("caption", ""),
        "media_type": item.get("media_type"),
        "media_url": item.get("media_url"),
        "thumbnail_url": item.get("thumbnail_url"),
        "permalink": item.get("permalink"),
        "timestamp": item.get("timestamp"),
    }


def get_instagram_feed(limit: int = 12) -> Dict:
    """Latest Instagram posts for the salon account."""
    token = _instagram_token()
    if not token:
        return {"configured": False, "posts": []}

    def fetch():
        try:
            resp = requests.get(
                f"{INSTAGRAM_GRAPH_URL}/{_instagram_user_id()}/media",
                params={
                    "fields": MEDIA_FIELDS,
                    "limit": max(1, min(limit, 25)),
                    "access_token": token,
                },
                timeout=10,
            )
            resp.raise_for_status()
            posts = [_format_media(item) for item in resp.json().get("data", [])]
            return {"configured": True, "posts": posts}
        except requests.RequestException as e:
            return {"configured": True, "posts": [], "error": str(e)}

    return _cached(f"ig_feed_{limit}", FEED_CACHE_TTL, fetch)


def get_instagram_stories() -> Dict:
    """Active Instagram stories (requires a professional IG account)."""
    token = _instagram_token()
    if not token:
        return {"configured": False, "stories": []}

    def fetch():
        try:
            resp = requests.get(
                f"{INSTAGRAM_GRAPH_URL}/{_instagram_user_id()}/stories",
                params={"fields": MEDIA_FIELDS, "access_token": token},
                timeout=10,
            )
            resp.raise_for_status()
            stories = [_format_media(item) for item in resp.json().get("data", [])]
            return {"configured": True, "stories": stories}
        except requests.RequestException as e:
            return {"configured": True, "stories": [], "error": str(e)}

    return _cached("ig_stories", STORIES_CACHE_TTL, fetch)


def refresh_instagram_token() -> Dict:
    """
    Refresh the long-lived Instagram token (valid 60 days).
    Call periodically (e.g. monthly cron) and store the returned token.
    """
    token = _instagram_token()
    if not token:
        return {"configured": False}

    try:
        resp = requests.get(
            "https://graph.instagram.com/refresh_access_token",
            params={"grant_type": "ig_refresh_token", "access_token": token},
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        return {
            "configured": True,
            "access_token": data.get("access_token"),
            "expires_in_days": round(data.get("expires_in", 0) / 86400),
        }
    except requests.RequestException as e:
        return {"configured": True, "error": str(e)}


def get_google_reviews() -> Dict:
    """Live Google rating and latest reviews via the Places API (New)."""
    api_key = os.environ.get("GOOGLE_PLACES_API_KEY")
    place_id = os.environ.get("GOOGLE_PLACE_ID")
    if not api_key or not place_id:
        return {"configured": False, "reviews": []}

    def fetch():
        try:
            resp = requests.get(
                f"{PLACES_API_URL}/{place_id}",
                headers={
                    "X-Goog-Api-Key": api_key,
                    "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri,reviews",
                },
                timeout=10,
            )
            resp.raise_for_status()
            data = resp.json()
            reviews = []
            for review in data.get("reviews", []):
                author = review.get("authorAttribution", {})
                reviews.append({
                    "author": author.get("displayName", "Google User"),
                    "author_photo": author.get("photoUri"),
                    "author_url": author.get("uri"),
                    "rating": review.get("rating"),
                    "relative_time": review.get("relativePublishTimeDescription"),
                    "text": (review.get("text") or {}).get("text", ""),
                    "publish_time": review.get("publishTime"),
                })
            return {
                "configured": True,
                "rating": data.get("rating"),
                "total_reviews": data.get("userRatingCount"),
                "maps_url": data.get("googleMapsUri"),
                "reviews": reviews,
            }
        except requests.RequestException as e:
            return {"configured": True, "reviews": [], "error": str(e)}

    return _cached("google_reviews", REVIEWS_CACHE_TTL, fetch)
