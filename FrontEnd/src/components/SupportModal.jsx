import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { CloseIcon, SparklesIcon, CrownIcon, CheckCircleIcon } from './Icons';

export default function SupportModal({ isOpen, onClose, initialCategory = 'Housekeeping' }) {
  const [activeTab, setActiveTab] = useState('ticket'); // 'ticket' | 'faqs' | 'hotline'
  const [faqs, setFaqs] = useState([]);
  const [expandedFaq, setExpandedFaq] = useState('housekeeping-status');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [roomNumber, setRoomNumber] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Pre-fill user data if logged in
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || 'null');
      if (u) {
        if (u.name) setName(u.name);
        if (u.email) setEmail(u.email);
        if (u.phone) setPhone(u.phone);
      }
    } catch {
      // ignore
    }
  }, [isOpen]);

  // Fetch FAQs
  useEffect(() => {
    if (!isOpen) return;
    let isCurrent = true;
    (async () => {
      try {
        const res = await axiosClient.get('/api/support/faqs');
        if (isCurrent && Array.isArray(res.data)) {
          setFaqs(res.data);
        }
      } catch {
        // Fallback default FAQs
        if (isCurrent) {
          setFaqs([
            {
              id: 'housekeeping-status',
              category: 'Housekeeping',
              question: 'How do I change room status in the Housekeeping Grid?',
              answer: 'Open the Housekeeping Grid from your Dashboard or Staff Desk. Each room card has a status selector (Available, Occupied, Cleaning, Maintenance). Changing the selection instantly updates both database records and front-desk schedules.'
            },
            {
              id: 'digital-keycard',
              category: 'Check-In',
              question: 'Where do I find my digital palace keycard?',
              answer: 'After confirmed reservation, view your booking in My Bookings or the Front Desk tab to generate/view your encrypted alphanumeric digital key code.'
            },
            {
              id: 'payments',
              category: 'Payments',
              question: 'Which currencies and payment cards are accepted?',
              answer: 'We accept all major debit/credit cards, UPI, and international cards. Tariffs can be paid in INR (₹), EUR (€), GBP (£), or USD ($) with automatic conversion.'
            }
          ]);
        }
      }
    })();
    return () => {
      isCurrent = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMessage('Please describe the problem you are experiencing.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await axiosClient.post('/api/support/ticket', {
        name,
        email,
        phone,
        category,
        roomNumber,
        subject,
        description,
        priority
      });

      setSubmittedTicket(res.data);
    } catch (err) {
      console.error('Support ticket submission error:', err);
      setErrorMessage(
        err.response?.data?.message || 'Could not submit support ticket. Please contact our 24/7 hotline directly.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmittedTicket(null);
    setDescription('');
    setSubject('');
    setErrorMessage('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          maxWidth: '720px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(15, 58, 47, 0.35)',
          border: '1px solid rgba(197, 160, 89, 0.35)',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0F3A2F 0%, #08241D 100%)',
            padding: '24px 28px',
            color: '#FAF7F2',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(197, 160, 89, 0.2)',
                  border: '1px solid rgba(197, 160, 89, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem'
                }}
              >
                🛎️
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3
                    style={{
                      margin: 0,
                      fontFamily: 'Playfair Display, Georgia, serif',
                      fontSize: '1.35rem',
                      color: '#FAF7F2',
                      letterSpacing: '0.02em'
                    }}
                  >
                    Palace Concierge &amp; 24/7 Support
                  </h3>
                  <span
                    style={{
                      background: 'rgba(16, 185, 129, 0.25)',
                      color: '#34d399',
                      border: '1px solid #10b981',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    ● 24/7 Live
                  </span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#dfb76c' }}>
                  Aatithya Royal Hospitality • Rapid problem resolution &amp; in-suite assistance
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#FAF7F2',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              aria-label="Close Support Dialog"
            >
              <CloseIcon size={16} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
            <button
              type="button"
              onClick={() => {
                setActiveTab('ticket');
                if (submittedTicket) handleResetForm();
              }}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'ticket' ? '#C5A059' : 'rgba(255, 255, 255, 0.08)',
                color: activeTab === 'ticket' ? '#0F3A2F' : '#FAF7F2',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              ✍️ Report an Issue / Ticket
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('faqs')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'faqs' ? '#C5A059' : 'rgba(255, 255, 255, 0.08)',
                color: activeTab === 'faqs' ? '#0F3A2F' : '#FAF7F2',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              ❓ Instant Help &amp; FAQs
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('hotline')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'hotline' ? '#C5A059' : 'rgba(255, 255, 255, 0.08)',
                color: activeTab === 'hotline' ? '#0F3A2F' : '#FAF7F2',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              📞 24/7 Royal Hotlines
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1, background: '#FAF7F2' }}>
          {/* TAB 1: REPORT AN ISSUE / TICKET */}
          {activeTab === 'ticket' && (
            <div>
              {submittedTicket ? (
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    padding: '32px 24px',
                    textAlign: 'center',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }}
                >
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.12)',
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      fontSize: '2rem'
                    }}
                  >
                    ✓
                  </div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '1.4rem', color: '#0F3A2F', fontWeight: '800' }}>
                    Support Ticket Logged!
                  </h4>
                  <div
                    style={{
                      display: 'inline-block',
                      background: '#0F3A2F',
                      color: '#C5A059',
                      padding: '6px 16px',
                      borderRadius: '8px',
                      fontWeight: '800',
                      letterSpacing: '0.08em',
                      fontSize: '0.95rem',
                      marginBottom: '16px'
                    }}
                  >
                    Reference: #{submittedTicket.ticketCode}
                  </div>
                  <p style={{ margin: '0 auto 20px', maxWidth: '480px', color: '#475569', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {submittedTicket.message}
                  </p>
                  <div
                    style={{
                      background: '#f8fafc',
                      borderRadius: '12px',
                      padding: '16px',
                      textAlign: 'left',
                      marginBottom: '24px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.85rem'
                    }}
                  >
                    <div style={{ color: '#64748b', marginBottom: '4px' }}>
                      <strong>Estimated Duty Response:</strong> Immediate Concierge Dispatch (&lt; 5 minutes)
                    </div>
                    <div style={{ color: '#64748b' }}>
                      <strong>Need Urgent Intervention?</strong> Call our Toll-Free line directly at{' '}
                      <a href="tel:+911145678900" style={{ color: '#0F3A2F', fontWeight: '700' }}>
                        1800-AATITHYA / +91 (11) 4567-8900
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={handleResetForm}
                    style={{
                      background: '#0F3A2F',
                      color: '#FAF7F2',
                      border: 'none',
                      padding: '10px 24px',
                      borderRadius: '10px',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {errorMessage && (
                    <div
                      style={{
                        background: '#fee2e2',
                        border: '1px solid #f87171',
                        color: '#991b1b',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        fontSize: '0.85rem',
                        marginBottom: '16px'
                      }}
                    >
                      {errorMessage}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Elena Vance"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="guest@example.com"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                        Problem Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          fontSize: '0.85rem',
                          fontWeight: '600'
                        }}
                      >
                        <option value="Housekeeping">🧹 Housekeeping &amp; Room Status</option>
                        <option value="Maintenance">🔧 Room Maintenance / Facility</option>
                        <option value="Reservations">📅 Reservation &amp; Booking Issue</option>
                        <option value="Payments">💳 Payment &amp; Invoice Billing</option>
                        <option value="Keycard">🔑 Digital Keycard &amp; Access</option>
                        <option value="Dining">🍽️ Room Service &amp; Dining</option>
                        <option value="Technical Issue">💻 Website &amp; Software Trouble</option>
                        <option value="Other">❓ General Concierge Inquiry</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                        Suite # or Booking Ref (Optional)
                      </label>
                      <input
                        type="text"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        placeholder="e.g. AMR-101 / BK-2026-90"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                        Priority / Urgency
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          fontSize: '0.85rem',
                          fontWeight: '600'
                        }}
                      >
                        <option value="Low">Standard Response</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="Urgent">🚨 Urgent (Immediate Palace Attention)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                      Subject / Brief Summary
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Cannot update suite status in housekeeping grid"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                      Detailed Problem Description *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Please describe the issue or problem in detail. Our duty supervisor and concierge desk will review immediately."
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        fontSize: '0.85rem',
                        lineHeight: 1.5,
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      🔒 Logged directly to Palace Operations Desk &amp; Audit Logs.
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        background: 'linear-gradient(135deg, #0F3A2F 0%, #154e3f 100%)',
                        color: '#FAF7F2',
                        border: '1px solid #C5A059',
                        padding: '12px 28px',
                        borderRadius: '12px',
                        fontWeight: '800',
                        fontSize: '0.9rem',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 14px rgba(15, 58, 47, 0.25)',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      {isSubmitting ? 'Submitting Ticket...' : '🚀 Submit Support Ticket'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: INSTANT HELP & FAQS */}
          {activeTab === 'faqs' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 6px', fontSize: '1.1rem', color: '#0F3A2F' }}>
                  Frequently Asked Questions &amp; Fast Solutions
                </h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                  Instant answers to common problems encountered during operations and stays.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {faqs.map((faq) => {
                  const isOpenItem = expandedFaq === faq.id;
                  return (
                    <div
                      key={faq.id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedFaq(isOpenItem ? null : faq.id)}
                        style={{
                          width: '100%',
                          padding: '14px 18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          border: 'none',
                          background: isOpenItem ? '#f8fafc' : '#ffffff',
                          textAlign: 'left',
                          cursor: 'pointer',
                          gap: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span
                            style={{
                              background: 'rgba(197, 160, 89, 0.15)',
                              color: '#99732e',
                              fontSize: '0.7rem',
                              fontWeight: '800',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              textTransform: 'uppercase'
                            }}
                          >
                            {faq.category}
                          </span>
                          <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0F3A2F' }}>
                            {faq.question}
                          </span>
                        </div>
                        <span style={{ fontSize: '1.2rem', color: '#94a3b8', transform: isOpenItem ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                          ▾
                        </span>
                      </button>

                      {isOpenItem && (
                        <div
                          style={{
                            padding: '14px 18px',
                            borderTop: '1px solid #f1f5f9',
                            fontSize: '0.85rem',
                            color: '#475569',
                            lineHeight: 1.6,
                            background: '#ffffff'
                          }}
                        >
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  marginTop: '20px',
                  background: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                  Didn’t find what you need? Our concierge team is ready to help.
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('ticket')}
                  style={{
                    background: '#0F3A2F',
                    color: '#FAF7F2',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Open Support Ticket
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: 24/7 ROYAL HOTLINES */}
          {activeTab === 'hotline' && (
            <div>
              <div style={{ marginBottom: '18px' }}>
                <h4 style={{ margin: '0 0 6px', fontSize: '1.1rem', color: '#0F3A2F' }}>
                  Direct Concierge &amp; Emergency Contacts
                </h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                  Connect instantly with our 24/7 dedicated hospitality management staff.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                {/* Toll Free */}
                <div style={{ background: '#ffffff', borderRadius: '14px', padding: '18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: '1.6rem', marginBottom: '8px' }}>📞</div>
                  <h5 style={{ margin: '0 0 4px', fontSize: '0.95rem', color: '#0F3A2F', fontWeight: '800' }}>
                    Toll-Free Palace Hotline
                  </h5>
                  <p style={{ margin: '0 0 12px', fontSize: '0.8rem', color: '#64748b' }}>
                    Toll-free from anywhere in India (24 Hours)
                  </p>
                  <a
                    href="tel:18002284849"
                    style={{
                      display: 'inline-block',
                      background: '#0F3A2F',
                      color: '#C5A059',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontWeight: '800',
                      fontSize: '0.85rem',
                      textDecoration: 'none'
                    }}
                  >
                    1800-AATITHYA (Free)
                  </a>
                </div>

                {/* Direct Landline */}
                <div style={{ background: '#ffffff', borderRadius: '14px', padding: '18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: '1.6rem', marginBottom: '8px' }}>🏨</div>
                  <h5 style={{ margin: '0 0 4px', fontSize: '0.95rem', color: '#0F3A2F', fontWeight: '800' }}>
                    Central Concierge Desk
                  </h5>
                  <p style={{ margin: '0 0 12px', fontSize: '0.8rem', color: '#64748b' }}>
                    Direct desk for reservations and in-suite requests
                  </p>
                  <a
                    href="tel:+911145678900"
                    style={{
                      display: 'inline-block',
                      background: '#f1f5f9',
                      color: '#0F3A2F',
                      border: '1px solid #cbd5e1',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontWeight: '800',
                      fontSize: '0.85rem',
                      textDecoration: 'none'
                    }}
                  >
                    +91 (11) 4567-8900
                  </a>
                </div>

                {/* WhatsApp Concierge */}
                <div style={{ background: '#ffffff', borderRadius: '14px', padding: '18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: '1.6rem', marginBottom: '8px' }}>💬</div>
                  <h5 style={{ margin: '0 0 4px', fontSize: '0.95rem', color: '#0F3A2F', fontWeight: '800' }}>
                    WhatsApp Live Concierge
                  </h5>
                  <p style={{ margin: '0 0 12px', fontSize: '0.8rem', color: '#64748b' }}>
                    Instant chat support with duty supervisor
                  </p>
                  <a
                    href="https://wa.me/919876543210"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-block',
                      background: '#10b981',
                      color: '#ffffff',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontWeight: '800',
                      fontSize: '0.85rem',
                      textDecoration: 'none'
                    }}
                  >
                    Chat on WhatsApp →
                  </a>
                </div>

                {/* VIP Email Desk */}
                <div style={{ background: '#ffffff', borderRadius: '14px', padding: '18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: '1.6rem', marginBottom: '8px' }}>✉️</div>
                  <h5 style={{ margin: '0 0 4px', fontSize: '0.95rem', color: '#0F3A2F', fontWeight: '800' }}>
                    VIP Support Email
                  </h5>
                  <p style={{ margin: '0 0 12px', fontSize: '0.8rem', color: '#64748b' }}>
                    Official correspondence and billing queries
                  </p>
                  <a
                    href="mailto:concierge@aatithya-hotels.com"
                    style={{
                      display: 'inline-block',
                      background: '#f1f5f9',
                      color: '#0F3A2F',
                      border: '1px solid #cbd5e1',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontWeight: '800',
                      fontSize: '0.85rem',
                      textDecoration: 'none'
                    }}
                  >
                    concierge@aatithya-hotels.com
                  </a>
                </div>
              </div>

              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(15, 58, 47, 0.08) 0%, rgba(197, 160, 89, 0.12) 100%)',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  border: '1px solid rgba(197, 160, 89, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px'
                }}
              >
                <CrownIcon size={24} color="#C5A059" />
                <div style={{ fontSize: '0.85rem', color: '#0F3A2F', lineHeight: 1.5 }}>
                  <strong>Aatithya Devotion:</strong> Our on-property duty managers and IT engineers are active 24/7. In-suite callers can dial <strong>0</strong> from any room telephone for instant front-desk service.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
