import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, ThumbsUp, MessageSquarePlus, Filter, X } from 'lucide-react';
import { Product } from '../../types/product';
import { Review, ProductRatingSummary } from '../../types/review';
import { ReviewService } from '../../services/review/review.service';

interface ProductReviewsSectionProps {
  product: Product;
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({ product }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ProductRatingSummary>({
    averageRating: 5.0,
    totalReviews: 0,
    starBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    starPercentages: { 5: 100, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | 'all'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Form states
  const [authorName, setAuthorName] = useState('');
  const [authorRole, setAuthorRole] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  // Reload reviews
  const loadReviewsData = () => {
    const list = ReviewService.getReviewsForProduct(product.id);
    const sum = ReviewService.getRatingSummary(product.id);
    setReviews(list);
    setSummary(sum);
  };

  useEffect(() => {
    loadReviewsData();
  }, [product.id]);

  const handleVoteHelpful = (reviewId: string) => {
    ReviewService.voteHelpful(reviewId);
    loadReviewsData();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !title.trim() || !comment.trim()) return;

    ReviewService.addReview(product.id, {
      authorName,
      authorRole: authorRole || 'Verified Developer',
      rating,
      title,
      comment,
    });

    // Reset form
    setAuthorName('');
    setAuthorRole('');
    setRating(5);
    setTitle('');
    setComment('');
    setFormSubmitted(true);
    setIsFormOpen(false);

    loadReviewsData();

    setTimeout(() => {
      setFormSubmitted(false);
    }, 4000);
  };

  const filteredReviews =
    selectedRatingFilter === 'all'
      ? reviews
      : reviews.filter((r) => Math.round(r.rating) === selectedRatingFilter);

  return (
    <section
      id="reviews"
      aria-labelledby="reviews-heading"
      style={{
        marginTop: 'var(--space-12)',
        paddingTop: 'var(--space-10)',
        borderTop: '1px solid var(--border-subtle)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <div>
          <span className="badge badge-lime" style={{ fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Verified Community Feedback
          </span>
          <h2 id="reviews-heading" style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, margin: 0 }}>
            Customer Reviews & Ratings
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: '6px 0 0' }}>
            Real evaluations from software engineers, tech founders, and digital creators.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
          aria-expanded={isFormOpen}
        >
          <MessageSquarePlus size={16} color="var(--accent-lime)" />
          <span>{isFormOpen ? 'Close Review Form' : 'Write a Review'}</span>
        </button>
      </div>

      {formSubmitted && (
        <div
          role="status"
          style={{
            backgroundColor: 'rgba(198, 255, 101, 0.1)',
            border: '1px solid var(--accent-lime)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3) var(--space-4)',
            marginBottom: 'var(--space-6)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            color: 'var(--text-primary)',
            fontSize: 'var(--text-sm)',
          }}
        >
          <CheckCircle2 size={18} color="var(--accent-lime)" />
          <span>Thank you! Your verified review has been submitted and posted to this digital product.</span>
        </div>
      )}

      {/* Review Form Accordion */}
      {isFormOpen && (
        <form
          onSubmit={handleFormSubmit}
          style={{
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius)',
            padding: 'var(--space-6)',
            marginBottom: 'var(--space-8)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, margin: 0 }}>Share Your Feedback</h3>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              aria-label="Close review form"
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Interactive Star Rating Picker */}
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, marginBottom: '6px' }}>
              Your Rating *
            </label>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }} role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((starNum) => {
                const isLit = (hoverRating !== null ? hoverRating : rating) >= starNum;
                return (
                  <button
                    key={starNum}
                    type="button"
                    onClick={() => setRating(starNum)}
                    onMouseEnter={() => setHoverRating(starNum)}
                    onMouseLeave={() => setHoverRating(null)}
                    aria-label={`${starNum} star${starNum > 1 ? 's' : ''}`}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      color: isLit ? 'var(--accent-lime)' : 'var(--text-dim)',
                      transition: 'transform var(--transition-fast)',
                    }}
                  >
                    <Star size={24} fill={isLit ? 'var(--accent-lime)' : 'none'} />
                  </button>
                );
              })}
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-lime)', fontWeight: 700, marginLeft: '8px' }}>
                {rating} of 5 Stars
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
            <div>
              <label htmlFor="review-author" style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, marginBottom: '4px' }}>
                Your Name *
              </label>
              <input
                id="review-author"
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="review-role" style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, marginBottom: '4px' }}>
                Your Role or Team (Optional)
              </label>
              <input
                id="review-role"
                type="text"
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label htmlFor="review-title" style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, marginBottom: '4px' }}>
              Headline / Summary *
            </label>
            <input
              id="review-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Saved our engineering team weeks of architectural research"
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="review-comment" style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, marginBottom: '4px' }}>
              Detailed Review *
            </label>
            <textarea
              id="review-comment"
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What specifically made this digital asset valuable? Mention inclusions, code quality, or practical results..."
              className="input-field"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
            <button type="button" onClick={() => setIsFormOpen(false)} className="btn btn-ghost btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '8px 20px', fontWeight: 700 }}>
              Post Verified Review
            </button>
          </div>
        </form>
      )}

      {/* Ratings Summary Box */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 'var(--space-6)',
          backgroundColor: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius)',
          padding: 'var(--space-6)',
          marginBottom: 'var(--space-8)',
          alignItems: 'center',
        }}
      >
        {/* Left: Big Score & Stars */}
        <div style={{ textAlign: 'center', padding: 'var(--space-2)' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '3.5rem',
              fontWeight: 900,
              color: 'var(--accent-lime)',
              lineHeight: 1,
              marginBottom: 'var(--space-2)',
            }}
          >
            {summary.averageRating}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: 'var(--space-2)' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={18}
                fill={i <= Math.round(summary.averageRating) ? 'var(--accent-lime)' : 'none'}
                color="var(--accent-lime)"
              />
            ))}
          </div>

          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Based on {summary.totalReviews} verified community reviews
          </span>
        </div>

        {/* Right: Breakdown Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {([5, 4, 3, 2, 1] as const).map((starNum) => {
            const pct = summary.starPercentages[starNum] || 0;
            const count = summary.starBreakdown[starNum] || 0;
            const isSelected = selectedRatingFilter === starNum;

            return (
              <button
                key={starNum}
                type="button"
                onClick={() => setSelectedRatingFilter(isSelected ? 'all' : starNum)}
                style={{
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  cursor: 'pointer',
                  padding: '2px 0',
                  textAlign: 'left',
                }}
                aria-label={`Filter by ${starNum} stars (${count} reviews)`}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: isSelected ? 'var(--accent-lime)' : 'var(--text-secondary)',
                    minWidth: '50px',
                    fontWeight: 600,
                  }}
                >
                  {starNum} Stars
                </span>

                {/* Progress Track */}
                <div
                  style={{
                    flex: 1,
                    height: '8px',
                    backgroundColor: 'var(--panel-light)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      backgroundColor: isSelected ? 'var(--accent-lime)' : 'var(--accent-lime)',
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.4s var(--ease-out-smooth)',
                    }}
                  />
                </div>

                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-dim)',
                    minWidth: '40px',
                    textAlign: 'right',
                  }}
                >
                  {count} ({pct}%)
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          <Filter size={14} />
          <span>Filter:</span>
        </div>

        <button
          type="button"
          onClick={() => setSelectedRatingFilter('all')}
          className={`btn btn-sm ${selectedRatingFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '11px', padding: '4px 12px' }}
        >
          All ({reviews.length})
        </button>

        {[5, 4, 3].map((starNum) => (
          <button
            key={starNum}
            type="button"
            onClick={() => setSelectedRatingFilter(selectedRatingFilter === starNum ? 'all' : starNum)}
            className={`btn btn-sm ${selectedRatingFilter === starNum ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '11px', padding: '4px 12px' }}
          >
            {starNum} Stars ({summary.starBreakdown[starNum as 1 | 2 | 3 | 4 | 5] || 0})
          </button>
        ))}
      </div>

      {/* Reviews Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {filteredReviews.length === 0 ? (
          <div
            style={{
              padding: 'var(--space-8)',
              textAlign: 'center',
              backgroundColor: 'var(--ink-2)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-card)',
            }}
          >
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', margin: 0 }}>
              No reviews match this star rating filter.
            </p>
            <button
              type="button"
              onClick={() => setSelectedRatingFilter('all')}
              className="btn btn-ghost btn-sm"
              style={{ marginTop: 'var(--space-2)', color: 'var(--accent-lime)' }}
            >
              Show all reviews
            </button>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              style={{
                backgroundColor: 'var(--ink-2)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-5)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
                transition: 'border-color var(--transition-fast)',
              }}
            >
              {/* Header row: Author & Rating */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                      {rev.authorName}
                    </span>
                    {rev.isVerifiedBuyer && (
                      <span
                        className="badge badge-lime"
                        style={{
                          fontSize: '10px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          padding: '1px 6px',
                        }}
                      >
                        <CheckCircle2 size={10} /> Verified Buyer
                      </span>
                    )}
                  </div>
                  {rev.authorRole && (
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block', marginTop: '2px' }}>
                      {rev.authorRole}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i <= rev.rating ? 'var(--accent-lime)' : 'none'}
                        color="var(--accent-lime)"
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    {rev.date}
                  </span>
                </div>
              </div>

              {/* Title & Comment */}
              <div>
                <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                  {rev.title}
                </h4>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {rev.comment}
                </p>
              </div>

              {/* Helpful Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--space-2)' }}>
                <button
                  type="button"
                  onClick={() => handleVoteHelpful(rev.id)}
                  className="btn btn-ghost btn-sm"
                  style={{
                    fontSize: '11px',
                    color: 'var(--text-dim)',
                    gap: '6px',
                    padding: '4px 8px',
                  }}
                  aria-label={`Mark review by ${rev.authorName} as helpful, currently ${rev.helpfulCount}`}
                >
                  <ThumbsUp size={12} />
                  <span>Helpful ({rev.helpfulCount})</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};
