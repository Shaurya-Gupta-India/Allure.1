export type SilhouetteVariant =
  | 'shaved-fade'
  | 'short-crop'
  | 'short-taper-curl'
  | 'short-side-swept'
  | 'short-bob'
  | 'short-coil'
  | 'medium-curtain'
  | 'medium-flow'
  | 'medium-lob'
  | 'medium-curl-halo'
  | 'medium-shag'
  | 'long-fringe-layers'
  | 'long-waves'
  | 'long-protective';

export type AnalysisMode = 'face' | 'hair' | 'both';

export type FaceShapeOption =
  | 'Oval'
  | 'Round'
  | 'Square'
  | 'Oblong'
  | 'Heart'
  | 'Diamond';

export type HairTextureOption = 'Straight' | 'Wavy' | 'Curly' | 'Coily';

export type SelfReportedHairTexture = HairTextureOption | 'not-sure' | 'other';

export type MaintenanceLevel = 'Low' | 'Moderate' | 'Detailed';

export type GroomingGoal =
  | 'hairstyle-refresh'
  | 'facial-grooming'
  | 'skincare-routine'
  | 'low-maintenance'
  | 'product-clarity'
  | 'other';

export type HairLength = 'short' | 'medium' | 'long' | 'shaved' | 'other';

export type HairStylingHabit =
  | 'air-dry'
  | 'quick-product'
  | 'heat-styled'
  | 'protective-low-touch'
  | 'other';

export type StylePreferenceFilter = 'all' | 'mens' | 'womens';

export type SkinFeelOption =
  | 'oily'
  | 'dry'
  | 'combination'
  | 'normal'
  | 'sensitive'
  | 'not-sure'
  | 'other';

export type DailyRoutineTime = '5-min' | '10-min' | '20-plus-min' | 'custom';

export type FacialHairPreference =
  | 'skip'
  | 'clean-shaven'
  | 'light-stubble'
  | 'trimmed-beard'
  | 'full-beard'
  | 'other';

export type BudgetTier = 'essential' | 'balanced' | 'elevated';

export type CurrencyCode = 'INR' | 'USD';

export type SampleProfileType = 'sample-a' | 'sample-b';

export type StatusChipTone = 'demo' | 'progress' | 'planned' | 'conditional' | 'later';

export type RoadmapStatus =
  | 'Done'
  | 'In progress'
  | 'Planned'
  | 'Only if suitable data exists'
  | 'Later';

export interface CustomOtherAnswers {
  goals: string;
  hairLength: string;
  hairStylingHabit: string;
  selfReportedHairTexture: string;
  facialHairPreference: string;
  skinFeel: string;
  skinSensitivities: string;
  avoidItems: string;
}

export interface SkinObservationItem {
  zone: string;
  observation: string;
  cosmeticTip: string;
}

export interface PhotoAnalysisResponse {
  analysisId: string;
  analysisMode: AnalysisMode;
  generatedAt: string;
  faceShape?: FaceShapeOption | 'Unable to assess';
  secondaryTendency?: string;
  hairTexture?: HairTextureOption | 'Unable to assess';
  skinObservations?: SkinObservationItem[];
  quality: 'good' | 'low-confidence';
  qualityMessage?: string;
  modelVersion: string;
  sampleProfileUsed?: SampleProfileType;
  userConfirmed?: {
    face: boolean;
    hair: boolean;
    skin: boolean;
  };
  userChanged?: {
    face: boolean;
    hair: boolean;
    skin: boolean;
  };
}

export interface UserPreferences {
  stylePreference: StylePreferenceFilter;
  goals: GroomingGoal[];
  hairLength: HairLength;
  hairStylingHabit: HairStylingHabit;
  /** Optional self-reported hair texture collected when analysisMode === 'face' */
  selfReportedHairTexture?: SelfReportedHairTexture;
  skinFeel: SkinFeelOption;
  skinSensitivities: string[];
  allergyNote: string;
  dailyTime: DailyRoutineTime;
  /** Numeric minutes per day (1–120) when dailyTime === 'custom' */
  customDailyMinutes?: number;
  monthlyBudgetINR: number;
  budgetTier: BudgetTier;
  useCustomBudget?: boolean;
  currency: CurrencyCode;
  avoidItems: string[];
  facialHairPreference: FacialHairPreference;
  customOther: CustomOtherAnswers;
  completedAt?: string;
}

