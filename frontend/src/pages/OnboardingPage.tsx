import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import PageShell from '../components/Layout';
import { Button, SelectionCard, StepProgress, ToggleChip } from '../components/ui';
import { useAllure } from '../state';
import { MAX_OTHER_TEXT_LENGTH, STYLE_PREFERENCE_LABELS } from '../data';
import {
  deriveBudgetTier,
  formatDailyTimeShort,
  resolveDailyMinutes,
  sanitizeFreeText,
  sanitizeLiveInput,
  saveUserPreferences,
} from '../services';
import {
  BudgetTier,
  CustomOtherAnswers,
  DailyRoutineTime,
  FacialHairPreference,
  GroomingGoal,
  HairLength,
  HairStylingHabit,
  SelfReportedHairTexture,
  SkinFeelOption,
  StylePreferenceFilter,
} from '../types';

const STEPS = [
  { number: 1, label: 'Profile & Goals' },
  { number: 2, label: 'Hair & Skin Context' },
  { number: 3, label: 'Lifestyle & Budget' },
];

const STYLE_PREFERENCE_OPTIONS: {
  id: StylePreferenceFilter;
  label: string;
  desc: string;
}[] = [
  {
    id: 'all',
    label: 'All Styles',
    desc: 'Show the full inclusive catalog of hairstyles and grooming options',
  },
  {
    id: 'mens',
    label: "Men's Grooming",
    desc: 'Prioritize men’s tailoring, fades, textured crops, and beard framing',
  },
  {
    id: 'womens',
    label: "Women's Grooming",
    desc: 'Prioritize layered cuts, bobs, movement styling, and sleek finishes',
  },
];

const GOAL_OPTIONS: { id: GroomingGoal; label: string; desc: string }[] = [
  {
    id: 'hairstyle-refresh',
    label: 'Hairstyle Upgrade',
    desc: 'Find cuts that complement your natural proportions and texture',
  },
  {
    id: 'skincare-routine',
    label: 'Clearer Skin Routine',
    desc: 'Build a calm morning and evening routine that fits your schedule',
  },
  {
    id: 'facial-grooming',
    label: 'Beard & Facial Grooming',
    desc: 'Refine stubble, neckline balance, or brow grooming without clutter',
  },
  {
    id: 'low-maintenance',
    label: 'Low-Maintenance Routine',
    desc: 'Keep daily preparation fast, practical, and easy to stick with',
  },
  {
    id: 'product-clarity',
    label: 'Clearer Product Choices',
    desc: 'Cut through guesswork and pick fewer, better-matched essentials',
  },
  {
    id: 'other',
    label: 'Other',
    desc: 'Add your own personal grooming focus in a few words',
  },
];

const HAIR_LENGTH_OPTIONS: { id: HairLength; label: string }[] = [
  { id: 'short', label: 'Short' },
  { id: 'medium', label: 'Medium' },
  { id: 'long', label: 'Long' },
  { id: 'shaved', label: 'Shaved / Buzz' },
  { id: 'other', label: 'Other' },
];

const SELF_REPORTED_TEXTURE_OPTIONS: {
  id: SelfReportedHairTexture;
  label: string;
}[] = [
  { id: 'Straight', label: 'Straight' },
  { id: 'Wavy', label: 'Wavy' },
  { id: 'Curly', label: 'Curly' },
  { id: 'Coily', label: 'Coily' },
  { id: 'not-sure', label: 'Not sure yet' },
  { id: 'other', label: 'Other' },
];

const STYLING_HABIT_OPTIONS: { id: HairStylingHabit; label: string; desc: string }[] = [
  { id: 'air-dry', label: 'Air-dry naturally', desc: 'Minimal touch, no heat tools' },
  {
    id: 'quick-product',
    label: 'Quick product & shape',
    desc: 'A small dab of clay, cream, or mist',
  },
  {
    id: 'heat-styled',
    label: 'Blow-dry or heat styled',
    desc: 'Comfortable spending time with a dryer or brush',
  },
  {
    id: 'protective-low-touch',
    label: 'Protective / low-touch',
    desc: 'Moisture-first care with gentle detangling',
  },
  {
    id: 'other',
    label: 'Other',
    desc: 'Describe your usual styling approach',
  },
];

