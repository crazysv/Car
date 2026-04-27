export type FuelType = "Petrol" | "Diesel";
export type VehicleCategory = "SUV" | "Sedan" | "Hatchback";

export interface Vehicle {
  id: string;
  slug: string;
  name: string;
  year: number;
  variant: string;
  fuelType: FuelType;
  category: VehicleCategory;
  pricePerDay: number;
  image: string;
  featured: boolean;
  description: string;
  highlights: string[];
}

export const fleet: Vehicle[] = [
  {
    id: "thar-roxx-4x4-2025",
    slug: "thar-roxx-4x4-diesel-2025",
    name: "Thar Roxx 4x4",
    year: 2025,
    variant: "Diesel",
    fuelType: "Diesel",
    category: "SUV",
    pricePerDay: 5500,
    image: "/cars/thar-roxx-4x4-diesel-2025.jpg",
    featured: true,
    description:
      "The ultimate off-road machine. The 2025 Thar Roxx 4x4 delivers raw power with refined interiors, perfect for adventurous road trips across Punjab and beyond.",
    highlights: [
      "4x4 drivetrain",
      "Premium interiors",
      "Strong road presence",
      "Adventure-ready",
    ],
  },
  {
    id: "scorpio-2023",
    slug: "scorpio-2023-diesel",
    name: "Scorpio",
    year: 2023,
    variant: "Diesel",
    fuelType: "Diesel",
    category: "SUV",
    pricePerDay: 5000,
    image: "/cars/scorpio-2023-diesel.jpg",
    featured: true,
    description:
      "A commanding presence on any road. The 2023 Scorpio combines muscular styling with a powerful diesel engine, ideal for family trips and highway cruising.",
    highlights: [
      "Powerful diesel engine",
      "Spacious 7-seater",
      "Bold road presence",
      "Highway comfort",
    ],
  },
  {
    id: "thar-4x4-2022",
    slug: "thar-4x4-2022-diesel",
    name: "Thar 4x4",
    year: 2022,
    variant: "Diesel",
    fuelType: "Diesel",
    category: "SUV",
    pricePerDay: 5000,
    image: "/cars/thar-4x4-2022-diesel.jpg",
    featured: true,
    description:
      "The iconic Thar with full 4x4 capability. Built for those who love off-road adventures while enjoying modern creature comforts.",
    highlights: [
      "4x4 drivetrain",
      "Iconic design",
      "Off-road capable",
      "Modern features",
    ],
  },
  {
    id: "thar-4x2-2024",
    slug: "thar-4x2-2024-diesel",
    name: "Thar 4x2",
    year: 2024,
    variant: "Diesel",
    fuelType: "Diesel",
    category: "SUV",
    pricePerDay: 4500,
    image: "/cars/thar-4x2-2024-diesel.jpg",
    featured: false,
    description:
      "All the Thar attitude in a more accessible package. The 4x2 variant offers stylish looks and a comfortable ride for city and highway use.",
    highlights: [
      "Stylish design",
      "Diesel efficiency",
      "Comfortable ride",
      "Modern interiors",
    ],
  },
  {
    id: "honda-city-2025",
    slug: "honda-city-2025-petrol-ivtec",
    name: "Honda City",
    year: 2025,
    variant: "Petrol i-VTEC",
    fuelType: "Petrol",
    category: "Sedan",
    pricePerDay: 3500,
    image: "/cars/honda-city-2025-petrol-ivtec.jpg",
    featured: true,
    description:
      "The gold standard of premium sedans. The 2025 Honda City i-VTEC delivers refined driving dynamics, premium interiors, and exceptional fuel efficiency.",
    highlights: [
      "i-VTEC engine",
      "Premium interiors",
      "Smooth ride quality",
      "Excellent mileage",
    ],
  },
  {
    id: "verna-2020",
    slug: "verna-2020-diesel",
    name: "Verna",
    year: 2020,
    variant: "Diesel",
    fuelType: "Diesel",
    category: "Sedan",
    pricePerDay: 3300,
    image: "/cars/verna-2020-diesel.jpg",
    featured: false,
    description:
      "A feature-rich sedan that combines elegance with performance. The Verna diesel offers a composed highway ride and impressive fuel economy.",
    highlights: [
      "Feature-rich cabin",
      "Diesel economy",
      "Elegant design",
      "Comfortable cruiser",
    ],
  },
  {
    id: "brezza-2017",
    slug: "brezza-2017-vxi",
    name: "Brezza",
    year: 2017,
    variant: "VXI",
    fuelType: "Petrol",
    category: "SUV",
    pricePerDay: 3200,
    image: "/cars/brezza-2017-vxi.jpg",
    featured: false,
    description:
      "India's favourite compact SUV. The Brezza VXI offers the perfect balance of practicality, safety, and style for everyday driving.",
    highlights: [
      "Compact SUV",
      "Practical design",
      "Good ground clearance",
      "Fuel efficient",
    ],
  },
  {
    id: "ciaz-alpha-2021",
    slug: "ciaz-alpha-2021-petrol",
    name: "Ciaz Alpha",
    year: 2021,
    variant: "Petrol",
    fuelType: "Petrol",
    category: "Sedan",
    pricePerDay: 3000,
    image: "/cars/ciaz-alpha-2021-petrol.jpg",
    featured: false,
    description:
      "Spacious, comfortable, and refined. The Ciaz Alpha is the ideal sedan for long-distance travel with its roomy cabin and smooth ride quality.",
    highlights: [
      "Spacious cabin",
      "Smooth petrol engine",
      "Long-distance comfort",
      "Great boot space",
    ],
  },
  {
    id: "venue-2021",
    slug: "venue-2021-petrol",
    name: "Venue",
    year: 2021,
    variant: "Petrol",
    fuelType: "Petrol",
    category: "SUV",
    pricePerDay: 3000,
    image: "/cars/venue-2021-petrol.jpg",
    featured: false,
    description:
      "A smart, connected SUV for the urban driver. The Venue packs premium features into a compact footprint, perfect for city and short trips.",
    highlights: [
      "Connected car tech",
      "Compact SUV",
      "City-friendly size",
      "Modern features",
    ],
  },
  {
    id: "ciaz-delta-2016",
    slug: "ciaz-delta-2016-petrol",
    name: "Ciaz Delta",
    year: 2016,
    variant: "Petrol",
    fuelType: "Petrol",
    category: "Sedan",
    pricePerDay: 2700,
    image: "/cars/ciaz-delta-2016-petrol.jpg",
    featured: false,
    description:
      "A reliable sedan with excellent space and comfort. The Ciaz Delta offers a smooth driving experience and great value for daily rentals.",
    highlights: [
      "Reliable performance",
      "Spacious interiors",
      "Smooth ride",
      "Value for money",
    ],
  },
  {
    id: "i20-sportz-2021",
    slug: "i20-sportz-2021-petrol",
    name: "i20 Sportz",
    year: 2021,
    variant: "Petrol",
    fuelType: "Petrol",
    category: "Hatchback",
    pricePerDay: 2700,
    image: "/cars/i20-sportz-2021-petrol.jpg",
    featured: false,
    description:
      "Premium hatchback with sporty styling. The i20 Sportz offers a fun driving experience with its refined engine and feature-rich cabin.",
    highlights: [
      "Sporty design",
      "Premium interiors",
      "Fun to drive",
      "Feature-loaded",
    ],
  },
  {
    id: "baleno-delta-2018",
    slug: "baleno-delta-2018-diesel",
    name: "Baleno Delta",
    year: 2018,
    variant: "Diesel",
    fuelType: "Diesel",
    category: "Hatchback",
    pricePerDay: 2200,
    image: "/cars/baleno-delta-2018-diesel.jpg",
    featured: false,
    description:
      "A practical hatchback with excellent fuel economy. The Baleno Delta diesel is perfect for budget-conscious travellers who don't want to compromise on comfort.",
    highlights: [
      "Excellent mileage",
      "Diesel economy",
      "Practical hatchback",
      "Comfortable ride",
    ],
  },
  {
    id: "baleno-zeta-2019",
    slug: "baleno-zeta-2019-petrol",
    name: "Baleno Zeta",
    year: 2019,
    variant: "Petrol",
    fuelType: "Petrol",
    category: "Hatchback",
    pricePerDay: 2200,
    image: "/cars/baleno-zeta-2019-petrol.jpg",
    featured: false,
    description:
      "A well-rounded premium hatchback. The Baleno Zeta petrol delivers a smooth city driving experience with modern features and good fuel economy.",
    highlights: [
      "Premium hatchback",
      "Smooth petrol engine",
      "City-friendly",
      "Good features",
    ],
  },
];

export function getVehicleBySlug(slug: string): Vehicle | undefined {
  return fleet.find((v) => v.slug === slug);
}

export function getFeaturedVehicles(): Vehicle[] {
  return fleet.filter((v) => v.featured);
}

export function getVehiclesByCategory(category: VehicleCategory): Vehicle[] {
  return fleet.filter((v) => v.category === category);
}

export function getRelatedVehicles(currentSlug: string, limit = 4): Vehicle[] {
  const current = getVehicleBySlug(currentSlug);
  if (!current) return fleet.slice(0, limit);

  return fleet
    .filter((v) => v.slug !== currentSlug)
    .sort((a, b) => {
      const aScore =
        (a.category === current.category ? 2 : 0) +
        (Math.abs(a.pricePerDay - current.pricePerDay) < 1000 ? 1 : 0);
      const bScore =
        (b.category === current.category ? 2 : 0) +
        (Math.abs(b.pricePerDay - current.pricePerDay) < 1000 ? 1 : 0);
      return bScore - aScore;
    })
    .slice(0, limit);
}
