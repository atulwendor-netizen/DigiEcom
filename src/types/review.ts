export interface Review {
  id: string;
  productId: string;
  authorName: string;
  authorRole?: string;
  rating: number; // 1 to 5
  date: string;
  title: string;
  comment: string;
  isVerifiedBuyer: boolean;
  helpfulCount: number;
}

export interface ProductRatingSummary {
  averageRating: number;
  totalReviews: number;
  starBreakdown: Record<1 | 2 | 3 | 4 | 5, number>;
  starPercentages: Record<1 | 2 | 3 | 4 | 5, number>;
}
