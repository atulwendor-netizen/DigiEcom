import { createRequire as __createRequire } from "module"; const require = __createRequire(import.meta.url);

// server/webhookApi.ts
import crypto from "crypto";
var WebhookEventCache = class {
  processedEvents = /* @__PURE__ */ new Map();
  ttlMs;
  constructor(ttlMs = 24 * 60 * 60 * 1e3) {
    this.ttlMs = ttlMs;
  }
  has(eventId) {
    this.cleanup();
    return this.processedEvents.has(eventId);
  }
  add(eventId) {
    this.cleanup();
    this.processedEvents.set(eventId, Date.now());
  }
  clear() {
    this.processedEvents.clear();
  }
  cleanup() {
    const now = Date.now();
    if (this.processedEvents.size > 2e3) {
      for (const [id, timestamp] of this.processedEvents.entries()) {
        if (now - timestamp > this.ttlMs) {
          this.processedEvents.delete(id);
        }
      }
    }
  }
};
var eventIdCache = new WebhookEventCache();
function verifyWebhookSignature(rawBody, receivedSignature, secret) {
  if (!rawBody || !receivedSignature || !secret) {
    return false;
  }
  try {
    const expectedSignature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    const expectedBuffer = Buffer.from(expectedSignature, "utf8");
    const receivedBuffer = Buffer.from(receivedSignature, "utf8");
    if (expectedBuffer.length !== receivedBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
  } catch (err) {
    console.error("Cryptographic signature verification error:", err);
    return false;
  }
}
var verifiedEventLog = [];
function processRazorpayEvent(payload, eventId = `evt_${Date.now()}`) {
  const eventType = payload.event;
  switch (eventType) {
    case "payment.captured": {
      const payment = payload.payload?.payment?.entity;
      if (!payment || !payment.id) {
        return {
          success: false,
          eventType,
          status: "invalid_payload",
          message: "Missing payment entity in payment.captured payload"
        };
      }
      verifiedEventLog.push({
        eventId,
        eventType,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        status: "captured",
        data: {
          paymentId: payment.id,
          orderId: payment.order_id,
          amountPaise: payment.amount,
          currency: payment.currency,
          method: payment.method,
          email: payment.email
        }
      });
      return {
        success: true,
        eventType,
        status: "captured",
        message: `Payment ${payment.id} captured successfully for order ${payment.order_id || "unassigned"}`
      };
    }
    case "payment.failed": {
      const payment = payload.payload?.payment?.entity;
      verifiedEventLog.push({
        eventId,
        eventType,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        status: "failed",
        data: {
          paymentId: payment?.id,
          orderId: payment?.order_id,
          errorCode: payment?.error_code,
          errorDescription: payment?.error_description
        }
      });
      return {
        success: true,
        eventType,
        status: "failed",
        message: `Payment ${payment?.id || "unknown"} failure logged: ${payment?.error_description || "unspecified"}`
      };
    }
    case "order.paid": {
      const order = payload.payload?.order?.entity;
      verifiedEventLog.push({
        eventId,
        eventType,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        status: "order_paid",
        data: {
          orderId: order?.id,
          amountPaidPaise: order?.amount_paid,
          receipt: order?.receipt
        }
      });
      return {
        success: true,
        eventType,
        status: "order_paid",
        message: `Order ${order?.id || "unknown"} marked as paid`
      };
    }
    default: {
      return {
        success: true,
        eventType: eventType || "unknown",
        status: "ignored",
        message: `Event type ${eventType || "unknown"} safely acknowledged (unhandled event)`
      };
    }
  }
}
function handleWebhookApi(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Razorpay-Signature, x-razorpay-event-id");
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method Not Allowed. Razorpay webhooks require POST." }));
    return;
  }
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret || webhookSecret.trim() === "") {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: "Server Configuration Error: RAZORPAY_WEBHOOK_SECRET is not configured on the server."
      })
    );
    return;
  }
  const signature = req.headers["x-razorpay-signature"] || "";
  if (!signature || signature.trim() === "") {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Bad Request: Missing X-Razorpay-Signature header" }));
    return;
  }
  const eventIdHeader = req.headers["x-razorpay-event-id"] || "";
  let rawBody = "";
  req.on("data", (chunk) => {
    rawBody += typeof chunk === "string" ? chunk : chunk.toString("utf8");
  });
  req.on("end", () => {
    try {
      const isSignatureValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
      if (!isSignatureValid) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Unauthorized: Invalid X-Razorpay-Signature" }));
        return;
      }
      let payload;
      try {
        payload = JSON.parse(rawBody);
      } catch {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Bad Request: Malformed JSON payload" }));
        return;
      }
      const eventId = eventIdHeader || payload.event_id || payload.payload?.payment?.entity?.id || "";
      if (eventId && eventIdCache.has(eventId)) {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            status: "ok",
            message: "Duplicate event already processed (idempotent acknowledgement)",
            eventId,
            duplicate: true
          })
        );
        return;
      }
      if (eventId) {
        eventIdCache.add(eventId);
      }
      const result = processRazorpayEvent(payload, eventId);
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          status: "ok",
          received: true,
          eventType: result.eventType,
          processingResult: result.status,
          message: result.message
        })
      );
    } catch (err) {
      console.error("Webhook execution failure:", err);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Internal Server Error during webhook processing" }));
    }
  });
}
export {
  WebhookEventCache,
  eventIdCache,
  handleWebhookApi,
  processRazorpayEvent,
  verifiedEventLog,
  verifyWebhookSignature
};

export default function handler(req, res) { return handleWebhookApi(req, res); }