const FACIAL_HAIR_OPTIONS: { id: FacialHairPreference; label: string }[] = [
  { id: 'skip', label: 'Skip / Not applicable' },
  { id: 'clean-shaven', label: 'Clean-shaven' },
  { id: 'light-stubble', label: 'Light stubble' },
  { id: 'trimmed-beard', label: 'Trimmed short beard' },
  { id: 'full-beard', label: 'Full beard' },
  { id: 'other', label: 'Other' },
];

const SKIN_FEEL_OPTIONS: { id: SkinFeelOption; label: string; desc: string }[] = [
  { id: 'normal', label: 'Balanced', desc: 'Generally comfortable and even throughout the day' },
  { id: 'dry', label: 'Dry', desc: 'Often feels tight, matte, or thirsty after washing' },
  { id: 'oily', label: 'Oily', desc: 'Noticeable midday shine across most of the face' },
  {
    id: 'combination',
    label: 'Combination',
    desc: 'Slight shine in the T-zone with calmer or drier cheeks',
  },
  {
    id: 'sensitive',
    label: 'Sensitive',
    desc: 'Reacts easily to heavy fragrance, harsh cleansers, or weather shifts',
  },
  { id: 'other', label: 'Other', desc: 'Share how your skin usually feels day to day' },
];

const SENSITIVITY_CHIPS = [
  'Fragrance',
  'Sulfates',
  'Strong exfoliants',
  'Alcohol-heavy formulas',
  'Redness-prone',
  'Dry patches',
  'Other',
];

const TIME_OPTIONS: { id: DailyRoutineTime; label: string; desc: string }[] = [
  { id: '5-min', label: '5 mins', desc: 'Essential wash-and-go steps only' },
  { id: '10-min', label: '10 mins', desc: 'Balanced daily skin & hair care' },
  { id: '20-plus-min', label: '20+ mins', desc: 'Room for targeted steps & styling' },
  { id: 'custom', label: 'Custom', desc: 'Enter your exact minutes per day (1–120)' },
];

const BUDGET_TIERS: {
  id: BudgetTier;
  label: string;
  inr: number;
  descINR: string;
  descUSD: string;
}[] = [
  {
    id: 'essential',
    label: 'Essential',
    inr: 1000,
    descINR: '₹500 – ₹1,000 / mo',
    descUSD: '$6 – $12 / mo',
  },
  {
    id: 'balanced',
    label: 'Balanced',
    inr: 1800,
    descINR: '₹1,000 – ₹2,500 / mo',
    descUSD: '$12 – $30 / mo',
  },
  {
    id: 'elevated',
    label: 'Elevated',
    inr: 3500,
    descINR: '₹2,500+ / mo',
    descUSD: '$30+ / mo',
  },
];

const AVOID_OPTIONS = [
  'High heat styling',
  'Heavy fragrances',
  'Drying alcohols',
  'Sulfates (SLS)',
  'Complicated 5+ step routines',
  'Other',
];

interface OtherTextFieldProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

