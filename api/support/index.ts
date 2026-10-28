import type { IncomingMessage, ServerResponse } from 'http';
import { handleSupportApi } from '../../server/supportApi';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return handleSupportApi(req, res);
}
