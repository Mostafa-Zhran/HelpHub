require('dotenv').config();

const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY || 'sandbox_api_key_placeholder';
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID || '123456';
const PAYMOB_WALLET_INTEGRATION_ID = process.env.PAYMOB_WALLET_INTEGRATION_ID || process.env.PAYMOB_INTEGRATION_ID || '123456';
const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID || '123456';
const PAYMOB_BASE_URL = 'https://accept.paymob.com/api';

/**
 * Step 1: Obtain Authentication Token from Paymob
 */
async function getAuthToken() {
  const apiKey = process.env.PAYMOB_API_KEY;
  if (!apiKey || apiKey === 'sandbox_api_key_placeholder') {
    return 'mock_paymob_auth_token';
  }

  const response = await fetch(`${PAYMOB_BASE_URL}/auth/tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: apiKey }),
  });

  const data = await response.json();
  if (!response.ok || !data.token) {
    throw new Error(data.message || 'Paymob authentication failed.');
  }
  return data.token;
}

/**
 * Step 2: Register Order with Paymob
 */
async function createOrder(authToken, { amountCents, merchantOrderId }) {
  if (authToken === 'mock_paymob_auth_token') {
    return { id: `MOCK_ORDER_${Date.now()}` };
  }

  const response = await fetch(`${PAYMOB_BASE_URL}/ecommerce/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_token: authToken,
      delivery_needed: "false",
      amount_cents: String(amountCents),
      currency: "EGP",
      merchant_order_id: String(merchantOrderId),
      items: [],
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.id) {
    throw new Error(data.message || 'Paymob order registration failed.');
  }
  return data;
}

/**
 * Step 3: Request Payment Key Token (Supports Card or Wallet integration ID)
 */
async function generatePaymentKey(authToken, { orderId, amountCents, billingData, integrationId }) {
  if (authToken === 'mock_paymob_auth_token') {
    return `MOCK_PAYMENT_KEY_${Date.now()}`;
  }

  const selectedIntegration = integrationId || process.env.PAYMOB_INTEGRATION_ID || PAYMOB_INTEGRATION_ID;

  const nameParts = (billingData.name || 'HelpHub User').split(' ');
  const firstName = nameParts[0] || 'HelpHub';
  const lastName = nameParts.slice(1).join(' ') || 'User';

  const response = await fetch(`${PAYMOB_BASE_URL}/acceptance/payment_keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_token: authToken,
      amount_cents: String(amountCents),
      expiration: 3600,
      order_id: String(orderId),
      billing_data: {
        apartment: "NA",
        email: billingData.email || "user@helphub.com",
        floor: "NA",
        first_name: firstName,
        street: "NA",
        building: "NA",
        phone_number: billingData.phone || "NA",
        shipping_method: "NA",
        postal_code: "NA",
        city: "Cairo",
        country: "EG",
        last_name: lastName,
        state: "NA"
      },
      currency: "EGP",
      integration_id: Number(selectedIntegration),
      lock_order_when_paid: "false"
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.token) {
    throw new Error(data.message || 'Paymob payment key request failed.');
  }
  return data.token;
}

/**
 * Step 4 (Mobile Wallet): Execute Mobile Wallet Payment (Vodafone Cash, Orange Cash, etc.)
 */
async function payWithWallet(paymentKey, walletNumber) {
  if (!walletNumber) {
    throw new Error('Vodafone Cash phone number is required.');
  }

  if (paymentKey.startsWith('MOCK_')) {
    return {
      redirect_url: `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID || PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`,
      pending: "true"
    };
  }

  const response = await fetch(`${PAYMOB_BASE_URL}/acceptance/payments/pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source: {
        identifier: String(walletNumber).trim(),
        subtype: "WALLET"
      },
      payment_token: paymentKey
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Mobile Wallet request failed.');
  }

  // Paymob returns redirection_url or redirect_url
  const redirectUrl = data.redirection_url || data.redirect_url || null;
  return {
    ...data,
    redirect_url: redirectUrl
  };
}

/**
 * Helper to construct the Paymob iframe URL
 */
function getIframeUrl(paymentKey) {
  const iframeId = process.env.PAYMOB_IFRAME_ID || PAYMOB_IFRAME_ID;
  return `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentKey}`;
}

module.exports = {
  getAuthToken,
  createOrder,
  generatePaymentKey,
  payWithWallet,
  getIframeUrl,
};
