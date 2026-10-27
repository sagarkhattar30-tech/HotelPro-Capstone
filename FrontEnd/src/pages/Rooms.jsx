import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { UsersIcon, BedIcon, SearchIcon, StarIcon } from '../components/Icons';
import RoomDetailsModal from '../components/RoomDetailsModal';
import BookingPaymentModal from '../components/BookingPaymentModal';

const categories = ['All', 'Presidential Villa', 'Ocean Villa', 'Penthouse', 'Executive Suite', 'Heritage Suite', 'Deluxe', 'Standard Double'];

export default function Rooms() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [rooms, setRooms] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Derive filter state directly from URL query parameters (Single Source of Truth)
  const selectedHotel = searchParams.get('hotel') || 'All';
  const selectedType = searchParams.get('type') || 'All';
  const minCapacity = Number(searchParams.get('capacity')) || 1;
  const urlSearch = searchParams.get('search') || searchParams.get('city') || searchParams.get('destination') || '';

  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [debouncedQuery, setDebouncedQuery] = useState(urlSearch);
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch);
  const [maxPrice, setMaxPrice] = useState(15000);
  const [selectedAmenity, setSelectedAmenity] = useState('All');
  const [sortBy, setSortBy] = useState('featured');

  // Modals
  const [activeDetailRoom, setActiveDetailRoom] = useState(null);
  const [activeBookingRoom, setActiveBookingRoom] = useState(null);
  const [bookingSuccessAlert, setBookingSuccessAlert] = useState('');

  const checkInParam = searchParams.get('checkIn');
  const checkOutParam = searchParams.get('checkOut');

  const debounceTimerRef = useRef(null);

  // Synchronize search query whenever URL search parameter changes
  if (urlSearch !== prevUrlSearch) {
    setPrevUrlSearch(urlSearch);
    setSearchQuery(urlSearch);
    setDebouncedQuery(urlSearch);
  }

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(val);
      setSearchParams((prev) => {
        const p = new URLSearchParams(prev);
        if (val.trim()) {
          p.set('search', val.trim());
        } else {
          p.delete('search');
        }
        return p;
      }, { replace: true });
    }, 350);
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  // Fetch hotels list for dropdown
  useEffect(() => {
    let isMounted = true;
    axiosClient.get('/api/hotels')
      .then((res) => {
        if (isMounted && Array.isArray(res.data)) setHotels(res.data);
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const fetchRooms = useCallback(() => {
    setRefreshTrigger((t) => t + 1);
  }, []);

  // Fetch rooms on filter or search parameter change
  useEffect(() => {
    let isMounted = true;
    let url = `/api/rooms?maxPrice=${maxPrice}&capacity=${minCapacity}`;
    if (selectedHotel !== 'All') url += `&hotel=${encodeURIComponent(selectedHotel)}`;
    if (selectedType !== 'All') url += `&type=${encodeURIComponent(selectedType)}`;
    if (debouncedQuery) url += `&search=${encodeURIComponent(debouncedQuery)}`;
    if (selectedAmenity !== 'All') url += `&amenity=${encodeURIComponent(selectedAmenity)}`;
    if (checkInParam && checkOutParam) {
      url += `&checkInDate=${encodeURIComponent(checkInParam)}&checkOutDate=${encodeURIComponent(checkOutParam)}`;
    }

    axiosClient.get(url)
      .then((res) => {
        if (isMounted && Array.isArray(res.data)) setRooms(res.data);
      })
      .catch((err) => {
        console.error('Failed to retrieve residences:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [selectedHotel, selectedType, debouncedQuery, maxPrice, minCapacity, selectedAmenity, checkInParam, checkOutParam, refreshTrigger]);

  // Client-side sorting
  const sortedRooms = useMemo(() => {
    const list = [...rooms];
    if (sortBy === 'price-low') {
      list.sort((a, b) => a.pricePerNight - b.pricePerNight);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.pricePerNight - a.pricePerNight);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 5) - (a.rating || 5));
    } else if (sortBy === 'capacity') {
      list.sort((a, b) => b.capacity - a.capacity);
    }
    return list;
  }, [rooms, sortBy]);

  const formatINR = (usdAmount) => {
    const inr = Math.round(Number(usdAmount || 0) * 83);
    return `₹${inr.toLocaleString('en-IN')}`;
  };

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: '110px 24px 80px', color: 'var(--text-main)' }}>
      {/* ── Page Header ── */}
      <div style={{ maxWidth: '1280px', margin: '0 auto 36px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '0.22em', color: 'var(--terracotta)', fontWeight: 700, textTransform: 'uppercase' }}>
          Aatithya Signature Residences
        </p>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)', color: 'var(--emerald-900)', margin: '8px 0 12px', fontWeight: 500 }}>
          Imperial Heritage Suites & Havelis
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '640px', margin: '0 auto' }}>
          Explore our handpicked collection of royal suites, ocean villas, and grand palatial retreats across celebrated destinations.
        </p>
      </div>

      {/* ── Booking Success Toast Notification ── */}
      {bookingSuccessAlert && (
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto 24px',
          background: 'rgba(34, 197, 94, 0.12)',
          border: '1.5px solid #22c55e',
          borderRadius: '12px',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'var(--emerald-900)'
        }}>
          <div>
            <strong>✓ Reservation Confirmed:</strong> {bookingSuccessAlert}
          </div>
          <button
            type="button"
            onClick={() => setBookingSuccessAlert('')}
            style={{ background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer', color: 'var(--emerald-900)' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Comprehensive Filter & Search Suite ── */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto 40px',
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1.5px solid var(--gold-border)',
        boxShadow: 'var(--shadow-md)',
        padding: '24px 28px'
      }}>
        {/* Row 1: Search, Destination, Sorting */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr 1fr', gap: '18px', marginBottom: '20px' }}>
          {/* Keyword Search */}
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '0.68rem', fontFamily: 'Cinzel, serif', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--terracotta)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Search Suite / City
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search Jaipur, Lake View, Royal Villa..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                style={{ paddingLeft: '38px', paddingRight: searchQuery ? '36px' : '14px' }}
              />
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                <SearchIcon size={16} />
              </span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem'
                  }}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Property Dropdown */}
          <div>
            <label style={{ display: 'block', fontSize: '0.68rem', fontFamily: 'Cinzel, serif', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--terracotta)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Heritage Palace / Hotel
            </label>
            <select
              className="form-select"
              value={selectedHotel}
              onChange={(e) => {
                setSearchParams((prev) => {
                  const p = new URLSearchParams(prev);
                  if (e.target.value === 'All') p.delete('hotel');
                  else p.set('hotel', e.target.value);
                  return p;
                }, { replace: true });
              }}
            >
              <option value="All">All Royal Properties</option>
              {hotels.map((h) => (
                <option key={h._id} value={h.name}>
                  {h.name} ({h.city})
                </option>
              ))}
            </select>
          </div>

          {/* Sorting */}
          <div>
            <label style={{ display: 'block', fontSize: '0.68rem', fontFamily: 'Cinzel, serif', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--terracotta)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Sort Results By
            </label>
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="featured">Featured Stays</option>
              <option value="price-low">Tariff: Low to High</option>
              <option value="price-high">Tariff: High to Low</option>
              <option value="rating">Highest Guest Rating</option>
              <option value="capacity">Largest Suite Capacity</option>
            </select>
          </div>
        </div>

        {/* Row 2: Category Filter Buttons */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '16px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSearchParams((prev) => {
                  const p = new URLSearchParams(prev);
                  if (cat === 'All') p.delete('type');
                  else p.set('type', cat);
                  return p;
                }, { replace: true });
              }}
              style={{
                padding: '7px 16px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 600,
                border: selectedType === cat ? '1.5px solid var(--emerald-800)' : '1px solid rgba(15,58,47,0.12)',
                background: selectedType === cat ? 'var(--emerald-800)' : 'var(--bg-secondary)',
                color: selectedType === cat ? '#FAF7F2' : 'var(--text-body)',
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Row 3: Active Filter Summary and Clear */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(15,58,47,0.06)', paddingTop: '14px', fontSize: '0.85rem' }}>
          <div style={{ color: 'var(--text-muted)' }}>
            Showing <strong style={{ color: 'var(--emerald-900)' }}>{sortedRooms.length}</strong> verified luxury residence{sortedRooms.length !== 1 ? 's' : ''}
            {checkInParam && checkOutParam && (
              <span style={{ marginLeft: '10px', color: 'var(--terracotta)', fontWeight: 600 }}>
                &bull; Available: {checkInParam} to {checkOutParam}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setDebouncedQuery('');
              setMaxPrice(15000);
              setSelectedAmenity('All');
              setSortBy('featured');
              setSearchParams({}, { replace: true });
            }}
            style={{ background: 'none', border: 'none', color: 'var(--terracotta)', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
          >
            Reset All Filters
          </button>
        </div>
      </div>

      {/* ── Rooms Grid ── */}
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {loading ? (
          /* Skeleton Loaders */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '30px' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ background: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(197,160,89,0.2)', height: '420px', display: 'flex', flexDirection: 'column' }}>
                <div className="skeleton" style={{ height: '240px', width: '100%' }} />
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="skeleton" style={{ height: '16px', width: '40%' }} />
                  <div className="skeleton" style={{ height: '24px', width: '75%' }} />
                  <div className="skeleton" style={{ height: '14px', width: '90%' }} />
                  <div className="skeleton" style={{ height: '36px', width: '100%', marginTop: 'auto' }} />
                </div>
              </div>
            ))}
          </div>
        ) : sortedRooms.length === 0 ? (
          /* Empty State */
          <div style={{
            textAlign: 'center',
            padding: '70px 24px',
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px solid var(--gold-border)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', color: 'var(--emerald-900)', marginBottom: '8px' }}>
              No Matching Residences Found
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', maxWidth: '480px', margin: '0 auto 24px' }}>
              Try adjusting your destination, dates, or suite type to view additional royal residences across India.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setDebouncedQuery('');
                setMaxPrice(15000);
                setSearchParams({}, { replace: true });
              }}
              className="btn-gold"
            >
              <span>View All Royal Residences</span>
            </button>
          </div>
        ) : (
          /* Active Room Cards */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '30px' }}>
            {sortedRooms.map((room) => {
              const displayImage = room.image || room.images?.[0] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop';
              const hotelName = room.hotelName || 'Aatithya Heritage Collection';

              return (
                <div
                  key={room._id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    border: '1px solid rgba(197,160,89,0.25)',
                    boxShadow: 'var(--shadow-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'transform 0.25s var(--ease-expo), box-shadow 0.25s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                >
                  {/* Image Card Top */}
                  <div>
                    <div
                      style={{ position: 'relative', height: '240px', overflow: 'hidden', cursor: 'pointer' }}
                      onClick={() => setActiveDetailRoom(room)}
                    >
                      <img
                        src={displayImage}
                        alt={room.name}
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop';
                        }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                      />
                      <span style={{
                        position: 'absolute',
                        top: '14px',
                        left: '14px',
                        background: 'rgba(10,38,30,0.85)',
                        backdropFilter: 'blur(4px)',
                        color: '#FAF7F2',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 600
                      }}>
                        {room.type} &bull; Suite #{room.roomNumber}
                      </span>
                      {room.images && room.images.length > 1 && (
                        <span style={{
                          position: 'absolute',
                          top: '14px',
                          right: '14px',
                          background: 'rgba(10,38,30,0.85)',
                          backdropFilter: 'blur(4px)',
                          color: 'var(--gold, #C5A059)',
                          padding: '4px 10px',
                          borderRadius: '16px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          border: '1px solid rgba(197, 160, 89, 0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          📷 {room.images.length} Photos
                        </span>
                      )}
                      <div style={{
                        position: 'absolute',
                        bottom: '14px',
                        right: '14px',
                        background: '#FFFFFF',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '4px'
                      }}>
                        <strong style={{ color: 'var(--emerald-800)', fontSize: '1.15rem' }}>{formatINR(room.pricePerNight)}</strong>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/ night</span>
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--terracotta)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          📍 {room.city || room.location || 'Heritage Destination'}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <StarIcon size={12} color="#C5A059" />
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--emerald-900)' }}>
                            {room.rating || 4.9}
                          </span>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'Cinzel, serif', fontWeight: 600, marginBottom: '6px' }}>
                        {hotelName}
                      </div>

                      <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', color: 'var(--emerald-900)', margin: '0 0 8px', lineHeight: 1.2 }}>
                        {room.name}
                      </h3>

                      <p style={{ color: 'var(--text-body)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '16px' }}>
                        {room.description && room.description.length > 110
                          ? `${room.description.substring(0, 110)}…`
                          : room.description}
                      </p>

                      {/* Room Specifications */}
                      <div style={{
                        display: 'flex',
                        gap: '16px',
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        padding: '10px 0',
                        borderTop: '1px solid rgba(15,58,47,0.06)',
                        borderBottom: '1px solid rgba(15,58,47,0.06)',
                        marginBottom: '16px'
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <UsersIcon size={14} color="#C5A059" /> Up to {room.capacity} Guests
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <BedIcon size={14} color="#C5A059" /> {room.bedType || 'King Plush'}
                        </span>
                        <span>{room.sizeSqFt || 650} sq.ft</span>
                      </div>

                      {/* Amenity Badges */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {(room.amenities || []).slice(0, 3).map((a, i) => (
                          <span key={i} className="badge-emerald">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Buttons */}
                  <div style={{
                    padding: '16px 24px 20px',
                    borderTop: '1px solid rgba(15,58,47,0.06)',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1.3fr',
                    gap: '12px'
                  }}>
                    <button
                      type="button"
                      onClick={() => setActiveDetailRoom(room)}
                      className="btn-outline-gold"
                      style={{ padding: '10px 14px', fontSize: '0.8rem' }}
                    >
                      View Details
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveBookingRoom(room)}
                      className="btn-gold"
                      style={{ padding: '10px 14px', fontSize: '0.8rem' }}
                    >
                      <span>Reserve Suite</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Room Details Modal ── */}
      {activeDetailRoom && (
        <RoomDetailsModal
          room={activeDetailRoom}
          onClose={() => setActiveDetailRoom(null)}
          onBookNow={(room) => {
            setActiveDetailRoom(null);
            setActiveBookingRoom(room);
          }}
        />
      )}

      {/* ── Booking & Stripe Payment Modal ── */}
      {activeBookingRoom && (
        <BookingPaymentModal
          room={activeBookingRoom}
          initialCheckIn={checkInParam}
          initialCheckOut={checkOutParam}
          onClose={() => setActiveBookingRoom(null)}
          onBookingSuccess={(booking) => {
            setActiveBookingRoom(null);
            setBookingSuccessAlert(
              `${booking.roomName} (Ref: ${booking.bookingNumber}) reserved successfully!`
            );
            fetchRooms();
          }}
        />
      )}
    </div>
  );
}