import baseReviewsData from '../../data/reviews.json';
import { Review, ProductRatingSummary } from '../../types/review';

const REVIEWS_STORAGE_KEY = 'digiecom_reviews_v1';
const VOTES_STORAGE_KEY = 'digiecom_review_votes_v1';

export class ReviewService {
  /**
   * Retrieves all user-submitted reviews stored in localStorage.
   */
  private static getStoredReviews(): Review[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(REVIEWS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  /**
   * Retrieves all helpful vote counts from localStorage.
   */
  private static getStoredVotes(): Record<string, number> {
    if (typeof window === 'undefined') return {};
    try {
      const raw = window.localStorage.getItem(VOTES_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch {
      return {};
    }
  }

  /**
   * Returns all reviews for a specific product, combining base seed data with user reviews.
   */
  public static getReviewsForProduct(productId: string): Review[] {
    const baseReviews = (baseReviewsData as unknown as Review[]).filter(
      (r) => r.productId === productId
    );
    const storedReviews = this.getStoredReviews().filter((r) => r.productId === productId);
    const votes = this.getStoredVotes();

    const all = [...storedReviews, ...baseReviews];

    // Apply any local vote increments
    return all.map((r) => ({
      ...r,
      helpfulCount: r.helpfulCount + (votes[r.id] || 0),
    }));
  }

  /**
   * Computes average rating and star distribution breakdown.
   */
  public static getRatingSummary(productId: string): ProductRatingSummary {
    const reviews = this.getReviewsForProduct(productId);

    const starBreakdown: Record<1 | 2 | 3 | 4 | 5, number> = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    if (reviews.length === 0) {
      // Default initial baseline for products without reviews yet
      return {
        averageRating: 5.0,
        totalReviews: 0,
        starBreakdown,
        starPercentages: { 5: 100, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    let sum = 0;
    for (const r of reviews) {
      const rating = Math.min(Math.max(Math.round(r.rating), 1), 5) as 1 | 2 | 3 | 4 | 5;
      starBreakdown[rating] = (starBreakdown[rating] || 0) + 1;
      sum += r.rating;
    }

    const averageRating = Number((sum / reviews.length).toFixed(1));

    const starPercentages: Record<1 | 2 | 3 | 4 | 5, number> = {
      5: Math.round((starBreakdown[5] / reviews.length) * 100),
      4: Math.round((starBreakdown[4] / reviews.length) * 100),
      3: Math.round((starBreakdown[3] / reviews.length) * 100),
      2: Math.round((starBreakdown[2] / reviews.length) * 100),
      1: Math.round((starBreakdown[1] / reviews.length) * 100),
    };

    return {
      averageRating,
      totalReviews: reviews.length,
      starBreakdown,
      starPercentages,
    };
  }

  /**
   * Submits and saves a new customer review.
   */
  public static addReview(
    productId: string,
    data: {
      authorName: string;
      authorRole?: string;
      rating: number;
      title: string;
      comment: string;
    }
  ): Review {
    const newReview: Review = {
      id: `rev-usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId,
      authorName: data.authorName.trim(),
      authorRole: data.authorRole?.trim() || 'Verified Developer',
      rating: Math.min(Math.max(Math.round(data.rating), 1), 5),
      date: 'Just now',
      title: data.title.trim(),
      comment: data.comment.trim(),
      isVerifiedBuyer: true,
      helpfulCount: 0,
    };

    if (typeof window !== 'undefined') {
      try {
        const stored = this.getStoredReviews();
        window.localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify([newReview, ...stored]));
      } catch (err) {
        console.warn('Failed to save review to localStorage:', err);
      }
    }

    return newReview;
  }

  /**
   * Increments helpful counter for a review.
   */
  public static voteHelpful(reviewId: string): void {
    if (typeof window === 'undefined') return;
    try {
      const votes = this.getStoredVotes();
      votes[reviewId] = (votes[reviewId] || 0) + 1;
      window.localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(votes));
    } catch (err) {
      console.warn('Failed to record helpful vote:', err);
    }
  }
}