function OtherTextField({
  id,
  label,
  placeholder,
  value,
  onChange,
}: OtherTextFieldProps) {
  const isEmpty = value.trim().length === 0;
  return (
    <div className="p-4 rounded-xl bg-[#1A1414] border border-[rgba(232,165,152,0.22)] space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-xs font-medium text-[#F5EBE6]">
          {label}
        </label>
        <span className="text-[11px] text-[#C9B8B0] tabular-nums">
          {value.length} / {MAX_OTHER_TEXT_LENGTH}
        </span>
      </div>
      <input
        id={id}
        type="text"
        maxLength={MAX_OTHER_TEXT_LENGTH}
        value={value}
        onChange={(e) => onChange(sanitizeLiveInput(e.target.value))}
        placeholder={placeholder}
        aria-describedby={`${id}-hint`}
        className="w-full px-3.5 py-2.5 rounded-lg bg-[#120E0E] border border-[rgba(232,165,152,0.22)] text-sm text-[#F5EBE6] placeholder:text-[#C9B8B0]/55 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A598] focus:border-[#E8A598]"
      />
      <p
        id={`${id}-hint`}
        role="status"
        aria-live="polite"
        className={`text-xs leading-relaxed ${
          isEmpty ? 'text-[#E8A598]' : 'text-[#C9B8B0]'
        }`}
      >
        {isEmpty
          ? 'Optional: add a brief note so we can reflect it in your plan.'
          : 'Saved as a personal preference note only (cosmetic styling context).'}
      </p>
    </div>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { preferences, updatePreferences } = useAllure();

  const [step, setStep] = useState(1);
  const [highestVisited, setHighestVisited] = useState(preferences.completedAt ? 3 : 1);
  const [saving, setSaving] = useState(false);

  const [customMinutesDraft, setCustomMinutesDraft] = useState<string>(
    String(preferences.customDailyMinutes ?? 15)
  );
  const [customBudgetDraft, setCustomBudgetDraft] = useState<string>(() =>
    preferences.currency === 'USD'
      ? String(Math.max(1, Math.round(preferences.monthlyBudgetINR / 80)))
      : String(preferences.monthlyBudgetINR)
  );

  const customOther = preferences.customOther;

  const updateOtherField = (field: keyof CustomOtherAnswers, value: string) => {
    updatePreferences({
      customOther: {
        ...customOther,
        [field]: value,
      },
    });
  };

  const toggleGoal = (goalId: GroomingGoal) => {
    const exists = preferences.goals.includes(goalId);
    const next = exists
      ? preferences.goals.filter((g) => g !== goalId)
      : [...preferences.goals, goalId];
    updatePreferences({ goals: next });
  };

  const toggleSensitivity = (item: string) => {
    const exists = preferences.skinSensitivities.includes(item);
    const next = exists
      ? preferences.skinSensitivities.filter((s) => s !== item)
      : [...preferences.skinSensitivities, item];
    updatePreferences({ skinSensitivities: next });
  };

  const toggleAvoid = (item: string) => {
    const exists = preferences.avoidItems.includes(item);
    const next = exists
      ? preferences.avoidItems.filter((a) => a !== item)
      : [...preferences.avoidItems, item];
    updatePreferences({ avoidItems: next });
  };

  const handleCurrencyChange = (nextCurr: 'INR' | 'USD') => {
    updatePreferences({ currency: nextCurr });
    const converted =
      nextCurr === 'USD'
        ? Math.max(1, Math.round(preferences.monthlyBudgetINR / 80))
        : preferences.monthlyBudgetINR;
    setCustomBudgetDraft(String(converted));
  };

  const handleCustomMinutesChange = (raw: string) => {
    setCustomMinutesDraft(raw);
    const parsed = Number(raw);
    if (raw.trim() !== '' && Number.isFinite(parsed) && parsed >= 1 && parsed <= 120) {
      updatePreferences({ customDailyMinutes: Math.round(parsed) });
    }
  };

  const handleCustomBudgetChange = (raw: string) => {
    setCustomBudgetDraft(raw);
    const parsed = Number(raw);
    if (raw.trim() !== '' && Number.isFinite(parsed) && parsed > 0) {
      const inrValue =
        preferences.currency === 'USD'
          ? Math.round(parsed * 80)
          : Math.round(parsed);
      const clampedINR = Math.min(100000, Math.max(100, inrValue));
      updatePreferences({
        monthlyBudgetINR: clampedINR,
        budgetTier: deriveBudgetTier(clampedINR),
        useCustomBudget: true,
      });
    }
  };

  const parsedMinutes = Number(customMinutesDraft);
  const customMinutesInvalid =
    preferences.dailyTime === 'custom' &&
    (customMinutesDraft.trim() === '' ||
      !Number.isFinite(parsedMinutes) ||
      parsedMinutes < 1 ||
      parsedMinutes > 120);

  const parsedBudget = Number(customBudgetDraft);
  const customBudgetInvalid =
    Boolean(preferences.useCustomBudget) &&
    (customBudgetDraft.trim() === '' ||
      !Number.isFinite(parsedBudget) ||
      parsedBudget < (preferences.currency === 'USD' ? 2 : 100) ||
      parsedBudget > (preferences.currency === 'USD' ? 1250 : 100000));

  const goNext = () => {
    if (step < 3) {
      const next = step + 1;
      setStep(next);
      setHighestVisited((prev) => Math.max(prev, next));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const sanitizedCustomOther: CustomOtherAnswers = {
        goals: sanitizeFreeText(customOther.goals),
        hairLength: sanitizeFreeText(customOther.hairLength),
        hairStylingHabit: sanitizeFreeText(customOther.hairStylingHabit),
        selfReportedHairTexture: sanitizeFreeText(customOther.selfReportedHairTexture),
        facialHairPreference: sanitizeFreeText(customOther.facialHairPreference),
        skinFeel: sanitizeFreeText(customOther.skinFeel),
        skinSensitivities: sanitizeFreeText(customOther.skinSensitivities),
        avoidItems: sanitizeFreeText(customOther.avoidItems),
      };
      const cleanedPrefs = {
        ...preferences,
        allergyNote: sanitizeFreeText(preferences.allergyNote),
        customDailyMinutes: resolveDailyMinutes(preferences),
        customOther: sanitizedCustomOther,
        completedAt: new Date().toISOString(),
      };
      await saveUserPreferences(cleanedPrefs);
      updatePreferences({
        allergyNote: cleanedPrefs.allergyNote,
        customDailyMinutes: cleanedPrefs.customDailyMinutes,
        customOther: sanitizedCustomOther,
        completedAt: cleanedPrefs.completedAt,
      });
      navigate('/analysis');
    } finally {
      setSaving(false);
    }
  };

  const displayBudget =
    preferences.currency === 'USD'
      ? `$${Math.max(1, Math.round(preferences.monthlyBudgetINR / 80))} / month`
      : `₹${preferences.monthlyBudgetINR.toLocaleString('en-IN')} / month`;

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-left">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#E8A598] mb-2">
            Step 1 of 3 · Personal Profile
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#F5EBE6]">
            Tell us about your routine &amp; goals
          </h1>
          <p className="text-sm text-[#C9B8B0] mt-2 leading-relaxed">
            Your preferences calibrate our styling recommendations, maintenance level,
            and product curation before you upload your portrait.
          </p>
        </div>

        <StepProgress
          steps={STEPS}
          currentStep={step}
          highestVisitedStep={highestVisited}
          onStepClick={(n) => setStep(n)}
        />

        <div
          key={step}
          className="luxury-glass rounded-2xl p-6 sm:p-8 text-left space-y-7 animate-fade-up"
        >
          {/* STEP 1: Profile & Goals */}
          {step === 1 && (
            <div className="space-y-7">
              <div>
                <h2 className="font-serif text-3xl font-semibold text-[#F5EBE6] mb-1">
                  01. Profile &amp; Goals
                </h2>
                <p className="text-sm text-[#C9B8B0]">
                  Choose your preferred style curation and what you want to focus on first.
                </p>
              </div>

              {/* Styling Preference Filter */}
              <div className="space-y-3">
                <span className="block text-xs font-medium text-[#C9B8B0]">
                  Styling Preference Filter (Optional — used only to tailor cut suggestions)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {STYLE_PREFERENCE_OPTIONS.map((opt) => (
                    <SelectionCard
                      key={opt.id}
                      label={opt.label}
                      description={opt.desc}
                      selected={(preferences.stylePreference ?? 'all') === opt.id}
                      onClick={() => updatePreferences({ stylePreference: opt.id })}
                    />
                  ))}
                </div>
              </div>

              {/* Primary Grooming Goals */}
              <div className="space-y-3">
                <span className="block text-xs font-medium text-[#C9B8B0]">
                  Primary Grooming Goals (Select all that apply)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {GOAL_OPTIONS.map((goal) => (
                    <SelectionCard
                      key={goal.id}
                      type="checkbox"
                      label={goal.label}
                      description={goal.desc}
                      selected={preferences.goals.includes(goal.id)}
                      onClick={() => toggleGoal(goal.id)}
                    />
                  ))}
                </div>
                {preferences.goals.includes('other') && (
                  <OtherTextField
                    id="other-goals-input"
                    label="Your other grooming goal (max 80 characters)"
                    placeholder="e.g., growing hair out evenly, calmer morning routine"
                    value={customOther.goals}
                    onChange={(val) => updateOtherField('goals', val)}
                  />
                )}
              </div>

              {/* Facial Hair Preference */}
              <div className="space-y-3">
                <span className="block text-xs font-medium text-[#C9B8B0]">
                  Facial Hair Preference (Optional — skip if not applicable)
                </span>
                <div className="flex flex-wrap gap-2">
                  {FACIAL_HAIR_OPTIONS.map((opt) => (
                    <ToggleChip
                      key={opt.id}
                      label={opt.label}
                      selected={preferences.facialHairPreference === opt.id}
                      onClick={() => updatePreferences({ facialHairPreference: opt.id })}
                    />
                  ))}
                </div>
                {preferences.facialHairPreference === 'other' && (
                  <OtherTextField
                    id="other-facial-hair-input"
                    label="Your facial hair preference (max 80 characters)"
                    placeholder="e.g., neat mustache with short stubble"
                    value={customOther.facialHairPreference}
                    onChange={(val) => updateOtherField('facialHairPreference', val)}
                  />
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Hair & Skin Context */}
          {step === 2 && (
            <div className="space-y-7">
              <div>
                <h2 className="font-serif text-3xl font-semibold text-[#F5EBE6] mb-1">
                  02. Hair &amp; Skin Context
                </h2>
                <p className="text-sm text-[#C9B8B0]">
                  Share how your hair is worn today and how your skin feels day to day.
                </p>
              </div>

              {/* Current Hair Length */}
              <div className="space-y-3">
                <span className="block text-xs font-medium text-[#C9B8B0]">
                  Current Hair Length
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {HAIR_LENGTH_OPTIONS.map((len) => (
                    <SelectionCard
                      key={len.id}
                      label={len.label}
                      selected={preferences.hairLength === len.id}
                      onClick={() => updatePreferences({ hairLength: len.id })}
                    />
                  ))}
                </div>
                {preferences.hairLength === 'other' && (
                  <OtherTextField
                    id="other-length-input"
                    label="Describe your current hair length (max 80 characters)"
                    placeholder="e.g., undercut with medium top, growing out a pixie"
                    value={customOther.hairLength}
                    onChange={(val) => updateOtherField('hairLength', val)}
                  />
                )}
              </div>

              {/* Styling Habits */}
              <div className="space-y-3">
                <span className="block text-xs font-medium text-[#C9B8B0]">
                  Usual Hair Styling Habits
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {STYLING_HABIT_OPTIONS.map((habit) => (
                    <SelectionCard
                      key={habit.id}
                      label={habit.label}
                      description={habit.desc}
                      selected={preferences.hairStylingHabit === habit.id}
                      onClick={() => updatePreferences({ hairStylingHabit: habit.id })}
                    />
                  ))}
                </div>
                {preferences.hairStylingHabit === 'other' && (
                  <OtherTextField
                    id="other-habit-input"
                    label="Your usual styling habit (max 80 characters)"
                    placeholder="e.g., diffuser once a week, hair oil and comb"
                    value={customOther.hairStylingHabit}
                    onChange={(val) => updateOtherField('hairStylingHabit', val)}
                  />
                )}
              </div>

              {/* Optional Self-Reported Hair Texture */}
              <div className="space-y-3">
                <span className="block text-xs font-medium text-[#C9B8B0]">
                  Natural Hair Texture (Optional — verified by photo analysis in the next step)
                </span>
                <div className="flex flex-wrap gap-2">
                  {SELF_REPORTED_TEXTURE_OPTIONS.map((opt) => (
                    <ToggleChip
                      key={opt.id}
                      label={opt.label}
                      selected={(preferences.selfReportedHairTexture ?? 'not-sure') === opt.id}
                      onClick={() => updatePreferences({ selfReportedHairTexture: opt.id })}
                    />
                  ))}
                </div>
                {preferences.selfReportedHairTexture === 'other' && (
                  <OtherTextField
                    id="other-texture-input"
                    label="Describe your natural hair texture (max 80 characters)"
                    placeholder="e.g., wavy roots with tighter curls at the ends"
                    value={customOther.selfReportedHairTexture}
                    onChange={(val) => updateOtherField('selfReportedHairTexture', val)}
                  />
                )}
              </div>

              {/* Self-Reported Skin Feel */}
              <div className="space-y-3">
                <span className="block text-xs font-medium text-[#C9B8B0]">
                  How Does Your Skin Typically Feel?
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SKIN_FEEL_OPTIONS.map((opt) => (
                    <SelectionCard
                      key={opt.id}
                      label={opt.label}
                      description={opt.desc}
                      selected={preferences.skinFeel === opt.id}
                      onClick={() => updatePreferences({ skinFeel: opt.id })}
                    />
                  ))}
                </div>
                {preferences.skinFeel === 'other' && (
                  <OtherTextField
                    id="other-skin-feel-input"
                    label="Describe how your skin usually feels (max 80 characters)"
                    placeholder="e.g., changes with humid summers and dry winters"
                    value={customOther.skinFeel}
                    onChange={(val) => updateOtherField('skinFeel', val)}
                  />
                )}
              </div>

              {/* Sensitivities */}
              <div className="space-y-3">
                <span className="block text-xs font-medium text-[#C9B8B0]">
                  Known Sensitivities or Comfort Preferences (Optional)
                </span>
                <div className="flex flex-wrap gap-2">
                  {SENSITIVITY_CHIPS.map((item) => (
                    <ToggleChip
                      key={item}
                      label={item}
                      selected={preferences.skinSensitivities.includes(item)}
                      onClick={() => toggleSensitivity(item)}
                    />
                  ))}
                </div>
                {preferences.skinSensitivities.includes('Other') && (
                  <OtherTextField
                    id="other-sensitivities-input"
                    label="Your other sensitivity or ingredient note (max 80 characters)"
                    placeholder="e.g., avoid strong citrus oils or heavy silicones"
                    value={customOther.skinSensitivities}
                    onChange={(val) => updateOtherField('skinSensitivities', val)}
                  />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="allergy-note"
                    className="block text-xs font-medium text-[#C9B8B0]"
                  >
                    Additional Ingredient Preference Note (Optional)
                  </label>
                  <span className="text-[11px] text-[#C9B8B0] tabular-nums">
                    {preferences.allergyNote.length} / {MAX_OTHER_TEXT_LENGTH}
                  </span>
                </div>
                <input
                  id="allergy-note"
                  type="text"
                  maxLength={MAX_OTHER_TEXT_LENGTH}
                  value={preferences.allergyNote}
                  onChange={(e) =>
                    updatePreferences({ allergyNote: sanitizeLiveInput(e.target.value) })
                  }
                  placeholder="e.g., prefer lightweight gel textures"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1A1414] border border-[rgba(232,165,152,0.18)] text-sm text-[#F5EBE6] placeholder:text-[#C9B8B0]/55 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A598] focus:border-[#E8A598]"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Lifestyle & Budget */}
          {step === 3 && (
            <div className="space-y-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-3xl font-semibold text-[#F5EBE6] mb-1">
                    03. Lifestyle &amp; Budget
                  </h2>
                  <p className="text-sm text-[#C9B8B0]">
                    Set a realistic daily routine window, comfortable monthly budget, and
                    anything you prefer to skip.
                  </p>
                </div>

                <div
                  role="group"
                  aria-label="Display currency"
                  className="inline-flex p-1 rounded-lg bg-[#120E0E] border border-[rgba(232,165,152,0.18)]"
                >
                  {(['INR', 'USD'] as const).map((curr) => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => handleCurrencyChange(curr)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A598] ${
                        preferences.currency === curr
                          ? 'bg-[#E8A598] text-[#120E0E] font-semibold'
                          : 'text-[#C9B8B0] hover:text-[#F5EBE6]'
                      }`}
                    >
                      {curr === 'INR' ? 'INR ₹' : 'USD $'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Daily Time */}
              <div className="space-y-3">
                <span className="block text-xs font-medium text-[#C9B8B0]">
                  Daily Routine Time Available
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TIME_OPTIONS.map((t) => (
                    <SelectionCard
                      key={t.id}
                      label={t.label}
                      description={t.desc}
                      selected={preferences.dailyTime === t.id}
                      onClick={() => updatePreferences({ dailyTime: t.id })}
                    />
                  ))}
                </div>

                {preferences.dailyTime === 'custom' && (
                  <div className="p-4 rounded-xl bg-[#1A1414] border border-[rgba(232,165,152,0.2)] space-y-2">
                    <label
                      htmlFor="custom-daily-minutes"
                      className="block text-xs font-medium text-[#F5EBE6]"
                    >
                      Custom daily routine time (minutes per day, 1–120)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        id="custom-daily-minutes"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={120}
                        value={customMinutesDraft}
                        onChange={(e) => handleCustomMinutesChange(e.target.value)}
                        aria-invalid={customMinutesInvalid}
                        aria-describedby="custom-daily-minutes-hint"
                        className="w-32 px-3.5 py-2.5 rounded-lg bg-[#120E0E] border border-[rgba(232,165,152,0.22)] text-sm text-[#F5EBE6] tabular-nums focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A598] focus:border-[#E8A598]"
                      />
                      <span className="text-xs text-[#C9B8B0]">minutes / day</span>
                    </div>
                    <p
                      id="custom-daily-minutes-hint"
                      role="status"
                      aria-live="polite"
                      className={`text-xs ${
                        customMinutesInvalid ? 'text-[#E8A598]' : 'text-[#C9B8B0]'
                      }`}
                    >
                      {customMinutesInvalid
                        ? 'Enter a number between 1 and 120 minutes.'
                        : `Used numerically to rank routines within ${resolveDailyMinutes(preferences)} min/day.`}
                    </p>
                  </div>
                )}
              </div>

              {/* Monthly Budget Slider + Tiers */}
              <div className="p-5 rounded-xl bg-[#1A1414] border border-[rgba(232,165,152,0.16)] space-y-5">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="monthly-budget" className="text-xs font-medium text-[#C9B8B0]">
                    Monthly Grooming Budget
                  </label>
                  <span className="text-lg font-semibold text-[#E8A598] tabular-nums">
                    {displayBudget}
                  </span>
                </div>

                <input
                  id="monthly-budget"
                  type="range"
                  min={500}
                  max={5000}
                  step={100}
                  value={Math.min(5000, Math.max(500, preferences.monthlyBudgetINR))}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    updatePreferences({
                      monthlyBudgetINR: val,
                      budgetTier: deriveBudgetTier(val),
                      useCustomBudget: false,
                    });
                    setCustomBudgetDraft(
                      preferences.currency === 'USD'
                        ? String(Math.max(1, Math.round(val / 80)))
                        : String(val)
                    );
                  }}
                  className="w-full luxury-range"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {BUDGET_TIERS.map((tier) => (
                    <SelectionCard
                      key={tier.id}
                      label={tier.label}
                      description={
                        preferences.currency === 'USD' ? tier.descUSD : tier.descINR
                      }
                      selected={
                        !preferences.useCustomBudget && preferences.budgetTier === tier.id
                      }
                      onClick={() => {
                        updatePreferences({
                          budgetTier: tier.id,
                          monthlyBudgetINR: tier.inr,
                          useCustomBudget: false,
                        });
                        setCustomBudgetDraft(
                          preferences.currency === 'USD'
                            ? String(Math.max(1, Math.round(tier.inr / 80)))
                            : String(tier.inr)
                        );
                      }}
                    />
                  ))}
                  <SelectionCard
                    label="Custom amount"
                    description={
                      preferences.currency === 'USD'
                        ? 'Enter your exact monthly budget in USD'
                        : 'Enter your exact monthly budget in INR'
                    }
                    selected={Boolean(preferences.useCustomBudget)}
                    onClick={() => updatePreferences({ useCustomBudget: true })}
                  />
                </div>

                {preferences.useCustomBudget && (
                  <div className="p-4 rounded-xl bg-[#120E0E] border border-[rgba(232,165,152,0.2)] space-y-2">
                    <label
                      htmlFor="custom-monthly-budget"
                      className="block text-xs font-medium text-[#F5EBE6]"
                    >
                      Custom monthly budget ({preferences.currency === 'USD' ? 'USD $' : 'INR ₹'})
                    </label>
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-semibold text-[#E8A598]">
                        {preferences.currency === 'USD' ? '$' : '₹'}
                      </span>
                      <input
                        id="custom-monthly-budget"
                        type="number"
                        inputMode="numeric"
                        min={preferences.currency === 'USD' ? 2 : 100}
                        max={preferences.currency === 'USD' ? 1250 : 100000}
                        value={customBudgetDraft}
                        onChange={(e) => handleCustomBudgetChange(e.target.value)}
                        aria-invalid={customBudgetInvalid}
                        aria-describedby="custom-budget-hint"
                        className="w-40 px-3.5 py-2.5 rounded-lg bg-[#1A1414] border border-[rgba(232,165,152,0.22)] text-sm text-[#F5EBE6] tabular-nums focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A598] focus:border-[#E8A598]"
                      />
                      <span className="text-xs text-[#C9B8B0]">/ month</span>
                    </div>
                    <p
                      id="custom-budget-hint"
                      role="status"
                      aria-live="polite"
                      className={`text-xs ${
                        customBudgetInvalid ? 'text-[#E8A598]' : 'text-[#C9B8B0]'
                      }`}
                    >
                      {customBudgetInvalid
                        ? preferences.currency === 'USD'
                          ? 'Enter an amount between $2 and $1,250 per month.'
                          : 'Enter an amount between ₹100 and ₹1,00,000 per month.'
                        : `Mapped numerically to the ${preferences.budgetTier} tier for recommendation scoring.`}
                    </p>
                  </div>
                )}
              </div>

              {/* Items to Avoid */}
              <div className="space-y-3">
                <span className="block text-xs font-medium text-[#C9B8B0]">
                  Styles or Products to Avoid (Optional)
                </span>
                <div className="flex flex-wrap gap-2">
                  {AVOID_OPTIONS.map((item) => (
                    <ToggleChip
                      key={item}
                      label={item}
                      selected={preferences.avoidItems.includes(item)}
                      onClick={() => toggleAvoid(item)}
                    />
                  ))}
                </div>
                {preferences.avoidItems.includes('Other') && (
                  <OtherTextField
                    id="other-avoid-input"
                    label="What else would you prefer to avoid? (max 80 characters)"
                    placeholder="e.g., glossy pomades, strong mint scents, buzzed sides"
                    value={customOther.avoidItems}
                    onChange={(val) => updateOtherField('avoidItems', val)}
                  />
                )}
              </div>

              {/* Clean Profile Summary */}
              <div className="p-5 rounded-xl bg-[#1A1414] border border-[rgba(232,165,152,0.16)]">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-[#E8A598]" aria-hidden="true" />
                  <h3 className="font-sans text-sm font-semibold text-[#F5EBE6]">
                    Profile Summary
                  </h3>
                </div>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs text-[#C9B8B0]">
                  <div>
                    <dt className="inline">Styling focus: </dt>
                    <dd className="inline font-medium text-[#F5EBE6]">
                      {STYLE_PREFERENCE_LABELS[preferences.stylePreference ?? 'all']}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline">Hair &amp; daily time: </dt>
                    <dd className="inline font-medium text-[#F5EBE6] capitalize">
                      {preferences.hairLength} · {formatDailyTimeShort(preferences)}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline">Skin feel: </dt>
                    <dd className="inline font-medium text-[#F5EBE6] capitalize">
                      {preferences.skinFeel === 'normal'
                        ? 'Balanced'
                        : preferences.skinFeel.replace(/-/g, ' ')}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline">Budget target: </dt>
                    <dd className="inline font-medium text-[#E8A598] tabular-nums">
                      {displayBudget}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {/* Footer Navigation */}
          <div className="pt-6 border-t border-[rgba(232,165,152,0.14)] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {step > 1 ? (
                <Button variant="outline" size="md" onClick={goBack}>
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </Button>
              ) : (
                <Link to="/">
                  <Button variant="outline" size="md">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Home</span>
                  </Button>
                </Link>
              )}
            </div>

            <div className="flex items-center gap-3">
              {step < 3 ? (
                <>
                  <Button variant="ghost" size="md" onClick={goNext}>
                    Skip
                  </Button>
                  <Button variant="primary" size="md" onClick={goNext}>
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  disabled={saving}
                  onClick={handleFinish}
                >
                  <span>{saving ? 'Saving Profile...' : 'Continue to Photo Analysis'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
