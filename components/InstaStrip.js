'use client';

import React, { useState, useEffect } from 'react';
import { BUSINESS } from '@/lib/businessRules';
import { api } from '@/lib/clientApi';

// One fetch per page load, shared by every strip on the page —
// the same Instagram posts get reused across the whole experience
// instead of hammering the API once per section.
let feedPromise = null;
function getFeedOnce() {
  if (!feedPromise) {
    feedPromise = api.getInstagramFeed(12).catch(() => null);
  }
  return feedPromise;
}

// Auto-scrolling film strip of real Instagram posts. Renders nothing at
// all when the feed isn't configured, so it never shows an empty box.
function InstaStrip({ title = 'Fresh from our Instagram', subtitle }) {
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    let active = true;
    getFeedOnce().then((data) => {
      if (active && data?.configured && data.posts?.length >= 4) {
        setPosts(data.posts);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  if (!posts) return null;

  // duplicate the row so the marquee loops seamlessly
  const loop = [...posts, ...posts];

  return (
    <section className="insta-strip" aria-label="Latest Instagram posts">
      <div className="insta-strip-head">
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <a
          className="insta-strip-follow"
          href={BUSINESS.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          @{BUSINESS.instagram} →
        </a>
      </div>
      <div className="insta-strip-viewport">
        <div className="insta-strip-track" style={{ '--strip-count': posts.length }}>
          {loop.map((post, i) => (
            <a
              key={`${post.id}-${i}`}
              href={post.permalink || BUSINESS.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="insta-strip-card"
              tabIndex={i >= posts.length ? -1 : 0}
              aria-hidden={i >= posts.length}
            >
              <img
                src={post.media_type === 'VIDEO' ? post.thumbnail_url || post.media_url : post.media_url}
                alt={post.caption ? post.caption.slice(0, 60) : 'The Nail Hubs nail art'}
                loading="lazy"
              />
              {post.media_type === 'VIDEO' && <span className="insta-strip-badge">▶</span>}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default InstaStrip;
