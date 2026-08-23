const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const volunteerAuth = require('../middleware/volunteerAuth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'helphub_secure_secret_key_2026!';

// ── VOLUNTEER LOGIN ────────────────────────────────────────────────────────
// Volunteers log in with their registered email + the password they set
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data: volunteer, error } = await supabase
        .from('volunteers')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (error || !volunteer) {
        return res.status(401).json({ success: false, message: 'No volunteer account found with that email.' });
      }

      if (!volunteer.password_hash) {
        return res.status(401).json({ success: false, message: 'This account has no password set. Please contact an administrator.' });
      }

      const valid = await bcrypt.compare(password, volunteer.password_hash);
      if (!valid) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      if (volunteer.status === 'rejected') {
        return res.status(403).json({ success: false, message: 'Your volunteer application was rejected. Contact admin for details.' });
      }

      const token = jwt.sign(
        { id: volunteer.id, email: volunteer.email, name: volunteer.name, role: 'volunteer', status: volunteer.status },
        JWT_SECRET,
        { expiresIn: '8h' }
      );

      return res.json({
        success: true,
        token,
        volunteer: {
          id: volunteer.id,
          name: volunteer.name,
          email: volunteer.email,
          service: volunteer.service,
          status: volunteer.status,
        }
      });
    }

    return res.status(503).json({ success: false, message: 'Database not yet configured. Contact administrator.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed: ' + error.message });
  }
});

// ── GET HELP REQUESTS (visible to approved volunteers) ────────────────────
router.get('/requests', volunteerAuth, async (req, res) => {
  try {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data, error } = await supabase
        .from('help_requests')
        .select('*')
        .in('status', ['pending', 'in-progress'])
        .order('urgency', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.json({ success: true, data: data || [] });
    }
    return res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── GET MY ACCEPTED REQUESTS ───────────────────────────────────────────────
router.get('/my-requests', volunteerAuth, async (req, res) => {
  try {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data, error } = await supabase
        .from('help_requests')
        .select('*')
        .eq('assigned_volunteer_id', req.volunteer.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.json({ success: true, data: data || [] });
    }
    return res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── ACCEPT A HELP REQUEST ──────────────────────────────────────────────────
router.patch('/requests/:id/accept', volunteerAuth, async (req, res) => {
  try {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      // Check that the request is still pending
      const { data: existing, error: fetchErr } = await supabase
        .from('help_requests')
        .select('status')
        .eq('id', req.params.id)
        .single();

      if (fetchErr || !existing) {
        return res.status(404).json({ success: false, message: 'Request not found.' });
      }
      if (existing.status !== 'pending') {
        return res.status(409).json({ success: false, message: 'This request is no longer pending.' });
      }

      const { data, error } = await supabase
        .from('help_requests')
        .update({
          status: 'in-progress',
          assigned_volunteer_id: req.volunteer.id,
          assigned_volunteer_name: req.volunteer.name,
          accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) throw error;
      return res.json({ success: true, message: 'Request accepted!', data });
    }
    return res.json({ success: true, message: 'Accepted (offline mode).' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── DECLINE / UNASSIGN A HELP REQUEST ─────────────────────────────────────
router.patch('/requests/:id/decline', volunteerAuth, async (req, res) => {
  try {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data, error } = await supabase
        .from('help_requests')
        .update({
          status: 'pending',
          assigned_volunteer_id: null,
          assigned_volunteer_name: null,
          accepted_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', req.params.id)
        .eq('assigned_volunteer_id', req.volunteer.id) // only the assigned volunteer can decline
        .select()
        .single();

      if (error) throw error;
      return res.json({ success: true, message: 'Request released back to pending.', data });
    }
    return res.json({ success: true, message: 'Declined (offline mode).' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── MARK MY REQUEST AS COMPLETE ────────────────────────────────────────────
router.patch('/requests/:id/complete', volunteerAuth, async (req, res) => {
  try {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data, error } = await supabase
        .from('help_requests')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', req.params.id)
        .eq('assigned_volunteer_id', req.volunteer.id)
        .select()
        .single();

      if (error) throw error;
      return res.json({ success: true, message: 'Request marked as completed.', data });
    }
    return res.json({ success: true, message: 'Completed (offline mode).' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── GET VOLUNTEER PROFILE ──────────────────────────────────────────────────
router.get('/me', volunteerAuth, async (req, res) => {
  try {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data, error } = await supabase
        .from('volunteers')
        .select('id, name, email, phone, service, availability, status, created_at')
        .eq('id', req.volunteer.id)
        .single();

      if (error) throw error;
      return res.json({ success: true, data });
    }
    return res.json({ success: true, data: req.volunteer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
