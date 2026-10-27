import { useState, useEffect, useCallback, useMemo } from 'react';
import { CloseIcon } from './Icons';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop';

const DEFAULT_CAPTIONS = [
  'Royal Chamber Suite',
  'Palace Courtyard & Architecture',
  'Heritage Sitting Salon',
  'Luxury Marble Bath',
  'Scenic Balcony & Vistas'
];

/**
 * Premium 5-Image Bento Grid with Fullscreen Lightbox, Thumbnails, Keyboard Nav & Touch Swipe
 */
export default function HotelGalleryModal({
  images = [],
  title = 'Palace Suite',
  hotelName = 'Aatithya Heritage Residence',
  isOpen = false,
  initialIndex = 0,
  onClose
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [prevInitialIndex, setPrevInitialIndex] = useState(initialIndex);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  // Compute valid images directly without cascading effect state
  const validImages = useMemo(() => {
    const rawList = Array.isArray(images) && images.length > 0 ? images : [FALLBACK_IMAGE];
    const cleaned = rawList.filter(Boolean);
    return cleaned.length > 0 ? cleaned : [FALLBACK_IMAGE];
  }, [images]);

  // Adjust state when initialIndex changes without violating useEffect rules
  if (initialIndex !== prevInitialIndex) {
    setPrevInitialIndex(initialIndex);
    setCurrentIndex(Math.min(initialIndex, Math.max(0, validImages.length - 1)));
  }

  const total = validImages.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Keyboard navigation (Arrow keys + Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, nextSlide, prevSlide, onClose]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    if (distance > 50) {
      nextSlide(); // Swiped left -> next
    } else if (distance < -50) {
      prevSlide(); // Swiped right -> prev
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  if (!isOpen) return null;

  const currentImage = validImages[currentIndex] || validImages[0] || FALLBACK_IMAGE;
  const currentCaption = DEFAULT_CAPTIONS[currentIndex] || `Residence Perspective ${currentIndex + 1}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} image gallery`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(8, 28, 22, 0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        animation: 'fadeIn 0.25s ease-out',
        color: '#FAF7F2',
        userSelect: 'none'
      }}
      onClick={onClose}
    >
      {/* Top Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 28px',
          borderBottom: '1px solid rgba(197, 160, 89, 0.2)',
          background: 'rgba(10, 36, 28, 0.7)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '0.7rem',
                letterSpacing: '0.18em',
                color: 'var(--gold, #C5A059)',
                textTransform: 'uppercase'
              }}
            >
              आतिथ्य &bull; Heritage Gallery
            </span>
            {total > 1 && (
              <span
                style={{
                  background: 'rgba(197, 160, 89, 0.2)',
                  color: 'var(--gold, #C5A059)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '2px 10px',
                  borderRadius: '12px',
                  border: '1px solid rgba(197, 160, 89, 0.3)'
                }}
              >
                {currentIndex + 1} / {total}
              </span>
            )}
          </div>
          <h3
            style={{
              margin: '4px 0 0',
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '1.4rem',
              fontWeight: 600,
              color: '#FFFFFF',
              letterSpacing: '0.02em'
            }}
          >
            {title} &mdash; <span style={{ opacity: 0.8, fontSize: '1.1rem', fontWeight: 400 }}>{hotelName}</span>
          </h3>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close lightbox"
          style={{
            background: 'rgba(250, 247, 242, 0.1)',
            border: '1px solid rgba(197, 160, 89, 0.4)',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(197, 160, 89, 0.3)';
            e.currentTarget.style.transform = 'scale(1.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(250, 247, 242, 0.1)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <CloseIcon size={22} />
        </button>
      </div>

      {/* Main Showcase Stage */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px 24px',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Previous Arrow */}
        {total > 1 && (
          <button
            onClick={prevSlide}
            aria-label="Previous photo"
            style={{
              position: 'absolute',
              left: '24px',
              zIndex: 10,
              background: 'rgba(10, 36, 28, 0.75)',
              border: '1px solid rgba(197, 160, 89, 0.5)',
              borderRadius: '50%',
              width: '52px',
              height: '52px',
              color: 'var(--gold, #C5A059)',
              fontSize: '1.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              transition: 'all 0.2s ease',
              paddingBottom: '4px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(197, 160, 89, 0.9)';
              e.currentTarget.style.color = '#0F3A2F';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(10, 36, 28, 0.75)';
              e.currentTarget.style.color = 'var(--gold, #C5A059)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            &#8249;
          </button>
        )}

        {/* Center Main Image */}
        <div
          style={{
            maxWidth: '1080px',
            maxHeight: 'calc(100vh - 240px)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img
            src={currentImage}
            alt={`${title} - ${currentCaption}`}
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
            style={{
              maxWidth: '100%',
              maxHeight: 'calc(100vh - 280px)',
              objectFit: 'contain',
              borderRadius: '14px',
              boxShadow: '0 24px 70px rgba(0,0,0,0.6)',
              border: '1px solid rgba(197, 160, 89, 0.2)',
              transition: 'transform 0.25s ease'
            }}
          />

          {/* Caption Tag */}
          <div
            style={{
              marginTop: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <span
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '0.85rem',
                letterSpacing: '0.12em',
                color: 'var(--gold, #C5A059)',
                textTransform: 'uppercase'
              }}
            >
              {currentCaption}
            </span>
          </div>
        </div>

        {/* Next Arrow */}
        {total > 1 && (
          <button
            onClick={nextSlide}
            aria-label="Next photo"
            style={{
              position: 'absolute',
              right: '24px',
              zIndex: 10,
              background: 'rgba(10, 36, 28, 0.75)',
              border: '1px solid rgba(197, 160, 89, 0.5)',
              borderRadius: '50%',
              width: '52px',
              height: '52px',
              color: 'var(--gold, #C5A059)',
              fontSize: '1.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              transition: 'all 0.2s ease',
              paddingBottom: '4px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(197, 160, 89, 0.9)';
              e.currentTarget.style.color = '#0F3A2F';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(10, 36, 28, 0.75)';
              e.currentTarget.style.color = 'var(--gold, #C5A059)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            &#8250;
          </button>
        )}
      </div>

      {/* Bottom Thumbnails Strip */}
      {total > 1 && (
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid rgba(197, 160, 89, 0.2)',
            background: 'rgba(10, 36, 28, 0.85)',
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            overflowX: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {validImages.map((img, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Jump to photo ${idx + 1}`}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  borderRadius: '10px',
                  outline: 'none',
                  flexShrink: 0,
                  transition: 'transform 0.2s ease'
                }}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                  style={{
                    width: '74px',
                    height: '50px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: isActive
                      ? '2px solid var(--gold, #C5A059)'
                      : '1px solid rgba(255,255,255,0.2)',
                    boxShadow: isActive ? '0 0 12px rgba(197, 160, 89, 0.6)' : 'none',
                    opacity: isActive ? 1 : 0.6,
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.2s ease'
                  }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Editorial 5-Image Bento Grid for Hotel/Room details view
 */
export function HotelImageBentoGrid({
  images = [],
  title = 'Palace Suite',
  onImageClick
}) {
  const list = Array.isArray(images) && images.length > 0 ? images.filter(Boolean) : [FALLBACK_IMAGE];
  const total = list.length;

  // Single-image presentation: hide gallery controls completely
  if (total <= 1) {
    return (
      <div
        style={{
          position: 'relative',
          height: '380px',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(15, 58, 47, 0.08)'
        }}
      >
        <img
          src={list[0] || FALLBACK_IMAGE}
          alt={title}
          onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    );
  }

  // 2 to 4 images presentation: Single clean view button, no duplicates
  if (total < 5) {
    return (
      <div
        style={{
          position: 'relative',
          height: '380px',
          borderRadius: '16px',
          overflow: 'hidden',
          cursor: 'pointer'
        }}
        onClick={() => onImageClick?.(0)}
      >
        <img
          src={list[0] || FALLBACK_IMAGE}
          alt={title}
          onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(10,36,28,0.5) 0%, transparent 60%)'
          }}
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onImageClick?.(0);
          }}
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            background: 'rgba(250, 247, 242, 0.95)',
            color: 'var(--emerald, #0F3A2F)',
            fontFamily: 'Cinzel, serif',
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
            padding: '8px 18px',
            borderRadius: '24px',
            border: '1px solid rgba(197, 160, 89, 0.5)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            cursor: 'pointer'
          }}
        >
          📷 View All {total} Photos
        </button>
      </div>
    );
  }

  // Authentic 5-Image Responsive Bento Grid (1 large feature + 4 gallery tiles)
  return (
    <div className="hotel-bento-grid">
      {/* 1. Large Feature Image (Spans 2 cols, 2 rows) */}
      <div
        className="hotel-bento-main"
        onClick={() => onImageClick?.(0)}
      >
        <img
          src={list[0]}
          alt={`${title} main`}
          onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        />
      </div>

      {/* 2. Top-Right 1 */}
      <div
        className="hotel-bento-sub"
        style={{
          gridColumn: '3 / 4',
          gridRow: '1 / 2',
          overflow: 'hidden',
          cursor: 'pointer',
          position: 'relative'
        }}
        onClick={() => onImageClick?.(1)}
      >
        <img
          src={list[1]}
          alt={`${title} detail 1`}
          onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        />
      </div>

      {/* 3. Top-Right 2 */}
      <div
        className="hotel-bento-sub"
        style={{
          gridColumn: '4 / 5',
          gridRow: '1 / 2',
          overflow: 'hidden',
          cursor: 'pointer',
          position: 'relative'
        }}
        onClick={() => onImageClick?.(2)}
      >
        <img
          src={list[2]}
          alt={`${title} detail 2`}
          onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        />
      </div>

      {/* 4. Bottom-Right 1 */}
      <div
        className="hotel-bento-sub"
        style={{
          gridColumn: '3 / 4',
          gridRow: '2 / 3',
          overflow: 'hidden',
          cursor: 'pointer',
          position: 'relative'
        }}
        onClick={() => onImageClick?.(3)}
      >
        <img
          src={list[3]}
          alt={`${title} detail 3`}
          onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        />
      </div>

      {/* 5. Bottom-Right 2 with "View All Photos" tile overlay */}
      <div
        className="hotel-bento-sub"
        style={{
          gridColumn: '4 / 5',
          gridRow: '2 / 3',
          overflow: 'hidden',
          cursor: 'pointer',
          position: 'relative'
        }}
        onClick={() => onImageClick?.(4)}
      >
        <img
          src={list[4]}
          alt={`${title} detail 4`}
          onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(10, 36, 28, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(2px)',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(10, 36, 28, 0.65)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(10, 36, 28, 0.45)'; }}
        >
          <span
            style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '0.78rem',
              letterSpacing: '0.1em',
              color: '#FFFFFF',
              fontWeight: 600,
              background: 'rgba(15, 58, 47, 0.85)',
              padding: '8px 14px',
              borderRadius: '20px',
              border: '1px solid var(--gold, #C5A059)'
            }}
          >
            📷 All {total} Photos
          </span>
        </div>
      </div>
    </div>
  );
}
