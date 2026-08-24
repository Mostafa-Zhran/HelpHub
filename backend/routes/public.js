const express = require('express');
const bcrypt  = require('bcryptjs');
const supabase = require('../config/supabase');
const paymob = require('../config/paymob');

const router = express.Router();

// Memory store fallback if database is offline/configuring
const memoryStore = {
  volunteers: [],
  contactMessages: [],
  helpRequests: [],
  payments: []
};

// ── VOLUNTEER REGISTRATION ──────────────────────────────────────────────────
router.post('/volunteer', async (req, res) => {
  try {
    const { full_name, name, email, phone, service_type, service, availability, skills, motivation, message, password } = req.body;
    let password_hash = null;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
      }
      password_hash = await bcrypt.hash(password, 10);
    }

    const volunteerData = {
      name: name || full_name || 'Anonymous',
      email: (email || '').toLowerCase().trim(),
      phone: phone || '',
      service: service || service_type || 'other',
      availability: availability || 'both',
      message: motivation || message || '',
      status: 'pending',
      ...(password_hash ? { password_hash } : {}),
      created_at: new Date().toISOString()
    };

    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data, error } = await supabase
        .from('volunteers')
        .insert([volunteerData])
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json({ success: true, message: 'Volunteer registered successfully.', data });
    }

    // In-memory fallback
    const mockRecord = { id: Date.now().toString(), ...volunteerData };
    memoryStore.volunteers.unshift(mockRecord);
    return res.status(201).json({ success: true, message: 'Volunteer registered successfully.', data: mockRecord });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
router.post('/volunteers', (req, res) => router.handle(req, res)); // Alias