export interface UploadedPhoto {
  objectUrl: string;
  fileName: string;
  fileSizeBytes: number;
  isSample?: boolean;
  sampleProfile?: SampleProfileType;
}

export interface GeometryScoreMetric {
  label: string;
  valueLabel: string;
  normalizedScore: number;
  note: string;
}

export interface MentionedNoteItem {
  category: string;
  text: string;
}

export interface GroomingReport {
  analysisId: string;
  analysisMode: AnalysisMode;
  modelVersion: string;
  faceSection?: {
    primaryShape: FaceShapeOption | 'Uncertain';
    secondaryTendency?: string;
    isUncertain: boolean;
    uncertainMessage: string;
    explanation: string;
    whyRecommended: string;
    metrics: GeometryScoreMetric[];
  };
  hairSection?: {
    texture: string;
    lengthLabel: string;
    stylingLabel: string;
    summary: string;
    whyRecommended: string;
    notes: string[];
  };
  skinSection?: {
    selfReportedFeel: string;
    sensitivitiesSummary: string;
    observations: SkinObservationItem[];
    whyRecommended: string;
    disclaimer: string;
  };
  constraintsSection: {
    goalsList: string[];
    dailyTimeLabel: string;
    budgetLabel: string;
    sensitivitiesLabel: string;
    avoidList: string[];
    facialHairLabel: string;
    selfReportedTextureLabel?: string;
    youAlsoMentioned: MentionedNoteItem[];
    whyRecommended: string;
  };
}

export interface HairstyleCatalogEntry {
  id: string;
  name: string;
  description: string;
  compatibleFaceShapes: FaceShapeOption[];
  compatibleTextures: HairTextureOption[];
  lengthCategory: Exclude<HairLength, 'other'>;
  maintenanceLevel: MaintenanceLevel;
  stylingTimeMinutes: number;
  tags: string[];
  /** Describes cut/length, parting/fringe, and volume placement */
  placementGuidance: string;
  /** Gender-neutral inline SVG silhouette variant */
  silhouetteVariant: SilhouetteVariant;
}

export interface HairstyleSuggestion {
  id: string;
  name: string;
  category: 'Hairstyle' | 'Facial Hair' | 'Styling Finish';
  maintenanceTime: string;
  stylingTimeMinutes: number;
  maintenanceLevel: MaintenanceLevel;
  lengthCategory: Exclude<HairLength, 'other'>;
  suitableLength: string;
  compatibleTextures: HairTextureOption[];
  placementGuidance: string;
  whySuitsFaceShape?: string;
  whyRecommended: string;
  bestWithTexture: string;
  description: string;
  tags: string[];
  fitScore: number;
  silhouetteVariant: SilhouetteVariant;
}

export interface EyewearTip {
  faceShape: string;
  recommendedFrames: string;
  proportionNote: string;
  whyRecommended: string;
}

export interface HairOnlyCareGuidance {
  texture: string;
  washFrequency: string;
  productTypes: string[];
  stylingTips: string[];
  whyRecommended: string;
}

export interface FacialHairGuidance {
  title: string;
  preferenceLabel: string;
  maintenanceTime: string;
  description: string;
  whyRecommended: string;
}

export interface RoutineStep {
  stepNumber: string;
  title: string;
  category: string;
  instruction: string;
  frequency: string;
  note: string;
}

export interface RecommendationsPayload {
  analysisId: string;
  analysisMode: AnalysisMode;
  styles: HairstyleSuggestion[];
  eyewearTip?: EyewearTip;
  facialHairGuidance?: FacialHairGuidance;
  hairOnlyCare?: HairOnlyCareGuidance;
  morningRoutine: RoutineStep[];
  eveningRoutine: RoutineStep[];
  activeSummary: {
    budgetLabel: string;
    maintenanceLabel: string;
    avoidCount: number;
  };
}

