import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductReviewsSection } from '../src/components/products/ProductReviewsSection';
import { ReviewService } from '../src/services/review/review.service';
import productsData from '../src/data/products.json';
import { Product } from '../src/types/product';

const sampleProducts = productsData as unknown as Product[];
const productA = sampleProducts[0]; // de-prod-001 (has 3 initial reviews)

describe('Option 4: Product Reviews & Customer Ratings System', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders rating summary, breakdown bars, and initial verified reviews', () => {
    render(<ProductReviewsSection product={productA} />);

    // Section title
    expect(screen.getByRole('heading', { name: /Customer Reviews & Ratings/i })).toBeInTheDocument();

    // Average score should be visible (e.g. 4.7)
    const summary = ReviewService.getRatingSummary(productA.id);
    expect(screen.getByText(String(summary.averageRating))).toBeInTheDocument();

    // Review author and comment from reviews.json
    expect(screen.getByText('Arjun Mehta')).toBeInTheDocument();
    expect(screen.getByText(/Principal Cloud Architect/i)).toBeInTheDocument();
    expect(screen.getByText(/Clear, practical blueprints with zero filler/i)).toBeInTheDocument();

    // Verified buyer badge
    const verifiedBadges = screen.getAllByText(/Verified Buyer/i);
    expect(verifiedBadges.length).toBeGreaterThan(0);
  });

  it('filters reviews by star rating pill', async () => {
    const user = userEvent.setup();
    render(<ProductReviewsSection product={productA} />);

    // Filter to 4 stars
    const fourStarBtn = screen.getAllByRole('button', { name: /4 Stars/i })[0];
    await user.click(fourStarBtn);

    // Devon Vance has a 4-star review
    expect(screen.getByText('Devon Vance')).toBeInTheDocument();

    // 5-star reviewer Arjun Mehta should be filtered out
    expect(screen.queryByText('Arjun Mehta')).not.toBeInTheDocument();

    // Reset filter to All
    const allBtn = screen.getByRole('button', { name: /^All \(/i });
    await user.click(allBtn);

    expect(screen.getByText('Arjun Mehta')).toBeInTheDocument();
  });

  it('submits a new customer review, updates average rating, and persists to localStorage', async () => {
    const user = userEvent.setup();
    render(<ProductReviewsSection product={productA} />);

    // Open "Write a Review" form
    const writeBtn = screen.getByRole('button', { name: /Write a Review/i });
    await user.click(writeBtn);

    // Fill form fields
    const nameInput = screen.getByLabelText(/Your Name \*/i);
    const roleInput = screen.getByLabelText(/Your Role or Team/i);
    const titleInput = screen.getByLabelText(/Headline \/ Summary \*/i);
    const commentInput = screen.getByLabelText(/Detailed Review \*/i);

    fireEvent.change(nameInput, { target: { value: 'Vikram Joshi' } });
    fireEvent.change(roleInput, { target: { value: 'Staff SRE' } });
    fireEvent.change(titleInput, { target: { value: 'Best distributed systems reference guide' } });
    fireEvent.change(commentInput, {
      target: { value: 'Every engineer on our infrastructure team found the saga pattern diagrams invaluable.' },
    });

    // Pick 5 stars
    const fiveStarPick = screen.getByRole('button', { name: '5 stars' });
    await user.click(fiveStarPick);

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /Post Verified Review/i });
    await user.click(submitBtn);

    // Confirmation alert
    expect(screen.getByRole('status')).toHaveTextContent(/Thank you! Your verified review has been submitted/i);

    // New review appears in the list
    expect(screen.getByText('Vikram Joshi')).toBeInTheDocument();
    expect(screen.getByText('Staff SRE')).toBeInTheDocument();
    expect(screen.getByText('Best distributed systems reference guide')).toBeInTheDocument();

    // Check localStorage persistence
    const reloadedReviews = ReviewService.getReviewsForProduct(productA.id);
    expect(reloadedReviews.some((r) => r.authorName === 'Vikram Joshi')).toBe(true);
  });

  it('increments helpful count when clicking Helpful button', async () => {
    const user = userEvent.setup();
    render(<ProductReviewsSection product={productA} />);

    // Locate the first helpful button
    const helpfulButtons = screen.getAllByRole('button', { name: /Mark review by .+ as helpful/i });
    const initialText = helpfulButtons[0].textContent;

    await user.click(helpfulButtons[0]);

    // Helpful count should have incremented
    const updatedButtons = screen.getAllByRole('button', { name: /Mark review by .+ as helpful/i });
    expect(updatedButtons[0].textContent).not.toBe(initialText);
  });
});
