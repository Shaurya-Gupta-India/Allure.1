import heroDualPortrait from './assets/images/hero_dual_portrait_1795432614081.jpg';
import sampleMalePortrait from './assets/images/sample_male_portrait_1795432642279.jpg';
import sampleFemalePortrait from './assets/images/sample_female_portrait_1795432615434.jpg';
import productSkincareLuxury from './assets/images/product_skincare_luxury_1795432615686.jpg';
import productHairGroomingLuxury from './assets/images/product_hair_grooming_luxury_1795432613738.jpg';

import {
  CustomOtherAnswers,
  FaceShapeOption,
  GeometryScoreMetric,
  GroomingGoal,
  HairTextureOption,
  HairstyleCatalogEntry,
  ProductItem,
  RoadmapStatus,
  SampleProfileType,
  SkinObservationItem,
  UserPreferences,
} from './types';

export const MAX_OTHER_TEXT_LENGTH = 80;

export const ASSETS = {
  heroDualPortrait,
  sampleMalePortrait,
  sampleFemalePortrait,
  productSkincareLuxury,
  productHairGroomingLuxury,
} as const;

export const FACE_SHAPE_OPTIONS: FaceShapeOption[] = [
  'Oval',
  'Round',
  'Square',
  'Oblong',
  'Heart',
  'Diamond',
];

export const SECONDARY_TENDENCY_OPTIONS: string[] = [
  'None',
  'Diamond tendencies',
  'Square jaw tendencies',
  'Soft heart tendencies',
  'Oval balance tendencies',
  'Slightly elongated outline',
];

export const HAIR_TEXTURE_OPTIONS: HairTextureOption[] = [
  'Straight',
  'Wavy',
  'Curly',
  'Coily',
];

export const EMPTY_CUSTOM_OTHER: CustomOtherAnswers = {
  goals: '',
  hairLength: '',
  hairStylingHabit: '',
  selfReportedHairTexture: '',
  facialHairPreference: '',
  skinFeel: '',
  skinSensitivities: '',
  avoidItems: '',
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  stylePreference: 'all',
  goals: ['hairstyle-refresh', 'skincare-routine'],
  hairLength: 'medium',
  hairStylingHabit: 'quick-product',
  selfReportedHairTexture: 'not-sure',
  skinFeel: 'combination',
  skinSensitivities: [],
  allergyNote: '',
  dailyTime: '10-min',
  customDailyMinutes: 15,
  monthlyBudgetINR: 2000,
  budgetTier: 'balanced',
  useCustomBudget: false,
  currency: 'INR',
  avoidItems: [],
  facialHairPreference: 'skip',
  customOther: { ...EMPTY_CUSTOM_OTHER },
};

export const SKIN_OBSERVATION_PRESETS: Record<string, SkinObservationItem[]> = {
  'Mild T-zone shine & subtle uneven tone': [
    {
      zone: 'T-Zone (Forehead & Nose)',
      observation: 'Mild surface shine appearance',
      cosmeticTip:
        'Gentle pH-balanced cleansing and lightweight gel hydration help keep daytime shine comfortable.',
    },
    {
      zone: 'Cheeks & Cheekbones',
      observation: 'Subtle uneven tone appearance',
      cosmeticTip:
        'Daily broad-spectrum SPF and mild niacinamide are common cosmetic steps for balanced visual clarity.',
    },
    {
      zone: 'Overall Surface Texture',
      observation: 'Smooth with light dehydration lines',
      cosmeticTip:
        'Avoid harsh scrubs in favor of lukewarm water and barrier-supporting moisturizers.',
    },
  ],
  'Visible surface dryness & tightness': [
    {
      zone: 'Cheeks & Jawline',
      observation: 'Light surface dryness appearance',
      cosmeticTip:
        'Creamy non-foaming cleansers and ceramide-rich moisturizers support comfortable hydration.',
    },
    {
      zone: 'Forehead & Around Mouth',
      observation: 'Mild flaky texture look',
      cosmeticTip:
        'Apply moisturizer onto slightly damp skin to help seal in everyday comfort.',
    },
  ],
  'Balanced, even surface appearance': [
    {
      zone: 'Overall Face',
      observation: 'Even surface tone and calm sheen',
      cosmeticTip:
        'A simple cleanser, light moisturizer, and daily SPF maintain steady balance without clutter.',
    },
    {
      zone: 'T-Zone',
      observation: 'Minimal midday shine',
      cosmeticTip:
        'Stick to gentle, non-stripping washes so your natural moisture barrier stays comfortable.',
    },
  ],
  'Noticeable surface shine & visible pores': [
    {
      zone: 'Forehead, Nose & Chin',
      observation: 'Noticeable midday oil sheen',
      cosmeticTip:
        'Oil-free gel hydration and mild evening cleansing help keep skin feeling fresh without over-drying.',
    },
    {
      zone: 'Inner Cheeks',
      observation: 'More visible pore texture',
      cosmeticTip:
        'Light non-comedogenic formulas and consistent SPF support a refined matte appearance.',
    },
  ],
};

export const SAMPLE_DEMO_PROFILES: Record<
  SampleProfileType,
  {
    label: string;
    subtitle: string;
    faceImageUrl: string;
    hairImageUrl: string;
    faceFileName: string;
    hairFileName: string;
  }
> = {
  'sample-a': {
    label: 'Sample Studio Set A',
    subtitle: 'Short-medium wavy hair · Even front studio lighting',
    faceImageUrl: sampleMalePortrait,
    hairImageUrl: sampleMalePortrait,
    faceFileName: 'sample-studio-a-front.jpg',
    hairFileName: 'sample-studio-a-hair.jpg',
  },
  'sample-b': {
    label: 'Sample Studio Set B',
    subtitle: 'Medium-long wavy hair · Even front studio lighting',
    faceImageUrl: sampleFemalePortrait,
    hairImageUrl: sampleFemalePortrait,
    faceFileName: 'sample-studio-b-front.jpg',
    hairFileName: 'sample-studio-b-hair.jpg',
  },
};

export const GOAL_LABELS: Record<GroomingGoal, string> = {
  'hairstyle-refresh': 'Hairstyle refresh',
  'facial-grooming': 'Facial hair & brow tidiness',
  'skincare-routine': 'Consistent skincare routine',
  'low-maintenance': 'Low-maintenance daily upkeep',
  'product-clarity': 'Clearer product choices',
  other: 'Other goal',
};

