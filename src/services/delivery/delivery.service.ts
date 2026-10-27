/**
 * Digital Delivery Architecture Boundary
 *
 * CRITICAL SECURITY CONSTRAINTS:
 * 1. Digital product binary files (.zip, .pdf, .fig, etc.) MUST NOT be placed
 *    in the public static assets directory (`/public`).
 * 2. In production, file downloads require an authenticated backend that generates
 *    short-lived cryptographically signed URLs (e.g., AWS S3 presigned URLs,
 *    Google Cloud Storage signed URLs) only after confirming completed order payment.
 * 3. Delivery must track download audit logs and enforce IP/rate limits.
 */

export interface DeliveryExpectation {
  formatSummary: string;
  deliveryMethod: string;
  isConfigured: boolean;
  statusMessage: string;
}

export class DeliveryService {
  /**
   * Returns human-readable delivery expectations for a product.
   */
  public static getDeliveryExpectation(): DeliveryExpectation {
    return {
      formatSummary: 'Direct secure archive or download link',
      deliveryMethod: 'Authenticated time-limited signed URL',
      isConfigured: false,
      statusMessage:
        'Protected digital delivery is not yet configured in this storefront preview release. No downloadable files are exposed publicly.',
    };
  }

  /**
   * Generates a signed download URL.
   * Deliberately throws in storefront preview to prevent any accidental exposure.
   */
  public static async generateDownloadUrl(
    _orderId: string,
    _productId: string
  ): Promise<string> {
    throw new Error(
      'DeliveryNotConfiguredError: Automated digital delivery is disabled in this storefront preview. Paid assets are not available for download.'
    );
  }
}
