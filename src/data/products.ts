export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  image: any; // React Native local image source (from require())
  imageKey?: string; // Key to lookup image from PRODUCT_IMAGES (for serialization)
  applications?: string[];
  features?: string[];
  specifications?: {
    materialStandard?: string;
    packaging?: string;
    testingCertificate?: string;
    brand?: string[];
    grades?: string[];
    delivery?: string;
    quality?: string;
    availability?: string;
  };
}

// Product images from local products folder at root - React Native requires static imports
export const PRODUCT_IMAGES: { [key: string]: any } = {
  // Steel Products
  tmtBars: require('../../products/tmt-bars-new.jpg'),
  msHollowSections: require('../../products/ms-hollow-sections.jpg'),
  msRoundBars: require('../../products/ms-round-bars-new.jpg'),
  msPlates: require('../../products/ms-plates-new.jpg'),
  msChannels: require('../../products/ms-channels-new.jpg'),
  msAngles: require('../../products/ms-angles-new.jpg'),
  msIBeams: require('../../products/ms-i-beams-new.jpg'),
  galvanizedSheets: require('../../products/galvanized-sheets-new.jpg'),
  
  // Stainless Steel Products
  ssSheets: require('../../products/ss-sheets-new.jpg'),
  ssPipes: require('../../products/ss-pipes-new.jpg'),
  ssCoils: require('../../products/ss-coils-new.jpg'),
  ssRoundBars: require('../../products/ss-round-bars-new.jpg'),
  ssAngles: require('../../products/ss-angles-channels-new.jpg'),
  
  // Construction Materials
  plywood: require('../../products/plywood-new.jpg'),
  ceramicTiles: require('../../products/tiles-ceramic.jpg'),
  constructionSand: require('../../products/construction-sand.jpg'),
  cement: require('../../products/cement-new.jpg'),
  aggregates: require('../../products/aggregates-new.jpg'),
  bricks: require('../../products/clay-bricks.jpg'),
  concreteBlocks: require('../../products/concrete-blocks-new.jpg'),
  aacBlocks: require('../../products/aac-blocks-new.jpg'),
  waterproofing: require('../../products/waterproofing.jpg'),
  paints: require('../../products/paints-coatings-new.jpg'),
  wallPutty: require('../../products/wall-putty.jpg'),
  tileAdhesive: require('../../products/tile-adhesive.jpg'),
  
  // Electrical Materials
  electricalCables: require('../../products/electrical-cables.jpg'),
  ledLights: require('../../products/led-lights.jpg'),
  mcbBreakers: require('../../products/mcb-breakers-new.jpg'),
  switchesSockets: require('../../products/switches-sockets-new.jpg'),
  distributionBoard: require('../../products/distribution-board-new.jpg'),
  panelBoard: require('../../products/panel-boards-new.jpg'),
};

