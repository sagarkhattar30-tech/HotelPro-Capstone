const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const ServiceRequest = require('../models/ServiceRequest');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const AdminLog = require('../models/AdminLog');

const seedDatabase = async () => {
  try {
    console.log('--- Initializing HotelPro Comprehensive Multi-Hotel Seeding ---');

    // 1. Seed Users
    const adminPass = await bcrypt.hash('admin123', 10);
    const staffPass = await bcrypt.hash('staff123', 10);
    const guestPass = await bcrypt.hash('guest123', 10);

    const defaultUsers = [
      {
        name: 'Elena Vance',
        email: 'admin@hotelpro.com',
        password: adminPass,
        role: 'Admin',
        phone: '+1 (555) 900-1122',
        membershipTier: 'Platinum VIP'
      },
      {
        name: 'Marcus Sterling',
        email: 'staff@hotelpro.com',
        password: staffPass,
        role: 'Staff',
        phone: '+1 (555) 900-3344',
        membershipTier: 'Gold Elite'
      },
      {
        name: 'Alexander Wright',
        email: 'guest@hotelpro.com',
        password: guestPass,
        role: 'Guest',
        phone: '+1 (555) 900-5566',
        membershipTier: 'Platinum VIP'
      },
      {
        name: 'Sagar Khattar',
        email: 'sagarkhattar30@gmail.com',
        password: guestPass,
        role: 'Admin',
        phone: '+1 (555) 777-8899',
        membershipTier: 'Platinum VIP'
      }
    ];

    for (const u of defaultUsers) {
      await User.findOneAndUpdate({ email: u.email }, u, { upsert: true, returnDocument: 'after' });
    }

    // 2. Seed 6 World-Class Hotels
    const hotelsList = [
      {
        name: 'The Grand Azure Resort & Spa',
        city: 'Malibu',
        country: 'USA',
        location: 'Malibu, California',
        address: '77 Oceanfront Boulevard, Paradise Cove, CA 90265',
        starRating: 5,
        rating: 4.98,
        reviewCount: 320,
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop'
        ],
        description: 'Iconic Pacific oceanfront sanctuary featuring private golden beaches, heated infinity plunge pools, and 3-Michelin-starred seaside dining.',
        amenities: ['Private Beach', 'Infinity Pools', 'Michelin 3-Star Dining', 'Helipad', 'Full Hydrotherapy Spa', '24/7 Butler Service'],
        startingPrice: 295,
        phone: '+1 (800) 555-AZURE',
        email: 'malibu@hotelpro.com',
        featured: true
      },
      {
        name: 'HotelPro Sky Palace & Towers',
        city: 'New York',
        country: 'USA',
        location: 'Manhattan, New York',
        address: '750 Fifth Avenue, Central Park South, New York, NY 10019',
        starRating: 5,
        rating: 4.95,
        reviewCount: 450,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1200&auto=format&fit=crop'
        ],
        description: 'Ultra-luxury modern Manhattan high-rise towering above Central Park with panoramic skyline terraces, private art galleries, and executive lounges.',
        amenities: ['Central Park Views', 'Skyline Cocktail Lounge', 'Rolls-Royce Chauffeur', 'Indoor Heated Pool', 'Private Boardrooms', 'Michelin Dining'],
        startingPrice: 265,
        phone: '+1 (800) 555-NYC1',
        email: 'newyork@hotelpro.com',
        featured: true
      },
      {
        name: 'HotelPro Alpine Snow Lodge & Chalet',
        city: 'Aspen',
        country: 'USA',
        location: 'Aspen, Colorado',
        address: '120 Mountain Pass Ridge, Aspen, CO 81611',
        starRating: 5,
        rating: 4.92,
        reviewCount: 210,
        image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200&auto=format&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1200&auto=format&fit=crop'
        ],
        description: 'Premier ski-in/ski-out mountain sanctuary with heated mineral thermal baths, artisan timber architecture, roaring stone fireplaces, and sommelier cellars.',
        amenities: ['Ski-In / Ski-Out', 'Heated Outdoor Springs', 'Stone Fireplaces', 'Ski Valet', 'Artisan Fondue Dining', 'Alpine Spa'],
        startingPrice: 240,
        phone: '+1 (800) 555-SNOW',
        email: 'aspen@hotelpro.com',
        featured: true
      },
      {
        name: 'HotelPro Emerald Lagoon & Palms',
        city: 'Miami Beach',
        country: 'USA',
        location: 'Miami Beach, Florida',
        address: '4401 Collins Avenue, Millionaire’s Row, Miami Beach, FL 33140',
        starRating: 5,
        rating: 4.91,
        reviewCount: 380,
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop'
        ],
        description: 'Glamorous Art Deco coastal haven on Millionaire’s Row with private yacht moorings, palm-fringed saltwater lagoons, and chic sunset lounges.',
        amenities: ['Private Marina', 'Lagoon Pool Cabanas', 'Ocean Boardwalk', 'Beachside DJ Lounge', 'Yacht Charter', 'Water Sports'],
        startingPrice: 220,
        phone: '+1 (800) 555-MIA1',
        email: 'miami@hotelpro.com',
        featured: true
      },
      {
        name: 'HotelPro Marina Mirage Bay',
        city: 'Dubai',
        country: 'UAE',
        location: 'Dubai Marina, UAE',
        address: 'Crescent Road, Palm Jumeirah & Marina Bay, Dubai, UAE',
        starRating: 5,
        rating: 4.99,
        reviewCount: 510,
        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop'
        ],
        description: 'An architectural marvel overlooking the Arabian Gulf featuring private golden terraces, rooftop infinity sky-pools, and royal suites with Rolls-Royce transfers.',
        amenities: ['Arabian Gulf Views', 'Private Superyacht', 'Gold-leaf Spa', 'Rooftop Sky Pool', 'Helicopter Transfer', 'Personal Chef'],
        startingPrice: 290,
        phone: '+971 4 555 9000',
        email: 'dubai@hotelpro.com',
        featured: true
      },
      {
        name: 'HotelPro Royal Regency Heritage',
        city: 'London',
        country: 'UK',
        location: 'Mayfair, London',
        address: '16 Park Lane, Mayfair, London W1K 1BE, UK',
        starRating: 5,
        rating: 4.96,
        reviewCount: 290,
        image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1200&auto=format&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1200&auto=format&fit=crop'
        ],
        description: 'Stately British elegance overlooking Hyde Park in royal Mayfair. Historic chandeliers, Michelin gastronomy, and afternoon high tea in the conservatory garden.',
        amenities: ['Hyde Park Views', 'Afternoon High Tea', 'Bentley Chauffeur', 'Historic Cigar Lounge', 'Private Butler', 'Fine Dining'],
        startingPrice: 275,
        phone: '+44 20 7555 8800',
        email: 'london@hotelpro.com',
        featured: true
      }
    ];

    const hotelMap = {};
    for (const h of hotelsList) {
      const saved = await Hotel.findOneAndUpdate({ name: h.name }, h, { upsert: true, returnDocument: 'after' });
      hotelMap[h.name] = saved;
    }

    // 3. Seed 24 Distinct Luxury Rooms across these 6 Hotels (4 per hotel)
    const allRooms = [
      // --- Malibu (The Grand Azure Resort) ---
      {
        roomNumber: 'AZ-501',
        name: 'Presidential Sky Villa & Terrace',
        hotelName: 'The Grand Azure Resort & Spa',
        city: 'Malibu',
        location: 'Malibu, California',
        hotelId: hotelMap['The Grand Azure Resort & Spa']._id,
        type: 'Presidential Villa',
        pricePerNight: 850,
        capacity: 6,
        bedType: 'Super King + 2 Queen Suites',
        sizeSqFt: 2400,
        floor: 5,
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop',
        description: 'Top floor featuring 360-degree ocean views, heated private infinity plunge pool, dedicated 24-hour butler service, and private dining hall.',
        amenities: ['Ocean View', 'Private Infinity Pool', '24/7 Butler Service', 'Jacuzzi', 'High-Speed WiFi', 'Climate Control'],
        status: 'Available',
        rating: 4.98,
        reviewCount: 38,
        featured: true
      },
      {
        roomNumber: 'AZ-402',
        name: 'Royal Azure Oceanfront Suite',
        hotelName: 'The Grand Azure Resort & Spa',
        city: 'Malibu',
        location: 'Malibu, California',
        hotelId: hotelMap['The Grand Azure Resort & Spa']._id,
        type: 'Ocean Villa',
        pricePerNight: 520,
        capacity: 4,
        bedType: 'Grand Californian King',
        sizeSqFt: 1150,
        floor: 4,
        image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=1200&auto=format&fit=crop',
        description: 'Direct uninterrupted ocean panorama. Italian marble bathroom with dual rain showers, private sun deck, and walk-in dressing room.',
        amenities: ['Ocean View', 'Private Balcony', 'Deep Soaking Tub', 'Espresso Bar', 'High-Speed WiFi'],
        status: 'Occupied',
        rating: 4.92,
        reviewCount: 45,
        featured: true
      },
      {
        roomNumber: 'AZ-210',
        name: 'Grand Deluxe Heritage Suite',
        hotelName: 'The Grand Azure Resort & Spa',
        city: 'Malibu',
        location: 'Malibu, California',
        hotelId: hotelMap['The Grand Azure Resort & Spa']._id,
        type: 'Deluxe',
        pricePerNight: 295,
        capacity: 2,
        bedType: 'Signature King Bed',
        sizeSqFt: 640,
        floor: 2,
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop',
        description: 'Elegantly appointed suite blending handcrafted teakwood furniture with modern amenities and lush botanical garden views.',
        amenities: ['Garden View', 'Deep Soaking Tub', 'High-Speed WiFi', 'Evening Turndown', 'Smart TV 65"'],
        status: 'Available',
        rating: 4.79,
        reviewCount: 31,
        featured: false
      },
      {
        roomNumber: 'AZ-104',
        name: 'Coastal Beachfront Family Retreat',
        hotelName: 'The Grand Azure Resort & Spa',
        city: 'Malibu',
        location: 'Malibu, California',
        hotelId: hotelMap['The Grand Azure Resort & Spa']._id,
        type: 'Executive Suite',
        pricePerNight: 360,
        capacity: 5,
        bedType: '1 King + 2 Queen Beds',
        sizeSqFt: 960,
        floor: 1,
        image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1200&auto=format&fit=crop',
        description: 'Direct step-out access to the golden beach with separate lounge, child-friendly amenities, and beachside cabana reservations.',
        amenities: ['Direct Beach Access', 'Family Lounge', 'Kitchenette', 'High-Speed WiFi'],
        status: 'Available',
        rating: 4.88,
        reviewCount: 22,
        featured: false
      },

      // --- New York (HotelPro Sky Palace) ---
      {
        roomNumber: 'NY-801',
        name: 'Manhattan Empire Sky Penthouse',
        hotelName: 'HotelPro Sky Palace & Towers',
        city: 'New York',
        location: 'Manhattan, New York',
        hotelId: hotelMap['HotelPro Sky Palace & Towers']._id,
        type: 'Penthouse',
        pricePerNight: 920,
        capacity: 4,
        bedType: 'Custom Handcrafted King',
        sizeSqFt: 1800,
        floor: 52,
        image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1200&auto=format&fit=crop',
        description: 'Unmatched 52nd-floor vantage over Central Park and the Manhattan skyline. Includes private wrap-around terrace and baby grand piano.',
        amenities: ['Central Park Views', 'Private Elevator', 'Wine Cellar', 'Butler Service', 'High-Speed WiFi'],
        status: 'Available',
        rating: 4.97,
        reviewCount: 41,
        featured: true
      },
      {
        roomNumber: 'NY-602',
        name: 'Central Park Executive Suite',
        hotelName: 'HotelPro Sky Palace & Towers',
        city: 'New York',
        location: 'Manhattan, New York',
        hotelId: hotelMap['HotelPro Sky Palace & Towers']._id,
        type: 'Executive Suite',
        pricePerNight: 580,
        capacity: 3,
        bedType: 'Californian King',
        sizeSqFt: 920,
        floor: 40,
        image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1200&auto=format&fit=crop',
        description: 'Designed for corporate executives with acoustic soundproofing, marble workstation, Nespresso bar, and VIP Club Lounge access.',
        amenities: ['Skyline View', 'Executive Lounge Access', 'High-Speed WiFi', 'Ergonomic Desk', 'Mini Bar'],
        status: 'Available',
        rating: 4.89,
        reviewCount: 35,
        featured: false
      },
      {
        roomNumber: 'NY-415',
        name: 'Broadway Grand Deluxe King',
        hotelName: 'HotelPro Sky Palace & Towers',
        city: 'New York',
        location: 'Manhattan, New York',
        hotelId: hotelMap['HotelPro Sky Palace & Towers']._id,
        type: 'Deluxe',
        pricePerNight: 340,
        capacity: 2,
        bedType: 'Pillow-top King Bed',
        sizeSqFt: 580,
        floor: 28,
        image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=1200&auto=format&fit=crop',
        description: 'Sophisticated metropolitan aesthetic with floor-to-ceiling windows, oversized soaking tub, and custom curated modern artwork.',
        amenities: ['City View', 'Rain Shower', 'High-Speed WiFi', 'Smart TV 70"'],
        status: 'Available',
        rating: 4.82,
        reviewCount: 29,
        featured: false
      },
      {
        roomNumber: 'NY-208',
        name: 'Fifth Avenue Skyline Studio',
        hotelName: 'HotelPro Sky Palace & Towers',
        city: 'New York',
        location: 'Manhattan, New York',
        hotelId: hotelMap['HotelPro Sky Palace & Towers']._id,
        type: 'Standard Double',
        pricePerNight: 265,
        capacity: 2,
        bedType: 'Plush Queen Bed',
        sizeSqFt: 460,
        floor: 15,
        image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1200&auto=format&fit=crop',
        description: 'Warm and intimate urban retreat moments from Broadway and premier shopping, with luxury organic bath amenities.',
        amenities: ['City View', 'High-Speed WiFi', 'Espresso Machine', 'In-room Safe'],
        status: 'Available',
        rating: 4.76,
        reviewCount: 24,
        featured: false
      },

      // --- Aspen (HotelPro Alpine Snow Lodge) ---
      {
        roomNumber: 'ASP-401',
        name: 'Alpine Peak Royal Ski Chalet',
        hotelName: 'HotelPro Alpine Snow Lodge & Chalet',
        city: 'Aspen',
        location: 'Aspen, Colorado',
        hotelId: hotelMap['HotelPro Alpine Snow Lodge & Chalet']._id,
        type: 'Presidential Villa',
        pricePerNight: 780,
        capacity: 6,
        bedType: '2 King Master Suites + Bunk Room',
        sizeSqFt: 2100,
        floor: 4,
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop',
        description: 'Private 3-story timber chalet with direct ski-in/ski-out access, outdoor cedar hot tub, stone wood-burning hearth, and gourmet chef kitchen.',
        amenities: ['Ski-In/Ski-Out', 'Private Cedar Hot Tub', 'Stone Fireplace', 'Wine Cellar', 'Butler Service'],
        status: 'Available',
        rating: 4.96,
        reviewCount: 33,
        featured: true
      },
      {
        roomNumber: 'ASP-302',
        name: 'Snow Summit Fireplace Suite',
        hotelName: 'HotelPro Alpine Snow Lodge & Chalet',
        city: 'Aspen',
        location: 'Aspen, Colorado',
        hotelId: hotelMap['HotelPro Alpine Snow Lodge & Chalet']._id,
        type: 'Executive Suite',
        pricePerNight: 490,
        capacity: 3,
        bedType: 'Handmade Aspen King Bed',
        sizeSqFt: 880,
        floor: 3,
        image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1200&auto=format&fit=crop',
        description: 'Cozy alpine luxury with authentic stone fireplace, private mountain-facing balcony, heated bathroom floors, and goose down comforters.',
        amenities: ['Mountain View', 'Fireplace', 'Heated Floors', 'Balcony', 'High-Speed WiFi'],
        status: 'Available',
        rating: 4.91,
        reviewCount: 28,
        featured: false
      },
      {
        roomNumber: 'ASP-205',
        name: 'Mountain View Timber Studio',
        hotelName: 'HotelPro Alpine Snow Lodge & Chalet',
        city: 'Aspen',
        location: 'Aspen, Colorado',
        hotelId: hotelMap['HotelPro Alpine Snow Lodge & Chalet']._id,
        type: 'Deluxe',
        pricePerNight: 310,
        capacity: 2,
        bedType: 'King Size Plush',
        sizeSqFt: 540,
        floor: 2,
        image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=1200&auto=format&fit=crop',
        description: 'Warm pine wood finishes, private balcony overlooking the snowy slopes, steam shower, and complimentary hot cider bar.',
        amenities: ['Mountain View', 'Steam Shower', 'High-Speed WiFi', 'Ski Locker Included'],
        status: 'Available',
        rating: 4.84,
        reviewCount: 19,
        featured: false
      },
      {
        roomNumber: 'ASP-108',
        name: 'Evergreen Deluxe Slopeside Room',
        hotelName: 'HotelPro Alpine Snow Lodge & Chalet',
        city: 'Aspen',
        location: 'Aspen, Colorado',
        hotelId: hotelMap['HotelPro Alpine Snow Lodge & Chalet']._id,
        type: 'Standard Double',
        pricePerNight: 240,
        capacity: 2,
        bedType: 'Queen Plush Bed',
        sizeSqFt: 450,
        floor: 1,
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop',
        description: 'Convenient ground-floor access directly to the ski lifts and heated outdoor mineral pool. Features in-room boot warmers.',
        amenities: ['Slope Access', 'Boot Warmers', 'High-Speed WiFi', 'Coffee Bar'],
        status: 'Available',
        rating: 4.78,
        reviewCount: 16,
        featured: false
      },

      // --- Miami Beach (HotelPro Emerald Lagoon) ---
      {
        roomNumber: 'MIA-701',
        name: 'Biscayne Bay Ocean Penthouse',
        hotelName: 'HotelPro Emerald Lagoon & Palms',
        city: 'Miami Beach',
        location: 'Miami Beach, Florida',
        hotelId: hotelMap['HotelPro Emerald Lagoon & Palms']._id,
        type: 'Penthouse',
        pricePerNight: 880,
        capacity: 5,
        bedType: 'Master King + 2 Doubles',
        sizeSqFt: 1950,
        floor: 18,
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop',
        description: 'Sun-drenched penthouse with private rooftop plunge pool, sunset cocktail lounge, and panoramic views of Biscayne Bay and South Beach.',
        amenities: ['Ocean View', 'Rooftop Pool', 'Cabana Included', 'Butler Service', 'High-Speed WiFi'],
        status: 'Available',
        rating: 4.94,
        reviewCount: 37,
        featured: true
      },
      {
        roomNumber: 'MIA-502',
        name: 'South Beach Cabana Villa Suite',
        hotelName: 'HotelPro Emerald Lagoon & Palms',
        city: 'Miami Beach',
        location: 'Miami Beach, Florida',
        hotelId: hotelMap['HotelPro Emerald Lagoon & Palms']._id,
        type: 'Ocean Villa',
        pricePerNight: 460,
        capacity: 4,
        bedType: 'King Bed + Daybed',
        sizeSqFt: 890,
        floor: 5,
        image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=1200&auto=format&fit=crop',
        description: 'Vibrant coastal retreat with private veranda overlooking the saltwater lagoon pool, private sunbeds, and outdoor rain shower.',
        amenities: ['Lagoon View', 'Outdoor Shower', 'Sun Deck', 'Cocktail Bar', 'High-Speed WiFi'],
        status: 'Available',
        rating: 4.88,
        reviewCount: 31,
        featured: false
      },
      {
        roomNumber: 'MIA-312',
        name: 'Palms Tropical Lagoon Deluxe',
        hotelName: 'HotelPro Emerald Lagoon & Palms',
        city: 'Miami Beach',
        location: 'Miami Beach, Florida',
        hotelId: hotelMap['HotelPro Emerald Lagoon & Palms']._id,
        type: 'Deluxe',
        pricePerNight: 320,
        capacity: 2,
        bedType: 'Californian King',
        sizeSqFt: 590,
        floor: 3,
        image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1200&auto=format&fit=crop',
        description: 'Bright Art Deco inspired aesthetics with lush palm terrace, spa soaking tub, and quick elevator access to the beach boardwalk.',
        amenities: ['Palm Garden View', 'Soaking Tub', 'High-Speed WiFi', 'Beach Towels Included'],
        status: 'Available',
        rating: 4.81,
        reviewCount: 25,
        featured: false
      },
      {
        roomNumber: 'MIA-104',
        name: 'Ocean Boardwalk Beach Studio',
        hotelName: 'HotelPro Emerald Lagoon & Palms',
        city: 'Miami Beach',
        location: 'Miami Beach, Florida',
        hotelId: hotelMap['HotelPro Emerald Lagoon & Palms']._id,
        type: 'Standard Double',
        pricePerNight: 220,
        capacity: 2,
        bedType: 'Queen Plush Bed',
        sizeSqFt: 440,
        floor: 1,
        image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1200&auto=format&fit=crop',
        description: 'Step right out onto the golden sands. Perfect for sun seekers looking for modern comfort, high-speed WiFi, and beachfront convenience.',
        amenities: ['Beachfront Access', 'High-Speed WiFi', 'Nespresso Coffee', 'Mini Fridge'],
        status: 'Available',
        rating: 4.75,
        reviewCount: 20,
        featured: false
      },

      // --- Dubai (HotelPro Marina Mirage Bay) ---
      {
        roomNumber: 'DXB-901',
        name: 'Burj Skyline Imperial Villa',
        hotelName: 'HotelPro Marina Mirage Bay',
        city: 'Dubai',
        location: 'Dubai Marina, UAE',
        hotelId: hotelMap['HotelPro Marina Mirage Bay']._id,
        type: 'Presidential Villa',
        pricePerNight: 1250,
        capacity: 6,
        bedType: 'Palatial Royal King + 2 Queen Suites',
        sizeSqFt: 3200,
        floor: 45,
        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop',
        description: 'The height of Middle Eastern opulence. 45th-floor villa with private gold-mosaic infinity pool, dedicated 24-hr butler, private elevator, and chauffeur.',
        amenities: ['Arabian Gulf View', 'Private Infinity Pool', 'Rolls-Royce Transfer', '24/7 Butler', 'Gold-leaf Spa'],
        status: 'Available',
        rating: 4.99,
        reviewCount: 52,
        featured: true
      },
      {
        roomNumber: 'DXB-704',
        name: 'Arabian Gulf Royal Oasis Suite',
        hotelName: 'HotelPro Marina Mirage Bay',
        city: 'Dubai',
        location: 'Dubai Marina, UAE',
        hotelId: hotelMap['HotelPro Marina Mirage Bay']._id,
        type: 'Ocean Villa',
        pricePerNight: 640,
        capacity: 4,
        bedType: 'Royal Californian King',
        sizeSqFt: 1250,
        floor: 32,
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop',
        description: 'Direct sea views with private marble balcony, jacuzzi overlooking the sunset, walk-in dressing wardrobe, and Hermes amenities.',
        amenities: ['Sea View', 'Jacuzzi', 'Hermes Amenities', 'Private Balcony', 'High-Speed WiFi'],
        status: 'Available',
        rating: 4.93,
        reviewCount: 39,
        featured: false
      },
      {
        roomNumber: 'DXB-510',
        name: 'Palm Jumeirah Executive Deluxe',
        hotelName: 'HotelPro Marina Mirage Bay',
        city: 'Dubai',
        location: 'Dubai Marina, UAE',
        hotelId: hotelMap['HotelPro Marina Mirage Bay']._id,
        type: 'Executive Suite',
        pricePerNight: 410,
        capacity: 3,
        bedType: 'Super King Bed',
        sizeSqFt: 780,
        floor: 20,
        image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1200&auto=format&fit=crop',
        description: 'Refined marble sanctuary overlooking the Palm islands. Includes evening cocktail reception and private beach club access.',
        amenities: ['Palm Island View', 'Beach Club Access', 'High-Speed WiFi', 'Marble Bath'],
        status: 'Available',
        rating: 4.87,
        reviewCount: 26,
        featured: false
      },
      {
        roomNumber: 'DXB-306',
        name: 'Royal Falcon Club Room',
        hotelName: 'HotelPro Marina Mirage Bay',
        city: 'Dubai',
        location: 'Dubai Marina, UAE',
        hotelId: hotelMap['HotelPro Marina Mirage Bay']._id,
        type: 'Deluxe',
        pricePerNight: 290,
        capacity: 2,
        bedType: 'King Size Bed',
        sizeSqFt: 560,
        floor: 12,
        image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=1200&auto=format&fit=crop',
        description: 'High-tech smart residence with automated ambient lighting, rainforest shower, private balcony, and 24-hr room service.',
        amenities: ['Marina View', 'Smart Lighting', 'Rainforest Shower', 'High-Speed WiFi'],
        status: 'Available',
        rating: 4.83,
        reviewCount: 21,
        featured: false
      },

      // --- London (HotelPro Royal Regency) ---
      {
        roomNumber: 'LDN-501',
        name: 'Mayfair Regal Diplomatic Suite',
        hotelName: 'HotelPro Royal Regency Heritage',
        city: 'London',
        location: 'Mayfair, London',
        hotelId: hotelMap['HotelPro Royal Regency Heritage']._id,
        type: 'Penthouse',
        pricePerNight: 950,
        capacity: 4,
        bedType: 'Four-Poster Royal King Bed',
        sizeSqFt: 1750,
        floor: 6,
        image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1200&auto=format&fit=crop',
        description: 'Stately Mayfair residence overlooking Hyde Park with antique fireplace, private library, formal dining room, and 24-hour British butler service.',
        amenities: ['Hyde Park View', 'Private Library', 'Butler Service', 'Bentley Transfer', 'High Tea Included'],
        status: 'Available',
        rating: 4.97,
        reviewCount: 44,
        featured: true
      },
      {
        roomNumber: 'LDN-402',
        name: 'Westminster Heritage Penthouse',
        hotelName: 'HotelPro Royal Regency Heritage',
        city: 'London',
        location: 'Mayfair, London',
        hotelId: hotelMap['HotelPro Royal Regency Heritage']._id,
        type: 'Heritage Suite',
        pricePerNight: 620,
        capacity: 3,
        bedType: 'Royal Velvet King Bed',
        sizeSqFt: 980,
        floor: 5,
        image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1200&auto=format&fit=crop',
        description: 'Classic English heritage styling with mahogany furnishings, clawfoot soaking tub, curated art, and afternoon tea delivered to your suite.',
        amenities: ['City View', 'Clawfoot Tub', 'Afternoon Tea', 'High-Speed WiFi', 'Espresso Bar'],
        status: 'Available',
        rating: 4.91,
        reviewCount: 32,
        featured: false
      },
      {
        roomNumber: 'LDN-305',
        name: 'Kensington Garden View King',
        hotelName: 'HotelPro Royal Regency Heritage',
        city: 'London',
        location: 'Mayfair, London',
        hotelId: hotelMap['HotelPro Royal Regency Heritage']._id,
        type: 'Deluxe',
        pricePerNight: 380,
        capacity: 2,
        bedType: 'King Size Plush Bed',
        sizeSqFt: 620,
        floor: 3,
        image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=1200&auto=format&fit=crop',
        description: 'Peaceful garden sanctuary overlooking the hotel courtyard rose gardens, marble bath, and bespoke turn-down service with English truffles.',
        amenities: ['Garden View', 'Marble Bathroom', 'High-Speed WiFi', 'Evening Turndown'],
        status: 'Available',
        rating: 4.86,
        reviewCount: 27,
        featured: false
      },
      {
        roomNumber: 'LDN-102',
        name: 'Piccadilly Boutique Luxury Room',
        hotelName: 'HotelPro Royal Regency Heritage',
        city: 'London',
        location: 'Mayfair, London',
        hotelId: hotelMap['HotelPro Royal Regency Heritage']._id,
        type: 'Standard Double',
        pricePerNight: 275,
        capacity: 2,
        bedType: 'Queen Plush Bed',
        sizeSqFt: 480,
        floor: 1,
        image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1200&auto=format&fit=crop',
        description: 'Impeccable central London location in Mayfair, perfect for West End theater visits, with acoustic noise dampening and luxury bedding.',
        amenities: ['Central Mayfair', 'Soundproof Glass', 'High-Speed WiFi', 'Nespresso Coffee'],
        status: 'Available',
        rating: 4.80,
        reviewCount: 22,
        featured: false
      }
    ];

    for (const r of allRooms) {
      await Room.findOneAndUpdate({ roomNumber: r.roomNumber }, r, { upsert: true, returnDocument: 'after' });
    }

    // 4. Seed Admin Log
    await AdminLog.create({
      action: 'Multi-Hotel Portfolio Expansion',
      performedBy: 'System Core',
      details: 'Expanded catalog to 6 international hotel destinations and 24 bespoke luxury residences.'
    });

    console.log(`✅ Multi-hotel seed complete: 6 Hotels & 24 Rooms successfully populated!`);
  } catch (err) {
    console.error('❌ Error during seeding:', err);
  }
};

module.exports = seedDatabase;