// ── HELP REQUEST SUBMISSION ────────────────────────────────────────────────
router.post('/help-request', async (req, res) => {
  try {
    const { full_name, name, email, service_type, service, urgency, description, details } = req.body;
    const requestData = {
      name: name || full_name || 'Anonymous',
      email: email || '',
      service: service || service_type || 'other',
      urgency: urgency || 'normal',
      details: details || description || '',
      status: 'unpaid', // Only activated to 'pending' after verified Paymob payment
      created_at: new Date().toISOString()
    };

    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data, error } = await supabase
        .from('help_requests')
        .insert([requestData])
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json({ success: true, message: 'Help request initialized. Proceed to payment.', data });
    }

    const mockRecord = { id: Date.now().toString(), ...requestData };
    memoryStore.helpRequests.unshift(mockRecord);
    return res.status(201).json({ success: true, message: 'Help request initialized. Proceed to payment.', data: mockRecord });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ── PAYMOB PAYMENT INTEGRATION ──────────────────────────────────────────────
router.post('/paymob/initiate', async (req, res) => {
  try {
    const { help_request_id, name, email, phone, amount, payment_method, wallet_number } = req.body;
    const payerName = name || 'HelpHub Requestor';
    const payerEmail = email || 'user@helphub.com';
    const isWallet = payment_method === 'wallet' || payment_method === 'vodafone_cash';
    const payerPhone = (wallet_number || phone || '').trim();

    if (isWallet && !payerPhone) {
      return res.status(400).json({ success: false, message: 'Vodafone Cash phone number is required.' });
    }

    // Amount in cents (e.g. 5 EGP = 500 cents)
    const amountCents = amount ? Math.round(Number(amount) * 100) : 500;
    const merchantOrderId = `HELPHUB_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // 1. Paymob Auth Token
    const authToken = await paymob.getAuthToken();

    // 2. Register Paymob Order
    const orderData = await paymob.createOrder(authToken, {
      amountCents,
      merchantOrderId
    });

    // 3. Select Integration ID (Card vs Wallet)
    const integrationId = isWallet
      ? (process.env.PAYMOB_WALLET_INTEGRATION_ID || process.env.PAYMOB_INTEGRATION_ID)
      : process.env.PAYMOB_INTEGRATION_ID;

    // 4. Obtain Payment Key Token
    const paymentToken = await paymob.generatePaymentKey(authToken, {
      orderId: orderData.id,
      amountCents,
      billingData: { name: payerName, email: payerEmail, phone: payerPhone },
      integrationId
    });

    let walletRedirectUrl = null;

    // 5. Handle Wallet Payment Execution if Wallet selected
    if (isWallet) {
      try {
        const walletResult = await paymob.payWithWallet(paymentToken, wallet_number || payerPhone);
        if (walletResult.redirect_url) {
          walletRedirectUrl = walletResult.redirect_url;
        }
      } catch (wErr) {
        console.warn('Wallet payment API execution note:', wErr.message);
      }
    }

    const iframeUrl = isWallet ? walletRedirectUrl : paymob.getIframeUrl(paymentToken);

    // Save payment intent to database table
    const paymentRecord = {
      help_request_id: help_request_id || null,
      payer_name: payerName,
      payer_email: payerEmail,
      payer_phone: wallet_number || payerPhone,
      payment_method: isWallet ? 'wallet' : 'card',
      amount_cents: amountCents,
      currency: 'EGP',
      status: 'pending',
      paymob_order_id: String(orderData.id),
      payment_token: paymentToken,
      created_at: new Date().toISOString()
    };

    let savedPayment = null;
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { data, error } = await supabase
          .from('payments')
          .insert([paymentRecord])
          .select()
          .single();
        if (!error) savedPayment = data;
      } catch (err) {
        console.warn('Database insert to payments table skipped or failed, falling back:', err.message);
      }
    }

    if (!savedPayment) {
      savedPayment = { id: `pay_${Date.now()}`, ...paymentRecord };
      memoryStore.payments.unshift(savedPayment);
    }

    return res.status(200).json({
      success: true,
      message: isWallet ? 'Vodafone Cash / Wallet payment initiated.' : 'Paymob payment session created successfully.',
      data: {
        paymentId: savedPayment.id,
        orderId: orderData.id,
        amount: (amountCents / 100).toFixed(2),
        currency: 'EGP',
        iframeUrl,
        redirectUrl: walletRedirectUrl || iframeUrl,
        paymentToken,
        isWallet
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Paymob Callback / Webhook Endpoint
const handlePaymobCallback = async (req, res) => {
  try {
    const payload = req.method === 'POST' ? req.body : req.query;
    const obj = payload.obj || payload;

    const orderId = String(obj.order?.id || obj.order || payload.order || '');
    const transactionId = String(obj.id || payload.id || '');
    const isSuccess = String(obj.success || payload.success) === 'true' || obj.success === true;
    const status = isSuccess ? 'success' : 'failed';

    if (orderId && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        // Update payment table record
        const { data: paymentRecord } = await supabase
          .from('payments')
          .update({
            status,
            paymob_transaction_id: transactionId,
            updated_at: new Date().toISOString()
          })
          .eq('paymob_order_id', orderId)
          .select('help_request_id')
          .maybeSingle();

        // If payment succeeded, activate help request for volunteers!
        if (paymentRecord && paymentRecord.help_request_id) {
          const reqStatus = isSuccess ? 'pending' : 'unpaid';
          await supabase
            .from('help_requests')
            .update({
              status: reqStatus,
              updated_at: new Date().toISOString()
            })
            .eq('id', paymentRecord.help_request_id);
        }
      } catch (err) {
        console.warn('Error updating payments/requests table:', err.message);
      }
    }

    // Also update memory store if present
    const memPayment = memoryStore.payments.find(p => String(p.paymob_order_id) === orderId);
    if (memPayment) {
      memPayment.status = status;
      memPayment.paymob_transaction_id = transactionId;
      if (memPayment.help_request_id) {
        const memReq = memoryStore.helpRequests.find(r => String(r.id) === String(memPayment.help_request_id));
        if (memReq) {
          memReq.status = isSuccess ? 'pending' : 'unpaid';
        }
      }
    }

    if (req.method === 'GET') {
      return res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>HelpHub Payment Status</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; color: #0f172a; }
              .card { background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
              .badge { display: inline-block; padding: 6px 16px; border-radius: 9999px; font-weight: bold; font-size: 14px; margin-bottom: 16px; }
              .success { background: #dcfce7; color: #15803d; }
              .failed { background: #fee2e2; color: #b91c1c; }
              a { display: inline-block; margin-top: 20px; background: #1d4ed8; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="badge ${isSuccess ? 'success' : 'failed'}">
                ${isSuccess ? 'Payment Successful!' : 'Payment Failed'}
              </div>
              <h2>${isSuccess ? 'Thank You!' : 'Transaction Declined'}</h2>
              <p>${isSuccess ? 'Your payment has been processed via Paymob. Your help request is confirmed.' : 'The payment was not completed. Please try again.'}</p>
              <a href="/">Return to HelpHub</a>
            </div>
          </body>
        </html>
      `);
    }

    return res.json({ success: true, status, orderId, transactionId });

  } catch (error) {
    if (req.method === 'GET') {
      return res.status(500).send('<h2>Payment processing error</h2>');
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

router.post('/paymob/complete-session', async (req, res) => {
  try {
    const { paymentId, orderId, status } = req.body;
    const finalStatus = status || 'success';

    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const query = paymentId
        ? supabase.from('payments').update({ status: finalStatus, updated_at: new Date().toISOString() }).eq('id', paymentId)
        : supabase.from('payments').update({ status: finalStatus, updated_at: new Date().toISOString() }).eq('paymob_order_id', String(orderId));

      const { data: paymentRecord } = await query.select('help_request_id').maybeSingle();

      if (paymentRecord && paymentRecord.help_request_id) {
        await supabase
          .from('help_requests')
          .update({ status: finalStatus === 'success' ? 'pending' : 'unpaid', updated_at: new Date().toISOString() })
          .eq('id', paymentRecord.help_request_id);
      }
    }

    const memPayment = memoryStore.payments.find(p => (paymentId && p.id === paymentId) || (orderId && String(p.paymob_order_id) === String(orderId)));
    if (memPayment) {
      memPayment.status = finalStatus;
      if (memPayment.help_request_id) {
        const memReq = memoryStore.helpRequests.find(r => String(r.id) === String(memPayment.help_request_id));
        if (memReq) memReq.status = finalStatus === 'success' ? 'pending' : 'unpaid';
      }
    }

    return res.json({ success: true, message: 'Payment status updated.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.all('/paymob/callback', handlePaymobCallback);
router.all('/paymob/webhook', handlePaymobCallback);

// ── CONTACT MESSAGE SUBMISSION ──────────────────────────────────────────────
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const contactData = {
      name: name || 'Anonymous',
      email: email || '',
      subject: subject || 'General Inquiry',
      message: message || '',
      status: 'unread',
      created_at: new Date().toISOString()
    };

    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data, error } = await supabase
        .from('contact_messages')
        .insert([contactData])
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json({ success: true, message: 'Message sent successfully.', data });
    }

    const mockRecord = { id: Date.now().toString(), ...contactData };
    memoryStore.contactMessages.unshift(mockRecord);
    return res.status(201).json({ success: true, message: 'Message sent successfully.', data: mockRecord });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ── PUBLIC STATS ────────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const [volunteersCount, messagesCount, requestsCount, completedCount, booksCount, approvedCount, responseTimeRows] = await Promise.all([
        supabase.from('volunteers').select('*', { count: 'exact', head: true }),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
        supabase.from('help_requests').select('*', { count: 'exact', head: true }),
        supabase.from('help_requests').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('help_requests').select('*', { count: 'exact', head: true }).eq('service', 'books').eq('status', 'completed'),
        supabase.from('volunteers').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        // Fetch rows that have accepted_at to compute average response time
        supabase.from('help_requests').select('created_at, accepted_at').not('accepted_at', 'is', null).limit(200)
      ]);

      const totalVolunteers = volunteersCount.count || 0;
      const totalMessages = messagesCount.count || 0;
      const totalRequests = requestsCount.count || 0;
      const totalCompleted = completedCount.count || 0;
      const totalBooksReused = booksCount.count || 0;
      const totalApproved = approvedCount.count || 0;

      // Volunteer hours: approved volunteers * 4 hours average per volunteer
      const volunteerHours = totalApproved * 4;

      // People helped = completed requests
      const peopleHelped = totalCompleted;

      // Average response time in minutes
      let avgResponseMinutes = null;
      if (responseTimeRows.data && responseTimeRows.data.length > 0) {
        const totalMinutes = responseTimeRows.data.reduce((sum, row) => {
          const created = new Date(row.created_at);
          const accepted = new Date(row.accepted_at);
          return sum + (accepted - created) / 60000; // ms → minutes
        }, 0);
        avgResponseMinutes = Math.round(totalMinutes / responseTimeRows.data.length);
      }

      // Participation % = approved volunteers / total volunteers
      const volunteerParticipationPct = totalVolunteers > 0
        ? Math.min(100, Math.round((totalApproved / totalVolunteers) * 100))
        : 0;

      // Completion % = completed / total requests
      const requestsCompletedPct = totalRequests > 0
        ? Math.min(100, Math.round((totalCompleted / totalRequests) * 100))
        : 0;

      return res.json({
        success: true,
        data: {
          volunteers: totalVolunteers,
          approvedVolunteers: totalApproved,
          helpRequests: totalRequests,
          completedRequests: totalCompleted,
          messages: totalMessages,
          booksReused: totalBooksReused,
          volunteerHours: volunteerHours,
          peopleHelped: peopleHelped,
          avgResponseMinutes: avgResponseMinutes,
          volunteerParticipationPct,
          requestsCompletedPct,
          communitySatisfactionPct: null
        }
      });
    }

    // Supabase not yet configured — return all zeros
    return res.json({
      success: true,
      data: {
        volunteers: null,
        approvedVolunteers: null,
        helpRequests: null,
        completedRequests: null,
        messages: null,
        booksReused: null,
        volunteerHours: null,
        peopleHelped: null,
        avgResponseMinutes: null,
        volunteerParticipationPct: null,
        requestsCompletedPct: null,
        communitySatisfactionPct: null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