export const LENGTH_LABELS: Record<UserPreferences['hairLength'], string> = {
  short: 'Short',
  medium: 'Medium',
  long: 'Long',
  shaved: 'Shaved / Buzz',
  other: 'Custom length',
};

export const HABIT_LABELS: Record<UserPreferences['hairStylingHabit'], string> = {
  'air-dry': 'Air-dry naturally',
  'quick-product': 'Quick matte clay or cream',
  'heat-styled': 'Blow-dry or heat styled',
  'protective-low-touch': 'Protective / low-manipulation care',
  other: 'Custom styling habit',
};

export const STYLE_PREFERENCE_LABELS: Record<'all' | 'mens' | 'womens', string> = {
  all: 'All Styles',
  mens: "Men's Grooming",
  womens: "Women's Grooming",
};

export const SKIN_FEEL_LABELS: Record<UserPreferences['skinFeel'], string> = {
  oily: 'Oily',
  dry: 'Dry',
  combination: 'Combination',
  normal: 'Balanced',
  sensitive: 'Sensitive',
  'not-sure': 'Not sure yet',
  other: 'Other skin feel',
};

export const FACIAL_HAIR_LABELS: Record<UserPreferences['facialHairPreference'], string> = {
  skip: 'Skipped / Not applicable',
  'clean-shaven': 'Clean-shaven',
  'light-stubble': 'Light stubble',
  'trimmed-beard': 'Trimmed short beard',
  'full-beard': 'Full beard',
  other: 'Other preference',
};

export const FACE_METRICS_BY_SHAPE: Record<FaceShapeOption, GeometryScoreMetric[]> = {
  Oval: [
    {
      label: 'Face Aspect Ratio',
      valueLabel: '0.84 similarity',
      normalizedScore: 84,
      note: 'Balanced vertical outline relative to cheekbone span',
    },
    {
      label: 'Forehead-to-Cheek',
      valueLabel: '0.78 similarity',
      normalizedScore: 78,
      note: 'Gentle upper taper keeping features proportionate',
    },
    {
      label: 'Jaw-to-Cheek',
      valueLabel: '0.76 similarity',
      normalizedScore: 76,
      note: 'Softly tapered lower third without stark corners',
    },
  ],
  Round: [
    {
      label: 'Face Aspect Ratio',
      valueLabel: '0.81 similarity',
      normalizedScore: 81,
      note: 'Similar vertical length and cheekbone width',
    },
    {
      label: 'Forehead-to-Cheek',
      valueLabel: '0.77 similarity',
      normalizedScore: 77,
      note: 'Soft curved hairline framing wider mid-face',
    },
    {
      label: 'Jaw-to-Cheek',
      valueLabel: '0.79 similarity',
      normalizedScore: 79,
      note: 'Smooth rounded jawline contour',
    },
  ],
  Square: [
    {
      label: 'Face Aspect Ratio',
      valueLabel: '0.80 similarity',
      normalizedScore: 80,
      note: 'Structured proportion across upper and lower thirds',
    },
    {
      label: 'Forehead-to-Cheek',
      valueLabel: '0.83 similarity',
      normalizedScore: 83,
      note: 'Forehead width aligns closely with cheekbones',
    },
    {
      label: 'Jaw-to-Cheek',
      valueLabel: '0.85 similarity',
      normalizedScore: 85,
      note: 'Defined jaw angles matching mid-face width',
    },
  ],
  Oblong: [
    {
      label: 'Face Aspect Ratio',
      valueLabel: '0.86 similarity',
      normalizedScore: 86,
      note: 'Longer vertical silhouette compared to width',
    },
    {
      label: 'Forehead-to-Cheek',
      valueLabel: '0.79 similarity',
      normalizedScore: 79,
      note: 'Even parallel alignment from temple to cheek',
    },
    {
      label: 'Jaw-to-Cheek',
      valueLabel: '0.77 similarity',
      normalizedScore: 77,
      note: 'Gentle elongated taper toward the chin',
    },
  ],
  Heart: [
    {
      label: 'Face Aspect Ratio',
      valueLabel: '0.82 similarity',
      normalizedScore: 82,
      note: 'Balanced vertical framing with focus near the upper third',
    },
    {
      label: 'Forehead-to-Cheek',
      valueLabel: '0.84 similarity',
      normalizedScore: 84,
      note: 'Slightly broader forehead and high cheekbones',
    },
    {
      label: 'Jaw-to-Cheek',
      valueLabel: '0.72 similarity',
      normalizedScore: 72,
      note: 'Distinct gentle taper toward a narrower chin',
    },
  ],
  Diamond: [
    {
      label: 'Face Aspect Ratio',
      valueLabel: '0.83 similarity',
      normalizedScore: 83,
      note: 'Slightly elongated center line with sculptural cheeks',
    },
    {
      label: 'Forehead-to-Cheek',
      valueLabel: '0.74 similarity',
      normalizedScore: 74,
      note: 'Forehead narrows softly above prominent cheekbones',
    },
    {
      label: 'Jaw-to-Cheek',
      valueLabel: '0.73 similarity',
      normalizedScore: 73,
      note: 'Clean taper down from cheekbones to chin',
    },
  ],
};

export const EYEWEAR_TIPS_BY_SHAPE: Record<
  FaceShapeOption,
  { frames: string; proportionNote: string }
> = {
  Oval: {
    frames: 'Medium-width geometric, walnut/tortoise wayfarers, or softly contoured rounds',
    proportionNote:
      'Match frame width closely to the broadest part of your temples so balanced proportions stay natural.',
  },
  Round: {
    frames: 'Structured rectangular, slim square, or subtle browline frames',
    proportionNote:
      'Gentle straight top lines and crisp outer edges introduce clean structure against softer cheek contours.',
  },
  Square: {
    frames: 'Thin round, oval, or softly curved keyhole-bridge frames',
    proportionNote:
      'Rounded lens rims and lightweight rims soften structured jaw angles without overwhelming the brow.',
  },
  Oblong: {
    frames: 'Taller lenses, aviator silhouettes, or deeper rounded squares with decorative temples',
    proportionNote:
      'Vertical lens depth and noticeable side arms break up vertical length for balanced mid-face framing.',
  },
  Heart: {
    frames: 'Light-rimmed oval, bottom-weighted round, or rimless/thin-metal frames',
    proportionNote:
      'Keeping the upper frame line airy avoids adding extra width at the forehead while harmonizing with a tapered chin.',
  },
  Diamond: {
    frames: 'Oval, subtle cat-eye, or top-accented browline silhouettes',
    proportionNote:
      'Softly curved rims with mild upper-rim detail balance narrower temples above prominent cheekbones.',
  },
};

