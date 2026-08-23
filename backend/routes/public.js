const express = require('express');
const bcrypt  = require('bcryptjs');
const supabase = require('../config/supabase');

const router = express.Router();

// Memory store fallback if database is offline/configuring
const memoryStore = {
  volunteers: [],
  contactMessages: [],
  helpRequests: []
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
      status: 'pending',
      created_at: new Date().toISOString()
    };

    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data, error } = await supabase
        .from('help_requests')
        .insert([requestData])
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json({ success: true, message: 'Help request submitted successfully.', data });
    }

    const mockRecord = { id: Date.now().toString(), ...requestData };
    memoryStore.helpRequests.unshift(mockRecord);
    return res.status(201).json({ success: true, message: 'Help request submitted successfully.', data: mockRecord });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

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