export const predefinedProducts: Product[] = [
  {
    id: "featured-1",
    name: "TMT Bars Fe 500D",
    category: "mild-steel",
    image: PRODUCT_IMAGES.tmtBars,
    imageKey: "tmtBars",
    description: "High-strength Thermo-Mechanically Treated reinforcement bars conforming to IS 1786 Fe 500D grade. Superior ductility, weldability, and earthquake resistance for modern construction projects.",
    applications: ["High-Rise Buildings", "Bridge Construction", "Industrial Structures", "Seismic Zone Projects"],
    features: ["Fe 500D Grade", "Earthquake Resistant", "Superior Ductility", "Corrosion Resistant"],
    specifications: {
      materialStandard: "IS 1786 Fe 500D",
      packaging: "Bundle / Loose",
      testingCertificate: "Mill Test Certificate Available",
      brand: ["JSW Steel", "Tata Steel", "SAIL", "Jindal Steel", "Kamdhenu"],
      grades: ["Fe 500D", "Fe 550D", "Fe 600"],
      delivery: "Pan India",
      quality: "ISI Certified",
      availability: "In Stock"
    }
  },
  {
    id: "featured-2",
    name: "MS Hollow Sections",
    category: "mild-steel",
    image: PRODUCT_IMAGES.msHollowSections,
    imageKey: "msHollowSections",
    description: "Premium mild steel hollow square and rectangular sections for structural applications. Manufactured to IS 4923 standards with uniform wall thickness and precise dimensions.",
    applications: ["Steel Structures", "Roof Trusses", "Industrial Frames", "Fabrication Works"],
    features: ["Uniform Wall Thickness", "High Strength-to-Weight Ratio", "Easy Fabrication", "Cost Effective"],
    specifications: {
      materialStandard: "IS 4923 / ASTM A500",
      packaging: "Bundle / Crate",
      testingCertificate: "Material Test Certificate",
      brand: ["Tata Steel", "JSW Steel", "SAIL", "Essar Steel"],
      grades: ["Grade A", "Grade B", "S355"],
      delivery: "Pan India",
      quality: "ISO Certified",
      availability: "In Stock"
    }
  },
  {
    id: "ms-1",
    name: "MS Round Bars IS 2062",
    category: "mild-steel",
    image: PRODUCT_IMAGES.msRoundBars,
    imageKey: "msRoundBars",
    description: "Premium quality mild steel round bars manufactured to IS 2062 specifications. Perfect for machining, fabrication, and construction applications with excellent weldability and machinability.",
    applications: ["Precision Machining", "Industrial Fabrication", "Construction Framework", "Automotive Components"],
    features: ["High Tensile Strength", "Uniform Diameter", "Smooth Surface Finish", "Cost Effective"],
    specifications: {
      materialStandard: "IS 2062 / ASTM A36",
      packaging: "Bundle / Loose",
      testingCertificate: "Mill Test Available",
      brand: ["JSW Steel", "Tata Steel", "SAIL", "Jindal Steel", "Essar Steel"],
      grades: ["Grade A", "Grade B", "E250A"],
      delivery: "Pan India",
      quality: "ISO Certified",
      availability: "In Stock"
    }
  },
  {
    id: "ms-2",
    name: "MS Plates Grade A",
    category: "mild-steel",
    image: PRODUCT_IMAGES.msPlates,
    imageKey: "msPlates",
    description: "Heavy-duty mild steel plates conforming to Grade A standards. Ideal for shipbuilding, pressure vessels, and heavy industrial applications with superior strength.",
    applications: ["Ship Building", "Pressure Vessels", "Industrial Machinery", "Structural Engineering"],
    features: ["High Load Bearing", "Uniform Thickness", "Easy to Weld", "Corrosion Resistant Coating"],
    specifications: {
      materialStandard: "IS 2062 Grade A / ASTM A36",
      packaging: "Wooden Crate / Bundle",
      testingCertificate: "Mill Test Certificate",
      brand: ["Tata Steel", "JSW Steel", "SAIL", "Jindal Steel", "Essar Steel"],
      grades: ["Grade A", "Grade B", "Grade C", "S235JR", "S275JR"],
      delivery: "Pan India",
      quality: "ISO 9001 Certified",
      availability: "In Stock"
    }
  },
  {
    id: "ss-1",
    name: "SS 304 Sheets",
    category: "stainless-steel",
    image: PRODUCT_IMAGES.ssSheets,
    imageKey: "ssSheets",
    description: "Premium stainless steel 304 sheets with excellent corrosion resistance. Ideal for food processing, pharmaceutical equipment, and architectural applications.",
    applications: ["Kitchen Equipment", "Food Processing", "Pharmaceutical Equipment", "Architectural Panels"],
    features: ["Corrosion Resistant", "Easy to Clean", "Aesthetic Finish", "Durable"],
    specifications: {
      materialStandard: "ASTM A240 / JIS G4304",
      packaging: "Wooden Crate / Pallet",
      testingCertificate: "Mill Test Certificate",
      brand: ["JSW Steel", "Jindal Stainless", "SAIL", "Viraj Profiles"],
      grades: ["SS 304", "SS 304L", "SS 316", "SS 316L"],
      delivery: "Pan India",
      quality: "ISO Certified",
      availability: "In Stock"
    }
  },
  {
    id: "ss-2",
    name: "SS Pipes 304/316",
    category: "stainless-steel",
    image: PRODUCT_IMAGES.ssPipes,
    imageKey: "ssPipes",
    description: "High-quality stainless steel pipes available in 304 and 316 grades. Perfect for industrial piping, food processing, and corrosive environments.",
    applications: ["Industrial Piping", "Food Processing", "Chemical Plants", "Marine Applications"],
    features: ["High Corrosion Resistance", "Long Service Life", "Easy Maintenance", "Multiple Sizes"],
    specifications: {
      materialStandard: "ASTM A312 / IS 1239",
      packaging: "Bundle / Wooden Crate",
      testingCertificate: "Mill Test Certificate",
      brand: ["Ratnamani Metals", "ISMT", "Maharashtra Seamless", "Zenith Birla"],
      grades: ["SS 304", "SS 316", "SS 304L", "SS 316L"],
      delivery: "Pan India",
      quality: "ISO 9001 Certified",
      availability: "In Stock"
    }
  },
  {
    id: "const-1",
    name: "Premium Plywood BWP Grade",
    category: "construction",
    image: PRODUCT_IMAGES.plywood,
    imageKey: "plywood",
    description: "Boiling Water Proof (BWP) grade plywood with superior bonding and moisture resistance. Made from high-quality hardwood veneers for construction and furniture applications.",
    applications: ["Furniture Making", "Interior Paneling", "Construction Formwork", "Kitchen Cabinets"],
    features: ["BWP Grade", "Moisture Resistant", "Termite Treatment", "Smooth Surface"],
    specifications: {
      materialStandard: "IS 303 BWP Grade",
      packaging: "Wooden Pallet / Bundle",
      testingCertificate: "ISI Mark & Quality Certificate",
      brand: ["Century Ply", "Greenply", "Kitply", "National Plywood", "Austin Ply"],
      grades: ["BWP Grade", "BWR Grade", "MR Grade", "Marine Grade"],
      delivery: "Pan India",
      quality: "ISI Certified",
      availability: "In Stock"
    }
  },
  {
    id: "const-2",
    name: "Ceramic Floor Tiles",
    category: "construction",
    image: PRODUCT_IMAGES.ceramicTiles,
    imageKey: "ceramicTiles",
    description: "Premium ceramic floor tiles with anti-slip surface and stain resistance. Available in multiple designs, colors, and finishes for residential and commercial spaces.",
    applications: ["Floor Tiling", "Wall Cladding", "Bathroom Flooring", "Commercial Spaces"],
    features: ["Anti-Slip Surface", "Stain Resistant", "Easy Maintenance", "Durable Finish"],
    specifications: {
      materialStandard: "IS 15622",
      packaging: "Carton / Pallet",
      testingCertificate: "Quality Certificate",
      brand: ["Kajaria", "Somany", "Johnson Tiles", "Nitco", "RAK Ceramics"],
      grades: ["Premium", "Economy", "Designer"],
      delivery: "Pan India",
      quality: "ISI Certified",
      availability: "In Stock"
    }
  },
  {
    id: "const-3",
    name: "Construction Sand (M-Sand)",
    category: "construction",
    image: PRODUCT_IMAGES.constructionSand,
    imageKey: "constructionSand",
    description: "High-quality manufactured sand (M-Sand) conforming to IS 383 standards. Ideal for concrete, plastering, and masonry works with consistent gradation and minimal silt content.",
    applications: ["Concrete Mixing", "Plastering Works", "Brick Masonry", "Block Work"],
    features: ["IS 383 Compliant", "Consistent Quality", "Low Silt Content", "Eco-Friendly"],
    specifications: {
      materialStandard: "IS 383",
      packaging: "Loose / Truck Load",
      testingCertificate: "Quality Test Certificate",
      brand: ["Local Quarries", "Certified Manufacturers"],
      delivery: "Local & Regional",
      quality: "ISI Certified",
      availability: "In Stock"
    }
  },
  {
    id: "const-4",
    name: "Portland Pozzolana Cement (PPC)",
    category: "construction",
    image: PRODUCT_IMAGES.cement,
    imageKey: "cement",
    description: "High-quality Portland Pozzolana Cement for general construction works. Excellent strength, durability, and resistance to chemical attacks.",
    applications: ["Building Construction", "Plastering", "Concrete Works", "Foundation"],
    features: ["High Strength", "Low Heat of Hydration", "Improved Workability", "Eco-Friendly"],
    specifications: {
      materialStandard: "IS 1489",
      packaging: "50 kg Bag",
      testingCertificate: "ISI Mark",
      brand: ["UltraTech", "ACC", "Ambuja", "Shree Cement", "Dalmia"],
      grades: ["PPC", "OPC 43", "OPC 53"],
      delivery: "Pan India",
      quality: "ISI Certified",
      availability: "In Stock"
    }
  },
  {
    id: "elec-1",
    name: "Electrical Cables FR-LSH",
    category: "electrical",
    image: PRODUCT_IMAGES.electricalCables,
    imageKey: "electricalCables",
    description: "Fire Resistant Low Smoke Halogen-Free cables for safe electrical installations. Ideal for commercial buildings, hospitals, and high-rise structures.",
    applications: ["Commercial Buildings", "Hospitals", "High-Rise Structures", "Industrial Units"],
    features: ["Fire Resistant", "Low Smoke Emission", "Halogen-Free", "High Safety"],
    specifications: {
      materialStandard: "IS 694 / IEC 60227",
      packaging: "Drum / Coil",
      testingCertificate: "ISI Mark & Test Certificate",
      brand: ["Polycab", "Havells", "KEI", "Finolex", "RR Kabel"],
      grades: ["FR-LSH", "FRLS", "PVC Insulated"],
      delivery: "Pan India",
      quality: "ISI Certified",
      availability: "In Stock"
    }
  },
  {
    id: "elec-2",
    name: "LED Tube Lights 20W",
    category: "electrical",
    image: PRODUCT_IMAGES.ledLights,
    imageKey: "ledLights",
    description: "Energy-efficient LED tube lights with high lumen output and long service life. Perfect replacement for traditional fluorescent tubes.",
    applications: ["Office Lighting", "Commercial Spaces", "Industrial Units", "Residential Areas"],
    features: ["Energy Efficient", "Long Life", "High Brightness", "Low Maintenance"],
    specifications: {
      materialStandard: "IS 16102",
      packaging: "Carton",
      testingCertificate: "BIS Certification",
      brand: ["Philips", "Syska", "Bajaj", "Crompton", "Havells"],
      grades: ["Cool White", "Warm White", "Day Light"],
      delivery: "Pan India",
      quality: "BIS Certified",
      availability: "In Stock"
    }
  },
  {
    id: "elec-3",
    name: "MCB Circuit Breakers",
    category: "electrical",
    image: PRODUCT_IMAGES.mcbBreakers,
    imageKey: "mcbBreakers",
    description: "Miniature Circuit Breakers (MCB) for overload and short circuit protection. Available in various current ratings for residential and commercial applications.",
    applications: ["Distribution Boards", "Electrical Panels", "Residential Buildings", "Commercial Buildings"],
    features: ["Overload Protection", "Short Circuit Protection", "Easy Installation", "Compact Design"],
    specifications: {
      materialStandard: "IS 8828 / IEC 60898",
      packaging: "Box",
      testingCertificate: "ISI Mark",
      brand: ["Schneider", "Siemens", "Legrand", "ABB", "L&T"],
      grades: ["Type B", "Type C", "Type D"],
      delivery: "Pan India",
      quality: "ISI Certified",
      availability: "In Stock"
    }
  },
  {
    id: "ms-3",
    name: "MS Channels ISMC",
    category: "mild-steel",
    image: PRODUCT_IMAGES.msChannels,
    imageKey: "msChannels",
    description: "Indian Standard Medium Channels manufactured to precise specifications. Widely used in construction and infrastructure projects for structural support.",
    applications: ["Building Construction", "Bridge Structures", "Industrial Sheds", "Support Beams"],
    features: ["High Strength-to-Weight Ratio", "Easy Installation", "Durable Finish", "Multiple Sizes Available"],
    specifications: {
      materialStandard: "IS 2062 / ISMC",
      packaging: "Bundle",
      testingCertificate: "Mill Test Certificate",
      brand: ["Tata Steel", "JSW Steel", "SAIL", "Jindal Steel"],
      grades: ["Grade A", "Grade B", "E250"],
      delivery: "Pan India",
      quality: "ISO Certified",
      availability: "In Stock"
    }
  },
  {
    id: "ms-4",
    name: "MS Angles L-Section",
    category: "mild-steel",
    image: PRODUCT_IMAGES.msAngles,
    imageKey: "msAngles",
    description: "Equal and unequal angle sections for diverse construction needs. Precision-cut with excellent straightness for easy installation.",
    applications: ["Roof Trusses", "Support Structures", "Frame Making", "Industrial Racking"],
    features: ["Precise Dimensions", "High Rigidity", "Corrosion Protection", "Easy to Cut & Weld"],
    specifications: {
      materialStandard: "IS 2062 / ASTM A36",
      packaging: "Bundle",
      testingCertificate: "Mill Test Certificate",
      brand: ["Tata Steel", "JSW Steel", "SAIL", "Essar Steel"],
      grades: ["Grade A", "Grade B"],
      delivery: "Pan India",
      quality: "ISO Certified",
      availability: "In Stock"
    }
  },
  {
    id: "ms-5",
    name: "MS I-Beams ISMB",
    category: "mild-steel",
    image: PRODUCT_IMAGES.msIBeams,
    imageKey: "msIBeams",
    description: "Wide flange H-beams for heavy structural applications. Provides exceptional load-bearing capacity for high-rise buildings and bridges.",
    applications: ["High-Rise Buildings", "Bridge Construction", "Industrial Plants", "Heavy Machinery Bases"],
    features: ["Superior Load Capacity", "Excellent Bending Resistance", "Long Span Coverage", "Seismic Resistant"],
    specifications: {
      materialStandard: "IS 2062 / ISMB",
      packaging: "Bundle / Loose",
      testingCertificate: "Mill Test Certificate",
      brand: ["JSW Steel", "Tata Steel", "SAIL", "Jindal Steel"],
      grades: ["ISMB 100", "ISMB 150", "ISMB 200", "ISMB 250"],
      delivery: "Pan India",
      quality: "ISO Certified",
      availability: "In Stock"
    }
  },
  {
    id: "ss-3",
    name: "SS Coils 304 Grade",
    category: "stainless-steel",
    image: PRODUCT_IMAGES.ssCoils,
    imageKey: "ssCoils",
    description: "SS 304 coils for fabrication and manufacturing. Excellent formability and weldability for various industrial applications.",
    applications: ["Kitchen Sinks", "Appliances", "Architectural Features", "Industrial Equipment"],
    features: ["Good Formability", "Weldable", "Polishable", "Corrosion Resistant"],
    specifications: {
      materialStandard: "ASTM A240 / JIS G4305",
      packaging: "Pallet / Wooden Crate",
      testingCertificate: "Mill Test Certificate",
      brand: ["Jindal Stainless", "Outokumpu", "Posco", "Acerinox"],
      grades: ["SS 304", "SS 304L", "SS 316", "SS 316L"],
      delivery: "Pan India",
      quality: "ISO Certified",
      availability: "In Stock"
    }
  },
  {
    id: "const-5",
    name: "AAC Blocks Premium",
    category: "construction",
    image: PRODUCT_IMAGES.aacBlocks,
    imageKey: "aacBlocks",
    description: "Autoclaved Aerated Concrete blocks with excellent thermal insulation and lightweight properties. Ideal for modern green buildings.",
    applications: ["High-Rise Buildings", "Residential Construction", "Commercial Buildings", "Earthquake Zones"],
    features: ["Lightweight", "Thermal Insulation", "Fire Resistant", "Eco-Friendly"],
    specifications: {
      materialStandard: "IS 2185 Part 3",
      packaging: "Pallet",
      testingCertificate: "ISI Mark",
      brand: ["Ultratech", "Siporex", "Magicrete", "JK Laksmi"],
      grades: ["4 inch", "6 inch", "8 inch"],
      delivery: "Pan India",
      quality: "ISI Certified",
      availability: "In Stock"
    }
  },
  {
    id: "const-6",
    name: "Waterproofing Membrane",
    category: "construction",
    image: PRODUCT_IMAGES.waterproofing,
    imageKey: "waterproofing",
    description: "High-quality bitumen waterproofing membrane for roofs and terraces. Provides long-lasting protection against water seepage.",
    applications: ["Roof Waterproofing", "Terrace", "Basement", "Underground Structures"],
    features: ["Weather Resistant", "Flexible", "Easy Application", "Long Lasting"],
    specifications: {
      materialStandard: "IS 1322",
      packaging: "Roll",
      testingCertificate: "Quality Certificate",
      brand: ["Dr. Fixit", "Fosroc", "Sika", "Pidilite"],
      grades: ["APP Modified", "SBS Modified"],
      delivery: "Pan India",
      quality: "ISO Certified",
      availability: "In Stock"
    }
  },
  {
    id: "elec-4",
    name: "Modular Switches & Sockets",
    category: "electrical",
    image: PRODUCT_IMAGES.switchesSockets,
    imageKey: "switchesSockets",
    description: "Premium modular switches and sockets for residential and commercial installations. Elegant design with superior safety features.",
    applications: ["Residential", "Commercial", "Hotels", "Offices"],
    features: ["Elegant Design", "Fire Retardant", "Child Safe", "Long Life"],
    specifications: {
      materialStandard: "IS 3854 / IEC 60884",
      packaging: "Box",
      testingCertificate: "ISI Mark",
      brand: ["Legrand", "Schneider", "Havells", "Anchor", "GM"],
      grades: ["Premium", "Standard"],
      delivery: "Pan India",
      quality: "ISI Certified",
      availability: "In Stock"
    }
  },
];

// AI Recommended Products - Featured products for dashboard recommendations
export const aiRecommendedProducts: Product[] = [
  predefinedProducts[0],  // TMT Bars
  predefinedProducts[4],  // SS 304 Sheets
  predefinedProducts[6],  // Premium Plywood
  predefinedProducts[9],  // Portland Cement
];
