import { useState } from 'react';
import { CloseIcon, StarIcon, UsersIcon, BedIcon, WifiIcon, SparklesIcon } from './Icons';
import HotelGalleryModal, { HotelImageBentoGrid } from './HotelGalleryModal';

export default function RoomDetailsModal({ room, onClose, onBookNow }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!room) return null;

  const images = Array.isArray(room.images) && room.images.length > 0
    ? room.images
    : [room.image || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop'];
  const inrPrice = Math.round((room.pricePerNight || 250) * 83).toLocaleString('en-IN');

  const openLightboxAt = (idx = 0) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{
          maxWidth: '860px',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: 'var(--warm-ivory, #FAF7F2)',
          borderRadius: '24px',
          border: '1px solid var(--border-color, #E8DFD1)',
          boxShadow: '0 24px 60px rgba(15, 58, 47, 0.18)',
          color: 'var(--text-primary, #1A2421)',
          padding: '24px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Controls Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                background: 'var(--emerald, #0F3A2F)',
                color: 'var(--gold, #C5A059)',
                fontFamily: 'Cinzel, serif',
                fontSize: '0.68rem',
                letterSpacing: '0.18em',
                padding: '6px 14px',
                borderRadius: '30px',
                border: '1px solid rgba(197, 160, 89, 0.5)',
                textTransform: 'uppercase'
              }}
            >
              आतिथ्य &bull; Royal Suite
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #5C6764)' }}>
              {room.hotelName || 'Aatithya Heritage Palace'} &bull; {room.city || room.location}
            </span>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: '#FFFFFF',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              border: '1px solid var(--border-color, #E8DFD1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--emerald, #0F3A2F)',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* 5-Image Bento Grid / Authentic Property Gallery */}
        <HotelImageBentoGrid
          images={images}
          title={room.name}
          hotelName={room.hotelName}
          onImageClick={openLightboxAt}
        />

        {/* Floating Price Pill */}
        <div
          style={{
            marginTop: '16px',
            background: '#FFFFFF',
            padding: '14px 22px',
            borderRadius: '16px',
            border: '1px solid var(--border-color, #E8DFD1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.9rem', fontWeight: '700', color: 'var(--emerald, #0F3A2F)' }}>
                ₹{inrPrice}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted, #5C6764)' }}>
                / night <span style={{ fontSize: '0.75rem', color: 'var(--gold, #C5A059)' }}>(${room.pricePerNight})</span>
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--terracotta, #C15336)', fontWeight: 600, letterSpacing: '0.04em' }}>
              Includes Royal Indian Breakfast & Luxury Hospitality Taxes
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '0.72rem',
                letterSpacing: '0.1em',
                color: 'var(--emerald, #0F3A2F)',
                background: 'rgba(15, 58, 47, 0.06)',
                border: '1px solid rgba(15, 58, 47, 0.15)',
                padding: '6px 14px',
                borderRadius: '20px',
                textTransform: 'uppercase'
              }}
            >
              👑 Heritage Reserve
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div style={{ padding: '28px 32px' }}>
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span
                  style={{
                    background: 'rgba(15, 58, 47, 0.08)',
                    color: 'var(--emerald, #0F3A2F)',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    letterSpacing: '0.12em',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                  }}
                >
                  {room.type}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #5C6764)' }}>
                  Residence #{room.roomNumber}
                </span>
              </div>
              <h2
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '2rem',
                  color: 'var(--emerald, #0F3A2F)',
                  margin: '0',
                  fontWeight: 600,
                  lineHeight: 1.2
                }}
              >
                {room.name}
              </h2>
            </div>

            {/* Rating badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#FEF3C7',
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #FDE68A',
                flexShrink: 0
              }}
            >
              <StarIcon size={16} color="#D97706" />
              <strong style={{ color: '#92400E', fontSize: '0.95rem' }}>{room.rating || 4.9}</strong>
              <span style={{ fontSize: '0.75rem', color: '#B45309' }}>({room.reviewCount || 24} reviews)</span>
            </div>
          </div>

          {/* Quick Specs Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              padding: '16px 0',
              borderTop: '1px solid var(--border-color, #E8DFD1)',
              borderBottom: '1px solid var(--border-color, #E8DFD1)',
              marginBottom: '22px'
            }}
          >
            <div style={{ textAlign: 'center', padding: '8px' }}>
              <div style={{ color: 'var(--gold, #C5A059)', marginBottom: '4px' }}><UsersIcon size={20} /></div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #5C6764)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Capacity</div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--emerald, #0F3A2F)' }}>Up to {room.capacity} Guests</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px' }}>
              <div style={{ color: 'var(--gold, #C5A059)', marginBottom: '4px' }}><BedIcon size={20} /></div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #5C6764)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Bedding</div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--emerald, #0F3A2F)' }}>{room.bedType || 'Royal King Bed'}</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px' }}>
              <div style={{ color: 'var(--gold, #C5A059)', marginBottom: '4px' }}><SparklesIcon size={20} /></div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #5C6764)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Living Space</div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--emerald, #0F3A2F)' }}>{room.sizeSqFt || 650} sq.ft</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px' }}>
              <div style={{ color: 'var(--gold, #C5A059)', marginBottom: '4px' }}><WifiIcon size={20} /></div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #5C6764)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Palace Wing</div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--emerald, #0F3A2F)' }}>Floor {room.floor || 2} &bull; Courtyard</div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '22px' }}>
            <h4
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '0.85rem',
                color: 'var(--emerald, #0F3A2F)',
                marginBottom: '8px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase'
              }}
            >
              The Residence Experience
            </h4>
            <p style={{ color: 'var(--text-secondary, #384541)', fontSize: '0.95rem', lineHeight: '1.75' }}>
              {room.description || 'Immerse in the timeless grandeur of Indian royalty. Handcrafted rosewood furnishings, bespoke silk drapery, and marble-clad en-suite bathrooms converge to craft an unforgettable sanctuary of quiet opulence.'}
            </p>
          </div>

          {/* Luxury Amenities */}
          <div style={{ marginBottom: '28px' }}>
            <h4
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '0.85rem',
                color: 'var(--emerald, #0F3A2F)',
                marginBottom: '12px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase'
              }}
            >
              Curated Privileges & Amenities
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {(room.amenities && room.amenities.length > 0 ? room.amenities : [
                'High-Speed Wi-Fi', 'Courtyard View', 'Deep Soaking Tub', 'Heritage Tea Bar', 'Smart Entertainment', 'Ayurvedic Bath Essentials', 'Personal Butler Service'
              ]).map((item, idx) => (
                <span
                  key={idx}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid var(--border-color, #E8DFD1)',
                    padding: '8px 16px',
                    borderRadius: '24px',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary, #384541)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}
                >
                  <SparklesIcon size={14} color="var(--gold, #C5A059)" /> {item}
                </span>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div
            style={{
              display: 'flex',
              gap: '14px',
              borderTop: '1px solid var(--border-color, #E8DFD1)',
              paddingTop: '20px'
            }}
          >
            <button
              onClick={() => {
                onClose();
                onBookNow(room);
              }}
              className="btn-emerald"
              style={{
                flex: 1,
                justifyContent: 'center',
                padding: '16px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Reserve Suite &bull; ₹{inrPrice} / night
            </button>
            <button
              onClick={onClose}
              className="btn-outline"
              style={{ padding: '16px 28px', cursor: 'pointer' }}
            >
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      <HotelGalleryModal
        isOpen={lightboxOpen}
        initialIndex={lightboxIndex}
        images={images}
        title={room.name}
        hotelName={room.hotelName}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