export const FACE_PLACEMENT_REASONS: Record<FaceShapeOption, string> = {
  Oval: 'preserves naturally balanced proportions without adding unnecessary height or width',
  Round: 'introduces clean vertical lift or off-center diagonal framing to elongate softer contours',
  Square: 'softens structured jaw corners with feathered layers and off-center movement',
  Oblong: 'adds gentle horizontal fullness around the temples or brow to soften vertical length',
  Heart: 'balances a wider upper third with soft fullness around the jaw and cheekbones',
  Diamond: 'frames prominent cheekbones while adding subtle softness at the forehead and chin',
};

export const HAIR_ONLY_CARE_BY_TEXTURE: Record<
  HairTextureOption,
  { washFrequency: string; baseProducts: string[]; baseTips: string[] }
> = {
  Straight: {
    washFrequency: 'Every 2–3 days with a gentle balancing cleanser to prevent root flatness.',
    baseProducts: [
      'Lightweight amino or oat scalp wash',
      'Light volumizing rinse-out conditioner on mid-lengths & ends only',
      'Dry-touch matte clay or sea-mineral mist for natural grip',
    ],
    baseTips: [
      'Avoid applying heavy oils or thick creams near the roots so natural lift stays crisp.',
      'Comb gently from ends upward when damp to prevent mechanical snagging.',
      'Use fingertip texture at the crown while drying to add natural separation.',
    ],
  },
  Wavy: {
    washFrequency: '2–3 times per week using a gentle sulfate-free wash to preserve natural S-waves.',
    baseProducts: [
      'Sulfate-free hydrating scalp cleanser',
      'Lightweight leave-in conditioning mist or fluid cream',
      'Aloe-based sea-mineral wave spray or pliable matte cream',
    ],
    baseTips: [
      'Scrunch lightly with a microfiber towel or cotton tee instead of rough towel rubbing.',
      'Detangle with a wide-tooth comb in the shower while conditioner is in.',
      'Let natural waves set undisturbed while air-drying to minimize surface frizz.',
    ],
  },
  Curly: {
    washFrequency: '1–2 times per week with a moisturizing cleanser; refresh with water mist between washes.',
    baseProducts: [
      'Sulfate-free moisture-rich cleanser or gentle co-wash',
      'Slip-rich rinse-out conditioner + lightweight leave-in veil',
      'Soft-hold curl defining cream or botanical gel',
    ],
    baseTips: [
      'Apply leave-in and styler onto soaking-wet hair so curl clumps form cleanly.',
      'Avoid dry brushing; detangle only when damp and coated with conditioner.',
      'Sleep on a smooth satin pillowcase to keep curl definition tidy overnight.',
    ],
  },
  Coily: {
    washFrequency: 'Once every 7–10 days with a gentle moisturizing wash, keeping scalp clean and hydrated.',
    baseProducts: [
      'Sulfate-free creamy scalp cleanser',
      'Deep-conditioning butter or plant-oil mask',
      'Water-based leave-in moisturizer sealed with lightweight jojoba or camellia oil',
    ],
    baseTips: [
      'Work in small sections when detangling and conditioning to protect delicate coils.',
      'Layer hydration with damp hair + leave-in + a few drops of lightweight botanical oil.',
      'Low-manipulation protective styles and satin sleep wraps reduce everyday breakage.',
    ],
  },
};

/**
 * Neutral, non-gender-labelled mock hairstyle catalog (Demo data).
 */
