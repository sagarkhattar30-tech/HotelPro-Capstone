/**
 * Heritage Suites catalog mapped directly to the 6 existing Indian Hotel records in MongoDB.
 * Uses exact existing hotel IDs and data without modifying or creating fake hotel records.
 * Provides rich 5-image collections per suite (Bedroom, Architectural View, Exterior/Courtyard, Luxury Bath, Living Salon).
 */

const HERITAGE_SUITES = [
  // =========================================================================
  // 1. The Amer Fort Haveli (Jaipur) - MongoDB _id: 6ad9e677ecabd32c0dc0cc9f
  // =========================================================================
  {
    _id: '6ad9e677ecabd32c0dc0e101',
    roomNumber: 'AMR-101',
    name: 'Pink City Deluxe Heritage Chamber',
    hotelId: '6ad9e677ecabd32c0dc0cc9f',
    hotelName: 'The Amer Fort Haveli',
    city: 'Jaipur',
    location: 'Amber Fort Road, Devisinghpura, Jaipur, Rajasthan',
    type: 'Deluxe',
    pricePerNight: 240,
    capacity: 2,
    bedType: 'Heritage Carved Teak King',
    sizeSqFt: 620,
    floor: 1,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop', // Bedroom
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1200&auto=format&fit=crop', // Haveli Courtyard
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1200&auto=format&fit=crop', // Ornate Jali Sitting Room
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop', // Marble Bath
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop'  // Amber Ramparts View
    ],
    description: 'Authentic Rajasthani courtyard chamber with handcrafted jali stonework, antique brass lanterns, and tranquil garden courtyard views.',
    amenities: ['Courtyard View', 'Handcrafted Jali Screen', 'Ayurvedic Bath Amenities', 'High-Speed WiFi', '24/7 Butler Service'],
    isAvailable: true,
    status: 'Available',
    rating: 4.88,
    reviewCount: 29,
    featured: false
  },
  {
    _id: '6ad9e677ecabd32c0dc0e102',
    roomNumber: 'AMR-201',
    name: 'Royal Sheesh Mahal Heritage Courtyard Suite',
    hotelId: '6ad9e677ecabd32c0dc0cc9f',
    hotelName: 'The Amer Fort Haveli',
    city: 'Jaipur',
    location: 'Amber Fort Road, Devisinghpura, Jaipur, Rajasthan',
    type: 'Heritage Suite',
    pricePerNight: 460,
    capacity: 4,
    bedType: 'Regal Rajputana Four-Poster King',
    sizeSqFt: 1100,
    floor: 2,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1200&auto=format&fit=crop', // Royal Bedroom & Mirrors
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1200&auto=format&fit=crop', // Palace Courtyard
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop', // Private Jharokha Balcony
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop', // Sunken Marble Tub
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1200&auto=format&fit=crop'  // Sheesh Mahal Salon
    ],
    description: 'Inspired by the historic Hall of Mirrors, featuring hand-cut Thikri glass mosaics, private jharokha balcony, and optional royal safari excursions to Ranthambore tiger sanctuary.',
    amenities: ['Amber Fort View', 'Thikri Mirror Mosaic', 'Private Jharokha Balcony', 'Sitar Recitals', 'Deep Soaking Tub', 'Dedicated Butler'],
    isAvailable: true,
    status: 'Available',
    rating: 4.96,
    reviewCount: 42,
    featured: true
  },
  {
    _id: '6ad9e677ecabd32c0dc0e103',
    roomNumber: 'AMR-301',
    name: 'Maharaja Haveli Rooftop Penthouse',
    hotelId: '6ad9e677ecabd32c0dc0cc9f',
    hotelName: 'The Amer Fort Haveli',
    city: 'Jaipur',
    location: 'Amber Fort Road, Devisinghpura, Jaipur, Rajasthan',
    type: 'Penthouse',
    pricePerNight: 680,
    capacity: 4,
    bedType: 'Imperial Embroidered Silk King + Daybed',
    sizeSqFt: 1750,
    floor: 3,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop', // Rooftop Penthouse Suite
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1200&auto=format&fit=crop', // Illuminated Ramparts View
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop', // Silk Canopy Master Bed
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop', // Open-Air Marble Bath
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1200&auto=format&fit=crop'  // Royal Dining Pavilion
    ],
    description: 'Expansive private rooftop terrace with heated plunge pool overlooking the rugged Aravalli hills and the illuminated ramparts of Amer Fort.',
    amenities: ['Panoramic Amer Fort View', 'Private Plunge Pool', 'Rooftop Stargazing Telescope', 'Royal Dining Pavilion', 'Vintage Car Chauffeur'],
    isAvailable: true,
    status: 'Available',
    rating: 4.98,
    reviewCount: 36,
    featured: true
  },
  {
    _id: '6ad9e677ecabd32c0dc0e104',
    roomNumber: 'AMR-401',
    name: 'Imperial Amber Palace Presidential Villa',
    hotelId: '6ad9e677ecabd32c0dc0cc9f',
    hotelName: 'The Amer Fort Haveli',
    city: 'Jaipur',
    location: 'Amber Fort Road, Devisinghpura, Jaipur, Rajasthan',
    type: 'Presidential Villa',
    pricePerNight: 950,
    capacity: 6,
    bedType: 'Master King + Two Rajputana Double Suites',
    sizeSqFt: 2800,
    floor: 2,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1200&auto=format&fit=crop', // Grand Palatial Salon
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1200&auto=format&fit=crop', // Private Courtyard & Lotus Fountain
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1200&auto=format&fit=crop', // Rajputana Master Chamber
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop', // Imperial Marble Jacuzzi
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop'  // Secondary Guest Chamber
    ],
    description: 'The pinnacle of Jaipur royalty. Two-story palatial suite with private courtyard, lotus fountain, dedicated master butler, and private dining pavilion.',
    amenities: ['Private Courtyard & Fountain', 'Dedicated 24/7 Butler', 'Private Chef Dining', 'Marble Jacuzzi', 'Royal Enfield Escort'],
    isAvailable: true,
    status: 'Available',
    rating: 5.0,
    reviewCount: 51,
    featured: true
  },

  // =========================================================================
  // 2. The Mewar Lake Palace (Udaipur) - MongoDB _id: 6ad9e677ecabd32c0dc0cc9e
  // =========================================================================
  {
    _id: '6ad9e677ecabd32c0dc0e201',
    roomNumber: 'MEW-101',
    name: 'Makrana Marble Deluxe Heritage Chamber',
    hotelId: '6ad9e677ecabd32c0dc0cc9e',
    hotelName: 'The Mewar Lake Palace',
    city: 'Udaipur',
    location: 'Pichola Island, Lake Pichola, City Palace Complex, Udaipur, Rajasthan',
    type: 'Deluxe',
    pricePerNight: 290,
    capacity: 2,
    bedType: 'Royal White Marble Platform King',
    sizeSqFt: 650,
    floor: 1,
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1200&auto=format&fit=crop', // White Marble Chamber
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop', // Lake Pichola Palace Exterior
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=1200&auto=format&fit=crop', // Pichola Water Balcony
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=1200&auto=format&fit=crop', // Makrana Marble Soaking Tub
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop'  // Lotus Courtyard Lounge
    ],
    description: 'Sculpted in pure white Makrana marble with lotus fountain accents and tranquil garden courtyard views overlooking Lake Pichola waters.',
    amenities: ['Lake Pichola Glimpse', 'Makrana Marble Bath', 'Ayurvedic Oil Therapies', 'High-Speed WiFi', 'Classical Flute Mornings'],
    isAvailable: true,
    status: 'Available',
    rating: 4.89,
    reviewCount: 31,
    featured: false
  },
  {
    _id: '6ad9e677ecabd32c0dc0e202',
    roomNumber: 'MEW-201',
    name: 'Royal Heritage Lake Pichola Courtyard Suite',
    hotelId: '6ad9e677ecabd32c0dc0cc9e',
    hotelName: 'The Mewar Lake Palace',
    city: 'Udaipur',
    location: 'Pichola Island, Lake Pichola, City Palace Complex, Udaipur, Rajasthan',
    type: 'Heritage Suite',
    pricePerNight: 520,
    capacity: 4,
    bedType: 'Mewar Royal Canopied King',
    sizeSqFt: 1250,
    floor: 2,
    image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=1200&auto=format&fit=crop', // Royal Canopied Suite & Lake View
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop', // City Palace & Island Panorama
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1200&auto=format&fit=crop', // Mewari Antique Sitting Nook
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=1200&auto=format&fit=crop', // Handcarved Marble Bath
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1200&auto=format&fit=crop'  // Royal Jharokha Dining Salon
    ],
    description: 'Unobstructed panorama across Lake Pichola towards Jag Mandir. Features antique Mewari miniature paintings and private jharokha dining.',
    amenities: ['Direct Lake Pichola View', 'Private Shikara Boat Arrival', 'Jharokha Dining', 'Lotus Courtyard Access', 'Heritage Butler'],
    isAvailable: true,
    status: 'Available',
    rating: 4.97,
    reviewCount: 48,
    featured: true
  },
  {
    _id: '6ad9e677ecabd32c0dc0e203',
    roomNumber: 'MEW-301',
    name: 'Maharana Jag Niwas Penthouse',
    hotelId: '6ad9e677ecabd32c0dc0cc9e',
    hotelName: 'The Mewar Lake Palace',
    city: 'Udaipur',
    location: 'Pichola Island, Lake Pichola, City Palace Complex, Udaipur, Rajasthan',
    type: 'Penthouse',
    pricePerNight: 780,
    capacity: 4,
    bedType: 'Master King + Pichola Sun Lounge Daybed',
    sizeSqFt: 1900,
    floor: 3,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop', // Rooftop Water-Palace Penthouse
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop', // 360-Degree Lake Pichola Horizon
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=1200&auto=format&fit=crop', // Suspended Jacuzzi Deck
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=1200&auto=format&fit=crop', // Gold Leaf Marble Bath
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1200&auto=format&fit=crop'  // Royal Durbar Salon
    ],
    description: 'Rooftop water-palace residence with 360-degree views of Udaipur lakes and the Aravalli skyline. Private heated jacuzzi suspended over shimmering water.',
    amenities: ['Suspended Lake Jacuzzi', 'Private Sunrise Shikara', 'Gold Leaf Ceiling', 'Royal Durbar Bar', '24/7 Personal Butler'],
    isAvailable: true,
    status: 'Available',
    rating: 4.99,
    reviewCount: 39,
    featured: true
  },
  {
    _id: '6ad9e677ecabd32c0dc0e204',
    roomNumber: 'MEW-401',
    name: 'Presidential Palace Water Sanctuary Villa',
    hotelId: '6ad9e677ecabd32c0dc0cc9e',
    hotelName: 'The Mewar Lake Palace',
    city: 'Udaipur',
    location: 'Pichola Island, Lake Pichola, City Palace Complex, Udaipur, Rajasthan',
    type: 'Presidential Villa',
    pricePerNight: 1100,
    capacity: 6,
    bedType: 'Emperor Royal King + Two Queen Suites',
    sizeSqFt: 3100,
    floor: 2,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop', // Floating Palace Presidential Wing
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=1200&auto=format&fit=crop', // Grand Canopied Emperor Suite
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1200&auto=format&fit=crop', // 24-Karat Gold Living Pavilion
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=1200&auto=format&fit=crop', // Floating Lotus Marble Bath
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1200&auto=format&fit=crop'  // Private Banquet Terrace
    ],
    description: 'The premier floating palace suite of Udaipur. Living pavilions adorned with 24-karat gold leaf, crystal chandeliers, and private terrace banquet deck.',
    amenities: ['Private Royal Boat & Captain', '24-Karat Gold Decor', 'Private Chef & Sommelier', 'Floating Lotus Plunge Pool', 'Personal Concierge'],
    isAvailable: true,
    status: 'Available',
    rating: 5.0,
    reviewCount: 64,
    featured: true
  },

  // =========================================================================
  // 3. The Cabo Serai Cliffs (Goa) - MongoDB _id: 6ad9e677ecabd32c0dc0cca1
  // =========================================================================
  {
    _id: '6ad9e677ecabd32c0dc0e301',
    roomNumber: 'CBS-101',
    name: 'Portuguese Heritage Cliff Chamber',
    hotelId: '6ad9e677ecabd32c0dc0cca1',
    hotelName: 'The Cabo Serai Cliffs',
    city: 'Cabo de Rama',
    location: 'Cabo de Rama Promontory, Canacona, South Goa',
    type: 'Heritage Suite',
    pricePerNight: 310,
    capacity: 2,
    bedType: 'Handcrafted Goan Teak King',
    sizeSqFt: 780,
    floor: 1,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200&auto=format&fit=crop', // Goan Teak Bedroom & Canopy
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200&auto=format&fit=crop', // Dramatic Cabo Cliff Coastline
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop', // Sub-tropical Foliage Verandah
      'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=1200&auto=format&fit=crop', // Open-Air Stone Rain Shower
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop'  // Coconut Grove Garden Path
    ],
    description: 'Nestled in sub-tropical foliage on the dramatic cliffs of South Goa. Features Portuguese azulejo tiles and open-to-sky garden rain shower.',
    amenities: ['Cliff Garden View', 'Azulejo Tiled Bath', 'Open-to-Sky Rain Shower', 'Private Golden Beach Path', 'Organic Tea Service'],
    isAvailable: true,
    status: 'Available',
    rating: 4.87,
    reviewCount: 24,
    featured: false
  },
  {
    _id: '6ad9e677ecabd32c0dc0e302',
    roomNumber: 'CBS-201',
    name: 'Lagoon & Oceanfront Cliffside Villa',
    hotelId: '6ad9e677ecabd32c0dc0cca1',
    hotelName: 'The Cabo Serai Cliffs',
    city: 'Cabo de Rama',
    location: 'Cabo de Rama Promontory, Canacona, South Goa',
    type: 'Ocean Villa',
    pricePerNight: 490,
    capacity: 4,
    bedType: 'Ocean Breeze King + Daybed',
    sizeSqFt: 1350,
    floor: 2,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop', // Oceanfront Cliffside Villa Deck
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200&auto=format&fit=crop', // Crashing Waves & Beach Path
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200&auto=format&fit=crop', // Coastal King Chamber
      'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=1200&auto=format&fit=crop', // Tropical Stone Bath
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop'  // Sunset Hammock Verandah
    ],
    description: 'Perched over crashing Arabian Sea waves with expansive timber sun deck, private hammock pavilion, and dolphin spotting views.',
    amenities: ['Arabian Sea Panorama', 'Private Timber Sundeck', 'Dolphin Spotting Veranda', 'Ayurvedic Herbal Spa', 'Farm-to-Table Dining'],
    isAvailable: true,
    status: 'Available',
    rating: 4.95,
    reviewCount: 38,
    featured: true
  },
  {
    _id: '6ad9e677ecabd32c0dc0e303',
    roomNumber: 'CBS-301',
    name: 'Konkan Horizon Penthouse Suite',
    hotelId: '6ad9e677ecabd32c0dc0cca1',
    hotelName: 'The Cabo Serai Cliffs',
    city: 'Cabo de Rama',
    location: 'Cabo de Rama Promontory, Canacona, South Goa',
    type: 'Penthouse',
    pricePerNight: 640,
    capacity: 4,
    bedType: 'Master Teak King + Ocean Sunbed',
    sizeSqFt: 1800,
    floor: 3,
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop', // Konkan Horizon Upper Deck
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200&auto=format&fit=crop', // 270° Ocean Sunset Panorama
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop', // Master Teak King Bed
      'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=1200&auto=format&fit=crop', // Cliffside Whirlpool Tub
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop'  // Open-Air Yoga Pavilion
    ],
    description: 'Upper-deck luxury aerie offering unbroken 270-degree sunset ocean horizons, private open-air yoga deck, and infinity whirlpool bath.',
    amenities: ['270° Ocean Sunset View', 'Cliffside Infinity Whirlpool', 'Private Yoga Pavilion', 'Curated Seafood Dining', 'Personal Host'],
    isAvailable: true,
    status: 'Available',
    rating: 4.98,
    reviewCount: 33,
    featured: true
  },
  {
    _id: '6ad9e677ecabd32c0dc0e304',
    roomNumber: 'CBS-401',
    name: 'Presidential Ocean Cliff Villa',
    hotelId: '6ad9e677ecabd32c0dc0cca1',
    hotelName: 'The Cabo Serai Cliffs',
    city: 'Cabo de Rama',
    location: 'Cabo de Rama Promontory, Canacona, South Goa',
    type: 'Presidential Villa',
    pricePerNight: 890,
    capacity: 6,
    bedType: 'Two Coastal King Suites + Studio Lounge',
    sizeSqFt: 2600,
    floor: 2,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop', // Presidential Ocean Estate
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200&auto=format&fit=crop', // Private Virgin Sands Trail
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop', // Coastal King Master Suite
      'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=1200&auto=format&fit=crop', // Cliff-Edge Plunge Pool
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop'  // Private Dining Verandah
    ],
    description: 'Secluded multi-pavilion ocean villa spanning 14 acres of private cliff estate with direct trail access to secluded virgin sands.',
    amenities: ['Private Beach Trail Access', 'Cliff-Edge Plunge Pool', 'Dedicated Villa Butler', 'Private Barbecue Terrace', 'Yacht Charters'],
    isAvailable: true,
    status: 'Available',
    rating: 5.0,
    reviewCount: 45,
    featured: true
  },

  // =========================================================================
  // 4. The Wildflower Himalayan Ridge (Shimla) - MongoDB _id: 6ad9e677ecabd32c0dc0cca0
  // =========================================================================
  {
    _id: '6ad9e677ecabd32c0dc0e401',
    roomNumber: 'WLD-101',
    name: 'Colonial Cedar Deluxe Heritage Chamber',
    hotelId: '6ad9e677ecabd32c0dc0cca0',
    hotelName: 'The Wildflower Himalayan Ridge',
    city: 'Shimla',
    location: 'Charabra, Kufri Ridge, Mashobra Hills, Shimla, Himachal Pradesh',
    type: 'Deluxe',
    pricePerNight: 260,
    capacity: 2,
    bedType: 'Burma Teak Heritage King',
    sizeSqFt: 580,
    floor: 1,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop', // Colonial Cedar Bedroom
      'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=1200&auto=format&fit=crop', // Mashobra Ridge Snow Peaks
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop', // Cedar Forest View Balcony
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop', // Heated Bathroom Floor & Bath
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1200&auto=format&fit=crop'  // Working Brass Fireplace Salon
    ],
    description: 'Colonial mountain chamber with fragrant cedarwood panelling, working Victorian brass fireplace, and views of mist-covered pine valleys.',
    amenities: ['Cedar Pine Forest View', 'Working Brass Fireplace', 'Teak Wood Floors', 'Heated Bathroom Floors', 'Herbal Tea Station'],
    isAvailable: true,
    status: 'Available',
    rating: 4.86,
    reviewCount: 27,
    featured: false
  },
  {
    _id: '6ad9e677ecabd32c0dc0e402',
    roomNumber: 'WLD-201',
    name: 'Executive Diplomatic Himalayan Suite',
    hotelId: '6ad9e677ecabd32c0dc0cca0',
    hotelName: 'The Wildflower Himalayan Ridge',
    city: 'Shimla',
    location: 'Charabra, Kufri Ridge, Mashobra Hills, Shimla, Himachal Pradesh',
    type: 'Executive Suite',
    pricePerNight: 420,
    capacity: 4,
    bedType: 'Grand Alpine King + Leather Study',
    sizeSqFt: 1150,
    floor: 2,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop', // Diplomatic Himalayan Suite
      'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=1200&auto=format&fit=crop', // Panoramic Mountain Balcony
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop', // Grand Alpine Master Bedroom
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop', // Deep Victorian Clawfoot Tub
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1200&auto=format&fit=crop'  // Teakwood Study & Library
    ],
    description: 'Former colonial governor suite featuring rich Burma teak libraries, mahogany writing desk, and panoramic balconies facing snow-capped Himalayan ranges.',
    amenities: ['Snow Peak Panorama', 'Mahogany Study & Library', 'Private Log Fire', 'Single Malt Bar', 'Resident Botanist Nature Walks'],
    isAvailable: true,
    status: 'Available',
    rating: 4.94,
    reviewCount: 37,
    featured: true
  },
  {
    _id: '6ad9e677ecabd32c0dc0e403',
    roomNumber: 'WLD-301',
    name: 'Himalayan Snow Crest Penthouse',
    hotelId: '6ad9e677ecabd32c0dc0cca0',
    hotelName: 'The Wildflower Himalayan Ridge',
    city: 'Shimla',
    location: 'Charabra, Kufri Ridge, Mashobra Hills, Shimla, Himachal Pradesh',
    type: 'Penthouse',
    pricePerNight: 610,
    capacity: 4,
    bedType: 'Master Pine King + Alpine Sunroom',
    sizeSqFt: 1850,
    floor: 3,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&auto=format&fit=crop', // Snow Crest Penthouse Solarium
      'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=1200&auto=format&fit=crop', // Eternal Himalayan Vista
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop', // Pine Timber Master Bed
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop', // Heated Cedar Hot Tub
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1200&auto=format&fit=crop'  // Glass Fireplace Living Room
    ],
    description: 'Situated at 8,250 feet above sea level with glass-enclosed heated alpine solarium, outdoor heated cedar hot tub, and sweeping views of eternal Himalayan snow peaks.',
    amenities: ['Heated Cedar Hot Tub', 'Glass Alpine Solarium', 'Double Fireplace', 'Stargazing Telescope', 'Personal Mountain Butler'],
    isAvailable: true,
    status: 'Available',
    rating: 4.98,
    reviewCount: 41,
    featured: true
  },
  {
    _id: '6ad9e677ecabd32c0dc0e404',
    roomNumber: 'WLD-401',
    name: 'Lord Kitchener Presidential Mountain Villa',
    hotelId: '6ad9e677ecabd32c0dc0cca0',
    hotelName: 'The Wildflower Himalayan Ridge',
    city: 'Shimla',
    location: 'Charabra, Kufri Ridge, Mashobra Hills, Shimla, Himachal Pradesh',
    type: 'Presidential Villa',
    pricePerNight: 880,
    capacity: 6,
    bedType: 'Lord Kitchener Master Suite + Two Alpine King Chambers',
    sizeSqFt: 2900,
    floor: 2,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop', // Manor Estate Mountain Villa
      'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=1200&auto=format&fit=crop', // Private Cedar Garden & Hills
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop', // Kitchener Master Suite
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop', // Heated Mountain Infinity Tub
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1200&auto=format&fit=crop'  // Billiard & Drawing Room
    ],
    description: 'Historic manor estate once home to the Commander-in-Chief. Stone fireplaces, private cedar garden, billiard room, and heated outdoor infinity whirlpool.',
    amenities: ['Heated Mountain Infinity Tub', 'Private Billiard Room', 'Private Cedar Garden', 'Bespoke Himalayan Trek Guide', '24/7 Butler Service'],
    isAvailable: true,
    status: 'Available',
    rating: 5.0,
    reviewCount: 53,
    featured: true
  },

  // =========================================================================
  // 5. The Munnar Tea Mist Sanctuary (Munnar / Kerala) - MongoDB _id: 6ad9e677ecabd32c0dc0cca2
  // =========================================================================
  {
    _id: '6ad9e677ecabd32c0dc0e501',
    roomNumber: 'MNR-101',
    name: "Scottish Planter's Deluxe Heritage Chamber",
    hotelId: '6ad9e677ecabd32c0dc0cca2',
    hotelName: 'The Munnar Tea Mist Sanctuary',
    city: 'Munnar',
    location: 'Anaviratty Valley, High Range Estates, Idukki, Munnar, Kerala',
    type: 'Deluxe',
    pricePerNight: 250,
    capacity: 2,
    bedType: 'Antique Rosewood King',
    sizeSqFt: 600,
    floor: 1,
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop', // Planter Bungalow Bedroom
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1200&auto=format&fit=crop', // Rolling Emerald Tea Mist Slopes
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop', // Polished Rosewood Chamber
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=1200&auto=format&fit=crop', // Ayurvedic Stone Spa Bath
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1200&auto=format&fit=crop'  // Tea Verandah Over Valley
    ],
    description: 'Circa 1910 Scottish planter bungalow chamber with polished rosewood furniture, private verandah opening to rolling emerald tea slopes, and morning mist breezes.',
    amenities: ['Tea Plantation Verandah', 'Rosewood Furniture', 'Fresh Garden Teas', 'Ayurvedic Abhyanga Oils', 'High-Speed WiFi'],
    isAvailable: true,
    status: 'Available',
    rating: 4.88,
    reviewCount: 26,
    featured: false
  },
  {
    _id: '6ad9e677ecabd32c0dc0e502',
    roomNumber: 'MNR-201',
    name: 'Executive Diplomatic Tea Estate Suite',
    hotelId: '6ad9e677ecabd32c0dc0cca2',
    hotelName: 'The Munnar Tea Mist Sanctuary',
    city: 'Munnar',
    location: 'Anaviratty Valley, High Range Estates, Idukki, Munnar, Kerala',
    type: 'Executive Suite',
    pricePerNight: 390,
    capacity: 4,
    bedType: 'High Range Four-Poster King',
    sizeSqFt: 1100,
    floor: 2,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop', // Four-Poster King Planter Suite
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1200&auto=format&fit=crop', // Western Ghats UNESCO Biosphere
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1200&auto=format&fit=crop', // Cloud Valley Panoramic Deck
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=1200&auto=format&fit=crop', // Spicewood Spa Bath
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop'  // Tea-Tasting Fireplace Salon
    ],
    description: 'Restored colonial planter residence with sweeping views of the Western Ghats UNESCO biosphere. Features private tea-tasting salon and fireplace.',
    amenities: ['Western Ghats Panorama', 'Private Tea-Tasting Salon', 'Colonial Fireplace', 'Waterfall Nature Excursions', 'Estate Butler'],
    isAvailable: true,
    status: 'Available',
    rating: 4.93,
    reviewCount: 35,
    featured: true
  },
  {
    _id: '6ad9e677ecabd32c0dc0e503',
    roomNumber: 'MNR-301',
    name: 'Western Ghats Royal Heritage Courtyard Suite',
    hotelId: '6ad9e677ecabd32c0dc0cca2',
    hotelName: 'The Munnar Tea Mist Sanctuary',
    city: 'Munnar',
    location: 'Anaviratty Valley, High Range Estates, Idukki, Munnar, Kerala',
    type: 'Heritage Suite',
    pricePerNight: 470,
    capacity: 4,
    bedType: 'Kerala Teak Heritage King + Verandah Daybed',
    sizeSqFt: 1400,
    floor: 1,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop', // Courtyard Verandah Suite
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1200&auto=format&fit=crop', // Mist Rising Over Spice Groves
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop', // Kerala Teak King Chamber
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=1200&auto=format&fit=crop', // Open-Sky Terracotta Bath
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1200&auto=format&fit=crop'  // Traditional Wooden Pavilion
    ],
    description: 'Heritage Kerala courtyard sanctuary with open-to-sky courtyard, traditional terracotta floor tiles, and private spice garden trail.',
    amenities: ['Private Spice Garden Trail', 'Open Sky Courtyard', 'Traditional Kerala Sadhya Dining', 'Ayurvedic Treatment Room', 'Evening Tea Bonfires'],
    isAvailable: true,
    status: 'Available',
    rating: 4.96,
    reviewCount: 39,
    featured: true
  },
  {
    _id: '6ad9e677ecabd32c0dc0e504',
    roomNumber: 'MNR-401',
    name: 'Anamudi Mist Presidential Tea Villa',
    hotelId: '6ad9e677ecabd32c0dc0cca2',
    hotelName: 'The Munnar Tea Mist Sanctuary',
    city: 'Munnar',
    location: 'Anaviratty Valley, High Range Estates, Idukki, Munnar, Kerala',
    type: 'Presidential Villa',
    pricePerNight: 820,
    capacity: 6,
    bedType: 'Master Rosewood King + Two Tea Terrace Suites',
    sizeSqFt: 2750,
    floor: 2,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1200&auto=format&fit=crop', // Anamudi Mist Villa Pavilion
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1200&auto=format&fit=crop', // Anamudi Peak & Mist Vistas
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop', // Master Rosewood Bedroom
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=1200&auto=format&fit=crop', // Heated Mountain Stone Pool
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1200&auto=format&fit=crop'  // Tea Terrace Dining Verandah
    ],
    description: 'The premier tea-mist estate sanctuary. Set high upon the ridge with private heated mountain pool, private chef crafting traditional Kerala gourmet, and panoramic views of Anamudi peak.',
    amenities: ['Private Heated Mountain Pool', 'Curated Orthodox Tea Tasting', 'Dedicated Estate Chef & Butler', 'Private Waterfall Walk', 'Ayurvedic Spa Room'],
    isAvailable: true,
    status: 'Available',
    rating: 5.0,
    reviewCount: 47,
    featured: true
  },

  // =========================================================================
  // 6. The Kashi Heritage Ghats (Varanasi) - MongoDB _id: 6ad9e677ecabd32c0dc0cca3
  // =========================================================================
  {
    _id: '6ad9e677ecabd32c0dc0e601',
    roomNumber: 'KSH-101',
    name: 'Sacred Ganges Deluxe Heritage Chamber',
    hotelId: '6ad9e677ecabd32c0dc0cca3',
    hotelName: 'The Kashi Heritage Ghats',
    city: 'Varanasi',
    location: 'Brijrama Palace, Munshi Ghat, Dashashwamedh, Varanasi, Uttar Pradesh',
    type: 'Deluxe',
    pricePerNight: 270,
    capacity: 2,
    bedType: 'Benarasi Silk Canopy King',
    sizeSqFt: 620,
    floor: 1,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop', // Benarasi Silk Chamber
      'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=1200&auto=format&fit=crop', // Munshi Ghat & Holy Ganges
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1200&auto=format&fit=crop', // Carved Sandstone Sitting Area
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop', // Heritage Sandstone Bath
      'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?q=80&w=1200&auto=format&fit=crop'  // Dawn Shehnai Jharokha
    ],
    description: 'Historic 19th-century Darbhanga sandstone palace chamber on Munshi Ghat. Features handwoven Benarasi silks, heritage stone elevator access, and dawn shehnai melodies.',
    amenities: ['Munshi Ghat River Glimpse', 'Heritage Stone Elevator Access', 'Benarasi Brocade Silk Decor', 'Dawn Classical Flute Recital', 'High-Speed WiFi'],
    isAvailable: true,
    status: 'Available',
    rating: 4.89,
    reviewCount: 29,
    featured: false
  },
  {
    _id: '6ad9e677ecabd32c0dc0e602',
    roomNumber: 'KSH-201',
    name: 'Brijrama Royal Heritage Courtyard Suite',
    hotelId: '6ad9e677ecabd32c0dc0cca3',
    hotelName: 'The Kashi Heritage Ghats',
    city: 'Varanasi',
    location: 'Brijrama Palace, Munshi Ghat, Dashashwamedh, Varanasi, Uttar Pradesh',
    type: 'Heritage Suite',
    pricePerNight: 490,
    capacity: 4,
    bedType: 'Carved Sandstone Four-Poster King',
    sizeSqFt: 1200,
    floor: 2,
    image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=1200&auto=format&fit=crop', // Sandstone Four-Poster King Suite
      'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=1200&auto=format&fit=crop', // Crescent Ghats & Aarti Panorama
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1200&auto=format&fit=crop', // Intricate Sandstone Pillars
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop', // Handcarved Marble Soaking Tub
      'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?q=80&w=1200&auto=format&fit=crop'  // Private Aarti Balcony
    ],
    description: 'Overlooking the holy Ganges riverfront. Features intricately carved sandstone pillars, private balcony for evening Ganga Aarti, and dawn wooden bajra boat ride.',
    amenities: ['Front-Row Ganga Aarti Balcony', 'Private Dawn Bajra Boat Ride', 'Intricate Sandstone Jharokhas', 'Satvik Royal Dining', 'Palace Butler'],
    isAvailable: true,
    status: 'Available',
    rating: 4.97,
    reviewCount: 46,
    featured: true
  },
  {
    _id: '6ad9e677ecabd32c0dc0e603',
    roomNumber: 'KSH-301',
    name: 'Munshi Ghat Riverview Penthouse',
    hotelId: '6ad9e677ecabd32c0dc0cca3',
    hotelName: 'The Kashi Heritage Ghats',
    city: 'Varanasi',
    location: 'Brijrama Palace, Munshi Ghat, Dashashwamedh, Varanasi, Uttar Pradesh',
    type: 'Penthouse',
    pricePerNight: 710,
    capacity: 4,
    bedType: 'Imperial Silk King + Riverview Sunbed',
    sizeSqFt: 1800,
    floor: 3,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop', // Riverview Penthouse Rooftop
      'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=1200&auto=format&fit=crop', // 360° Holy Ganges Crescent Vistas
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=1200&auto=format&fit=crop', // Imperial Silk Master Bed
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop', // Handcarved Brass Bath
      'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?q=80&w=1200&auto=format&fit=crop'  // Rooftop Tea Pavilion & Telescope
    ],
    description: 'Upper rooftop sandstone palace aerie with panoramic vistas across the entire crescent of the holy Ganges ghats. Features private brass telescope and rooftop tea pavilion.',
    amenities: ['360° Holy Ganges Panorama', 'Rooftop Tea Pavilion', 'Private Astronomical Telescope', 'Classical Sitar Evenings', '24/7 Personal Valet'],
    isAvailable: true,
    status: 'Available',
    rating: 4.99,
    reviewCount: 38,
    featured: true
  },
  {
    _id: '6ad9e677ecabd32c0dc0e604',
    roomNumber: 'KSH-401',
    name: 'Kashi Darbhanga Palace Presidential Villa',
    hotelId: '6ad9e677ecabd32c0dc0cca3',
    hotelName: 'The Kashi Heritage Ghats',
    city: 'Varanasi',
    location: 'Brijrama Palace, Munshi Ghat, Dashashwamedh, Varanasi, Uttar Pradesh',
    type: 'Presidential Villa',
    pricePerNight: 990,
    capacity: 6,
    bedType: 'Royal Maharana King + Two Riverview Guest Suites',
    sizeSqFt: 3000,
    floor: 2,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop', // Darbhanga Palace Riverfront Estate
      'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=1200&auto=format&fit=crop', // Private Bajra Barge Mooring
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1200&auto=format&fit=crop', // Darbhanga Durbar Living Hall
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop', // Handcarved Marble Lotus Bath
      'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?q=80&w=1200&auto=format&fit=crop'  // Private Sandstone Aarti Terrace
    ],
    description: 'The most prestigious riverfront palace sanctuary in Varanasi. Private sandstone terraces, personal priest for private Vedic blessings, dedicated chef, and private wooden bajra barge.',
    amenities: ['Private River Terrace & Bajra Barge', 'Private Vedic Blessing Ritual', 'Personal Palace Chef', 'Darbhanga Durbar Dining', 'VIP Aarti Seating'],
    isAvailable: true,
    status: 'Available',
    rating: 5.0,
    reviewCount: 57,
    featured: true
  }
];

