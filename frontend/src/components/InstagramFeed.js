import React, { useState, useEffect } from 'react';
import { api } from '../api';
import './InstagramFeed.css';

const INSTAGRAM_URL = 'https://www.instagram.com/thenailhubs/';

// Live Instagram posts + stories pulled through the backend (cached).
// If the API isn't reachable or no token is configured, falls back to
// the official Instagram profile embed so the section never looks empty.
function InstagramFeed() {
  const [posts, setPosts] = useState(null);
  const [stories, setStories] = useState([]);
  const [useFallback, setUseFallback] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    let active = true;

    api.getInstagramFeed(12)
      .then((data) => {
        if (!active) return;
        if (data.configured && data.posts && data.posts.length > 0) {
          setPosts(data.posts);
        } else {
          setUseFallback(true);
        }
      })
      .catch(() => active && setUseFallback(true));

    api.getInstagramStories()
      .then((data) => {
        if (active && data.configured && data.stories) {
          setStories(data.stories);
        }
      })
      .catch(() => {});

    return () => { active = false; };
  }, []);

  if (useFallback) {
    return (
      <div className="instagram-feed-wrapper">
        <iframe
          src="https://www.instagram.com/thenailhubs/embed"
          className="instagram-feed-iframe"
          frameBorder="0"
          scrolling="no"
          loading="lazy"
          title="Instagram Feed"
          style={{
            background: 'white',
            maxWidth: '100%',
            width: '100%',
            border: 'none',
            overflow: 'hidden',
            minHeight: '600px',
            borderRadius: '15px',
          }}
        />
      </div>
    );
  }

  if (!posts) {
    return (
      <div className="ig-loading">
        <div className="ig-loading-spinner" />
        <p>Loading our latest work…</p>
      </div>
    );
  }

  const renderMedia = (item) => {
    const src = item.media_type === 'VIDEO' ? (item.thumbnail_url || item.media_url) : item.media_url;
    return <img src={src} alt={item.caption ? item.caption.slice(0, 80) : 'The Nail Hubs nail art'} loading="lazy" />;
  };

  return (
    <div className="ig-live-feed">
      {stories.length > 0 && (
        <div className="ig-stories">
          <h4 className="ig-stories-title">✨ Today's Stories</h4>
          <div className="ig-stories-row">
            {stories.map((story) => (
              <button
                key={story.id}
                className="ig-story-bubble"
                onClick={() => setLightbox(story)}
                aria-label="View story"
              >
                <span className="ig-story-ring">
                  <img
                    src={story.media_type === 'VIDEO' ? (story.thumbnail_url || story.media_url) : story.media_url}
                    alt="Instagram story"
                    loading="lazy"
                  />
                </span>
                {story.media_type === 'VIDEO' && <span className="ig-video-badge">▶</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="ig-posts-grid">
        {posts.map((post) => (
          <a
            key={post.id}
            href={post.permalink || INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ig-post-card"
          >
            {renderMedia(post)}
            {post.media_type === 'VIDEO' && <span className="ig-video-badge">▶</span>}
            {post.media_type === 'CAROUSEL_ALBUM' && <span className="ig-video-badge">🗂</span>}
            <div className="ig-post-overlay">
              <p>{post.caption ? `${post.caption.slice(0, 90)}${post.caption.length > 90 ? '…' : ''}` : 'View on Instagram'}</p>
            </div>
          </a>
        ))}
      </div>

      {lightbox && (
        <div className="ig-lightbox" onClick={() => setLightbox(null)} role="dialog" aria-label="Story viewer">
          <button className="ig-lightbox-close" onClick={() => setLightbox(null)} aria-label="Close">✕</button>
          <div className="ig-lightbox-content" onClick={(e) => e.stopPropagation()}>
            {lightbox.media_type === 'VIDEO' ? (
              <video src={lightbox.media_url} controls autoPlay playsInline />
            ) : (
              <img src={lightbox.media_url} alt="Instagram story" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default InstagramFeed;