export const HAIRSTYLE_CATALOG: HairstyleCatalogEntry[] = [
  {
    id: 'style-soft-textured-crop',
    name: 'Soft Textured Crop',
    description:
      'Cleanly tapered perimeter with point-cut crown layers that settle effortlessly with fingertips or a pea-sized matte clay.',
    compatibleFaceShapes: ['Oval', 'Round', 'Square', 'Heart'],
    compatibleTextures: ['Straight', 'Wavy', 'Curly'],
    lengthCategory: 'short',
    maintenanceLevel: 'Low',
    stylingTimeMinutes: 4,
    tags: ['heat-free', 'air-dry', 'crown-volume', 'textured-fringe', 'low-effort'],
    placementGuidance:
      'Keep volume centered at the crown with softly feathered temples and a light forward fringe.',
    silhouetteVariant: 'short-crop',
  },
  {
    id: 'style-curtain-framing-layers',
    name: 'Face-Framing Curtain Layers',
    description:
      'Graduated mid-length layers parting softly off-center to trace the cheekbones and soften angular jawlines without heavy bulk.',
    compatibleFaceShapes: ['Oval', 'Square', 'Oblong', 'Heart', 'Diamond'],
    compatibleTextures: ['Straight', 'Wavy', 'Curly'],
    lengthCategory: 'medium',
    maintenanceLevel: 'Moderate',
    stylingTimeMinutes: 8,
    tags: ['parting', 'curtain-fringe', 'cheekbone-framing', 'movement'],
    placementGuidance:
      'Center or slight off-center part with curtain pieces grazing cheekbones and airy lower movement.',
    silhouetteVariant: 'medium-curtain',
  },
  {
    id: 'style-relaxed-mid-flow',
    name: 'Relaxed Mid-Length Flow',
    description:
      'Scissor-shaped medium length with internal weight removal so natural waves or bends fall cleanly behind the ear.',
    compatibleFaceShapes: ['Oval', 'Oblong', 'Square', 'Diamond'],
    compatibleTextures: ['Wavy', 'Straight', 'Curly'],
    lengthCategory: 'medium',
    maintenanceLevel: 'Low',
    stylingTimeMinutes: 5,
    tags: ['heat-free', 'air-dry', 'natural-part', 'balanced-sides'],
    placementGuidance:
      'Natural relaxed part with soft lateral fullness around temples and ears rather than tall vertical height.',
    silhouetteVariant: 'medium-flow',
  },
  {
    id: 'style-sculpted-crown-taper',
    name: 'Sculpted Crown Taper',
    description:
      'Neat sides paired with structured vertical lift through the top to visually elongate rounder contours and highlight natural curl or coil definition.',
    compatibleFaceShapes: ['Round', 'Oval', 'Diamond'],
    compatibleTextures: ['Curly', 'Coily', 'Wavy'],
    lengthCategory: 'short',
    maintenanceLevel: 'Low',
    stylingTimeMinutes: 5,
    tags: ['heat-free', 'crown-volume', 'defined-texture', 'low-effort'],
    placementGuidance:
      'Tapered sides with clean height concentrated at the upper crown to draw the eye upward.',
    silhouetteVariant: 'short-taper-curl',
  },
  {
    id: 'style-collarbone-blunt-lob',
    name: 'Collarbone Textured Lob',
    description:
      'Clean collarbone-length cut with subtle invisible layering at the ends so the silhouette stays light and frames the jawline gently.',
    compatibleFaceShapes: ['Oval', 'Round', 'Square', 'Heart', 'Oblong'],
    compatibleTextures: ['Straight', 'Wavy'],
    lengthCategory: 'medium',
    maintenanceLevel: 'Low',
    stylingTimeMinutes: 6,
    tags: ['heat-free', 'air-dry', 'jaw-framing', 'off-center-part'],
    placementGuidance:
      'Soft side part with ends resting just below the jawline to balance width and add gentle length.',
    silhouetteVariant: 'medium-lob',
  },
  {
    id: 'style-soft-side-swept-taper',
    name: 'Side-Swept Textured Taper',
    description:
      'Slightly longer top brushed diagonally across the forehead with scissor-tapered sides for clean diagonal balance.',
    compatibleFaceShapes: ['Round', 'Square', 'Heart', 'Diamond'],
    compatibleTextures: ['Straight', 'Wavy'],
    lengthCategory: 'short',
    maintenanceLevel: 'Moderate',
    stylingTimeMinutes: 7,
    tags: ['side-part', 'diagonal-fringe', 'structured-crown'],
    placementGuidance:
      'Asymmetrical side part sweeping lightly across the brow to break up symmetry and soften forehead width.',
    silhouetteVariant: 'short-side-swept',
  },
  {
    id: 'style-layered-curl-halo',
    name: 'Rounded Layered Curl Shape',
    description:
      'Dry-cut graduated layers crafted to prevent triangular weight at the bottom and create an airy, balanced frame around the cheekbones.',
    compatibleFaceShapes: ['Oval', 'Square', 'Oblong', 'Heart', 'Diamond'],
    compatibleTextures: ['Curly', 'Coily'],
    lengthCategory: 'medium',
    maintenanceLevel: 'Low',
    stylingTimeMinutes: 6,
    tags: ['heat-free', 'air-dry', 'side-volume', 'curl-definition', 'protective'],
    placementGuidance:
      'Weight lifted off the lower perimeter so soft fullness sits near the temples and cheekbones.',
    silhouetteVariant: 'medium-curl-halo',
  },
  {
    id: 'style-airy-wispy-fringe-layers',
    name: 'Airy Wispy Fringe & Long Layers',
    description:
      'Long flowing layers paired with a light brow-skimming fringe that shortens vertical length and frames the eyes naturally.',
    compatibleFaceShapes: ['Oblong', 'Oval', 'Heart', 'Diamond'],
    compatibleTextures: ['Straight', 'Wavy'],
    lengthCategory: 'long',
    maintenanceLevel: 'Moderate',
    stylingTimeMinutes: 10,
    tags: ['wispy-fringe', 'long-layers', 'side-volume', 'soft-contour'],
    placementGuidance:
      'Light see-through fringe across the forehead paired with mid-cheek layers that add horizontal softness.',
    silhouetteVariant: 'long-fringe-layers',
  },
  {
    id: 'style-close-cropped-buzz-fade',
    name: 'Precision Textured Buzz & Soft Fade',
    description:
      'Uniform close crop with a subtle temple blend that highlights strong bone structure and requires almost zero daily styling.',
    compatibleFaceShapes: ['Oval', 'Square', 'Diamond'],
    compatibleTextures: ['Coily', 'Curly', 'Straight', 'Wavy'],
    lengthCategory: 'shaved',
    maintenanceLevel: 'Low',
    stylingTimeMinutes: 2,
    tags: ['heat-free', 'minimalist', 'low-effort', 'clean-outline'],
    placementGuidance:
      'Even close silhouette with a gentle taper at the nape and temples to keep proportions crisp.',
    silhouetteVariant: 'shaved-fade',
  },
  {
    id: 'style-chin-jaw-french-bob',
    name: 'Jaw-Skimming Soft Bob',
    description:
      'Relaxed chin-to-jaw length cut with softly razored ends that add effortless fullness at the lower third of the face.',
    compatibleFaceShapes: ['Heart', 'Oblong', 'Diamond', 'Oval'],
    compatibleTextures: ['Wavy', 'Straight', 'Curly'],
    lengthCategory: 'short',
    maintenanceLevel: 'Moderate',
    stylingTimeMinutes: 8,
    tags: ['jaw-volume', 'soft-fringe', 'air-dry', 'editorial'],
    placementGuidance:
      'Ends curve softly near the chin and jaw to counterbalance broader cheekbones or forehead width.',
    silhouetteVariant: 'short-bob',
  },
  {
    id: 'style-defined-coil-taper-top',
    name: 'Defined Coil Taper with Soft Fringe',
    description:
      'Close-cropped sides transitioning into moisturized, sponge- or finger-defined coils on top with slight forward movement.',
    compatibleFaceShapes: ['Round', 'Square', 'Oblong', 'Heart'],
    compatibleTextures: ['Coily', 'Curly'],
    lengthCategory: 'short',
    maintenanceLevel: 'Low',
    stylingTimeMinutes: 5,
    tags: ['heat-free', 'protective', 'defined-texture', 'crown-volume'],
    placementGuidance:
      'Softly rounded top profile with gentle forward coil placement to balance forehead height.',
    silhouetteVariant: 'short-coil',
  },
  {
    id: 'style-long-cascading-waves',
    name: 'Long Cascading Perimeter Layers',
    description:
      'Below-the-shoulder length with long interior layering starting past the chin so movement builds smoothly without heaviness.',
    compatibleFaceShapes: ['Round', 'Square', 'Oval', 'Heart'],
    compatibleTextures: ['Wavy', 'Curly', 'Coily', 'Straight'],
    lengthCategory: 'long',
    maintenanceLevel: 'Detailed',
    stylingTimeMinutes: 14,
    tags: ['long-layers', 'elongating', 'off-center-part', 'movement'],
    placementGuidance:
      'Off-center part with vertical flow starting below the chin to elongate rounder or squarer proportions.',
    silhouetteVariant: 'long-waves',
  },
  {
    id: 'style-modern-shag-texture',
    name: 'Soft Modern Layered Shag',
    description:
      'Feathered crown layers and wispy side pieces that build effortless volume at the sides and soften sharp jaw corners.',
    compatibleFaceShapes: ['Oblong', 'Diamond', 'Square', 'Round'],
    compatibleTextures: ['Wavy', 'Curly', 'Straight'],
    lengthCategory: 'medium',
    maintenanceLevel: 'Moderate',
    stylingTimeMinutes: 9,
    tags: ['heat-free', 'air-dry', 'side-volume', 'textured-fringe'],
    placementGuidance:
      'Layered crown lift with wispy cheek-level texture that adds balanced horizontal dimension.',
    silhouetteVariant: 'medium-shag',
  },
  {
    id: 'style-protective-twists-medium',
    name: 'Medium Layered Twists or Braids',
    description:
      'Low-manipulation protective medium length parted cleanly to frame the face while locking in scalp and strand moisture.',
    compatibleFaceShapes: ['Oval', 'Round', 'Square', 'Oblong', 'Heart', 'Diamond'],
    compatibleTextures: ['Coily', 'Curly'],
    lengthCategory: 'long',
    maintenanceLevel: 'Low',
    stylingTimeMinutes: 4,
    tags: ['heat-free', 'protective', 'low-effort', 'versatile-part'],
    placementGuidance:
      'Flexible side or center part allowing strands to sit softly near the cheeks or sweep back cleanly.',
    silhouetteVariant: 'long-protective',
  },
];