/**
 * Filter heritage suites according to search/filter criteria.
 * Supports destination/city matching, hotel matching, type, capacity, price, amenity.
 */
function getMatchingHeritageSuites(filters = {}) {
  const { search, hotel, city, type, minPrice, maxPrice, capacity, amenity } = filters;

  return HERITAGE_SUITES.filter(room => {
    // Hotel filter
    if (hotel && hotel !== 'All') {
      const cleanHotel = hotel.replace(/^(HotelPro|Aatithya)\s+/i, '').trim();
      const regex = new RegExp(cleanHotel, 'i');
      const matchesHotel = regex.test(room.hotelName) || regex.test(room.city) || regex.test(room.location);
      if (!matchesHotel) return false;
    }

    // City filter
    if (city && city !== 'All') {
      const regex = new RegExp(city, 'i');
      const matchesCity = regex.test(room.city) || regex.test(room.location);
      if (!matchesCity) return false;
    }

    // Type filter
    if (type && type !== 'All') {
      const singular = type.replace(/s$/i, '');
      const regex = new RegExp(singular, 'i');
      if (!regex.test(room.type)) return false;
    }

    // Search query filter (matches hotel, city, location, room name, description)
    if (search && search.trim()) {
      const s = search.trim();
      const regex = new RegExp(s, 'i');
      const matchesSearch =
        regex.test(room.name) ||
        regex.test(room.hotelName) ||
        regex.test(room.city) ||
        regex.test(room.location) ||
        regex.test(room.description) ||
        regex.test(room.roomNumber);
      if (!matchesSearch) return false;
    }

    // Capacity
    if (capacity && Number(capacity) > 0) {
      if (room.capacity < Number(capacity)) return false;
    }

    // Price
    if (minPrice && room.pricePerNight < Number(minPrice)) return false;
    if (maxPrice && room.pricePerNight > Number(maxPrice)) return false;

    // Amenity
    if (amenity && amenity !== 'All') {
      if (!room.amenities.includes(amenity)) return false;
    }

    return true;
  });
}

