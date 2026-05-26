---
title: 'Contacts API'
description: 'Sync your external CRM data into ShrFlow.'
icon: 'users'
---

The Contacts API provides endpoints to sync your users, update their custom attributes, and manage their subscription preferences.

## Upsert a Contact

Creates a new contact or updates an existing one based on their email address.

**Endpoint:** `POST /v1/contacts/upsert`

```json Request Body
{
  "email": "user@example.com",
  "first_name": "Jane",
  "last_name": "Doe",
  "attributes": {
    "plan": "premium",
    "LTV": 500
  }
}
```

## Unsubscribe a Contact

Manually opt-out a user from all future marketing communications. This is a hard-block at the infrastructure level.

**Endpoint:** `POST /v1/contacts/{email}/unsubscribe`

<Note>
Even if you accidentally attempt to email an unsubscribed contact later, the ShrFlow Deliverability Engine will automatically drop the email at the edge to protect your sender reputation.
</Note>