export const CURATED_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-cleanser-amino',
    brand: 'Aurelia Botanica',
    title: 'Amino Silk Barrier Cleanser',
    category: 'Skincare',
    priceINR: 540,
    priceUSD: 14,
    routineStepMatch: 'AM / PM Step 01 · Cleanse',
    keyBenefits: ['pH 5.5 Balanced', 'Fragrance-Free', 'Non-Stripping'],
    suitableFor: ['Sensitive skin', 'Daily morning & evening cleanse', 'All skin feels'],
    budgetTier: 'essential',
    shortDescription:
      'Gentle amino-acid gel wash that lifts daily sunscreen and surface oil without leaving skin tight.',
    fullDescription:
      'Formulated without sulfates or added fragrance, this silky gel rinses cleanly with lukewarm water while keeping surface comfort steady. Ideal for streamlined daily routines.',
    imageUrl: productSkincareLuxury,
    retailerLabel: 'View at Partner Retailer',
  },
  {
    id: 'prod-serum-niacinamide',
    brand: 'Solstice Lab',
    title: '5% Niacinamide + Panthenol Essence',
    category: 'Skincare',
    priceINR: 790,
    priceUSD: 19,
    routineStepMatch: 'PM Step 02 · Balance',
    keyBenefits: ['5% Niacinamide', 'Calm Surface Shine', 'Weightless Drop'],
    suitableFor: ['Oily or combination feel', 'Uneven tone look', 'Simple routines'],
    budgetTier: 'balanced',
    shortDescription:
      'Fast-absorbing water essence pairing moderate-strength niacinamide with soothing panthenol.',
    fullDescription:
      'Designed for visible tone clarity and comfortable hydration without sticky residue. Pairs cleanly beneath both daytime SPF fluids and evening barrier moisturizers.',
    imageUrl: productSkincareLuxury,
    retailerLabel: 'View at Partner Retailer',
  },
  {
    id: 'prod-spf-invisible',
    brand: 'Verre Studio',
    title: 'Velvet Invisible Fluid SPF 50',
    category: 'Skincare',
    priceINR: 850,
    priceUSD: 22,
    routineStepMatch: 'AM Step 02 · Protect',
    keyBenefits: ['Zero White Cast', 'Satin-Matte Finish', 'Broad Spectrum'],
    suitableFor: ['All skin tones', 'Daily commute', 'Lightweight finish'],
    budgetTier: 'balanced',
    shortDescription:
      'Ultra-fluid daily UV shield that blends cleanly across skin tones with zero greasy sheen.',
    fullDescription:
      'Engineered to feel like a breathable lotion rather than heavy sunscreen. Settles into a natural velvet finish within 45 seconds for effortless morning consistency.',
    imageUrl: productSkincareLuxury,
    retailerLabel: 'View at Partner Retailer',
  },
  {
    id: 'prod-clay-kaolin',
    brand: 'Atelier Noir',
    title: 'Kaolin & Charcoal Matte Sculpting Clay',
    category: 'Haircare',
    priceINR: 920,
    priceUSD: 24,
    routineStepMatch: 'AM Hair · Shape & Hold',
    keyBenefits: ['True Matte Finish', 'Pliable Medium Hold', 'Water-Soluble'],
    suitableFor: ['Short to medium cuts', 'Wavy & straight hair', '5-minute morning prep'],
    budgetTier: 'balanced',
    shortDescription:
      'Dry-touch mineral clay delivering effortless crown separation and reworkable natural hold.',
    fullDescription:
      'Blends refined kaolin clay with lightweight botanical wax to define natural texture without stiffness or shine. Rinses cleanly in warm water without buildup.',
    imageUrl: productHairGroomingLuxury,
    retailerLabel: 'View at Partner Retailer',
  },
  {
    id: 'prod-mist-mineral',
    brand: 'Kuro & Salt',
    title: 'Botanical Sea-Mineral Wave Mist',
    category: 'Haircare',
    priceINR: 680,
    priceUSD: 18,
    routineStepMatch: 'AM Hair · Refresh',
    keyBenefits: ['Natural Wave Grip', 'Aloe Hydrating Base', 'Zero Heat Needed'],
    suitableFor: ['Air-dried wavy hair', 'Medium & long layers', 'Heat-free styling'],
    budgetTier: 'essential',
    shortDescription:
      'Fine-mist mineral spray that encourages natural S-wave separation with soft movement.',
    fullDescription:
      'Enriched with aloe leaf juice and sea kelp extract so hair gains airy volume and texture without feeling dry. Built specifically for quick air-dry routines.',
    imageUrl: productHairGroomingLuxury,
    retailerLabel: 'View at Partner Retailer',
  },
  {
    id: 'prod-shampoo-scalp',
    brand: 'Maison Terrene',
    title: 'Oat Amino & Rosemary Scalp Wash',
    category: 'Haircare',
    priceINR: 650,
    priceUSD: 16,
    routineStepMatch: 'Wash Days · Cleanse',
    keyBenefits: ['Sulfate-Free', 'Calms Scalp', 'Soft Bounce'],
    suitableFor: ['2–3x weekly washes', 'Straight, wavy & curly hair', 'Sensitive scalps'],
    budgetTier: 'essential',
    shortDescription:
      'Low-lather clarifying cleanser that lifts styling residue while keeping hair strands supple.',
    fullDescription:
      'Formulated without SLS or heavy silicones to leave roots airy and mid-lengths naturally soft.',
    imageUrl: productHairGroomingLuxury,
    retailerLabel: 'View at Partner Retailer',
  },
  {
    id: 'prod-leavein-silk',
    brand: 'Maison Terrene',
    title: 'Weightless Camellia Leave-In Veil',
    category: 'Haircare',
    priceINR: 1180,
    priceUSD: 28,
    routineStepMatch: 'Post-Wash · Condition',
    keyBenefits: ['Frizz Control', 'Micro-Mist Detangler', 'Heat-Free Polish'],
    suitableFor: ['Medium to long lengths', 'Wavy, curly & coily hair', 'Dry ends'],
    budgetTier: 'elevated',
    shortDescription:
      'Feather-light conditioning mist that smooths flyaways and enhances natural softness.',
    fullDescription:
      'Cold-pressed camellia oil suspended in an aqueous conditioning mist smooths dry ends without flattening crown volume.',
    imageUrl: productSkincareLuxury,
    retailerLabel: 'View at Partner Retailer',
  },
  {
    id: 'prod-beard-elixir',
    brand: 'Atelier Noir',
    title: 'Golden Jojoba & Cedar Conditioning Oil',
    category: 'Grooming Tools',
    priceINR: 890,
    priceUSD: 22,
    routineStepMatch: 'AM / PM · Soften & Finish',
    keyBenefits: ['Fast-Absorbing', 'Softens Coarse Stubble', 'Lightweight Botanical Oil'],
    suitableFor: ['Stubble & beards', 'Dry skin beneath facial hair', 'Daily tidying'],
    budgetTier: 'balanced',
    shortDescription:
      'Dry-finish botanical oil that conditions facial hair and softens skin underneath without shine.',
    fullDescription:
      'Cold-pressed golden jojoba and squalane soften coarse facial hair quickly. Two to three drops warmed between palms keep skin calm and flake-free.',
    imageUrl: productHairGroomingLuxury,
    retailerLabel: 'View at Partner Retailer',
  },
  {
    id: 'prod-sandalwood-comb',
    brand: 'Kuro & Salt',
    title: 'Hand-Finished Sandalwood Wide-Tooth Comb',
    category: 'Grooming Tools',
    priceINR: 620,
    priceUSD: 16,
    routineStepMatch: 'Post-Wash · Anti-Static Detangle',
    keyBenefits: ['Zero Static', 'Seamless Polished Teeth', 'Preserves Wave Pattern'],
    suitableFor: ['Wavy, curly & coily hair', 'Gentle wet detangling', 'All hair lengths'],
    budgetTier: 'essential',
    shortDescription:
      'Smooth natural wood wide-tooth comb engineered to glide through conditioned strands without snagging.',
    fullDescription:
      'Crafted from sustainably sourced sandalwood with rounded tooth tips to protect scalp comfort and reduce breakage while preserving natural curl and wave clumping.',
    imageUrl: productHairGroomingLuxury,
    retailerLabel: 'View at Partner Retailer',
  },
  {
    id: 'prod-precision-detailer',
    brand: 'Atelier Noir',
    title: 'Precision Matte-Steel Brow & Contour Trimmer',
    category: 'Grooming Tools',
    priceINR: 1390,
    priceUSD: 34,
    routineStepMatch: '2x Weekly · Neckline & Brow Detail',
    keyBenefits: ['Skin-Safe Micro Blades', 'USB-C Rechargeable', 'Dual Comb Guards'],
    suitableFor: ['Neckline & cheek-line tidying', 'Brow shaping', 'Travel-ready grooming'],
    budgetTier: 'balanced',
    shortDescription:
      'Balanced matte-obsidian precision trimmer for crisp beard contours, sideburns, and effortless brow maintenance.',
    fullDescription:
      'Engineered with skin-friendly rounded stainless micro-blades and precision length guards so anyone can maintain sharp, natural edges in under three minutes.',
    imageUrl: productHairGroomingLuxury,
    retailerLabel: 'View at Partner Retailer',
  },
];

