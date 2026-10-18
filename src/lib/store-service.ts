import nassCustomLabcoat from "@/assets/nass_custom_labcoat.png";

export interface StoreProduct {
  id: string;
  title: string;
  category: "labcoat" | "manual" | "jersey" | "gear" | "general";
  price: number;
  priceConfirmed: boolean;
  badge: string;
  image?: string;
  description: string;
  features: string[];
  inStock?: boolean;
  manualOptions?: { name: string; price?: number; discount?: string }[];
  updatedAt?: string;
}

export const DEFAULT_STORE_PRODUCTS: StoreProduct[] = [
  {
    id: "labcoat",
    title: "Official CBS Customised Lab Coat",
    category: "labcoat",
    price: 6500,
    priceConfirmed: true,
    image: nassCustomLabcoat,
    badge: "Embroidered Crest & Custom Name",
    description: "Heavyweight 100% white cotton drill fabric, customized with official embroidered NASS LASUSTECH crest on the left chest pocket and student's custom name embroidery on the right chest in collegiate green stitching. Features 3 reinforced deep pockets, side slits, and anti-corrosion press buttons.",
    features: [
      "Official NASS LASUSTECH embroidered crest on left chest pocket",
      "Bespoke student name embroidered in green on right chest (e.g. ADEGOKE M. A.)",
      "100% heavy cotton drill with acid & stain resistance",
      "Available in Small (S), Medium (M), Large (L), Extra Large (XL), XXL",
      "Mandatory for all Chemistry, Biology, Physics, and Biotech laboratory practicals",
    ],
    inStock: true,
  },
  {
    id: "jersey",
    title: "CBS Customised Sport Jersey",
    category: "jersey",
    price: 5500,
    priceConfirmed: false,
    badge: "Custom Name & Squad Number",
    description: "Official College of Basic Sciences athletic dry-fit sport jersey in collegiate emerald green and gold trim. Features bespoke heat-pressed custom back surname and squad number, breathable moisture-wicking fabric, and official collegiate crest.",
    features: [
      "Official NASS CBS woven crest and collegiate athletic insignia",
      "Customized surname & squad number printed on the back",
      "Ultra-breathable dry-fit polyester performance fabric",
      "Available in Small (S), Medium (M), Large (L), XL, and XXL",
      "Official attire for HOD Cup, Science Day sports, and inter-faculty tourneys",
    ],
    inStock: true,
  },
  {
    id: "manuals",
    title: "CBS Laboratory Practical Manuals",
    category: "manual",
    price: 2500,
    priceConfirmed: false,
    badge: "2025/2026 Approved Editions",
    description: "Official laboratory practical manuals approved by the CBS Deanery. Includes pre-lab safety protocols, qualitative and volumetric schemes, observation logsheets, and experiment report formats.",
    manualOptions: [
      { name: "Chemistry Practical Manual (CHM 107/108)" },
      { name: "Physics Practical Manual & Logbook (PHY 107/108)" },
      { name: "Biology Practical Manual & Plates (BIO 107/108)" },
      { name: "Complete 3-in-1 CBS Science Practical Pack" },
    ],
    features: [
      "Curriculum-matched experiments for 100L - 200L basic science students",
      "Includes authentic tear-out practical report sheets for grading",
      "Officially stamped and accepted by all CBS laboratory supervisors",
      "Complimentary NASS science bookmark and periodic table guide included",
    ],
    inStock: true,
  },
];

const STORE_STORAGE_KEY = "nass_store_products";

/**
 * Retrieves all store products from localStorage or initializes with defaults.
 */
export const getStoreProducts = (): StoreProduct[] => {
  if (typeof window === "undefined") return DEFAULT_STORE_PRODUCTS;

  try {
    const raw = localStorage.getItem(STORE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure labcoat has default image if missing
        return parsed.map((p) => {
          if (p.id === "labcoat" && !p.image) {
            return { ...p, image: nassCustomLabcoat };
          }
          return p;
        });
      }
    }
  } catch (e) {
    console.error("Failed to load store products from storage", e);
  }

  // Initialize defaults
  try {
    localStorage.setItem(STORE_STORAGE_KEY, JSON.stringify(DEFAULT_STORE_PRODUCTS));
  } catch (e) {}

  return DEFAULT_STORE_PRODUCTS;
};

/**
 * Saves store products to localStorage and broadcasts the update.
 */
export const saveStoreProducts = (products: StoreProduct[]): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORE_STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("nass_store_updated", { detail: products }));
  } catch (e) {
    console.error("Failed to save store products to storage", e);
  }
};

/**
 * Adds a new product to the store.
 */
export const addStoreProduct = (
  newProduct: Omit<StoreProduct, "id"> & { id?: string }
): StoreProduct => {
  const current = getStoreProducts();
  const id = newProduct.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const product: StoreProduct = {
    ...newProduct,
    id,
    updatedAt: new Date().toISOString(),
  };

  const updated = [product, ...current];
  saveStoreProducts(updated);
  return product;
};

/**
 * Updates an existing store product.
 */
export const updateStoreProduct = (
  id: string,
  updates: Partial<StoreProduct>
): boolean => {
  const current = getStoreProducts();
  const index = current.findIndex((p) => p.id === id);
  if (index === -1) return false;

  current[index] = {
    ...current[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveStoreProducts(current);
  return true;
};

/**
 * Deletes a store product by ID.
 */
export const deleteStoreProduct = (id: string): boolean => {
  const current = getStoreProducts();
  const filtered = current.filter((p) => p.id !== id);
  if (filtered.length === current.length) return false;

  saveStoreProducts(filtered);
  return true;
};

/**
 * Resets store products back to defaults.
 */
export const resetStoreProducts = (): StoreProduct[] => {
  saveStoreProducts(DEFAULT_STORE_PRODUCTS);
  return DEFAULT_STORE_PRODUCTS;
};
