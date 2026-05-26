---
title: 'Webhooks'
description: 'Stream email events to your own servers in real-time.'
icon: 'webhook'
---

ShrFlow processes millions of email events (opens, clicks, bounces) per hour. Webhooks allow you to subscribe to these events and push them directly to your own infrastructure in real-time, rather than polling our API.

## Configuring a Webhook Endpoint

1. Go to **Settings > Webhooks** in your ShrFlow dashboard.
2. Click **Add Endpoint** and enter your secure `HTTPS` URL.
3. Select the event types you want to subscribe to.

## Sample Payload

When an event occurs, ShrFlow sends a `POST` request to your endpoint with a JSON body:

```json
{
  "id": "evt_xxxxxxxxxxxx",
  "type": "email.clicked",
  "created_at": "2026-05-16T10:00:00Z",
  "data": {
    "campaign_id": "camp_abc123",
    "contact_email": "user@example.com",
    "url": "https://yourstore.com/sale",
    "user_agent": "Mozilla/5.0...",
    "ip_address": "1.1.1.1"
  }
}
```

## Security & Verification

We sign every webhook payload using a cryptographic secret unique to your endpoint. You **must** verify this signature to ensure the payload actually came from ShrFlow.

ShrFlow includes the following headers:
- `ShrFlow-Signature`: The HMAC-SHA256 signature.
- `ShrFlow-Timestamp`: The unix timestamp of the request (to prevent replay attacks).

<CodeGroup>
```javascript Node.js
import crypto from 'crypto';

function verifySignature(req, endpointSecret) {
  const signature = req.headers['shrflow-signature'];
  const timestamp = req.headers['shrflow-timestamp'];
  const payload = JSON.stringify(req.body);
  
  // 1. Check if the request is too old (5 min window)
  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5;
  if (timestamp < fiveMinutesAgo) return false;

  // 2. Compute the signature
  const expectedSignature = crypto
    .createHmac('sha256', endpointSecret)
    .update(`${timestamp}.${payload}`)
    .digest('hex');
    
  return signature === expectedSignature;
}
```
</CodeGroup>

## Event Types

| Event | Description |
| :--- | :--- |
| `email.delivered` | The recipient's mail server accepted the message. |
| `email.opened` | The recipient opened the email (pixel tracked). |
| `email.clicked` | The recipient clicked a link within the email. |
| `email.bounced` | The email could not be delivered (Hard or Soft). |
| `email.complained` | The recipient marked the email as spam. |
| `contact.unsubscribed` | The contact clicked the unsubscribe link. |