// ============================================================================
// Informational page copy (Home, Features, How It Works, About)
// ============================================================================

export const HOME_HOW_IT_WORKS_STEPS = [
  {
    number: '01',
    title: 'Upload your photo',
    description:
      'Capture or drop a front-facing portrait and hair detail photo with built-in framing guidance—processed privately in memory.',
  },
  {
    number: '02',
    title: 'Tell us your preferences',
    description:
      'Share your styling focus, hair length, skin feel, daily routine window, and monthly budget in three quick steps.',
  },
  {
    number: '03',
    title: 'Get your analysis',
    description:
      'Review your face geometry ratios, secondary contour tendencies, hair texture, and calm cosmetic skin observations.',
  },
  {
    number: '04',
    title: 'Explore recommendations',
    description:
      'Unlock tailored hairstyles, eyewear balance, AM/PM routines, and budget-matched grooming essentials.',
  },
];

export const HOME_SAMPLE_RESULT_BULLETS = [
  'Every insight comes with a clear, plain-language explanation.',
  'Adjust daily time, maintenance level, and budget live at any time.',
  'Cosmetic styling intelligence designed equally for men and women.',
];

export const FEATURE_FACE_SHAPE_ICONS: { name: string; path: string }[] = [
  {
    name: 'Oval',
    path: 'M22 6C14.8 6 10 12.2 10 22C10 31.8 14.8 38 22 38C29.2 38 34 31.8 34 22C34 12.2 29.2 6 22 6Z',
  },
  {
    name: 'Round',
    path: 'M22 8C13.8 8 8 14 8 22C8 30 13.8 36 22 36C30.2 36 36 30 36 22C36 14 30.2 8 22 8Z',
  },
  {
    name: 'Square',
    path: 'M13 8H31C33.2 8 34.5 9.8 34.5 12.2V30.8C34.5 34 32 36 28.5 36.5L22 37.2L15.5 36.5C12 36 9.5 34 9.5 30.8V12.2C9.5 9.8 10.8 8 13 8Z',
  },
  {
    name: 'Oblong',
    path: 'M22 4.5C15.8 4.5 12 9.4 12 16.5V27.5C12 34.6 15.8 39.5 22 39.5C28.2 39.5 32 34.6 32 27.5V16.5C32 9.4 28.2 4.5 22 4.5Z',
  },
  {
    name: 'Heart',
    path: 'M22 7C14 7 9.5 11.4 9.5 17.5C9.5 24.5 15.2 33.4 22 37.5C28.8 33.4 34.5 24.5 34.5 17.5C34.5 11.4 30 7 22 7Z',
  },
  {
    name: 'Diamond',
    path: 'M22 6C17.2 6 13.5 10.2 12 15.5L9 22L12 28.5C14.2 33.4 18 37.2 22 38C26 37.2 29.8 33.4 32 28.5L35 22L32 15.5C30.5 10.2 26.8 6 22 6Z',
  },
];