export type ProductCategory = 'Haircare' | 'Skincare' | 'Grooming Tools';

export interface ProductItem {
  id: string;
  brand: string;
  title: string;
  category: ProductCategory;
  priceINR: number;
  priceUSD: number;
  routineStepMatch: string;
  keyBenefits: string[];
  suitableFor: string[];
  budgetTier: BudgetTier;
  shortDescription: string;
  fullDescription: string;
  imageUrl: string;
  retailerLabel: string;
}

export interface ProductFilterParams {
  search?: string;
  category?: ProductCategory | 'All';
  maxPriceINR?: number;
  sortBy?: 'recommended' | 'price-asc' | 'price-desc';
}

// ============================================================================
// Assistant Types (Structured results only — never includes photo data)
// ============================================================================

export interface AssistantRecommendationItem {
  id: string;
  name: string;
  whyRecommended: string;
  whySuitsFaceShape?: string;
  bestWithTexture: string;
  maintenanceTime: string;
  maintenanceLevel: MaintenanceLevel;
  placementGuidance: string;
  tags: string[];
}

export interface AssistantContext {
  hasAnalysis: boolean;
  analysisId?: string;
  analysisMode?: AnalysisMode;
  faceShape?: FaceShapeOption | 'Unable to assess';
  secondaryTendency?: string;
  isUncertainFace?: boolean;
  faceMetrics?: GeometryScoreMetric[];
  faceWhyRecommended?: string;
  hairTexture?: HairTextureOption | 'Unable to assess';
  hairWhyRecommended?: string;
  skinObservations?: SkinObservationItem[];
  questionnaireAnswers: UserPreferences;
  youAlsoMentioned: MentionedNoteItem[];
  dailyTimeLabel: string;
  dailyMinutes: number;
  budgetLabel: string;
  budgetTier: BudgetTier;
  topRecommendations: AssistantRecommendationItem[];
  eyewearTip?: EyewearTip;
  facialHairGuidance?: FacialHairGuidance;
  hairOnlyCare?: HairOnlyCareGuidance;
  morningRoutine: RoutineStep[];
  eveningRoutine: RoutineStep[];
  modelVersion?: string;
}

export interface AssistantReply {
  text: string;
  suggestions?: string[];
  sources?: string[];
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  suggestions?: string[];
  sources?: string[];
  ctaLabel?: string;
  ctaTo?: string;
  createdAt: string;
}

export interface AnalysisUpdateEvent {
  eventId: number;
  analysisId: string;
  mode: AnalysisMode;
  summaryMessage: string;
}

// ============================================================================
// History Types (Persisted to localStorage — never includes photo data)
// ============================================================================

export interface HistoryRecommendationSummary {
  id: string;
  name: string;
  whyRecommended: string;
  maintenanceTime?: string;
}

export interface HistoryRoutineSummary {
  morningCount: number;
  eveningCount: number;
  morningSteps: string[];
  eveningSteps: string[];
  dailyTimeLabel: string;
}

export interface HistoryEntry {
  id: string;
  createdAt: string;
  analysisMode: AnalysisMode;
  faceShape?: FaceShapeOption | 'Unable to assess';
  secondaryTendency?: string;
  hairTexture?: HairTextureOption | 'Unable to assess';
  skinObservations?: SkinObservationItem[];
  questionnaireAnswers: UserPreferences;
  topRecommendations: HistoryRecommendationSummary[];
  routineSummary: HistoryRoutineSummary;
  budgetTier: BudgetTier;
  modelVersion: string;
  quality?: 'good' | 'low-confidence';
  qualityMessage?: string;
  userConfirmed?: {
    face: boolean;
    hair: boolean;
    skin: boolean;
  };
  userChanged?: {
    face: boolean;
    hair: boolean;
    skin: boolean;
  };
}

