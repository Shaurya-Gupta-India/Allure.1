import {
  ANALYSIS_MODE_LABELS,
  ASSISTANT_PHOTO_TIPS,
  ASSISTANT_SUGGESTIONS_WITHOUT_RESULTS,
  ASSISTANT_SUGGESTIONS_WITH_RESULTS,
  CURATED_PRODUCTS,
  DEFAULT_PREFERENCES,
  EMPTY_CUSTOM_OTHER,
  EYEWEAR_TIPS_BY_SHAPE,
  FACE_METRICS_BY_SHAPE,
  FACE_PLACEMENT_REASONS,
  FACE_SHAPE_EXPLANATIONS,
  FACIAL_HAIR_LABELS,
  GOAL_LABELS,
  HABIT_LABELS,
  HAIR_ONLY_CARE_BY_TEXTURE,
  HAIRSTYLE_CATALOG,
  LENGTH_LABELS,
  MAX_OTHER_TEXT_LENGTH,
  SKIN_FEEL_LABELS,
  SKIN_OBSERVATION_PRESETS,
  STYLE_PREFERENCE_LABELS,
} from './data';
import {
  AnalysisMode,
  AssistantContext,
  AssistantReply,
  BudgetTier,
  CurrencyCode,
  EyewearTip,
  FaceShapeOption,
  FacialHairGuidance,
  GroomingReport,
  HairOnlyCareGuidance,
  HairTextureOption,
  HairstyleSuggestion,
  HistoryEntry,
  MaintenanceLevel,
  MentionedNoteItem,
  PhotoAnalysisResponse,
  ProductFilterParams,
  ProductItem,
  RecommendationsPayload,
  RoutineStep,
  SampleProfileType,
  UserPreferences,
} from './types';

/**
 * ALLURE FastAPI-compatible client service layer.
 * Matches REST contract:
 *  - POST /api/v1/upload
 *  - POST /api/v1/analyses
 *  - POST /api/v1/recommendations
 *  - GET  /api/v1/products
 *  - POST /api/v1/concierge
 * Executes cleanly standalone in the browser with automatic local fallback when
 * no external FastAPI server is configured.
 */
export const API_BASE_URL =
  (import.meta.env?.VITE_ALLURE_API_URL as string | undefined) || '/api/v1';

const ENABLE_REMOTE_BACKEND = Boolean(import.meta.env?.VITE_ALLURE_API_URL);

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function hasAssessedFaceShape(
  shape?: FaceShapeOption | 'Unable to assess' | null
): shape is FaceShapeOption {
  return Boolean(shape && shape !== 'Unable to assess');
}

export function hasAssessedHairTexture(
  texture?: HairTextureOption | 'Unable to assess' | null
): texture is HairTextureOption {
  return Boolean(texture && texture !== 'Unable to assess');
}

export function sanitizeLiveInput(
  raw: string,
  maxLength = MAX_OTHER_TEXT_LENGTH
): string {
  return raw.replace(/[\u0000-\u001F\u007F<>]/g, '').slice(0, maxLength);
}