function getHeritageSuiteById(id) {
  if (!id) return null;
  const strId = String(id);
  return HERITAGE_SUITES.find(s => String(s._id) === strId || String(s.roomNumber) === strId) || null;
}

const PROPERTY_GALLERIES = {
  // Indian Heritage Residences
  'The Amer Fort Haveli': [
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop'
  ],
  'The Mewar Lake Palace': [
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1200&auto=format&fit=crop'
  ],
  'The Cabo Serai Cliffs': [
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop'
  ],
  'The Wildflower Himalayan Ridge': [
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1200&auto=format&fit=crop'
  ],
  'The Munnar Tea Mist Sanctuary': [
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1200&auto=format&fit=crop'
  ],
  'The Kashi Heritage Ghats': [
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?q=80&w=1200&auto=format&fit=crop'
  ],

  // Luxury Properties
  'The Grand Azure Resort & Spa': [
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1200&auto=format&fit=crop'
  ],
  'HotelPro Sky Palace & Towers': [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1200&auto=format&fit=crop'
  ],
  'HotelPro Alpine Snow Lodge & Chalet': [
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1200&auto=format&fit=crop'
  ],
  'HotelPro Emerald Lagoon & Palms': [
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=1200&auto=format&fit=crop'
  ],
  'HotelPro Marina Mirage Bay': [
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop'
  ],
  'HotelPro Royal Regency Heritage': [
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop'
  ],
  'HotelPro Malibu Cliff Estate': [
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop'
  ],
  'HotelPro South Beach Cove': [
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1200&auto=format&fit=crop'
  ],
  'HotelPro Parisian Élysée Palace': [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1200&auto=format&fit=crop'
  ],
  'HotelPro Santorini Caldera Heights': [
    'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=1200&auto=format&fit=crop'
  ],
  'HotelPro Amalfi Cliffside Haven': [
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=1200&auto=format&fit=crop'
  ],
  'HotelPro Kyoto Imperial Onsen': [
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=1200&auto=format&fit=crop'
  ]
};

function getPropertyImages(hotelName, primaryImage) {
  const pool = PROPERTY_GALLERIES[hotelName] || [];
  if (!primaryImage) return pool.length > 0 ? pool : [];
  const filtered = pool.filter(url => url !== primaryImage);
  const combined = [primaryImage, ...filtered];
  return combined.length > 0 ? combined.slice(0, 5) : [primaryImage];
}

module.exports = {
  HERITAGE_SUITES,
  PROPERTY_GALLERIES,
  getMatchingHeritageSuites,
  getHeritageSuiteById,
  getPropertyImages
};
