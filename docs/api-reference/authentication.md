---
title: 'Authentication'
description: 'Securely interact with the ShrFlow API using Bearer tokens.'
icon: 'lock'
---

All programmatic requests to the ShrFlow API must be authenticated. We use standard JWT (JSON Web Token) authorization headers for user sessions and scoped API Keys for server-to-server integrations.

<Warning>
Keep your API keys secret. Never commit them to version control, embed them in mobile apps, or expose them in client-side JavaScript. If a key is compromised, revoke it immediately in the dashboard.
</Warning>

## Authentication Methods

### 1. API Keys (Recommended)
Ideal for automated syncs and backend integrations. API keys are long-lived and scoped to a specific workspace.

**Example Header:**
`Authorization: Bearer sf_live_xxxxxxxxxxxx`

### 2. User JWT (Developer Console)
Short-lived tokens used primarily by the ShrFlow dashboard. Not recommended for external scripts as they expire every 24 hours.

## Making Requests

Pass your credential in the `Authorization` header of your HTTP requests.

```bash
curl -X GET "https://api.shrflow.com/v1/campaigns" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

## Rate Limits

To ensure platform stability and protect against brute-force abuse, API requests are subject to rate limiting based on your workspace tier:

| Plan | Limit | Header Constraints |
| :--- | :--- | :--- |
| **Free** | 60 req / min | `X-RateLimit-Limit` |
| **Starter** | 300 req / min | `X-RateLimit-Limit` |
| **Pro** | 1,000 req / min | `X-RateLimit-Limit` |
| **Enterprise** | Custom | Custom SLA |

### Handling Rate Limits
If you exceed the limit, the API will respond with a `429 Too Many Requests` status code. The `Retry-After` header will indicate how many seconds to wait before retrying.