export function sanitizeFreeText(
  raw?: string | null,
  maxLength = MAX_OTHER_TEXT_LENGTH
): string {
  if (!raw) return '';
  return raw
    .replace(/[\u0000-\u001F\u007F<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

export function resolveDailyMinutes(preferences: UserPreferences): number {
  if (preferences.dailyTime === '5-min') return 5;
  if (preferences.dailyTime === '10-min') return 10;
  if (preferences.dailyTime === '20-plus-min') return 25;
  const custom = preferences.customDailyMinutes;
  if (typeof custom === 'number' && Number.isFinite(custom)) {
    return Math.min(120, Math.max(1, Math.round(custom)));
  }
  return 10;
}

export function formatDailyTimeLabel(preferences: UserPreferences): string {
  if (preferences.dailyTime === '5-min') return '5 minutes / day';
  if (preferences.dailyTime === '10-min') return '10 minutes / day';
  if (preferences.dailyTime === '20-plus-min') return '20+ minutes / day';
  const mins = resolveDailyMinutes(preferences);
  return `${mins} ${mins === 1 ? 'minute' : 'minutes'} / day`;
}

export function formatDailyTimeShort(preferences: UserPreferences): string {
  if (preferences.dailyTime === '5-min') return '5 min';
  if (preferences.dailyTime === '10-min') return '10 min';
  if (preferences.dailyTime === '20-plus-min') return '20+ min';
  return `${resolveDailyMinutes(preferences)} min`;
}

export function collectMentionedNotes(preferences: UserPreferences): MentionedNoteItem[] {
  const notes: MentionedNoteItem[] = [];
  const other = preferences.customOther ?? EMPTY_CUSTOM_OTHER;

  const pushIfActive = (active: boolean, category: string, raw?: string) => {
    if (!active) return;
    const clean = sanitizeFreeText(raw);
    if (clean) {
      notes.push({ category, text: clean });
    }
  };

  pushIfActive(preferences.goals.includes('other'), 'Main goal', other.goals);
  pushIfActive(
    preferences.selfReportedHairTexture === 'other',
    'Hair texture note',
    other.selfReportedHairTexture
  );
  pushIfActive(preferences.hairLength === 'other', 'Hair length', other.hairLength);
  pushIfActive(
    preferences.hairStylingHabit === 'other',
    'Styling habit',
    other.hairStylingHabit
  );
  pushIfActive(
    preferences.facialHairPreference === 'other',
    'Facial hair preference',
    other.facialHairPreference
  );
  pushIfActive(preferences.skinFeel === 'other', 'Skin feel', other.skinFeel);
  pushIfActive(
    preferences.skinSensitivities.includes('Other'),
    'Sensitivity preference',
    other.skinSensitivities
  );
  pushIfActive(
    preferences.avoidItems.includes('Other'),
    'Avoid preference',
    other.avoidItems
  );

  const allergyClean = sanitizeFreeText(preferences.allergyNote);
  if (allergyClean) {
    notes.push({ category: 'Ingredient comfort note', text: allergyClean });
  }

  return notes;
}

export function formatSamplePrice(
  priceINR: number,
  priceUSD: number,
  currency: CurrencyCode
): string {
  return currency === 'USD' ? `$${priceUSD}` : `₹${priceINR.toLocaleString('en-IN')}`;
}

export function deriveBudgetTier(monthlyBudgetINR: number): BudgetTier {
  if (monthlyBudgetINR <= 1000) return 'essential';
  if (monthlyBudgetINR <= 2500) return 'balanced';
  return 'elevated';
}

/**
 * POST /api/v1/upload — Validates and stages an in-memory portrait asset.
 */
// Holds the most recently uploaded/captured photo in session memory
let stagedFiles: { face?: File; hair?: File } = {};

function mapFaceShapeFromCode(code?: string): FaceShapeOption | 'Unable to assess' {
  const map: Record<string, FaceShapeOption> = {
    face_shape_oval: 'Oval',
    face_shape_round: 'Round',
    face_shape_square: 'Square',
    face_shape_oblong: 'Oblong',
    face_shape_heart: 'Heart',
    face_shape_diamond: 'Diamond',
  };
  return (code && map[code]) || 'Unable to assess';
}

function mapHairTextureFromCode(code?: string): HairTextureOption | 'Unable to assess' {
  const map: Record<string, HairTextureOption> = {
    hair_texture_straight: 'Straight',
    hair_texture_wavy: 'Wavy',
    hair_texture_curly: 'Curly',
    hair_texture_kinky: 'Coily',
    hair_texture_dreadlocks: 'Coily',
  };
  return (code && map[code]) || 'Unable to assess';
}

/**
 * Stages the captured/uploaded photo for direct ML backend analysis.
 */
export async function uploadPortraitAsset(
  slot: 'face' | 'hair',
  file: File
): Promise<{ uploadId: string; slot: 'face' | 'hair'; accepted: boolean }> {
  stagedFiles[slot] = file;
  await wait(80);
  return {
    uploadId: `upload-${slot}-${Date.now()}`,
    slot,
    accepted: true,
  };
}

/**
 * POST /api/v1/models/analyze-direct — Runs real Face Shape + Hair Texture ML + Groq LLM.
 */
export async function analyzePhotos(options?: {
  mode?: AnalysisMode;
  hasFacePhoto?: boolean;
  hasHairPhoto?: boolean;
  sampleProfileUsed?: SampleProfileType;
  simulateLowQuality?: boolean;
  existingAnalysis?: PhotoAnalysisResponse | null;
}): Promise<PhotoAnalysisResponse> {
  const mode: AnalysisMode = options?.mode ?? 'both';
  const includeFace = mode === 'face' || mode === 'both';
  const includeHair = mode === 'hair' || mode === 'both';
  const prev = options?.existingAnalysis;

  const fileToSend =
    mode === 'hair'
      ? stagedFiles.hair || stagedFiles.face
      : stagedFiles.face || stagedFiles.hair;

  if (
    ENABLE_REMOTE_BACKEND &&
    fileToSend &&
    !options?.simulateLowQuality &&
    !options?.sampleProfileUsed
  ) {
    try {
      const formData = new FormData();
      formData.append('file', fileToSend, fileToSend.name || 'capture.jpg');

      const res = await fetch(`${API_BASE_URL}/models/analyze-direct`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = (await res.json()) as {
          face_detected: boolean;
          model_version: string;
          findings: Array<{ domain: string; code: string; confidence: number; label?: string }>;
          ai_explanation: string;
        };

        const faceFinding = data.findings.find((f) => f.domain === 'face');
        const hairFinding = data.findings.find((f) => f.domain === 'hair');

        const detectedFace = mapFaceShapeFromCode(faceFinding?.code);
        const detectedHair = mapHairTextureFromCode(hairFinding?.code);

        return {
          analysisId: `allure-${Date.now()}`,
          analysisMode: mode,
          generatedAt: new Date().toISOString(),
          ...(includeFace
            ? {
                faceShape: detectedFace,
                skinObservations: SKIN_OBSERVATION_PRESETS['Mild T-zone shine & subtle uneven tone'],
              }
            : {}),
          ...(includeHair
            ? {
                hairTexture: detectedHair,
              }
            : {}),
          quality: data.face_detected || mode === 'hair' ? 'good' : 'low-confidence',
          qualityMessage: data.ai_explanation || 'Face geometry and hair texture analyzed by ALLURE ML.',
          modelVersion: data.model_version || 'allure-v1-face-hair',
          userConfirmed: { face: false, hair: false, skin: false },
          userChanged: { face: false, hair: false, skin: false },
        };
      }
    } catch (err) {
      console.error('ALLURE backend request failed, falling back locally:', err);
    }
  }

  await wait(240);

  if (options?.simulateLowQuality) {
    return {
      analysisId: `allure-${Date.now()}`,
      analysisMode: mode,
      generatedAt: new Date().toISOString(),
      ...(includeFace
        ? {
            faceShape: 'Unable to assess' as const,
            skinObservations: [],
          }
        : {}),
      ...(includeHair
        ? {
            hairTexture: 'Unable to assess' as const,
          }
        : {}),
      quality: 'low-confidence',
      qualityMessage:
        mode === 'face'
          ? 'Low confidence reading. Lighting, blur, or camera angle made facial landmarks difficult to measure clearly.'
          : mode === 'hair'
          ? 'Low confidence reading. Lighting or camera distance made hair strand texture difficult to assess clearly.'
          : 'Low confidence reading. Lighting, blur, or camera angle made facial landmarks and hair texture difficult to measure clearly.',
      modelVersion: 'allure-v1',
      sampleProfileUsed: options?.sampleProfileUsed,
      userConfirmed: { face: false, hair: false, skin: false },
      userChanged: { face: false, hair: false, skin: false },
    };
  }

  const preserveFace = includeFace && hasAssessedFaceShape(prev?.faceShape);
  const preserveHair = includeHair && hasAssessedHairTexture(prev?.hairTexture);

  const defaultFaceShape: FaceShapeOption = 'Oval';
  const defaultSecondary =
    options?.sampleProfileUsed === 'sample-b'
      ? 'Soft heart tendencies'
      : 'Diamond cheekbones';
  const defaultHairTexture: HairTextureOption = 'Wavy';

  return {
    analysisId: `allure-${Date.now()}`,
    analysisMode: mode,
    generatedAt: new Date().toISOString(),
    ...(includeFace
      ? {
          faceShape: preserveFace ? prev!.faceShape : defaultFaceShape,
          secondaryTendency: preserveFace ? prev!.secondaryTendency : defaultSecondary,
          skinObservations:
            preserveFace && prev?.skinObservations && prev.skinObservations.length > 0
              ? prev.skinObservations
              : SKIN_OBSERVATION_PRESETS['Mild T-zone shine & subtle uneven tone'],
        }
      : {}),
    ...(includeHair
      ? {
          hairTexture: preserveHair ? prev!.hairTexture : defaultHairTexture,
        }
      : {}),
    quality: 'good',
    qualityMessage:
      mode === 'face'
        ? 'Front face proportions mapped cleanly.'
        : mode === 'hair'
        ? 'Hair strand pattern mapped cleanly.'
        : 'Front face geometry and hair texture mapped cleanly.',
    modelVersion: 'allure-v1',
    sampleProfileUsed: options?.sampleProfileUsed,
    userConfirmed: {
      face: preserveFace ? !!prev?.userConfirmed?.face : false,
      hair: preserveHair ? !!prev?.userConfirmed?.hair : false,
      skin: preserveFace ? !!prev?.userConfirmed?.skin : false,
    },
    userChanged: {
      face: preserveFace ? !!prev?.userChanged?.face : false,
      hair: preserveHair ? !!prev?.userChanged?.hair : false,
      skin: preserveFace ? !!prev?.userChanged?.skin : false,
    },
  };
}


export const createPhotoAnalysis = analyzePhotos;

export async function saveUserPreferences(preferences: UserPreferences): Promise<{
  saved: boolean;
  savedAt: string;
  preferences: UserPreferences;
}> {
  await wait(110);
  return {
    saved: true,
    savedAt: new Date().toISOString(),
    preferences,
  };
}

/**
 * Builds the structured report for /results combining photo analysis + preferences.
 */
export function buildPersonalizedReport(
  analysis: PhotoAnalysisResponse,
  preferences: UserPreferences,
  simulateUncertainFace = false
): GroomingReport {
  const mode = analysis.analysisMode ?? 'both';
  const hasFaceData = Boolean(analysis.faceShape);
  const hasHairData = Boolean(analysis.hairTexture);
  const hasSkinData = Boolean(
    analysis.skinObservations && analysis.skinObservations.length > 0
  );

  const timeReadable = formatDailyTimeLabel(preferences);
  const budgetReadable =
    preferences.currency === 'USD'
      ? `~$${Math.max(1, Math.round(preferences.monthlyBudgetINR / 80))} / month (${preferences.budgetTier})`
      : `₹${preferences.monthlyBudgetINR.toLocaleString('en-IN')} / month (${preferences.budgetTier})`;

  const secondaryClean =
    analysis.secondaryTendency && analysis.secondaryTendency !== 'None'
      ? analysis.secondaryTendency
      : undefined;

  const lengthLabel = LENGTH_LABELS[preferences.hairLength] ?? 'Custom length';
  const habitLabel = HABIT_LABELS[preferences.hairStylingHabit] ?? 'Custom styling habit';
  const skinFeelLabel = SKIN_FEEL_LABELS[preferences.skinFeel] ?? 'Balanced';

  let faceSection: GroomingReport['faceSection'] | undefined;
  if (hasFaceData) {
    const faceAssessed = hasAssessedFaceShape(analysis.faceShape);
    const showUncertain = simulateUncertainFace || !faceAssessed;

    faceSection = showUncertain
      ? {
          primaryShape: 'Uncertain',
          secondaryTendency: 'Soft lighting or angle variance',
          isUncertain: true,
          uncertainMessage:
            'Re-capture guidance: uneven lighting, shadow, or camera angle reduced landmark clarity. Retake facing diffuse natural light with a level chin, or refine your best match below.',
          explanation:
            'When lighting or camera tilt introduces ambiguity, ALLURE avoids forcing a rigid label and expands recommendations to versatile, universally balanced cuts.',
          whyRecommended: `While landmark clarity is lower, recommendations lean on versatile proportions, your ${lengthLabel.toLowerCase()} length preference, and your ${timeReadable} schedule.`,
          metrics: [
            {
              label: 'Face Aspect Ratio',
              valueLabel: '0.66 clarity',
              normalizedScore: 66,
              note: 'Borderline vertical proportion under uneven light',
            },
            {
              label: 'Jaw-to-Cheek Ratio',
              valueLabel: '0.60 clarity',
              normalizedScore: 60,
              note: 'Lower-third contour partially softened by shadow',
            },
            {
              label: 'Forehead Balance',
              valueLabel: '0.62 clarity',
              normalizedScore: 62,
              note: 'Upper hairline partially obscured by framing',
            },
          ],
        }
      : {
          primaryShape: analysis.faceShape as FaceShapeOption,
          secondaryTendency: secondaryClean,
          isUncertain: false,
          uncertainMessage: '',
          explanation: secondaryClean
            ? `Your profile reflects an ${analysis.faceShape} primary outline with ${secondaryClean.toLowerCase()}. Hairstyles and frames that complement these ratios stay effortless.`
            : `Your profile reflects a clear ${analysis.faceShape} outline, giving you a reliable foundation for crown volume, parting, and eyewear proportions.`,
          whyRecommended: analysis.userChanged?.face
            ? `Calibrated directly to your refined ${analysis.faceShape} selection and ${timeReadable} upkeep window.`
            : `Mapped from your ${analysis.faceShape}${secondaryClean ? ` (${secondaryClean.toLowerCase()})` : ''} proportions and paired with your ${lengthLabel.toLowerCase()} preference.`,
          metrics: FACE_METRICS_BY_SHAPE[analysis.faceShape as FaceShapeOption].map((m) => ({
            ...m,
            label:
              m.label === 'Forehead-to-Cheek'
                ? 'Forehead Balance'
                : m.label === 'Jaw-to-Cheek'
                ? 'Jaw-to-Cheek Ratio'
                : m.label,
          })),
        };
  }

  let hairSection: GroomingReport['hairSection'] | undefined;
  if (hasHairData) {
    const assessedHair = hasAssessedHairTexture(analysis.hairTexture)
      ? analysis.hairTexture
      : null;
    const textureDisplay = assessedHair ?? 'Unable to assess';
    const textureLower = assessedHair ? assessedHair.toLowerCase() : 'natural';
    hairSection = {
      texture: textureDisplay,
      lengthLabel,
      stylingLabel: habitLabel,
      summary: !assessedHair
        ? 'Strand pattern could not be read clearly from the photo. Select your natural dry texture below or upload a clearer photo in natural light.'
        : `${textureDisplay} hair at ${lengthLabel.toLowerCase()} length performs best when shaped around its natural movement rather than fighting it daily.`,
      whyRecommended: !assessedHair
        ? `Guidance begins with gentle, adaptable care for ${lengthLabel.toLowerCase()} hair within ${timeReadable}.`
        : analysis.userChanged?.hair
        ? `Refined for your ${textureDisplay} texture paired with ${lengthLabel.toLowerCase()} length and ${habitLabel.toLowerCase()}.`
        : `Calibrated for your ${textureLower} texture, ${lengthLabel.toLowerCase()} length, and preference to ${habitLabel.toLowerCase()}.`,
      notes: [
        !assessedHair
          ? 'Capture dry, unstyled strands in diffuse natural light for sharper texture reading.'
          : `Natural ${textureLower} strands benefit from gentle, buildup-free cleansing.`,
        preferences.avoidItems.includes('High heat styling')
          ? 'Heat-free shaping prioritized per your preferences.'
          : `Styling guidance stays cleanly inside your ${timeReadable} window.`,
      ],
    };
  }

  const standardSensitivities = preferences.skinSensitivities.filter((s) => s !== 'Other');
  const sensitivitiesLabel =
    standardSensitivities.length > 0
      ? standardSensitivities.join(', ')
      : preferences.skinSensitivities.includes('Other')
      ? 'Custom note recorded'
      : 'None reported';

  let skinSection: GroomingReport['skinSection'] | undefined;
  if (hasSkinData && analysis.skinObservations) {
    skinSection = {
      selfReportedFeel: skinFeelLabel,
      sensitivitiesSummary: sensitivitiesLabel,
      observations: analysis.skinObservations,
      whyRecommended: `Pairs visible cosmetic surface cues with your "${skinFeelLabel}" skin feel and sensitivities (${sensitivitiesLabel}) to keep daily care calm and consistent.`,
      disclaimer:
        'ALLURE provides cosmetic grooming guidance rather than medical diagnosis. Lighting and camera lenses influence visible tone and shine—consult a qualified dermatologist for persistent skin or scalp concerns.',
    };
  }

  const selfReportedTextureLabel =
    mode === 'face'
      ? preferences.selfReportedHairTexture &&
        preferences.selfReportedHairTexture !== 'not-sure' &&
        preferences.selfReportedHairTexture !== 'other'
        ? `${preferences.selfReportedHairTexture} (Self-reported)`
        : preferences.selfReportedHairTexture === 'other'
        ? 'Custom note recorded'
        : 'Not specified'
      : undefined;

  const standardAvoids = preferences.avoidItems.filter((a) => a !== 'Other');
  const youAlsoMentioned = collectMentionedNotes(preferences);

  return {
    analysisId: analysis.analysisId,
    analysisMode: mode,
    modelVersion: analysis.modelVersion,
    faceSection,
    hairSection,
    skinSection,
    constraintsSection: {
      goalsList:
        preferences.goals.length > 0
          ? preferences.goals.map((g) => GOAL_LABELS[g] ?? 'Custom goal')
          : ['General grooming clarity'],
      dailyTimeLabel: timeReadable,
      budgetLabel: budgetReadable,
      sensitivitiesLabel,
      avoidList: standardAvoids,
      facialHairLabel:
        FACIAL_HAIR_LABELS[preferences.facialHairPreference] ?? 'Custom preference',
      selfReportedTextureLabel,
      youAlsoMentioned,
      whyRecommended:
        mode === 'hair'
          ? `Tailored to your Hair only focus—prioritizing strand care, wash rhythm, and compatible cuts within ${timeReadable} and your ${preferences.budgetTier} budget.`
          : `Every recommendation in your personalized plan fits ${timeReadable}, aligns with your ${preferences.budgetTier} budget, and respects your ${STYLE_PREFERENCE_LABELS[preferences.stylePreference ?? 'all']} focus.`,
    },
  };
}

/**
 * Scores hairstyles against face geometry, hair texture, length, stylePreference, time, and budget.
 */
export function scoreAndSelectHairstyles(options: {
  mode: AnalysisMode;
  faceShape?: FaceShapeOption;
  secondaryTendency?: string;
  detectedHairTexture?: HairTextureOption;
  selfReportedHairTexture?: UserPreferences['selfReportedHairTexture'];
  preferences: UserPreferences;
  maintenanceFilter?: 'all' | MaintenanceLevel;
}): HairstyleSuggestion[] {
  const {
    mode,
    faceShape,
    secondaryTendency,
    detectedHairTexture,
    selfReportedHairTexture,
    preferences,
    maintenanceFilter = 'all',
  } = options;

  const avoidsHeat = preferences.avoidItems.includes('High heat styling');
  const avoidsComplex = preferences.avoidItems.includes('Complicated 5+ step routines');
  const stylePref = preferences.stylePreference ?? 'all';

  const userDailyMinutes = resolveDailyMinutes(preferences);
  const dailyTimeShort = formatDailyTimeShort(preferences);
  const budgetINR = preferences.monthlyBudgetINR;

  const effectiveTexture: HairTextureOption | undefined =
    mode === 'face'
      ? selfReportedHairTexture &&
        selfReportedHairTexture !== 'not-sure' &&
        selfReportedHairTexture !== 'other'
        ? selfReportedHairTexture
        : undefined
      : detectedHairTexture;

  const secondaryClean =
    secondaryTendency && secondaryTendency !== 'None' ? secondaryTendency : undefined;

  const scored = HAIRSTYLE_CATALOG.map((entry) => {
    let score = 0;

    // 1. Face shape compatibility
    const faceMatch = faceShape ? entry.compatibleFaceShapes.includes(faceShape) : true;
    if ((mode === 'face' || mode === 'both') && faceShape) {
      score += faceMatch ? 40 : 5;
      if (secondaryClean) {
        const lowerSec = secondaryClean.toLowerCase();
        const secondaryShapes: FaceShapeOption[] = [
          'Oval',
          'Round',
          'Square',
          'Oblong',
          'Heart',
          'Diamond',
        ];
        const matchedSec = secondaryShapes.find((s) =>
          lowerSec.includes(s.toLowerCase())
        );
        if (matchedSec && entry.compatibleFaceShapes.includes(matchedSec)) {
          score += 10;
        }
      }
    } else if (mode === 'face' || mode === 'both') {
      score += entry.compatibleFaceShapes.length * 4;
    }

    // 2. Hair texture compatibility
    const textureMatch = effectiveTexture
      ? entry.compatibleTextures.includes(effectiveTexture)
      : true;
    if (mode === 'hair') {
      score += effectiveTexture
        ? textureMatch
          ? 45
          : 0
        : entry.compatibleTextures.length * 6;
    } else if (mode === 'both') {
      score += effectiveTexture
        ? textureMatch
          ? 35
          : 0
        : entry.compatibleTextures.length * 4;
    } else if (mode === 'face' && effectiveTexture) {
      score += textureMatch ? 22 : -4;
    }

    // 3. Length & optional styling preference emphasis
    if (preferences.hairLength !== 'other') {
      if (entry.lengthCategory === preferences.hairLength) {
        score += 16;
      } else if (
        (preferences.hairLength === 'medium' &&
          (entry.lengthCategory === 'short' || entry.lengthCategory === 'long')) ||
        (preferences.hairLength === 'short' && entry.lengthCategory === 'medium')
      ) {
        score += 6;
      }
    }

    if (stylePref === 'mens' && (entry.lengthCategory === 'short' || entry.lengthCategory === 'shaved' || entry.silhouetteVariant === 'medium-curtain' || entry.silhouetteVariant === 'medium-flow')) {
      score += 6;
    } else if (stylePref === 'womens' && (entry.lengthCategory === 'medium' || entry.lengthCategory === 'long' || entry.silhouetteVariant === 'short-bob')) {
      score += 6;
    }

    // 4. Daily routine time & budget scoring
    if (entry.stylingTimeMinutes <= userDailyMinutes) {
      score += 14;
    } else {
      const overrun = entry.stylingTimeMinutes - userDailyMinutes;
      score -= Math.min(18, 6 + overrun);
    }

    if (userDailyMinutes <= 6 && entry.maintenanceLevel === 'Low') {
      score += 10;
    }
    if (budgetINR <= 1000 && entry.maintenanceLevel === 'Low') {
      score += 10;
    } else if (budgetINR <= 2000 && entry.maintenanceLevel === 'Detailed') {
      score -= 6;
    }
    if (avoidsComplex && entry.maintenanceLevel === 'Low') {
      score += 10;
    }
    if (avoidsComplex && entry.maintenanceLevel === 'Detailed') {
      score -= 12;
    }

    // 5. Avoid list handling (heat-free)
    const isHeatFree =
      entry.tags.includes('heat-free') || entry.tags.includes('air-dry');
    if (avoidsHeat) {
      score += isHeatFree ? 12 : -14;
    }

    const whySuitsFaceShape =
      mode === 'face' || mode === 'both'
        ? faceShape
          ? `For your ${faceShape.toLowerCase()} proportions${secondaryClean ? ` (${secondaryClean.toLowerCase()})` : ''}, this cut ${FACE_PLACEMENT_REASONS[faceShape]}.`
          : 'Designed as a versatile, balanced silhouette suitable across soft and structured proportions.'
        : undefined;

    let bestWithTexture: string;
    if (mode === 'face') {
      if (effectiveTexture) {
        bestWithTexture = textureMatch
          ? `Refined for ${effectiveTexture} hair (also complements ${entry.compatibleTextures.join(', ')})`
          : `Best with ${entry.compatibleTextures.join(', ')} hair`;
      } else {
        bestWithTexture = `Best suited to ${entry.compatibleTextures.join(', ')} hair`;
      }
    } else if (mode === 'hair') {
      bestWithTexture = effectiveTexture
        ? `Matched for ${effectiveTexture} strands (${entry.compatibleTextures.join(', ')})`
        : `Versatile across ${entry.compatibleTextures.join(', ')} hair`;
    } else {
      bestWithTexture = effectiveTexture
        ? `Tailored for ${effectiveTexture} hair (${entry.compatibleTextures.join(', ')})`
        : `Works cleanly with ${entry.compatibleTextures.join(', ')} hair`;
    }

    const timeNote = `${entry.stylingTimeMinutes} min/day fits your ${dailyTimeShort} routine`;
    const avoidNote =
      avoidsHeat && isHeatFree ? ' and stays heat-free per your preferences' : '';

    let whyRecommended: string;
    if (mode === 'face') {
      const proportionPhrase = faceShape
        ? `your ${faceShape.toLowerCase()} geometry`
        : 'versatile proportions';
      whyRecommended =
        effectiveTexture && textureMatch
          ? `Matched to ${proportionPhrase} and ${effectiveTexture.toLowerCase()} hair; ${timeNote}${avoidNote}.`
          : `Selected for ${proportionPhrase} with ${entry.maintenanceLevel.toLowerCase()} upkeep; ${timeNote}${avoidNote}.`;
    } else if (mode === 'hair') {
      const texturePhrase = effectiveTexture
        ? `${effectiveTexture.toLowerCase()} hair texture`
        : 'everyday strand versatility';
      whyRecommended = `Works naturally with ${texturePhrase} at ${entry.maintenanceLevel.toLowerCase()} upkeep; ${timeNote}${avoidNote}.`;
    } else {
      const proportionPhrase = faceShape
        ? `your ${faceShape.toLowerCase()} geometry`
        : 'balanced proportions';
      const texturePhrase = effectiveTexture
        ? `${effectiveTexture.toLowerCase()} texture`
        : 'natural hair movement';
      whyRecommended = `Balances ${proportionPhrase} and ${texturePhrase}; ${timeNote} within your ${preferences.budgetTier} budget${avoidNote}.`;
    }

    const lengthReadable =
      entry.lengthCategory === 'shaved'
        ? 'Shaved / Close'
        : entry.lengthCategory.charAt(0).toUpperCase() + entry.lengthCategory.slice(1);

    return {
      entry,
      faceMatch,
      textureMatch,
      score,
      suggestion: {
        id: entry.id,
        name: entry.name,
        category: 'Hairstyle' as const,
        maintenanceTime: `${entry.stylingTimeMinutes} min / day`,
        stylingTimeMinutes: entry.stylingTimeMinutes,
        maintenanceLevel: entry.maintenanceLevel,
        lengthCategory: entry.lengthCategory,
        suitableLength: lengthReadable,
        compatibleTextures: entry.compatibleTextures,
        placementGuidance: entry.placementGuidance,
        whySuitsFaceShape,
        whyRecommended,
        bestWithTexture,
        description: entry.description,
        tags: entry.tags,
        fitScore: score,
        silhouetteVariant: entry.silhouetteVariant,
      },
    };
  });

  let pool = scored;
  if (mode === 'face' && faceShape) {
    pool = scored.filter((item) => item.faceMatch);
  } else if (mode === 'hair' && effectiveTexture) {
    pool = scored.filter((item) => item.textureMatch);
  } else if (mode === 'both' && faceShape && effectiveTexture) {
    const bothMatched = scored.filter((item) => item.faceMatch && item.textureMatch);
    pool =
      bothMatched.length >= 4
        ? bothMatched
        : scored.filter((item) => item.faceMatch || item.textureMatch);
  }

  if (maintenanceFilter !== 'all') {
    pool = pool.filter((item) => item.entry.maintenanceLevel === maintenanceFilter);
  }

  pool.sort((a, b) => b.score - a.score);

  const desiredCount = mode === 'hair' ? 4 : 6;
  return pool.slice(0, desiredCount).map((item) => item.suggestion);
}

/**
 * Generates personalized hairstyles, eyewear, facial hair, and AM/PM routines.
 */
export function buildDynamicRecommendations(
  preferences: UserPreferences,
  analysis: PhotoAnalysisResponse,
  options?: { maintenanceFilter?: 'all' | MaintenanceLevel }
): RecommendationsPayload {
  const mode: AnalysisMode = analysis.analysisMode ?? 'both';

  const assessedFace = hasAssessedFaceShape(analysis.faceShape)
    ? analysis.faceShape
    : undefined;
  const assessedHair = hasAssessedHairTexture(analysis.hairTexture)
    ? analysis.hairTexture
    : undefined;

  const styles = scoreAndSelectHairstyles({
    mode,
    faceShape: assessedFace,
    secondaryTendency: analysis.secondaryTendency,
    detectedHairTexture: assessedHair,
    selfReportedHairTexture: preferences.selfReportedHairTexture,
    preferences,
    maintenanceFilter: options?.maintenanceFilter ?? 'all',
  });

  const avoidsHeat = preferences.avoidItems.includes('High heat styling');
  const avoidsFragrance =
    preferences.avoidItems.includes('Heavy fragrances') ||
    preferences.skinSensitivities.includes('Fragrance') ||
    preferences.skinFeel === 'sensitive';
  const avoidsComplex = preferences.avoidItems.includes('Complicated 5+ step routines');
  const avoidsSulfates =
    preferences.avoidItems.includes('Sulfates (SLS)') ||
    preferences.skinSensitivities.includes('Sulfates');

  const userDailyMinutes = resolveDailyMinutes(preferences);
  const timeText = `${formatDailyTimeShort(preferences)} daily routine`;

  let eyewearTip: EyewearTip | undefined;
  if (mode === 'face' || mode === 'both') {
    if (assessedFace) {
      const tip = EYEWEAR_TIPS_BY_SHAPE[assessedFace];
      eyewearTip = {
        faceShape: assessedFace,
        recommendedFrames: tip.frames,
        proportionNote: tip.proportionNote,
        whyRecommended: `Matched to your ${assessedFace.toLowerCase()} temple-to-jaw proportions${analysis.secondaryTendency && analysis.secondaryTendency !== 'None' ? ` (${analysis.secondaryTendency.toLowerCase()})` : ''}.`,
      };
    } else {
      eyewearTip = {
        faceShape: 'Balanced Proportions',
        recommendedFrames: 'Medium-width softly contoured rectangular or oval frames',
        proportionNote:
          'Balanced medium-width rims aligned with your brow line complement most facial ratios effortlessly.',
        whyRecommended:
          'Versatile everyday eyewear guidance aligned to medium bridge and temple symmetry.',
      };
    }
  }

  const wantsFacialHair =
    (preferences.facialHairPreference !== 'skip' ||
      preferences.goals.includes('facial-grooming') ||
      preferences.stylePreference === 'mens') &&
    (mode === 'face' || mode === 'both');

  let facialHairGuidance: FacialHairGuidance | undefined;
  if (wantsFacialHair) {
    const activePref =
      preferences.facialHairPreference !== 'skip'
        ? preferences.facialHairPreference
        : 'light-stubble';
    const isCleanShaven = activePref === 'clean-shaven';
    const prefLabel = FACIAL_HAIR_LABELS[activePref] ?? 'Refined Facial Grooming';
    const proportionPhrase = assessedFace
      ? `${assessedFace.toLowerCase()} jaw proportions`
      : 'natural jaw proportions';

    facialHairGuidance = {
      title: isCleanShaven
        ? 'Low-Irritation Clean-Shave Protocol'
        : activePref === 'other'
        ? 'Balanced Facial Hair Contour Guide'
        : `${prefLabel} Contour Guide`,
      preferenceLabel: prefLabel,
      maintenanceTime: '3–5 min / 2x week',
      description: isCleanShaven
        ? 'Soften facial hair with warm water for 60 seconds, shave along growth direction with minimal pressure, and calm skin with an unscented moisturizer.'
        : `Keep cheek lines natural and define the neckline two fingers above the Adam’s apple so ${proportionPhrase} stay sharp; finish with 2–3 drops of lightweight jojoba oil.`,
      whyRecommended: `Calibrated to your ${proportionPhrase} and "${prefLabel}" grooming preference within a quick upkeep cadence.`,
    };
  }

  let hairOnlyCare: HairOnlyCareGuidance | undefined;
  if (mode === 'hair') {
    const careTexture: HairTextureOption = assessedHair ?? 'Wavy';
    const template = HAIR_ONLY_CARE_BY_TEXTURE[careTexture];
    const filteredProducts = template.baseProducts.map((p) => {
      if (avoidsSulfates && p.toLowerCase().includes('wash')) {
        return `${p} (sulfate-free prioritized)`;
      }
      if (avoidsFragrance && p.toLowerCase().includes('conditioner')) {
        return `${p} (fragrance-free prioritized)`;
      }
      return p;
    });
    const tips = [...template.baseTips];
    if (avoidsHeat) {
      tips.unshift(
        'Heat-free styling prioritized: air-dry or gently diffuse on cool air only.'
      );
    }
    const lengthReadable = (LENGTH_LABELS[preferences.hairLength] ?? 'custom').toLowerCase();
    hairOnlyCare = {
      texture: assessedHair ?? 'Natural Hair Care',
      washFrequency: template.washFrequency,
      productTypes: filteredProducts,
      stylingTips: tips,
      whyRecommended: assessedHair
        ? `Tailored to your ${assessedHair.toLowerCase()} hair texture, ${lengthReadable} length, and ${timeText}.`
        : `Balanced hair care foundation aligned to your ${lengthReadable} length and ${timeText}.`,
    };
  }

  const keepRoutineMinimal =
    userDailyMinutes <= 6 ||
    avoidsComplex ||
    preferences.monthlyBudgetINR <= 1000;

  const isDrySkin = preferences.skinFeel === 'dry' || preferences.skinFeel === 'sensitive';
  const isOilySkin =
    preferences.skinFeel === 'oily' || preferences.skinFeel === 'combination';
  const skinFeelReadable = (SKIN_FEEL_LABELS[preferences.skinFeel] ?? 'balanced').toLowerCase();

  const hairLabelForRoutine =
    assessedHair?.toLowerCase() ??
    (preferences.selfReportedHairTexture &&
    preferences.selfReportedHairTexture !== 'not-sure' &&
    preferences.selfReportedHairTexture !== 'other'
      ? preferences.selfReportedHairTexture.toLowerCase()
      : 'natural');

  const morningRoutine: RoutineStep[] = [
    ...(mode !== 'hair'
      ? [
          {
            stepNumber: '01',
            title: isDrySkin ? 'Lukewarm Rinse or Amino Cream Cleanse' : 'Gentle Amino Cleanse',
            category: 'Skincare · Cleanse',
            instruction: isDrySkin
              ? 'Rinse with lukewarm water or use a mild cream cleanser for 20 seconds without stripping comfort.'
              : 'Massage a pH-balanced gel cleanser onto damp skin for 20 seconds, then rinse with lukewarm water.',
            frequency: 'Daily AM',
            note: avoidsFragrance
              ? 'Fragrance-free formula prioritized for your skin comfort.'
              : 'Pat dry gently with a clean towel.',
          },
          {
            stepNumber: '02',
            title: isDrySkin
              ? 'Barrier Comfort Moisturizer + SPF 50'
              : 'Light Hydrating Moisturizer + SPF 50',
            category: 'Skincare · Moisturize & Protect',
            instruction:
              'Smooth an even layer over face, ears, and neck 15 minutes before stepping outdoors.',
            frequency: 'Every Morning',
            note: `Selected for ${skinFeelReadable} skin feel and ${preferences.budgetTier} budget tier.`,
          },
        ]
      : []),
    {
      stepNumber: mode === 'hair' ? '01' : '03',
      title: avoidsHeat
        ? 'Air-Dry Texture Mist & Finger Shape'
        : 'Quick Morning Hair Finish',
      category: 'Haircare · Style',
      instruction: avoidsHeat
        ? `Lightly mist damp ${hairLabelForRoutine} hair and shape with fingertips—zero heat tools needed.`
        : `Warm a small amount of matte clay, cream, or leave-in veil between palms and guide through ${hairLabelForRoutine} strands.`,
      frequency: 'Daily AM',
      note: `Fits cleanly inside your ${timeText}.`,
    },
    ...(mode === 'hair'
      ? [
          {
            stepNumber: '02',
            title: 'Midday Refresh & Frizz Control',
            category: 'Haircare · Refresh',
            instruction: `Keep a light water or conditioning mist handy to revive ${hairLabelForRoutine} shape without re-washing.`,
            frequency: 'As needed',
            note: avoidsFragrance
              ? 'Unscented lightweight mists prioritized per your preferences.'
              : 'Prevents buildup between wash days.',
          },
        ]
      : []),
  ];

  const eveningRoutine: RoutineStep[] = [
    ...(mode !== 'hair'
      ? [
          {
            stepNumber: '01',
            title: 'Evening Surface Wash',
            category: 'Skincare · Cleanse',
            instruction:
              'Remove daytime SPF, dust, and excess oil using a gentle non-stripping face wash.',
            frequency: 'Daily PM',
            note: avoidsFragrance
              ? 'Keep formulas unscented and alcohol-free.'
              : 'Avoid hot water to protect skin comfort.',
          },
          ...(!keepRoutineMinimal
            ? [
                {
                  stepNumber: '02',
                  title: isOilySkin
                    ? '5% Niacinamide Balancing Essence'
                    : 'Soothing Hydration Serum',
                  category: 'Skincare · Targeted Care',
                  instruction:
                    'Press 2–3 drops across forehead, nose, and cheeks on clean, slightly damp skin.',
                  frequency: '4–7 nights / week',
                  note: 'Introduce one new cosmetic product at a time and patch-test first.',
                },
              ]
            : []),
          {
            stepNumber: keepRoutineMinimal ? '02' : '03',
            title: 'Overnight Moisture Seal',
            category: 'Skincare · Moisturize',
            instruction:
              'Apply a calm barrier-friendly moisturizer to support overnight softness.',
            frequency: 'Daily PM',
            note: 'Cosmetic care only — consult a qualified dermatologist for persistent concerns.',
          },
        ]
      : []),
    {
      stepNumber: mode === 'hair' ? '01' : keepRoutineMinimal ? '03' : '04',
      title: avoidsSulfates
        ? 'Sulfate-Free Scalp Wash & Condition'
        : 'Gentle Scalp Wash & Mid-Length Condition',
      category: 'Haircare · Cleanse',
      instruction:
        'Cleanse the scalp gently with fingertips on wash nights and smooth conditioner through mid-lengths and ends.',
      frequency: assessedHair === 'Coily' ? '1x / 7–10 days' : '2–3x / week',
      note: avoidsSulfates
        ? 'Sulfate-free wash prioritized per your sensitivity profile.'
        : `Supports natural ${hairLabelForRoutine} bounce without heavy buildup.`,
    },
    ...(mode === 'hair'
      ? [
          {
            stepNumber: '02',
            title: 'Overnight Strand Protection',
            category: 'Haircare · Recovery',
            instruction:
              'Detangle gently when conditioned and rest on a smooth cotton or satin pillowcase to reduce morning friction.',
            frequency: 'Nightly',
            note: 'Zero extra products required; preserves cut shape longer.',
          },
        ]
      : []),
  ];

  const budgetLabel =
    preferences.currency === 'USD'
      ? `~$${Math.max(1, Math.round(preferences.monthlyBudgetINR / 80))} / mo (${preferences.budgetTier})`
      : `₹${preferences.monthlyBudgetINR.toLocaleString('en-IN')} / mo (${preferences.budgetTier})`;

  return {
    analysisId: analysis.analysisId,
    analysisMode: mode,
    styles,
    eyewearTip,
    facialHairGuidance,
    hairOnlyCare,
    morningRoutine,
    eveningRoutine,
    activeSummary: {
      budgetLabel,
      maintenanceLabel: formatDailyTimeShort(preferences),
      avoidCount: preferences.avoidItems.filter((i) => i !== 'Other').length,
    },
  };
}

/**
 * POST /api/v1/recommendations — FastAPI-ready wrapper over recommendation engine.
 */
export async function fetchRecommendations(
  preferences: UserPreferences,
  analysis: PhotoAnalysisResponse,
  options?: { maintenanceFilter?: 'all' | MaintenanceLevel }
): Promise<RecommendationsPayload> {
  if (ENABLE_REMOTE_BACKEND) {
    try {
      const res = await fetch(`${API_BASE_URL}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences, analysis, options }),
      });
      if (res.ok) return (await res.json()) as RecommendationsPayload;
    } catch {
      // Fallback seamlessly to local engine
    }
  }
  return buildDynamicRecommendations(preferences, analysis, options);
}

/**
 * GET /api/v1/products — Filters and sorts curated grooming essentials.
 */
export async function fetchProducts(
  params?: ProductFilterParams
): Promise<ProductItem[]> {
  if (ENABLE_REMOTE_BACKEND) {
    try {
      const qs = new URLSearchParams();
      if (params?.search) qs.set('search', params.search);
      if (params?.category && params.category !== 'All') qs.set('category', params.category);
      if (typeof params?.maxPriceINR === 'number') qs.set('maxPriceINR', String(params.maxPriceINR));
      if (params?.sortBy) qs.set('sortBy', params.sortBy);
      const res = await fetch(`${API_BASE_URL}/products?${qs.toString()}`);
      if (res.ok) return (await res.json()) as ProductItem[];
    } catch {
      // Fallback seamlessly to local catalog
    }
  }

  await wait(90);
  let results = [...CURATED_PRODUCTS];

  if (params?.category && params.category !== 'All') {
    results = results.filter((p) => p.category === params.category);
  }

  if (typeof params?.maxPriceINR === 'number') {
    results = results.filter((p) => p.priceINR <= params.maxPriceINR!);
  }

  if (params?.search && params.search.trim().length > 0) {
    const q = params.search.toLowerCase().trim();
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.keyBenefits.some((b) => b.toLowerCase().includes(q))
    );
  }

  if (params?.sortBy === 'price-asc') {
    results.sort((a, b) => a.priceINR - b.priceINR);
  } else if (params?.sortBy === 'price-desc') {
    results.sort((a, b) => b.priceINR - a.priceINR);
  }

  return results;
}

export const fetchSampleProducts = fetchProducts;

// ============================================================================
// History Helpers (Structured data only — NEVER stores photos or image URLs)
// ============================================================================

export const HISTORY_STORAGE_KEY = 'allure_analysis_history_v1';
export const MAX_HISTORY_ENTRIES = 20;

const VALID_MODES: AnalysisMode[] = ['face', 'hair', 'both'];
const VALID_BUDGET_TIERS: BudgetTier[] = ['essential', 'balanced', 'elevated'];

function sanitizePreferencesSnapshot(raw?: Partial<UserPreferences> | null): UserPreferences {
  const src = raw ?? {};
  const monthlyBudgetINR =
    typeof src.monthlyBudgetINR === 'number' && Number.isFinite(src.monthlyBudgetINR)
      ? src.monthlyBudgetINR
      : DEFAULT_PREFERENCES.monthlyBudgetINR;
  return {
    ...DEFAULT_PREFERENCES,
    ...src,
    stylePreference:
      src.stylePreference === 'mens' || src.stylePreference === 'womens'
        ? src.stylePreference
        : 'all',
    goals: Array.isArray(src.goals) ? [...src.goals] : [...DEFAULT_PREFERENCES.goals],
    skinSensitivities: Array.isArray(src.skinSensitivities)
      ? [...src.skinSensitivities]
      : [],
    avoidItems: Array.isArray(src.avoidItems) ? [...src.avoidItems] : [],
    monthlyBudgetINR,
    budgetTier:
      src.budgetTier && VALID_BUDGET_TIERS.includes(src.budgetTier)
        ? src.budgetTier
        : deriveBudgetTier(monthlyBudgetINR),
    customOther: {
      ...EMPTY_CUSTOM_OTHER,
      ...(src.customOther ?? {}),
    },
  };
}

function isValidHistoryEntry(raw: unknown): raw is HistoryEntry {
  if (!raw || typeof raw !== 'object') return false;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.id !== 'string' || obj.id.trim().length === 0) return false;
  if (typeof obj.createdAt !== 'string' || Number.isNaN(Date.parse(obj.createdAt))) {
    return false;
  }
  if (typeof obj.analysisMode !== 'string' || !VALID_MODES.includes(obj.analysisMode as AnalysisMode)) {
    return false;
  }
  if (!obj.questionnaireAnswers || typeof obj.questionnaireAnswers !== 'object') return false;
  if (!Array.isArray(obj.topRecommendations)) return false;
  if (!obj.routineSummary || typeof obj.routineSummary !== 'object') return false;
  return true;
}

export function loadHistoryEntries(): HistoryEntry[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const valid: HistoryEntry[] = [];
    for (const item of parsed) {
      try {
        if (!isValidHistoryEntry(item)) continue;
        valid.push({
          id: item.id,
          createdAt: item.createdAt,
          analysisMode: item.analysisMode,
          faceShape: item.faceShape,
          secondaryTendency: item.secondaryTendency,
          hairTexture: item.hairTexture,
          skinObservations: Array.isArray(item.skinObservations)
            ? item.skinObservations.filter(
                (o) =>
                  o &&
                  typeof o.zone === 'string' &&
                  typeof o.observation === 'string' &&
                  typeof o.cosmeticTip === 'string'
              )
            : undefined,
          questionnaireAnswers: sanitizePreferencesSnapshot(item.questionnaireAnswers),
          topRecommendations: item.topRecommendations
            .filter(
              (r) =>
                r &&
                typeof r.id === 'string' &&
                typeof r.name === 'string' &&
                typeof r.whyRecommended === 'string'
            )
            .slice(0, 6),
          routineSummary: {
            morningCount:
              typeof item.routineSummary.morningCount === 'number'
                ? item.routineSummary.morningCount
                : 0,
            eveningCount:
              typeof item.routineSummary.eveningCount === 'number'
                ? item.routineSummary.eveningCount
                : 0,
            morningSteps: Array.isArray(item.routineSummary.morningSteps)
              ? item.routineSummary.morningSteps.filter((s) => typeof s === 'string')
              : [],
            eveningSteps: Array.isArray(item.routineSummary.eveningSteps)
              ? item.routineSummary.eveningSteps.filter((s) => typeof s === 'string')
              : [],
            dailyTimeLabel:
              typeof item.routineSummary.dailyTimeLabel === 'string'
                ? item.routineSummary.dailyTimeLabel
                : formatDailyTimeLabel(sanitizePreferencesSnapshot(item.questionnaireAnswers)),
          },
          budgetTier: VALID_BUDGET_TIERS.includes(item.budgetTier)
            ? item.budgetTier
            : deriveBudgetTier(
                sanitizePreferencesSnapshot(item.questionnaireAnswers).monthlyBudgetINR
              ),
          modelVersion: 'allure-v1',
          quality: item.quality === 'low-confidence' ? 'low-confidence' : 'good',
          qualityMessage:
            typeof item.qualityMessage === 'string' ? item.qualityMessage : undefined,
          userConfirmed: item.userConfirmed,
          userChanged: item.userChanged,
        });
      } catch {
        // Skip invalid entries gracefully
      }
    }

    return valid
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, MAX_HISTORY_ENTRIES);
  } catch {
    return [];
  }
}

export function saveHistoryEntries(entries: HistoryEntry[]): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const normalized = [...entries]
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, MAX_HISTORY_ENTRIES)
      .map((entry) => ({
        id: entry.id,
        createdAt: entry.createdAt,
        analysisMode: entry.analysisMode,
        ...(entry.faceShape !== undefined ? { faceShape: entry.faceShape } : {}),
        ...(entry.secondaryTendency !== undefined
          ? { secondaryTendency: entry.secondaryTendency }
          : {}),
        ...(entry.hairTexture !== undefined ? { hairTexture: entry.hairTexture } : {}),
        ...(entry.skinObservations !== undefined
          ? { skinObservations: entry.skinObservations }
          : {}),
        questionnaireAnswers: sanitizePreferencesSnapshot(entry.questionnaireAnswers),
        topRecommendations: entry.topRecommendations.map((r) => ({
          id: r.id,
          name: r.name,
          whyRecommended: r.whyRecommended,
          ...(r.maintenanceTime ? { maintenanceTime: r.maintenanceTime } : {}),
        })),
        routineSummary: entry.routineSummary,
        budgetTier: entry.budgetTier,
        modelVersion: 'allure-v1',
        quality: entry.quality,
        qualityMessage: entry.qualityMessage,
        userConfirmed: entry.userConfirmed,
        userChanged: entry.userChanged,
      }));

    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    // Ignore storage quota errors
  }
}

export function buildHistoryEntryFromState(
  analysis: PhotoAnalysisResponse,
  preferences: UserPreferences,
  existingCreatedAt?: string
): HistoryEntry {
  const cleanPrefs = sanitizePreferencesSnapshot(preferences);
  const recs = buildDynamicRecommendations(cleanPrefs, analysis);

  return {
    id: analysis.analysisId,
    createdAt: existingCreatedAt ?? analysis.generatedAt ?? new Date().toISOString(),
    analysisMode: analysis.analysisMode ?? 'both',
    faceShape: analysis.faceShape,
    secondaryTendency: analysis.secondaryTendency,
    hairTexture: analysis.hairTexture,
    skinObservations: analysis.skinObservations
      ? analysis.skinObservations.map((o) => ({ ...o }))
      : undefined,
    questionnaireAnswers: cleanPrefs,
    topRecommendations: recs.styles.slice(0, 4).map((style) => ({
      id: style.id,
      name: style.name,
      whyRecommended: style.whyRecommended,
      maintenanceTime: style.maintenanceTime,
    })),
    routineSummary: {
      morningCount: recs.morningRoutine.length,
      eveningCount: recs.eveningRoutine.length,
      morningSteps: recs.morningRoutine.map((s) => s.title),
      eveningSteps: recs.eveningRoutine.map((s) => s.title),
      dailyTimeLabel: formatDailyTimeLabel(cleanPrefs),
    },
    budgetTier: cleanPrefs.budgetTier,
    modelVersion: 'allure-v1',
    quality: analysis.quality,
    qualityMessage: analysis.qualityMessage,
    userConfirmed: analysis.userConfirmed ? { ...analysis.userConfirmed } : undefined,
    userChanged: analysis.userChanged ? { ...analysis.userChanged } : undefined,
  };
}

export function upsertHistoryEntry(
  entries: HistoryEntry[],
  nextEntry: HistoryEntry
): HistoryEntry[] {
  const existing = entries.find((e) => e.id === nextEntry.id);
  const mergedEntry: HistoryEntry = existing
    ? { ...nextEntry, createdAt: existing.createdAt }
    : nextEntry;

  const remaining = entries.filter((e) => e.id !== nextEntry.id);
  const combined = [mergedEntry, ...remaining];
  combined.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  return combined.slice(0, MAX_HISTORY_ENTRIES);
}

export function deleteHistoryEntryById(
  entries: HistoryEntry[],
  id: string
): HistoryEntry[] {
  return entries.filter((e) => e.id !== id);
}

export function historyEntryToPhotoAnalysis(entry: HistoryEntry): PhotoAnalysisResponse {
  return {
    analysisId: entry.id,
    analysisMode: entry.analysisMode,
    generatedAt: entry.createdAt,
    faceShape: entry.faceShape,
    secondaryTendency: entry.secondaryTendency,
    hairTexture: entry.hairTexture,
    skinObservations: entry.skinObservations
      ? entry.skinObservations.map((o) => ({ ...o }))
      : undefined,
    quality: entry.quality ?? 'good',
    qualityMessage: entry.qualityMessage,
    modelVersion: 'allure-v1',
    userConfirmed: entry.userConfirmed ?? { face: true, hair: true, skin: true },
    userChanged: entry.userChanged ?? { face: false, hair: false, skin: false },
  };
}

export function formatHistoryDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Saved session';
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}

export function buildAnalysisUpdateMessage(analysis: PhotoAnalysisResponse): string {
  const mode = analysis.analysisMode ?? 'both';
  const facePart = analysis.faceShape
    ? hasAssessedFaceShape(analysis.faceShape)
      ? `${analysis.faceShape} face shape${
          analysis.secondaryTendency && analysis.secondaryTendency !== 'None'
            ? ` (${analysis.secondaryTendency.toLowerCase()})`
            : ''
        }`
      : 'Uncertain face shape'
    : null;
  const hairPart = analysis.hairTexture
    ? hasAssessedHairTexture(analysis.hairTexture)
      ? `${analysis.hairTexture} hair`
      : 'Unassessed hair texture'
    : null;

  const traits = [facePart, hairPart].filter(Boolean);
  if (traits.length === 0) {
    return `I've updated with your new ${ANALYSIS_MODE_LABELS[mode]} profile. Ask me anything about your styling plan.`;
  }
  return `I've updated with your latest analysis: ${traits.join(', ')}. Ask me anything about your cuts, routine, or matched products.`;
}

// ============================================================================
// ALLURE Chatbot Context & Context-Aware Responder
// ============================================================================

export function buildAssistantContext(
  photoAnalysis: PhotoAnalysisResponse | null,
  preferences: UserPreferences
): AssistantContext {
  const dailyTimeLabel = formatDailyTimeLabel(preferences);
  const dailyMinutes = resolveDailyMinutes(preferences);
  const budgetLabel =
    preferences.currency === 'USD'
      ? `~$${Math.max(1, Math.round(preferences.monthlyBudgetINR / 80))} / month (${preferences.budgetTier})`
      : `₹${preferences.monthlyBudgetINR.toLocaleString('en-IN')} / month (${preferences.budgetTier})`;
  const youAlsoMentioned = collectMentionedNotes(preferences);

  if (!photoAnalysis) {
    return {
      hasAnalysis: false,
      questionnaireAnswers: preferences,
      youAlsoMentioned,
      dailyTimeLabel,
      dailyMinutes,
      budgetLabel,
      budgetTier: preferences.budgetTier,
      topRecommendations: [],
      morningRoutine: [],
      eveningRoutine: [],
    };
  }

  const report = buildPersonalizedReport(photoAnalysis, preferences, false);
  const recs = buildDynamicRecommendations(preferences, photoAnalysis);

  return {
    hasAnalysis: true,
    analysisId: photoAnalysis.analysisId,
    analysisMode: photoAnalysis.analysisMode ?? 'both',
    faceShape: photoAnalysis.faceShape,
    secondaryTendency:
      photoAnalysis.secondaryTendency && photoAnalysis.secondaryTendency !== 'None'
        ? photoAnalysis.secondaryTendency
        : undefined,
    isUncertainFace: Boolean(report.faceSection?.isUncertain),
    faceMetrics: report.faceSection?.metrics,
    faceWhyRecommended: report.faceSection?.whyRecommended,
    hairTexture: photoAnalysis.hairTexture,
    hairWhyRecommended: report.hairSection?.whyRecommended,
    skinObservations: photoAnalysis.skinObservations,
    questionnaireAnswers: preferences,
    youAlsoMentioned,
    dailyTimeLabel,
    dailyMinutes,
    budgetLabel,
    budgetTier: preferences.budgetTier,
    topRecommendations: recs.styles.slice(0, 4).map((s) => ({
      id: s.id,
      name: s.name,
      whyRecommended: s.whyRecommended,
      whySuitsFaceShape: s.whySuitsFaceShape,
      bestWithTexture: s.bestWithTexture,
      maintenanceTime: s.maintenanceTime,
      maintenanceLevel: s.maintenanceLevel,
      placementGuidance: s.placementGuidance,
      tags: s.tags,
    })),
    eyewearTip: recs.eyewearTip,
    facialHairGuidance: recs.facialHairGuidance,
    hairOnlyCare: recs.hairOnlyCare,
    morningRoutine: recs.morningRoutine,
    eveningRoutine: recs.eveningRoutine,
    modelVersion: photoAnalysis.modelVersion,
  };
}

function buildContextLeadIn(context: AssistantContext): string {
  const parts: string[] = [];
  if (hasAssessedFaceShape(context.faceShape)) {
    parts.push(
      `${context.faceShape} face shape${
        context.secondaryTendency ? ` with ${context.secondaryTendency.toLowerCase()}` : ''
      }`
    );
  } else if (context.faceShape === 'Unable to assess') {
    parts.push('uncertain face outline');
  }

  if (hasAssessedHairTexture(context.hairTexture)) {
    parts.push(`${context.hairTexture.toLowerCase()} hair`);
  } else if (context.hairTexture === 'Unable to assess') {
    parts.push('unassessed hair texture');
  } else if (
    context.analysisMode === 'face' &&
    context.questionnaireAnswers.selfReportedHairTexture &&
    context.questionnaireAnswers.selfReportedHairTexture !== 'not-sure' &&
    context.questionnaireAnswers.selfReportedHairTexture !== 'other'
  ) {
    parts.push(`${context.questionnaireAnswers.selfReportedHairTexture.toLowerCase()} hair`);
  }

  if (parts.length === 0) {
    return `Based on your ${ANALYSIS_MODE_LABELS[context.analysisMode ?? 'both']} profile`;
  }
  return `Based on your ${parts.join(' and ')}`;
}

// Replace with a backend call (POST /api/v1/concierge). Keep any AI API key on the server, never in frontend code.
export async function askAssistant(
  message: string,
  context: AssistantContext
): Promise<AssistantReply> {
  if (ENABLE_REMOTE_BACKEND) {
    try {
      const res = await fetch(`${API_BASE_URL}/concierge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context }),
      });
      if (res.ok) return (await res.json()) as AssistantReply;
    } catch {
      // Fallback to local conversational concierge
    }
  }

  const cleanMsg = sanitizeFreeText(message, 400);
  const q = cleanMsg.toLowerCase();

  await wait(420 + Math.floor(Math.random() * 220));

  const defaultSuggestions = context.hasAnalysis
    ? ASSISTANT_SUGGESTIONS_WITH_RESULTS
    : ASSISTANT_SUGGESTIONS_WITHOUT_RESULTS;

  if (!q) {
    return {
      text: 'Ask me about your face proportions, hairstyles, a 5-minute morning routine, or products matched to your budget.',
      suggestions: defaultSuggestions,
    };
  }

  // GUARDRAIL 1: Medical / dermatology / hair-loss treatment queries
  const medicalPattern =
    /\b(acne|pimple|pimples|cystic|eczema|psoriasis|dermatitis|rosacea|rash|rashes|hives|fungal|ringworm|infection|infected|bleeding|scar|scars|scarring|hair loss|balding|baldness|alopecia|receding|thinning hair|minoxidil|finasteride|tretinoin|accutane|isotretinoin|steroid|antibiotic|prescription|medication|medicine|diagnos\w*|cure|treat\w*|clinical|dermatologist|doctor|medical|melanoma|mole|lesion|dandruff treatment|seborrheic)\b/i;

  if (medicalPattern.test(q)) {
    return {
      text: 'ALLURE focuses exclusively on cosmetic styling and everyday grooming guidance—not medical diagnosis or clinical treatment. For concerns such as acne treatments, rashes, persistent scalp irritation, hair loss, or prescriptions, please consult a qualified doctor or board-certified dermatologist. I’m always happy to help refine a gentle, fragrance-free everyday cosmetic routine.',
      suggestions: ['Build a 5-minute morning routine', 'Best products under ₹1,500', 'Is my photo saved?'],
      sources: ['Cosmetic Guidance Scope'],
    };
  }

  // GUARDRAIL 2: Attractiveness rating refusal
  const ratingPattern =
    /\b(rate me|am i attractive|how attractive|out of 10|\/10|am i ugly|am i pretty|am i handsome|am i hot|beauty score|attractiveness|glow up score|looksmax)\b/i;

  if (ratingPattern.test(q)) {
    return {
      text: 'ALLURE never rates attractiveness or assigns appearance scores. Our guidance focuses entirely on natural proportion harmony, effortless daily routines, and personal comfort.',
      suggestions: defaultSuggestions,
      sources: ['ALLURE Philosophy'],
    };
  }

  // GUARDRAIL 3: Never guess gender, age, or ethnicity
  const demographicPattern =
    /\b(my gender|what gender|male or female|man or woman|how old|my age|guess my age|ethnicity|what race|my race|skin color|nationality|ancestry)\b/i;

  if (demographicPattern.test(q)) {
    return {
      text: 'ALLURE never guesses or classifies gender, age, or ethnicity. Every recommendation is inclusive and calibrated around face geometry, hair texture, and your chosen styling preferences.',
      suggestions: defaultSuggestions,
      sources: ['Inclusive Standards'],
    };
  }

  // INTENT 1: Specific quick-prompt "Which hairstyles suit an Oval-Diamond face?"
  if (/\boval[- ]?diamond\b/i.test(q) || (/\boval\b/i.test(q) && /\bdiamond\b/i.test(q))) {
    const matched = HAIRSTYLE_CATALOG.filter(
      (s) =>
        s.compatibleFaceShapes.includes('Oval') &&
        s.compatibleFaceShapes.includes('Diamond')
    ).slice(0, 3);
    const lines = matched
      .map(
        (s, i) =>
          `${i + 1}. ${s.name} (${s.stylingTimeMinutes} min/day) — ${s.placementGuidance}`
      )
      .join('\n');
    return {
      text: `For an Oval outline with Diamond cheekbone tendencies, aim for soft temple width and natural movement that frames the cheekbones without adding excessive vertical height:\n${lines}\n\nPairing a soft off-center or curtain part keeps proportions effortlessly balanced.`,
      suggestions: ['Build a 5-minute morning routine', 'Best products under ₹1,500', 'Why this face shape?'],
      sources: ['Face Geometry Style Guide'],
    };
  }

  // INTENT 2: Specific quick-prompt "Build a 5-minute morning routine"
  if (/\b5[- ]?min(ute)?\b/i.test(q) && /\b(morning|routine)\b/i.test(q)) {
    const hairLabel = hasAssessedHairTexture(context.hairTexture)
      ? context.hairTexture.toLowerCase()
      : 'natural';
    const skinLabel = (SKIN_FEEL_LABELS[context.questionnaireAnswers.skinFeel] ?? 'balanced').toLowerCase();
    return {
      text: `Here is a streamlined 5-minute morning routine calibrated for ${skinLabel} skin and ${hairLabel} hair:\n1. Cleanse (60s): Lukewarm rinse or gentle pH-balanced Amino Silk Barrier Cleanser.\n2. Hydrate & Protect (60s): Lightweight moisturizer layered with Velvet Invisible Fluid SPF 50.\n3. Hair Finish (2 min): Finger-shape with Botanical Sea-Mineral Wave Mist or a pea-sized touch of Kaolin Matte Sculpting Clay—zero heat tools required.\n4. Detail (60s): Quick brow brush or 2 drops of Jojoba Conditioning Oil if wearing stubble or a beard.`,
      suggestions: ['Best products under ₹1,500', 'Which hairstyles suit an Oval-Diamond face?', 'Is my photo saved?'],
      sources: ['5-Minute Routine Blueprint'],
    };
  }

  // INTENT 3: Privacy, photo storage, and history
  if (
    /\b(photo saved|save my photo|stored|storage|privacy|private|server|upload|training|train|delete|history|localstorage|browser)\b/i.test(
      q
    )
  ) {
    return {
      text: 'Your photos are never saved, shared, sold, or used for external model training. Uploaded images stay strictly in temporary session memory while your analysis runs, and are never passed to the ALLURE Chatbot or saved in History. Only your structured styling insights and preferences are kept locally in this browser, and you can delete them anytime in Recent Analyses on the Results page.',
      suggestions: ['How to take a better photo?', 'Build a 5-minute morning routine', 'Best products under ₹1,500'],
      sources: ['Privacy Guarantee'],
    };
  }

  // INTENT 4: Better photo tips
  if (
    /\b(better photo|good photo|retake|lighting|blurry|blur|camera|angle|framing|clearer photo|tip.*photo|photo tip)\b/i.test(
      q
    )
  ) {
    const tipsText = ASSISTANT_PHOTO_TIPS.map((tip, idx) => `${idx + 1}. ${tip}`).join('\n');
    return {
      text: `For the sharpest analysis on /analysis:\n${tipsText}\nYour photos remain strictly in temporary memory and are never stored.`,
      suggestions: ["What does 'uncertain' mean?", 'Why this face shape?', 'Is my photo saved?'],
      sources: ['Portrait Framing Guide'],
    };
  }

  // INTENT 5: Explain "uncertain" / mixed shapes
  if (
    /\b(uncertain|low confidence|unable to assess|mixed|tendency|tendencies|borderline|unsure|re-?capture)\b/i.test(
      q
    )
  ) {
    if (context.hasAnalysis && context.analysisMode !== 'hair') {
      const lead = buildContextLeadIn(context);
      const secondaryNote = context.secondaryTendency
        ? ` Your profile currently shows ${context.secondaryTendency.toLowerCase()}, meaning your contour naturally blends two complementary outlines.`
        : '';
      return {
        text: `${lead}: "Uncertain" appears when shadows, lens tilt, or borderline ratios lower landmark clarity. Rather than forcing a rigid category, ALLURE expands recommendations to versatile cuts and gives re-capture guidance.${secondaryNote}`,
        suggestions: ['Why this face shape?', 'How to take a better photo?', 'Which hairstyles suit me?'],
        sources: ['Geometry Clarity Guide'],
      };
    }

    return {
      text: '"Uncertain" appears whenever uneven lighting, shadows, or borderline proportions make a single face-shape label less reliable. Instead of guessing, ALLURE provides re-capture tips, offers versatile silhouettes, and lets you refine your match directly.',
      suggestions: defaultSuggestions,
      sources: ['Geometry Clarity Guide'],
    };
  }

  // INTENT 6: Budget & products (supports explicit price caps like "under ₹1,500")
  if (
    /\b(budget|price|prices|cost|afford|cheap|expensive|product|products|buy|catalog|inr|usd|rupee|dollar|tier|essential|balanced|elevated|under|₹|\$)\b/i.test(
      q
    )
  ) {
    const prefs = context.questionnaireAnswers;
    const explicitCapMatch = q.match(/under\s*[₹$]?\s*([\d,]+)/i);
    const capINR = explicitCapMatch
      ? Number(explicitCapMatch[1].replace(/,/g, ''))
      : prefs.monthlyBudgetINR;
    const effectiveCap = Number.isFinite(capINR) && capINR > 0 ? capINR : 1500;

    const withinBudget = CURATED_PRODUCTS.filter((p) => p.priceINR <= effectiveCap).sort(
      (a, b) => a.priceINR - b.priceINR
    );
    const picked = (withinBudget.length > 0 ? withinBudget : CURATED_PRODUCTS).slice(0, 4);

    const productLines = picked
      .map(
        (p) =>
          `• ${p.brand} — ${p.title} (${formatSamplePrice(
            p.priceINR,
            p.priceUSD,
            prefs.currency
          )} · ${p.routineStepMatch}): ${p.shortDescription}`
      )
      .join('\n');

    const lead = context.hasAnalysis
      ? `${buildContextLeadIn(context)} and a ceiling of ₹${effectiveCap.toLocaleString('en-IN')}`
      : `Top curated essentials under ₹${effectiveCap.toLocaleString('en-IN')}`;

    return {
      text: `${lead}:\n${productLines}\n\nYou can compare up to 3 essentials side by side on the Products page.`,
      suggestions: ['Build a 5-minute morning routine', 'Which hairstyles suit an Oval-Diamond face?', 'Why this face shape?'],
      sources: ['Curated Product Catalog', 'Budget Filter'],
    };
  }

  // INTENT 7: Face shape & measurements
  if (
    /\b(face shape|why this face|oval|round|square|oblong|heart|diamond|measurement|measurements|ratio|ratios|aspect|forehead|cheek|jaw|proportion|proportions|metric|metrics|similarity)\b/i.test(
      q
    )
  ) {
    if (!context.hasAnalysis) {
      return {
        text: 'Complete your quick portrait analysis on /analysis and I’ll break down your primary face shape, secondary tendencies, and three geometric ratios (Face Aspect Ratio, Jaw-to-Cheek Ratio, and Forehead Balance).',
        suggestions: defaultSuggestions,
        sources: ['ALLURE Face Geometry'],
      };
    }

    if (context.analysisMode === 'hair') {
      return {
        text: `Your current session used Hair only (${context.hairTexture ?? 'Natural'} hair), so facial proportions weren’t measured. Select "Add face analysis" on the Results page anytime to unlock face geometry insights.`,
        suggestions: ['Which hairstyles suit me?', 'Build a 5-minute morning routine', 'Best products under ₹1,500'],
        sources: ['Active Analysis Profile'],
      };
    }

    const lead = buildContextLeadIn(context);
    const shapeExplain = hasAssessedFaceShape(context.faceShape)
      ? FACE_SHAPE_EXPLANATIONS[context.faceShape]
      : 'Your current reading is in low-confidence mode, so recommendations prioritize balanced, universally flattering proportions.';

    const metricsSummary =
      context.faceMetrics && context.faceMetrics.length > 0
        ? context.faceMetrics
            .map((m) => `• ${m.label}: ${m.valueLabel} — ${m.note}`)
            .join('\n')
        : '';

    return {
      text: `${lead}: ${shapeExplain}${
        metricsSummary ? `\n\nGeometric Breakdown:\n${metricsSummary}` : ''
      }`,
      suggestions: ['Which hairstyles suit me?', 'Build a 5-minute morning routine', 'Best products under ₹1,500'],
      sources: ['Active Analysis Report', 'Geometric Breakdown'],
    };
  }

  // INTENT 8: Hairstyles, eyewear, facial hair & why recommended
  if (
    /\b(hairstyle|hairstyles|haircut|haircuts|cut|cuts|suit me|style|styles|recommend\w*|eyewear|glasses|frames|beard|stubble|facial hair|why.*recommended|why.*matched)\b/i.test(
      q
    )
  ) {
    if (!context.hasAnalysis) {
      return {
        text: 'Run your quick portrait analysis on /analysis so ALLURE can match hairstyles, eyewear frames, and optional beard contours to your exact face ratios, hair texture, and daily time budget.',
        suggestions: defaultSuggestions,
        sources: ['Style Matching Engine'],
      };
    }

    const lead = buildContextLeadIn(context);
    const lengthLabel = LENGTH_LABELS[context.questionnaireAnswers.hairLength] ?? 'Custom';
    const topStyles = context.topRecommendations.slice(0, 3);

    const styleLines =
      topStyles.length > 0
        ? topStyles
            .map(
              (s, i) =>
                `${i + 1}. ${s.name} (${s.maintenanceTime}): ${s.whyRecommended}`
            )
            .join('\n')
        : 'Try widening the maintenance filter on /recommendations to view additional silhouettes.';

    const extras: string[] = [];
    if (context.eyewearTip) {
      extras.push(
        `Eyewear Balance: ${context.eyewearTip.recommendedFrames} — ${context.eyewearTip.whyRecommended}`
      );
    }
    if (context.facialHairGuidance) {
      extras.push(
        `Facial Grooming (${context.facialHairGuidance.preferenceLabel}): ${context.facialHairGuidance.whyRecommended}`
      );
    }

    return {
      text: `${lead}, ${lengthLabel.toLowerCase()} length, and a ${context.dailyTimeLabel} cadence, here are your strongest matches:\n${styleLines}${
        extras.length > 0 ? `\n\n${extras.join('\n')}` : ''
      }`,
      suggestions: ['Build a 5-minute morning routine', 'Best products under ₹1,500', 'Why this face shape?'],
      sources: ['Personalized Plan', 'Your Preferences'],
    };
  }

  // INTENT 9: Routine & daily time alignment
  if (
    /\b(routine|morning|evening|night|am|pm|steps|daily time|minutes|how long|skincare|cleanser|moisturizer|spf|sunscreen|schedule)\b/i.test(
      q
    )
  ) {
    if (!context.hasAnalysis) {
      return {
        text: `Your preferences are currently set to ${context.dailyTimeLabel} and a ${context.budgetTier} budget. Complete your analysis on /analysis to unlock your tailored AM/PM care blueprint, or tap "Build a 5-minute morning routine" for an immediate streamlined plan.`,
        suggestions: defaultSuggestions,
        sources: ['Your Preferences'],
      };
    }

    const lead = buildContextLeadIn(context);
    const skinFeel = SKIN_FEEL_LABELS[context.questionnaireAnswers.skinFeel] ?? 'balanced';
    const amList = context.morningRoutine
      .map((s) => `${s.stepNumber}. ${s.title} — ${s.note}`)
      .join('\n');
    const pmList = context.eveningRoutine
      .map((s) => `${s.stepNumber}. ${s.title} (${s.frequency}) — ${s.note}`)
      .join('\n');

    return {
      text: `${lead}, "${skinFeel}" skin feel, and your ${context.dailyTimeLabel} schedule, your routine stays focused (${context.morningRoutine.length} AM / ${context.eveningRoutine.length} PM steps):\n\nMorning:\n${amList}\n\nEvening:\n${pmList}`,
      suggestions: ['Best products under ₹1,500', 'Which hairstyles suit me?', 'How should I care for my hair texture?'],
      sources: ['AM/PM Routine Blueprint'],
    };
  }

  // INTENT 10: Hair texture care
  if (
    /\b(hair texture|wavy|curly|coily|straight|frizz|hair care|shampoo|conditioner|wash day|wash frequency|handle my hair|manage my hair|styling habit)\b/i.test(
      q
    )
  ) {
    const effectiveTexture: HairTextureOption = hasAssessedHairTexture(context.hairTexture)
      ? context.hairTexture
      : context.questionnaireAnswers.selfReportedHairTexture &&
        context.questionnaireAnswers.selfReportedHairTexture !== 'not-sure' &&
        context.questionnaireAnswers.selfReportedHairTexture !== 'other'
      ? context.questionnaireAnswers.selfReportedHairTexture
      : 'Wavy';

    const care = HAIR_ONLY_CARE_BY_TEXTURE[effectiveTexture];
    const habitLabel =
      HABIT_LABELS[context.questionnaireAnswers.hairStylingHabit] ?? 'everyday styling';

    return {
      text: `For ${effectiveTexture} hair paired with your "${habitLabel.toLowerCase()}" habit:\n• Wash rhythm: ${care.washFrequency}\n• Key product types: ${care.baseProducts.join(', ')}\n• Practical guidance: ${care.baseTips.join(' ')}`,
      suggestions: ['Which hairstyles suit me?', 'Best products under ₹1,500', 'Build a 5-minute morning routine'],
      sources: ['Hair Texture Care Guide'],
    };
  }

  // INTENT 11: How ALLURE works / pages overview
  if (
    /\b(how does allure|how.*work|what can i analys|what can i analyze|which page|what.*page|about allure|features|flow|steps)\b/i.test(
      q
    )
  ) {
    return {
      text: 'ALLURE guides you smoothly from profile setup to daily routine:\n• Onboarding (/onboarding): Set your styling preference, goals, hair & skin context, routine time, and monthly budget.\n• Photo Analysis (/analysis): Securely scan a front-facing portrait and hair detail photo.\n• Results (/results): Review face shape geometry, secondary tendencies, hair texture, and cosmetic skin cues.\n• Recommendations (/recommendations): Explore hairstyles, eyewear balance, and AM/PM care routines with live filters.\n• Products (/products): Search, filter, and compare up to 3 curated essentials side by side.',
      suggestions: defaultSuggestions,
      sources: ['ALLURE Guide'],
    };
  }

  // INTENT 12: Visible skin observations
  if (
    /\b(skin|shine|t-zone|dryness|dry|oily|combination|pores|tone|uneven|sensitivit|fragrance|allergy|surface)\b/i.test(
      q
    )
  ) {
    const skinFeel = SKIN_FEEL_LABELS[context.questionnaireAnswers.skinFeel] ?? 'Balanced';
    const obsLines =
      context.skinObservations && context.skinObservations.length > 0
        ? context.skinObservations
            .map((o) => `• ${o.zone}: ${o.observation} — ${o.cosmeticTip}`)
            .join('\n')
        : 'Gentle pH-balanced cleansing, calm barrier hydration, and broad-spectrum SPF 50 form the foundation for steady surface comfort.';

    return {
      text: `For your "${skinFeel}" skin profile:\n${obsLines}\n\nThese are cosmetic grooming observations rather than medical assessments.`,
      suggestions: ['Build a 5-minute morning routine', 'Best products under ₹1,500'],
      sources: ['Cosmetic Skin Notes'],
    };
  }

  // Polite greeting or fallback
  if (/^(hi|hello|hey|thanks|thank you|good morning|good evening)\b/i.test(q)) {
    return {
      text: context.hasAnalysis
        ? `Welcome back. ${buildContextLeadIn(context)}, I’m ready to help with haircut shapes, eyewear proportions, AM/PM routines, or budget-matched essentials.`
        : 'Welcome to ALLURE Chatbot. I can recommend hairstyles by face shape, build a 5-minute morning routine, or curate grooming essentials for your budget.',
      suggestions: defaultSuggestions,
    };
  }

  return {
    text: context.hasAnalysis
      ? `${buildContextLeadIn(context)}, here is how I can help right now:\n• Break down your face shape ratios and secondary tendencies\n• Explain why specific hairstyles, beard contours, or eyewear frames fit you\n• Customize an AM/PM routine for your ${context.dailyTimeLabel} window\n• Recommend curated products within your ${context.budgetLabel} budget`
      : 'I specialize in personal grooming, styling proportions, and daily care routines. Try asking:\n• "Which hairstyles suit an Oval-Diamond face?"\n• "Build a 5-minute morning routine"\n• "Best products under ₹1,500"\n• Or complete your analysis on /analysis for tailored profile answers.',
    suggestions: defaultSuggestions,
  };
}

export const askConcierge = askAssistant;
