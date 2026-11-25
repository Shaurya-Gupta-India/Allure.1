import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Clock,
  Columns2,
  Droplets,
  Layers,
  Minus,
  ScanFace,
  Scissors,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import PageShell from '../components/Layout';
import { StatusChip } from '../components/ui';
import {
  FACE_SHAPE_EXPLANATIONS,
  FEATURE_FACE_SHAPE_ICONS,
  FEATURE_HAIR_WAVE_ICONS,
  FEATURE_NOT_DONE_LIST,
  HAIR_ONLY_CARE_BY_TEXTURE,
} from '../data';
import { FaceShapeOption, HairTextureOption } from '../types';

const ROUTINE_CADENCE_PREVIEWS: Record<
  '5-min' | '10-min' | '20-min',
  {
    label: string;
    budgetNote: string;
    am: string[];
    pm: string[];
  }
> = {
  '5-min': {
    label: '5 Minutes / Day',
    budgetNote: 'Fits ₹500–₹1,000 / mo essential tier',
    am: ['Gentle pH-balanced cleanse (60s)', 'Lightweight moisturizer + SPF 50'],
    pm: ['Evening cleanse to clear sunscreen & oil', 'Calming barrier moisturizer'],
  },
  '10-min': {
    label: '10 Minutes / Day',
    budgetNote: 'Fits ₹1,000–₹2,500 / mo balanced tier',
    am: [
      'Gentle amino cleanse',
      'Hydrating serum or balancing niacinamide',
      'Invisible broad-spectrum SPF 50 + finger-shaped hair finish',
    ],
    pm: [
      'Thorough evening cleanse',
      'Targeted hydration serum',
      'Barrier-repair night cream + scalp/beard conditioning',
    ],
  },
  '20-min': {
    label: '20+ Minutes / Day',
    budgetNote: 'Fits ₹2,500+ / mo elevated tier',
    am: [
      'Gentle cleanse + hydrating essence',
      'Antioxidant or balancing serum',
      'Barrier moisturizer + SPF 50',
      'Heat-protected styling & precision detail finish',
    ],
    pm: [
      'Double cleanse on heavy SPF or styling days',
      'Weekly mild exfoliation or hydrating mask',
      'Peptide or ceramide night cream + strand nourishment',
    ],
  },
};

