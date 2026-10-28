import type { IncomingMessage, ServerResponse } from 'http';
import { handleCheckoutApi } from '../../server/checkoutApi';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return handleCheckoutApi(req, res);
}