export const FEATURE_HAIR_WAVE_ICONS: { name: string; path: string }[] = [
  { name: 'Straight', path: 'M20 5V39' },
  { name: 'Wavy', path: 'M20 5C25.5 10.5 14.5 16.5 20 22C25.5 27.5 14.5 33.5 20 39' },
  { name: 'Curly', path: 'M20 5C26 8 26 14 20 16.5C14 19 14 25 20 27.5C26 30 26 36 20 39' },
  {
    name: 'Coily',
    path: 'M20 5C25 5.6 25 10 20 10.8C15 11.6 15 16 20 16.8C25 17.6 25 22 20 22.8C15 23.6 15 28 20 28.8C25 29.6 25 34 20 34.8C15.5 35.5 16 38.5 20 39',
  },
];

export const FEATURE_NOT_DONE_LIST = [
  'Does not assess, identify, or treat medical skin or hair conditions.',
  'Does not rate attractiveness or assign appearance scores.',
  'Does not recognize people or build identity profiles.',
  'Does not guarantee styling or product outcomes.',
  'Does not replace a doctor, dermatologist, or professional stylist.',
];

export const HOW_IT_WORKS_TIMELINE = [
  {
    number: '01',
    title: 'Set your preferences & goals',
    description:
      'Choose your styling filter, grooming goals, hair length, skin feel, daily routine window, and monthly budget in three quick steps.',
    youDo: 'Select the options that match your lifestyle and routine comfort.',
    weDo: 'Calibrate recommendation weights and routine length around your real schedule.',
  },
  {
    number: '02',
    title: 'Review privacy & upload portraits',
    description:
      'Confirm session privacy and upload a front-facing face portrait and hair texture photo—or test immediately with a studio portrait.',
    youDo: 'Upload JPG, PNG, or WebP photos (or load a sample studio portrait).',
    weDo: 'Validate framing and keep image buffers strictly in temporary session memory.',
  },
  {
    number: '03',
    title: 'Biometric proportion & texture scan',
    description:
      'ALLURE maps key facial ratios, identifies secondary contour tendencies, and evaluates hair strand pattern alongside cosmetic surface cues.',
    youDo: 'Review your results and confirm or refine any estimate in one click.',
    weDo: 'Flag low-confidence lighting transparently rather than forcing a rigid label.',
  },
  {
    number: '04',
    title: 'Explore tailored styles & routines',
    description:
      'Browse hairstyles matched to your face geometry and hair texture, AM/PM care steps fitted to your time window, and eyewear proportion guidance.',
    youDo: 'Adjust maintenance level or budget filters live to refine your blueprint.',
    weDo: 'Attach clear "Why This Fits You" rationales to every recommendation.',
  },
  {
    number: '05',
    title: 'Discover & compare matched products',
    description:
      'Filter curated skincare, haircare, and grooming tools by category and budget, and compare up to three items side by side.',
    youDo: 'Compare active benefits, suitability, and pricing across shortlisted picks.',
    weDo: 'Highlight how each product connects directly to your AM/PM routine steps.',
  },
  {
    number: '06',
    title: 'Ask the ALLURE Chatbot anytime',
    description:
      'Open the floating ALLURE Chatbot on any page to ask questions about your face ratios, hairstyles, routine steps, or budget picks.',
    youDo: 'Tap a quick prompt or ask your own grooming question.',
    weDo: 'Answer using your live profile and active analysis—never storing your photos.',
  },
];

export const PHOTO_TIPS_DO = [
  'Front-facing posture looking straight at the lens',
  'Even daylight or soft, balanced indoor lighting',
  'Hair pulled back off the face for face analysis',
  'No camera filters or beauty retouching',
  'A plain, uncluttered background',
];

export const PHOTO_TIPS_AVOID = [
  'Heavy camera filters or wide-angle lens distortion',
  'Sunglasses, hats, or face masks covering key features',
  'Strong overhead or harsh side shadows',
  'Tilted head or extreme profile angles',
  'Group photos with multiple faces in frame',
];

export const PLANNED_ARCHITECTURE_NODES = [
  { step: '01', label: 'Photo', detail: 'In-session input' },
  { step: '02', label: 'Quality check', detail: 'Lighting & framing' },
  { step: '03', label: 'Face landmarks', detail: 'Key contour points' },
  { step: '04', label: 'Measurements', detail: 'Length & width ratios' },
  { step: '05', label: 'Classifier', detail: 'Top shape candidates' },
  { step: '06', label: 'Explainable report', detail: 'Plain-language guide' },
];