export default function FeaturesPage() {
  const [selectedShape, setSelectedShape] = useState<FaceShapeOption>('Oval');
  const [selectedTexture, setSelectedTexture] = useState<HairTextureOption>('Wavy');
  const [selectedCadence, setSelectedCadence] = useState<'5-min' | '10-min' | '20-min'>(
    '5-min'
  );

  const activeHairCare = HAIR_ONLY_CARE_BY_TEXTURE[selectedTexture];
  const activeRoutine = ROUTINE_CADENCE_PREVIEWS[selectedCadence];

  return (
    <PageShell noPadding>
      {/* Page Header */}
      <section className="py-16 lg:py-24 bg-[#120E0E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-5 animate-fade-up">
          <p className="text-xs font-medium tracking-[0.22em] uppercase text-[#E8A598]">
            Features &amp; Core Intelligence
          </p>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#F5EBE6] leading-[1.06] max-w-3xl">
            Every pillar of your personal grooming blueprint
          </h1>

          <p className="text-base sm:text-lg text-[#C9B8B0] max-w-2xl leading-relaxed">
            Explore how ALLURE combines facial geometry, hair strand classification,
            non-diagnostic cosmetic skin cues, and budget-aware routines within one
            unified Dark Luxury experience built equally for men and women.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to="/onboarding">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#E8A598] hover:bg-[#D98A7C] text-[#120E0E] text-sm font-semibold transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A598]"
              >
                <span>Start Your Analysis</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </Link>
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-[rgba(232,165,152,0.28)] hover:border-[#E8A598] text-sm font-medium text-[#F5EBE6] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A598]"
            >
              <span>See How It Works</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Pillar 1: Facial Geometry & Proportions */}
      <section className="py-16 lg:py-24 bg-[#1A1414] border-t border-[rgba(232,165,152,0.16)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center text-left">
            <div className="lg:col-span-6 space-y-5">
              <div className="space-y-3">
                <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#E8A598]">
                  01 · Facial Geometry &amp; Proportions
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-semibold text-[#F5EBE6] leading-tight">
                  MediaPipe landmark mapping &amp; mixed-shape nuance
                </h2>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <StatusChip label="6 Face Shapes" tone="demo" />
                  <StatusChip label="Mixed-Shape Tendencies" tone="progress" />
                  <StatusChip label="Honest Uncertainty Mode" tone="conditional" />
                </div>
              </div>

              <div className="space-y-3 text-sm sm:text-base text-[#C9B8B0] leading-relaxed">
                <p>
                  ALLURE evaluates normalized length-to-width ratios across forehead,
                  cheekbone, and jawline landmarks using MediaPipe geometric reference
                  points—calibrated identically for male and female portraits without rigid
                  stereotypes.
                </p>
                <p>
                  Because real proportions often sit between two outlines, ALLURE surfaces
                  both a primary shape and an optional secondary tendency (such as{' '}
                  <strong className="text-[#F5EBE6]">Oval with Diamond tendencies</strong>),
                  returns an honest re-capture prompt when shadows or angles reduce clarity,
                  and lets you confirm or refine your shape anytime.
                </p>
              </div>
            </div>

            {/* Interactive 6-Shape Preview Card */}
            <div className="lg:col-span-6">
              <div className="luxury-glass rounded-2xl p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ScanFace className="w-4 h-4 text-[#E8A598]" aria-hidden="true" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#F5EBE6]">
                      Interactive Shape Preview
                    </span>
                  </div>
                  <span className="text-[11px] text-[#C9B8B0]">Select an outline</span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {FEATURE_FACE_SHAPE_ICONS.map((shape) => {
                    const shapeKey = shape.name as FaceShapeOption;
                    const active = selectedShape === shapeKey;
                    return (
                      <button
                        key={shape.name}
                        type="button"
                        onClick={() => setSelectedShape(shapeKey)}
                        aria-pressed={active}
                        className={`rounded-xl p-3 flex flex-col items-center justify-center gap-2 border transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A598] ${
                          active
                            ? 'bg-[#2A2020] border-[#E8A598] shadow-[0_0_20px_-8px_rgba(232,165,152,0.5)]'
                            : 'bg-[#140F0F] border-[rgba(232,165,152,0.14)] hover:border-[rgba(232,165,152,0.38)]'
                        }`}
                      >
                        <svg
                          width="42"
                          height="42"
                          viewBox="0 0 44 44"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d={shape.path}
                            stroke={active ? '#E8A598' : '#C9B8B0'}
                            strokeWidth={active ? '1.8' : '1.3'}
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span
                          className={`text-xs font-medium ${
                            active ? 'text-[#E8A598]' : 'text-[#F5EBE6]'
                          }`}
                        >
                          {shape.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="p-4 rounded-xl bg-[#140F0F] border border-[rgba(232,165,152,0.18)] space-y-1.5">
                  <p className="text-xs font-semibold text-[#E8A598]">
                    {selectedShape} Proportion Guidance
                  </p>
                  <p className="text-xs sm:text-sm text-[#C9B8B0] leading-relaxed">
                    {FACE_SHAPE_EXPLANATIONS[selectedShape]}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillar 2: Hair Texture Analysis */}
      <section className="py-16 lg:py-24 bg-[#120E0E] border-t border-[rgba(232,165,152,0.16)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center text-left">
            {/* Interactive Texture Preview */}
            <div className="lg:col-span-6 lg:order-1 order-2">
              <div className="luxury-glass rounded-2xl p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-[#E8A598]" aria-hidden="true" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#F5EBE6]">
                      Strand Pattern Explorer
                    </span>
                  </div>
                  <span className="text-[11px] text-[#C9B8B0]">Separated from length</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {FEATURE_HAIR_WAVE_ICONS.map((wave) => {
                    const tex = wave.name as HairTextureOption;
                    const active = selectedTexture === tex;
                    return (
                      <button
                        key={wave.name}
                        type="button"
                        onClick={() => setSelectedTexture(tex)}
                        aria-pressed={active}
                        className={`rounded-xl p-3.5 flex flex-col items-center justify-center gap-2 border transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A598] ${
                          active
                            ? 'bg-[#2A2020] border-[#E8A598]'
                            : 'bg-[#140F0F] border-[rgba(232,165,152,0.14)] hover:border-[rgba(232,165,152,0.38)]'
                        }`}
                      >
                        <svg
                          width="36"
                          height="40"
                          viewBox="0 0 40 44"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d={wave.path}
                            stroke={active ? '#E8A598' : '#C9B8B0'}
                            strokeWidth="1.7"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span
                          className={`text-xs font-medium ${
                            active ? 'text-[#E8A598]' : 'text-[#F5EBE6]'
                          }`}
                        >
                          {wave.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="p-4 rounded-xl bg-[#140F0F] border border-[rgba(232,165,152,0.18)] space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#E8A598]">
                      {selectedTexture} Care Rhythm
                    </span>
                    <span className="text-[11px] text-[#C9B8B0]">
                      Wash cadence: {activeHairCare.washFrequency}
                    </span>
                  </div>
                  <p className="text-xs text-[#F5EBE6] leading-relaxed">
                    {activeHairCare.baseTips[0]}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {activeHairCare.baseProducts.map((prod) => (
                      <span
                        key={prod}
                        className="px-2.5 py-1 rounded-full text-[11px] bg-[#221A1A] border border-[rgba(232,165,152,0.16)] text-[#C9B8B0]"
                      >
                        {prod}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 lg:order-2 order-1 space-y-5">
              <div className="space-y-3">
                <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#E8A598]">
                  02 · Hair Texture Analysis
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-semibold text-[#F5EBE6] leading-tight">
                  Straight, wavy, curly &amp; coily — decoupled from cut length
                </h2>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <StatusChip label="4 Strand Categories" tone="demo" />
                  <StatusChip label="Length-Aware Styling" tone="progress" />
                </div>
              </div>

              <div className="space-y-3 text-sm sm:text-base text-[#C9B8B0] leading-relaxed">
                <p>
                  Hair texture determines how a cut settles, holds volume, and responds to
                  humidity, while length determines which silhouettes are achievable right
                  now. ALLURE tracks both independently.
                </p>
                <p>
                  Whether your hair is buzzed close, cropped, medium-length, or long, our
                  engine pairs natural dry strand pattern with your everyday heat and
                  styling habits—and flags <strong className="text-[#F5EBE6]">unable to assess</strong>{' '}
                  honestly when hair is covered or heavily product-styled.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillar 3: Non-Diagnostic Visible Skin Insights */}
      <section className="py-16 lg:py-24 bg-[#1A1414] border-t border-[rgba(232,165,152,0.16)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center text-left">
            <div className="lg:col-span-6 space-y-5">
              <div className="space-y-3">
                <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#E8A598]">
                  03 · Non-Diagnostic Visible Skin Insights
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-semibold text-[#F5EBE6] leading-tight">
                  Calm cosmetic observations, never medical claims
                </h2>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <StatusChip label="Cosmetic Guidance Only" tone="conditional" />
                  <StatusChip label="Sensitivity-Aware" tone="demo" />
                </div>
              </div>

              <div className="space-y-3 text-sm sm:text-base text-[#C9B8B0] leading-relaxed">
                <p>
                  ALLURE highlights visible cosmetic surface characteristics—such as T-zone
                  shine, dry cheek appearance, or uneven surface tone—and combines them with
                  your self-reported skin feel (Balanced, Dry, Oily, Combination, or
                  Sensitive).
                </p>
                <p>
                  Sensitivities such as fragrance avoidance or gentle-only preferences are
                  always asked directly rather than guessed from lighting, and every report
                  carries a clear educational reminder that ALLURE is not a clinical
                  diagnostic tool.
                </p>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="luxury-glass rounded-2xl p-6 sm:p-8 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#120E0E] border border-[rgba(232,165,152,0.2)] flex items-center justify-center text-[#E8A598] shrink-0">
                    <Droplets className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-serif text-2xl font-semibold text-[#F5EBE6]">
                      Cosmetic Surface Evaluation
                    </p>
                    <p className="text-xs text-[#C9B8B0]">
                      Paired directly with your everyday skin comfort notes
                    </p>
                  </div>
                </div>

                <ul className="space-y-2.5 pt-3 border-t border-[rgba(232,165,152,0.12)] text-xs sm:text-sm text-[#F5EBE6]">
                  {[
                    'Visible surface shine along the forehead and T-zone',
                    'Surface dryness or hydration comfort observations',
                    'Visible surface texture and uneven tone cues',
                    'Fragrance-free & sensitive-skin ingredient filters',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check
                        className="w-4 h-4 text-[#E8A598] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="p-4 rounded-xl bg-[#140F0F] border border-[rgba(232,165,152,0.2)] flex items-start gap-3">
                  <ShieldAlert
                    className="w-4 h-4 text-[#E8A598] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <p className="text-xs text-[#C9B8B0] leading-relaxed">
                    <strong className="text-[#F5EBE6]">Educational Disclaimer:</strong>{' '}
                    ALLURE offers cosmetic skincare and styling guidance only and never
                    replaces a licensed dermatologist or physician.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillar 4: Personalized Grooming & Care Routines */}
      <section className="py-16 lg:py-24 bg-[#120E0E] border-t border-[rgba(232,165,152,0.16)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center text-left">
            {/* Interactive Time Cadence Preview */}
            <div className="lg:col-span-6 lg:order-1 order-2">
              <div className="luxury-glass rounded-2xl p-6 sm:p-8 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#E8A598]" aria-hidden="true" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#F5EBE6]">
                      Live Routine Calibration
                    </span>
                  </div>
                  <span className="text-[11px] text-[#E8A598]">
                    {activeRoutine.budgetNote}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(['5-min', '10-min', '20-min'] as const).map((key) => {
                    const active = selectedCadence === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedCadence(key)}
                        aria-pressed={active}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A598] ${
                          active
                            ? 'bg-[#E8A598] text-[#120E0E] border-[#E8A598] font-semibold'
                            : 'bg-[#140F0F] text-[#C9B8B0] border-[rgba(232,165,152,0.18)] hover:border-[#E8A598] hover:text-[#F5EBE6]'
                        }`}
                      >
                        {ROUTINE_CADENCE_PREVIEWS[key].label}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-xl bg-[#140F0F] border border-[rgba(232,165,152,0.14)] space-y-2">
                    <span className="text-xs font-semibold text-[#E8A598] block">
                      Morning (AM)
                    </span>
                    <ol className="space-y-1.5 text-xs text-[#F5EBE6] list-decimal list-inside">
                      {activeRoutine.am.map((step) => (
                        <li key={step} className="leading-relaxed">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className="p-4 rounded-xl bg-[#140F0F] border border-[rgba(232,165,152,0.14)] space-y-2">
                    <span className="text-xs font-semibold text-[#E8A598] block">
                      Evening (PM)
                    </span>
                    <ol className="space-y-1.5 text-xs text-[#F5EBE6] list-decimal list-inside">
                      {activeRoutine.pm.map((step) => (
                        <li key={step} className="leading-relaxed">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#140F0F] border border-[#E8A598]/30 flex items-start gap-2.5">
                  <Sparkles
                    className="w-4 h-4 text-[#E8A598] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <p className="text-xs text-[#C9B8B0] leading-relaxed">
                    Every hairstyle, eyewear tip, and care step includes a plain-language{' '}
                    <strong className="text-[#F5EBE6]">Why This Fits You</strong> rationale
                    linked directly to your confirmed traits.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 lg:order-2 order-1 space-y-5">
              <div className="space-y-3">
                <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#E8A598]">
                  04 · Personalized Grooming &amp; Care Routines
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-semibold text-[#F5EBE6] leading-tight">
                  Built for the time and budget you actually have
                </h2>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <StatusChip label="Time-Calibrated AM/PM" tone="demo" />
                  <StatusChip label="Live Filter Controls" tone="progress" />
                </div>
              </div>

              <div className="space-y-3 text-sm sm:text-base text-[#C9B8B0] leading-relaxed">
                <p>
                  Great grooming only works if it fits real mornings. ALLURE scales your
                  hairstyle maintenance level, optional facial hair shaping, eyewear frame
                  balance, and skincare steps to match your 5-, 10-, or 20+-minute window.
                </p>
                <p>
                  You can toggle maintenance complexity or monthly budget tiers live on the
                  Recommendations dashboard and watch every suggestion recalculate
                  immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillar 5: Product & Routine Matchmaking */}
      <section className="py-16 lg:py-24 bg-[#1A1414] border-t border-[rgba(232,165,152,0.16)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center text-left">
            <div className="lg:col-span-6 space-y-5">
              <div className="space-y-3">
                <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#E8A598]">
                  05 · Product &amp; Routine Matchmaking
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-semibold text-[#F5EBE6] leading-tight">
                  Curated essentials with transparent active ingredients
                </h2>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <StatusChip label="Haircare · Skincare · Tools" tone="demo" />
                  <StatusChip label="3-Item Comparison" tone="progress" />
                </div>
              </div>

              <div className="space-y-3 text-sm sm:text-base text-[#C9B8B0] leading-relaxed">
                <p>
                  Every item in the ALLURE catalog is scored against your confirmed routine
                  steps, skin sensitivities, hair texture, and monthly budget ceiling—so you
                  never buy redundant bottles or mismatched formulas.
                </p>
                <p>
                  Inspect key active ingredients, transparent sourcing notes, and INR/USD
                  pricing side by side for up to three shortlisted essentials before choosing
                  what belongs on your shelf.
                </p>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="luxury-glass rounded-2xl p-6 sm:p-8 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      icon: Search,
                      title: 'Smart Catalog Search',
                      desc: 'Filter by ingredient, texture suitability, or routine step.',
                    },
                    {
                      icon: SlidersHorizontal,
                      title: 'Budget Ceiling Controls',
                      desc: 'Match INR or USD tiers from everyday essentials to elevated picks.',
                    },
                    {
                      icon: Columns2,
                      title: 'Side-by-Side Compare',
                      desc: 'Compare up to 3 Haircare, Skincare, or Grooming Tools together.',
                    },
                    {
                      icon: ShoppingBag,
                      title: 'Routine Step Alignment',
                      desc: 'See exactly which AM or PM step each product fulfills.',
                    },
                  ].map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <div
                        key={tool.title}
                        className="p-4 rounded-xl bg-[#140F0F] border border-[rgba(232,165,152,0.14)] space-y-1.5"
                      >
                        <div className="flex items-center gap-2 text-[#E8A598]">
                          <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span className="text-xs sm:text-sm font-semibold text-[#F5EBE6]">
                            {tool.title}
                          </span>
                        </div>
                        <p className="text-xs text-[#C9B8B0] leading-relaxed">
                          {tool.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-[rgba(232,165,152,0.12)] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-[#C9B8B0]">
                    <ShieldCheck className="w-4 h-4 text-[#E8A598]" aria-hidden="true" />
                    <span>Zero sponsored rankings · Sorted purely by routine match</span>
                  </div>
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E8A598] hover:text-[#F5EBE6] underline underline-offset-4"
                  >
                    <span>Browse Catalog</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clear Boundaries */}
      <section className="py-16 lg:py-24 bg-[#120E0E] border-t border-[rgba(232,165,152,0.16)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-5 space-y-3">
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#E8A598]">
                Clear Boundaries
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#F5EBE6] leading-tight">
                What ALLURE does not do
              </h2>
              <p className="text-sm sm:text-base text-[#C9B8B0] leading-relaxed">
                Ethical grooming intelligence starts with stating clear boundaries up front.
              </p>
            </div>

            <div className="lg:col-span-7 luxury-glass rounded-2xl p-6 sm:p-8">
              <ul className="divide-y divide-[rgba(232,165,152,0.12)]">
                {FEATURE_NOT_DONE_LIST.map((item) => (
                  <li
                    key={item}
                    className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3 text-sm sm:text-base text-[#F5EBE6]"
                  >
                    <Minus
                      className="w-4 h-4 text-[#E8A598] shrink-0 mt-1"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Closing Silk-Rose CTA */}
      <section className="py-16 lg:py-24 bg-[#1A1414] border-t border-[rgba(232,165,152,0.16)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="silk-rose-surface rounded-2xl p-8 sm:p-12 text-left text-[#120E0E] border border-[rgba(245,235,230,0.28)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#120E0E]/75">
                <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Begin Your Consultation</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#120E0E] leading-tight">
                Ready to build your personalized plan?
              </h2>
              <p className="text-sm sm:text-base text-[#120E0E]/80 leading-relaxed">
                Share your routine goals, choose Face only, Hair only, or Face + Hair, and
                receive plain-language insights tailored to your everyday schedule.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link to="/onboarding">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#120E0E] hover:bg-[#221A1A] text-[#F5EBE6] text-sm font-semibold transition-colors duration-150 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#120E0E]"
                >
                  <span>Start Your Analysis</span>
                  <ArrowRight className="w-4 h-4 text-[#E8A598]" aria-hidden="true" />
                </button>
              </Link>
              <Link
                to="/how-it-works"
                className="text-sm font-semibold text-[#120E0E] underline underline-offset-4 hover:text-[#120E0E]/75 transition-colors duration-150 px-2 py-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#120E0E]"
              >
                See How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
