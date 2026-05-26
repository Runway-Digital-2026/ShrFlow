---
title: 'Verify Your Domain'
description: 'Establish sender identity and secure your deliverability rates.'
icon: 'globe'
---

Domain verification is critical for achieving high inbox placement. ShrFlow requires SPF and DKIM cryptographic signatures on all outgoing mail to align with Google and Yahoo's latest sender requirements.

## Step 1: Generate Records

![Domain DNS Generation](../screen-shots/settings-sending-domains.png)

Navigate to **Settings > Domains** in your dashboard. Enter your domain (e.g., `company.com`) to generate unique DNS records.

## Step 2: Configure Your DNS Provider

Add the generated `TXT` and `CNAME` records to your DNS settings. Select your provider below for specific instructions:

<Tabs>
  <Tab title="AWS Route 53">
    1. Open the **Route 53 Console**.
    2. Go to **Hosted zones** and select your domain.
    3. Click **Create record**.
    4. Set the **Record type** to `TXT`, paste the Hostname into the **Record name** field, and paste the Value into the **Value** box.
    5. Click **Create records**.
  </Tab>
  <Tab title="Cloudflare">
    1. Log into your Cloudflare dashboard.
    2. Select your domain and go to the **DNS** tab.
    3. Click **Add record**. Select `TXT` as the type.
    4. Paste the Name and Content provided by ShrFlow.
    5. **Important:** Disable the orange cloud (Proxy status) for CNAME records.
  </Tab>
  <Tab title="GoDaddy">
    1. Navigate to your GoDaddy **Domain Portfolio**.
    2. Click the dots next to your domain and select **Edit DNS**.
    3. Click **Add New Record**.
    4. Choose `TXT` from the Type dropdown and enter the Name and Value.
    5. Click **Save**.
  </Tab>
</Tabs>

## Step 3: Validate Propagation

DNS propagation can take up to 48 hours, though it typically resolves within 15 minutes. 

<Tip>
You can use `dig` in your terminal to verify your records locally before checking ShrFlow:  
`dig txt yourdomain.com`
</Tip>

Click the **Verify** button in ShrFlow. Once successful, the status will change to an active green **Verified** badge.
