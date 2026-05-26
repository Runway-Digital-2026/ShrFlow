---
title: 'Campaigns API'
description: 'Programmatically dispatch and manage email blasts.'
icon: 'paper-plane'
---

The Campaigns API allows you to trigger bulk email sends, query historical analytics, and automate your email marketing flows without touching the dashboard.

## Create a Campaign

Draft a new campaign. This does not send the email; it creates a draft state.

**Endpoint:** `POST /v1/campaigns`

<CodeGroup>
```bash cURL
curl -X POST "https://api.shrflow.com/v1/campaigns" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Black Friday Sale",
    "subject": "50% Off Everything!",
    "audience_segment_id": "seg_12345",
    "template_id": "tpl_9876"
  }'
```

```javascript Node.js
const response = await fetch('https://api.shrflow.com/v1/campaigns', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Black Friday Sale',
    subject: '50% Off Everything!',
    audience_segment_id: 'seg_12345',
    template_id: 'tpl_9876'
  })
});
const data = await response.json();
```
</CodeGroup>

### Response

```json
{
  "id": "camp_abc123",
  "status": "draft",
  "created_at": "2026-05-16T10:00:00Z"
}
```

## Dispatch a Campaign

Triggers the asynchronous delivery engine for a previously created draft.

**Endpoint:** `POST /v1/campaigns/{campaign_id}/dispatch`

<Warning>
This action is irreversible. Once the RabbitMQ queue is populated, emails will be delivered.
</Warning>
