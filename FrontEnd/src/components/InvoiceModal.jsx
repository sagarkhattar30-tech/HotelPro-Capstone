import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { PrinterIcon, CloseIcon, ShieldCheckIcon } from './Icons';

export default function InvoiceModal({ bookingId, onClose }) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      axiosClient
        .get(`/api/payments/invoice/${bookingId}`)
        .then((res) => {
          setInvoice(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching invoice:', err);
          setLoading(false);
        });
    }
  }, [bookingId]);

  const handlePrint = () => {
    window.print();
  };

  if (!bookingId) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content printable-invoice"
        style={{ maxWidth: '750px', padding: '40px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }} className="no-print">
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handlePrint} className="btn-gold" style={{ padding: '8px 18px', fontSize: '0.9rem' }}>
              <PrinterIcon size={16} /> Print / Save PDF
            </button>
          </div>
          <button
            onClick={onClose}
            style={{ background: '#f1f5f9', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading tax invoice...</div>
        ) : !invoice ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>Invoice not found</div>
        ) : (
          <div style={{ background: '#ffffff', color: '#0f172a' }}>
            {/* Top Brand Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span style={{ fontFamily: 'Rozha One, serif', fontSize: '1.5rem', color: '#c5a059', lineHeight: 1 }}>आ</span>
                  <div>
                    <span style={{ fontFamily: 'Cinzel, serif', fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.2em', color: '#0f3a2f' }}>
                      AATITHYA
                    </span>
                    <span style={{ display: 'block', fontSize: '0.62rem', letterSpacing: '0.1em', color: '#c15336', textTransform: 'uppercase' }}>
                      अतिथि देवो भव &bull; Royal Hospitality
                    </span>
                  </div>
                </div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#0f172a' }}>{invoice.hotelInfo.name}</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{invoice.hotelInfo.address}</p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Concierge: {invoice.hotelInfo.phone} | Tax ID: {invoice.hotelInfo.taxId}</p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'inline-block', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', color: '#10b981', marginBottom: '8px' }}>
                  PAID IN FULL
                </span>
                <h2 style={{ margin: 0, fontSize: '1.6rem', color: '#0f172a' }}>TAX INVOICE</h2>
                <p style={{ margin: '4px 0 0 0', fontWeight: '700', color: '#c5a059', fontSize: '0.95rem' }}>{invoice.invoiceNumber}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Date: {new Date(invoice.issueDate).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Guest & Reservation Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '20px 0', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <p style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', marginBottom: '4px' }}>Billed To</p>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>{invoice.bookingDetails.guestName}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>{invoice.bookingDetails.guestEmail}</p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>Phone: {invoice.bookingDetails.guestPhone}</p>
              </div>

              <div>
                <p style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', marginBottom: '4px' }}>Stay Details</p>
                <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>Reservation Ref:</strong> {invoice.bookingDetails.bookingNumber}</p>
                <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>Room:</strong> {invoice.bookingDetails.roomName} (Room #{invoice.bookingDetails.roomNumber})</p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>
                  {new Date(invoice.bookingDetails.checkInDate).toLocaleDateString()} &rarr; {new Date(invoice.bookingDetails.checkOutDate).toLocaleDateString()} ({invoice.bookingDetails.nights} Nights)
                </p>
              </div>
            </div>

              {/* Financial Ledger Table */}
              <div style={{ margin: '24px 0' }}>
                {(() => {
                  const currencySym = invoice?.charges?.currencySymbol || (
                    invoice?.charges?.currency === 'EUR' ? '€' :
                    invoice?.charges?.currency === 'INR' ? '₹' :
                    invoice?.charges?.currency === 'GBP' ? '£' : '$'
                  );
                  const formatCurrency = (amount) => {
                    const val = Number(amount);
                    if (isNaN(val)) return '0.00';
                    return val.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    });
                  };

                  const displayRate = formatCurrency(invoice?.charges?.ratePerNight);
                  const displaySubtotal = formatCurrency(invoice?.charges?.subtotal);
                  const displayTax = formatCurrency(invoice?.charges?.occupancyTax);
                  const displayResortFee = formatCurrency(invoice?.charges?.resortFee);
                  const displayRoundingAdjustment = formatCurrency(Math.abs(Number(invoice?.charges?.roundingAdjustment) || 0));
                  const displayTotal = formatCurrency(invoice?.charges?.total);

                  return (
                    <>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid #cbd5e1', color: '#475569', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                            <th style={{ padding: '8px 0' }}>Description</th>
                            <th style={{ padding: '8px', textAlign: 'center' }}>Rate</th>
                            <th style={{ padding: '8px', textAlign: 'center' }}>Qty</th>
                            <th style={{ padding: '8px 0', textAlign: 'right' }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 0' }}>
                              <strong>{invoice.bookingDetails.roomName}</strong>
                              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Luxury Accommodations for {invoice.bookingDetails.guestsCount} guests</div>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>{currencySym}{displayRate}</td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>{invoice.charges.nights} nights</td>
                            <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: '600' }}>{currencySym}{displaySubtotal}</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 0' }}>State & Municipal Occupancy Tax (12%)</td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>12%</td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>1</td>
                            <td style={{ padding: '12px 0', textAlign: 'right' }}>{currencySym}{displayTax}</td>
                          </tr>
                          {Boolean(invoice?.charges?.roundingAdjustment && Math.abs(Number(invoice.charges.roundingAdjustment)) > 0) && (
                            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '12px 0' }}>Currency Exchange & Tariff Rounding Adjustment</td>
                              <td style={{ padding: '12px', textAlign: 'center' }}>—</td>
                              <td style={{ padding: '12px', textAlign: 'center' }}>1</td>
                              <td style={{ padding: '12px 0', textAlign: 'right' }}>
                                {Number(invoice.charges.roundingAdjustment) >= 0 ? '+' : '-'}{currencySym}{displayRoundingAdjustment}
                              </td>
                            </tr>
                          )}
                          {Boolean(invoice.charges.resortFee && Number(invoice.charges.resortFee) > 0) && (
                            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '12px 0' }}>Hospitality Resort Amenities Fee (Pool, Spa, High-Speed WiFi)</td>
                              <td style={{ padding: '12px', textAlign: 'center' }}>{currencySym}{displayResortFee}</td>
                              <td style={{ padding: '12px', textAlign: 'center' }}>1</td>
                              <td style={{ padding: '12px 0', textAlign: 'right' }}>{currencySym}{displayResortFee}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>

                      {/* Total Calculation */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                        <div style={{ width: '280px', borderTop: '2px solid #0f172a', paddingTop: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                            <span style={{ color: '#64748b' }}>Subtotal:</span>
                            <span>{currencySym}{displaySubtotal}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                            <span style={{ color: '#64748b' }}>Taxes & Fees (12%):</span>
                            <span>{currencySym}{displayTax}</span>
                          </div>
                          {Boolean(invoice?.charges?.roundingAdjustment && Math.abs(Number(invoice.charges.roundingAdjustment)) > 0) && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                              <span style={{ color: '#64748b' }}>Rounding Adjustment:</span>
                              <span>{Number(invoice.charges.roundingAdjustment) >= 0 ? '+' : '-'}{currencySym}{displayRoundingAdjustment}</span>
                            </div>
                          )}
                          {Boolean(invoice?.charges?.resortFee && Number(invoice.charges.resortFee) > 0) && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                              <span style={{ color: '#64748b' }}>Resort Fee:</span>
                              <span>{currencySym}{displayResortFee}</span>
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                            <span>Total Paid:</span>
                            <span style={{ color: '#c5a059' }}>{currencySym}{displayTotal}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

            {/* Payment & Security Footer */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <div>
                <p style={{ margin: 0, fontWeight: '700', color: '#0f172a' }}>
                  Paid via {invoice.payment.method} &bull; Card ending in {invoice.payment.cardLast4}
                </p>
                <p style={{ margin: '2px 0 0 0', color: '#64748b' }}>
                  Transaction ID: <span style={{ fontFamily: 'monospace' }}>{invoice.payment.transactionId}</span>
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: '700' }}>
                <ShieldCheckIcon size={20} color="#10b981" />
                <span>Verified Cryptographically</span>
              </div>
            </div>

            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', marginTop: '20px' }}>
              Thank you for choosing {invoice.hotelInfo.name}. For questions regarding this tax statement, please contact concierge services.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
