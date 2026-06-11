import React, { useState, useEffect } from 'react';
import { api } from '../api';
import './GoogleReviews.css';

// Curated reviews shown until the live Google Places integration is
// configured (or whenever the API is unreachable)
const FALLBACK_REVIEWS = [
  {
    author: 'Vyoma Patel',
    rating: 5,
    relative_time: 'Local Guide · 2 years ago',
    text: 'I went here for my wedding Nail art… & I noticed Cooperative nature of saloni, she explains well about shapes of nail extensions, gel polish, which colour would suit on my outfits... also her suggestions for designs and colours are up to mark… thank you for making my nails pretty 🤗♥️',
  },
  {
    author: 'Dhvani Shah',
    rating: 5,
    relative_time: '7 months ago',
    text: 'I recently had the pleasure of getting my nails done at The Nails Hub, and I must say it was such a relaxing and enjoyable experience! I especially loved how creative and detailed the nail artist was—the design turned out even better than I imagined!',
  },
  {
    author: 'Gayatri Patel',
    rating: 5,
    relative_time: 'A year ago',
    text: 'Firstly I would like to say Thank you to saloni for being so polite and courteous, nail techs actually are very knowledgeable and have interest. I highly recommend this nail studio (THE NAIL HUBS).',
  },
  {
    author: 'Helin Patel',
    rating: 5,
    relative_time: '3 months ago',
    text: 'It was amazing experience. I never got my nails done nd the owner was very sweet despite me fumbling. It was a really good experience overall.',
  },
  {
    author: 'Dolly Suthar',
    rating: 5,
    relative_time: 'A year ago',
    text: 'Got the beautiful nails.... So happy to choose her for permanent things.... Thank you so much the nail hubs (saloni) my first experience is good and worth visiting .. ♥️♥️♥️♥️😘',
  },
  {
    author: 'Nidhi Patel',
    rating: 5,
    relative_time: '2 years ago',
    text: "Must visit guys. It's a such a amazing experience ❤️❤️❤️ I am so happy with artist's work and it's is also reasonable range ❤️❤️❤️❤️",
  },
  {
    author: 'Meet Patel',
    rating: 5,
    relative_time: 'A year ago',
    text: 'Very happy with the service here! My sister got her nails done here for her birthday ceremony and she was too happy with that...... Thank you THE NAIL HUBS (saloni didi) 😍💐',
  },
  {
    author: 'Minaxi Patel',
    rating: 5,
    relative_time: 'A year ago',
    text: 'She has magical hands... Got awesome nails.... Specially came from Bharuch....very happy.... ♥️♥️♥️',
  },
  {
    author: 'Misha Patel',
    rating: 5,
    relative_time: '10 months ago',
    text: 'Art of nails is too much elegance and natural. Nature is too much soft and friendly.',
  },
];

const stars = (rating) => '⭐'.repeat(Math.round(rating || 5));

function GoogleReviews() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;
    api.getGoogleReviews()
      .then((res) => {
        if (active && res.configured && res.reviews && res.reviews.length > 0) {
          setData(res);
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const isLive = Boolean(data);
  const reviews = isLive ? data.reviews : FALLBACK_REVIEWS;
  const rating = isLive && data.rating ? data.rating.toFixed(1) : '5.0';
  const totalLabel = isLive && data.total_reviews
    ? `${data.total_reviews} Google reviews and counting!`
    : 'Join hundreds of satisfied customers!';

  return (
    <>
      <div className="reviews-header">
        <div className="reviews-rating">
          <span className="star-icon">{stars(rating)}</span>
          <h3>{rating} Rating on Google</h3>
          <p>{totalLabel}</p>
          {isLive && <span className="live-reviews-badge">● Live from Google</span>}
        </div>
      </div>

      <div className="testimonials-header">
        <h3>{isLive ? 'Latest Google Reviews' : 'Customer Testimonials'}</h3>
        <p>Hear what our clients have to say about their experience</p>
      </div>

      <div className="review-cards">
        {reviews.map((review, index) => (
          <div className="review-card" key={review.author + index}>
            <div className="review-card-top">
              {review.author_photo && (
                <img
                  className="review-avatar"
                  src={review.author_photo}
                  alt={review.author}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="review-stars">{stars(review.rating)}</div>
            </div>
            <p className="review-text">{review.text}</p>
            <p className="review-author">- {review.author}</p>
            {review.relative_time && <p className="review-meta">{review.relative_time}</p>}
          </div>
        ))}
      </div>
    </>
  );
}

export default GoogleReviews;