export const HOW_IT_WORKS_FAQ = [
  {
    question: 'Is my photo saved?',
    answer:
      'No. Photos stay strictly in temporary session memory for your active analysis. They are never saved to history, never shared or sold, and never used for external model training.',
  },
  {
    question: 'Is this a medical tool?',
    answer:
      'No. ALLURE provides everyday grooming ideas and cosmetic surface observations only. It never assesses, identifies, or treats medical skin or hair conditions, and it does not replace a doctor, dermatologist, or professional stylist.',
  },
  {
    question: 'Why does ALLURE combine photos with a short questionnaire?',
    answer:
      'A photograph can reveal visible geometry and strand pattern, but it cannot know your personal goals, daily routine time, monthly budget, or ingredient sensitivities. Combining both produces realistic plans you can actually maintain.',
  },
  {
    question: 'Can I analyse only my face or only my hair?',
    answer:
      'Yes. On the Analysis page, you can choose Face only, Hair only, or Face + Hair. Every recommendation adapts to your chosen focus, and you can add the missing photo anytime.',
  },
  {
    question: 'How does ALLURE choose product matches?',
    answer:
      'Products are filtered against your routine steps, skin feel, sensitivities, and monthly budget tier so every pick aligns directly with your morning and evening plan.',
  },
  {
    question: 'How does ALLURE handle low-light or borderline photos?',
    answer:
      'When shadows, camera angles, or overlapping contours lower confidence, ALLURE surfaces an Uncertain / re-capture guide rather than guessing, and lets you confirm or refine any estimate directly.',
  },
];

export const ABOUT_DEMO_TECH = ['React 18', 'TypeScript', 'Tailwind CSS'];

export const ABOUT_PLANNED_TECH = [
  'Python',
  'FastAPI',
  'MediaPipe',
  'Geometric Proportion Engine',
  'Hair Texture Classifier',
];

export const ABOUT_ROADMAP_ITEMS: {
  milestone: string;
  summary: string;
  status: RoadmapStatus;
}[] = [
  {
    milestone: 'Interactive Web Platform',
    summary:
      'Complete multi-page Dark Luxury experience with onboarding, biometric scan flow, personalized recommendations, product comparison, and ALLURE Chatbot.',
    status: 'Done',
  },
  {
    milestone: 'Face Geometry Pipeline',
    summary:
      'Landmark-based proportion extraction and interpretable classification with secondary contour tendency reporting.',
    status: 'In progress',
  },
  {
    milestone: 'FastAPI Service Integration',
    summary:
      'Stateless Python FastAPI REST endpoints (/api/v1/upload, /analyses, /recommendations, /products) for in-memory processing.',
    status: 'In progress',
  },
  {
    milestone: 'Hair-Texture Classifier',
    summary:
      'Fine-grained classification across straight, wavy, curly, and coily strand patterns with transparent re-capture fallbacks.',
    status: 'Planned',
  },
  {
    milestone: 'Expanded Retailer Feeds',
    summary:
      'Direct regional partner integrations with verified ingredient breakdowns and real-time availability.',
    status: 'Planned',
  },
  {
    milestone: 'Cosmetic Surface Cue Refinement',
    summary:
      'Lighting-calibrated visual surface cues for shine and hydration comfort, strictly non-diagnostic.',
    status: 'Only if suitable data exists',
  },
  {
    milestone: 'Stylist & Salon Discovery',
    summary:
      'Optional directory helping users connect with local stylists who specialize in their hair texture and cut goals.',
    status: 'Later',
  },
];

export const ABOUT_LIMITATIONS = [
  'Face shapes and hair types are descriptive appearance categories that naturally overlap rather than rigid boxes.',
  'Visual estimates depend on photo quality, even lighting, camera lens distance, and clear framing.',
  'ALLURE provides everyday grooming and cosmetic guidance only and does not offer medical diagnosis or clinical advice.',
];

// ============================================================================
// ALLURE Chatbot Static Copy & Reference Tables
// ============================================================================

export const ASSISTANT_SUGGESTIONS_WITH_RESULTS: string[] = [
  'Which hairstyles suit an Oval-Diamond face?',
  'Build a 5-minute morning routine',
  'Best products under ₹1,500',
  'Why this face shape?',
  "What does 'uncertain' mean?",
];

export const ASSISTANT_SUGGESTIONS_WITHOUT_RESULTS: string[] = [
  'Which hairstyles suit an Oval-Diamond face?',
  'Build a 5-minute morning routine',
  'Best products under ₹1,500',
  'Is my photo saved?',
];

export const ANALYSIS_MODE_LABELS: Record<'face' | 'hair' | 'both', string> = {
  face: 'Face only',
  hair: 'Hair only',
  both: 'Face + Hair',
};

export const FACE_SHAPE_EXPLANATIONS: Record<FaceShapeOption, string> = {
  Oval: 'An Oval outline has gently balanced vertical length relative to cheekbone width, with softly tapered forehead and jawlines—so most balanced cuts and medium-width frames work effortlessly.',
  Round: 'A Round outline has similar vertical length and cheekbone width with softer chin curves, so light crown volume and angled parting add clean vertical definition.',
  Square: 'A Square outline features strong, aligned forehead, cheekbone, and jawline widths; textured layers and softened edges balance crisp angles naturally.',
  Oblong: 'An Oblong outline is noticeably longer than it is wide with even side lines, so mid-level width, soft fringe, or side movement keep proportions visually balanced.',
  Heart: 'A Heart outline is slightly wider across the forehead and cheekbones with a narrower chin; softer jaw-level texture and gentle fringes harmonize the upper and lower thirds.',
  Diamond: 'A Diamond outline has prominent cheekbones with a narrower forehead and chin, so light volume at the temples and soft jaw-level movement frame those angles cleanly.',
};

export const ASSISTANT_PHOTO_TIPS: string[] = [
  'Face diffuse natural light (such as a window) so both sides of your face are evenly lit without harsh shadows.',
  'Hold the camera at eye level about an arm’s length away with a neutral expression and level chin.',
  'Pull hair slightly back from your forehead and hairline for the face photo so facial landmarks stay unobstructed.',
  'For the hair photo, capture dry, unstyled strands in clear light from the front or side so your natural wave, curl, or coil pattern is visible.',
];


