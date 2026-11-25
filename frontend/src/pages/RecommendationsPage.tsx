import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Clock,
  Droplets,
  Glasses,
  Moon,
  Plus,
  Scissors,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Sun,
} from 'lucide-react';
import PageShell from '../components/Layout';
import { Button, EmptyState, HairstyleSilhouette } from '../components/ui';
import { useAllure } from '../state';
import {
  analyzePhotos,
  buildDynamicRecommendations,
  deriveBudgetTier,
  hasAssessedFaceShape,
  hasAssessedHairTexture,
  resolveDailyMinutes,
} from '../services';
import { BudgetTier, DailyRoutineTime, MaintenanceLevel } from '../types';

type RecommendationTab = 'hairstyles' | 'routine' | 'eyewear';

const CATEGORY_TABS: {
  id: RecommendationTab;
  label: string;
  icon: typeof Scissors;
}[] = [
  { id: 'hairstyles', label: 'Hairstyles & Grooming', icon: Scissors },
  { id: 'routine', label: 'Morning & Evening Care Routine', icon: Sun },
  { id: 'eyewear', label: 'Eyewear & Feature Balance', icon: Glasses },
];

const BUDGET_PILLS: { id: BudgetTier; labelINR: string; labelUSD: string; inr: number }[] = [
  { id: 'essential', labelINR: '₹500–₹1,000', labelUSD: '$6–$12', inr: 1000 },
  { id: 'balanced', labelINR: '₹1,000–₹2,500', labelUSD: '$12–$30', inr: 1800 },
  { id: 'elevated', labelINR: '₹2,500+', labelUSD: '$30+', inr: 3500 },
];

export default function Recommendations() {
  const navigate = useNavigate();
  const {
    analysisMode,
    setAnalysisMode,
    preferences,
    updatePreferences,
    photoAnalysis,
    setPhotoAnalysis,
    loadSampleProfilePhotos,
  } = useAllure();

  const [activeTab, setActiveTab] = useState<RecommendationTab>('hairstyles');
  const [routineTab, setRoutineTab] = useState<'am' | 'pm'>('am');
  const [maintenanceFilter, setMaintenanceFilter] = useState<'all' | MaintenanceLevel>('all');

  const handleQuickProfileSetup = async () => {
    loadSampleProfilePhotos('sample-a', analysisMode);
    const result = await analyzePhotos({
      mode: analysisMode,
      hasFacePhoto: analysisMode !== 'hair',
      hasHairPhoto: analysisMode !== 'face',
      sampleProfileUsed: 'sample-a',
    });
    setPhotoAnalysis(result);
  };

  const handleAddMissingPhoto = (missing: 'face' | 'hair') => {
    setAnalysisMode('both');
    navigate(`/analysis?add=${missing}`);
  };

  const recommendations = useMemo(() => {
    if (!photoAnalysis) return null;
    return buildDynamicRecommendations(preferences, photoAnalysis, {
      maintenanceFilter,
    });
  }, [preferences, photoAnalysis, maintenanceFilter]);

  if (!photoAnalysis || !recommendations) {
    return (
      <PageShell>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <EmptyState
            icon={<Scissors className="w-6 h-6" />}
            title="Recommendations require your analysis profile"
            description="Complete your profile preferences and portrait analysis so ALLURE can rank hairstyles, eyewear proportions, and daily care routines for you."
            actionLabel="Start Guided Profile"
            actionTo="/onboarding"
            secondaryLabel="Upload Portrait"
            secondaryTo="/analysis"
          />
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={handleQuickProfileSetup}
              className="text-xs font-medium text-[#E8A598] hover:text-[#F5EBE6] underline underline-offset-4 cursor-pointer"
            >
              Or explore with a sample studio portrait
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  const mode = recommendations.analysisMode;
  const activeRoutine =
    routineTab === 'am' ? recommendations.morningRoutine : recommendations.eveningRoutine;

  const faceAssessed = hasAssessedFaceShape(photoAnalysis.faceShape);
  const hairAssessed = hasAssessedHairTexture(photoAnalysis.hairTexture);
  const secondaryClean =
    photoAnalysis.secondaryTendency && photoAnalysis.secondaryTendency !== 'None'
      ? photoAnalysis.secondaryTendency.toLowerCase()
      : undefined;
  const selfTextureClean =
    preferences.selfReportedHairTexture &&
    preferences.selfReportedHairTexture !== 'not-sure' &&
    preferences.selfReportedHairTexture !== 'other'
      ? preferences.selfReportedHairTexture.toLowerCase()
      : undefined;

  const stylesHeading =
    mode === 'face'
      ? 'Hairstyles Tailored to Your Face Shape'
      : mode === 'hair'
      ? 'Cuts Matched to Your Hair Texture'
      : 'Hairstyles & Grooming Matches';

  const stylesSubheading = (() => {
    if (mode === 'face') {
      if (!faceAssessed) {
        return selfTextureClean
          ? `Scored for balanced proportions and refined with your ${selfTextureClean} hair context.`
          : 'Scored for versatile proportions. Retake your portrait in brighter light for tighter precision.';
      }
      const facePhrase = `Scored for your ${photoAnalysis.faceShape!.toLowerCase()} proportions${
        secondaryClean ? ` with ${secondaryClean}` : ''
      }`;
      return selfTextureClean
        ? `${facePhrase} and refined for ${selfTextureClean} hair.`
        : `${facePhrase} — including length, parting, and volume placement.`;
    }
    if (mode === 'hair') {
      return hairAssessed
        ? `Selected to work effortlessly with your natural ${photoAnalysis.hairTexture!.toLowerCase()} pattern.`
        : 'Selected for natural versatility across everyday hair lengths.';
    }
    if (faceAssessed && hairAssessed) {
      return `Ranked for your ${photoAnalysis.faceShape!.toLowerCase()} proportions and ${photoAnalysis.hairTexture!.toLowerCase()} texture, calibrated to your daily time and budget.`;
    }
    if (faceAssessed && !hairAssessed) {
      return `Scored for your ${photoAnalysis.faceShape!.toLowerCase()} proportions with flexible texture compatibility.`;
    }
    if (!faceAssessed && hairAssessed) {
      return `Scored for versatile proportions and your ${photoAnalysis.hairTexture!.toLowerCase()} hair texture.`;
    }
    return 'Scored for balanced proportions and everyday wearability.';
  })();

  const displayedAvoids = preferences.avoidItems.filter((item) => item !== 'Other');

  const timeFilterButtons: { id: DailyRoutineTime; label: string }[] = [
    { id: '5-min', label: '5 mins' },
    { id: '10-min', label: '10 mins' },
    { id: '20-plus-min', label: '20+ mins' },
    ...(preferences.dailyTime === 'custom'
      ? [{ id: 'custom' as const, label: `${resolveDailyMinutes(preferences)}m` }]
      : []),
  ];

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#E8A598] mb-2">
              Personalized Styling Plan ·{' '}
              {mode === 'face'
                ? 'Face Profile'
                : mode === 'hair'
                ? 'Hair Profile'
                : 'Complete Face + Hair Profile'}
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#F5EBE6]">
              Personalized Recommendations
            </h1>
            <p className="text-sm text-[#C9B8B0] mt-2 max-w-2xl leading-relaxed">
              Every recommendation includes a clear &ldquo;Why This Fits You&rdquo;
              explanation and updates immediately when you adjust maintenance or budget.
              {displayedAvoids.length > 0 && (
                <>
                  {' '}
                  Respecting your avoidances:{' '}
                  <span className="text-[#E8A598]">{displayedAvoids.join(', ')}</span>.
                </>
              )}
            </p>
          </div>

          <Link to="/products" className="shrink-0">
            <Button variant="primary" size="lg">
              <ShoppingBag className="w-4 h-4" />
              <span>Explore Matched Products</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* ============================================================ */}
        {/* LIVE FILTER PILLS: MAINTENANCE LEVEL, BUDGET & DAILY TIME    */}
        {/* ============================================================ */}
        <section
          aria-labelledby="tweaker-heading"
          className="luxury-glass rounded-2xl p-5 sm:p-6 space-y-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <SlidersHorizontal className="w-4 h-4 text-[#E8A598]" aria-hidden="true" />
              <h2
                id="tweaker-heading"
                className="font-sans text-sm font-semibold text-[#F5EBE6]"
              >
                Live Filters — Maintenance Level &amp; Budget
              </h2>
            </div>

            <div className="inline-flex p-1 rounded-lg bg-[#120E0E] border border-[rgba(232,165,152,0.16)]">
              {(['INR', 'USD'] as const).map((curr) => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => updatePreferences({ currency: curr })}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors duration-150 cursor-pointer ${
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-end">
            {/* Maintenance Level Pills */}
            <div className="space-y-2">
              <span className="block text-xs text-[#C9B8B0]">Maintenance Level</span>
              <div className="flex flex-wrap gap-1.5">
                {(['all', 'Low', 'Moderate', 'Detailed'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setMaintenanceFilter(lvl)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors duration-150 cursor-pointer ${
                      maintenanceFilter === lvl
                        ? 'bg-[#E8A598] text-[#120E0E] border-[#E8A598] font-semibold'
                        : 'bg-[#1A1414] text-[#C9B8B0] border-[rgba(232,165,152,0.16)] hover:border-[#E8A598] hover:text-[#F5EBE6]'
                    }`}
                  >
                    {lvl === 'all' ? 'All Levels' : lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Tier Pills */}
            <div className="space-y-2">
              <span className="block text-xs text-[#C9B8B0]">Monthly Budget Tier</span>
              <div className="flex flex-wrap gap-1.5">
                {BUDGET_PILLS.map((tier) => {
                  const selected = preferences.budgetTier === tier.id;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() =>
                        updatePreferences({
                          monthlyBudgetINR: tier.inr,
                          budgetTier: deriveBudgetTier(tier.inr),
                          useCustomBudget: false,
                        })
                      }
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors duration-150 cursor-pointer tabular-nums ${
                        selected
                          ? 'bg-[#E8A598] text-[#120E0E] border-[#E8A598] font-semibold'
                          : 'bg-[#1A1414] text-[#C9B8B0] border-[rgba(232,165,152,0.16)] hover:border-[#E8A598] hover:text-[#F5EBE6]'
                      }`}
                    >
                      {preferences.currency === 'USD' ? tier.labelUSD : tier.labelINR}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Routine Time Pills */}
            <div className="space-y-2">
              <span className="block text-xs text-[#C9B8B0]">Daily Routine Time</span>
              <div className="flex flex-wrap gap-1.5">
                {timeFilterButtons.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => updatePreferences({ dailyTime: t.id })}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors duration-150 cursor-pointer ${
                      preferences.dailyTime === t.id
                        ? 'bg-[#E8A598] text-[#120E0E] border-[#E8A598] font-semibold'
                        : 'bg-[#1A1414] text-[#C9B8B0] border-[rgba(232,165,152,0.16)] hover:border-[#E8A598] hover:text-[#F5EBE6]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* INTERACTIVE CATEGORY TABS                                    */}
        {/* ============================================================ */}
        <div
          role="tablist"
          aria-label="Recommendation categories"
          className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[rgba(232,165,152,0.16)]"
        >
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 sm:px-5 py-3 text-xs sm:text-sm font-medium inline-flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A598] rounded-t-xl ${
                  active
                    ? 'text-[#E8A598] bg-[#221A1A]/75'
                    : 'text-[#C9B8B0] hover:text-[#F5EBE6]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{tab.label}</span>
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 bottom-0 h-[2px] bg-[#E8A598]"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ============================================================ */}
        {/* TAB 1: HAIRSTYLES & GROOMING                                 */}
        {/* ============================================================ */}
        {activeTab === 'hairstyles' && (
          <div className="space-y-8 animate-fade-up">
            {mode === 'hair' && recommendations.hairOnlyCare && (
              <section
                aria-labelledby="hair-only-care-heading"
                className="luxury-glass rounded-2xl p-6 sm:p-8 space-y-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="text-xs text-[#E8A598] font-medium block mb-1">
                      Texture-Specific Hair Care &amp; Styling
                    </span>
                    <h2
                      id="hair-only-care-heading"
                      className="font-serif text-3xl font-semibold text-[#F5EBE6]"
                    >
                      {recommendations.hairOnlyCare.texture} Blueprint
                    </h2>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddMissingPhoto('face')}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Face Analysis</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="p-5 rounded-xl bg-[#1A1414] border border-[rgba(232,165,152,0.14)] space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#E8A598]">
                      <Droplets className="w-4 h-4" aria-hidden="true" />
                      <span>Wash Frequency</span>
                    </div>
                    <p className="text-sm text-[#F5EBE6] leading-relaxed">
                      {recommendations.hairOnlyCare.washFrequency}
                    </p>
                  </div>

                  <div className="p-5 rounded-xl bg-[#1A1414] border border-[rgba(232,165,152,0.14)] space-y-2">
                    <span className="text-xs font-semibold text-[#E8A598] block">
                      Recommended Formulas
                    </span>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-[#C9B8B0] list-disc list-inside">
                      {recommendations.hairOnlyCare.productTypes.map((prod) => (
                        <li key={prod}>{prod}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-5 rounded-xl bg-[#1A1414] border border-[rgba(232,165,152,0.14)] space-y-2">
                    <span className="text-xs font-semibold text-[#E8A598] block">
                      Everyday Styling Notes
                    </span>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-[#C9B8B0] list-disc list-inside">
                      {recommendations.hairOnlyCare.stylingTips.map((tip) => (
                        <li key={tip}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#1A1414] border border-[rgba(232,165,152,0.18)]">
                  <span className="text-[11px] font-semibold text-[#E8A598] block mb-0.5">
                    Why This Fits You
                  </span>
                  <p className="text-xs text-[#F5EBE6] leading-relaxed">
                    {recommendations.hairOnlyCare.whyRecommended}
                  </p>
                </div>
              </section>
            )}

            <section aria-labelledby="styles-heading" className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                  <h2
                    id="styles-heading"
                    className="font-serif text-3xl sm:text-4xl font-semibold text-[#F5EBE6]"
                  >
                    {stylesHeading}
                  </h2>
                  <p className="text-sm text-[#C9B8B0] mt-1 max-w-3xl leading-relaxed">
                    {stylesSubheading}
                  </p>
                </div>
                {mode === 'face' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddMissingPhoto('hair')}
                    className="self-start sm:self-auto shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Hair Analysis</span>
                  </Button>
                )}
              </div>

              {recommendations.styles.length === 0 ? (
                <div className="luxury-glass rounded-2xl p-8 text-center space-y-3">
                  <p className="text-sm text-[#F5EBE6] font-medium">
                    No hairstyles match the &ldquo;{maintenanceFilter}&rdquo; maintenance
                    filter for your current settings.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMaintenanceFilter('all')}
                  >
                    Show All Maintenance Levels
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {recommendations.styles.map((style) => (
                    <article
                      key={style.id}
                      className="luxury-glass luxury-card-hover rounded-2xl overflow-hidden flex flex-col sm:flex-row"
                    >
                      <HairstyleSilhouette
                        variant={style.silhouetteVariant}
                        lengthCategory={style.lengthCategory}
                        textures={style.compatibleTextures}
                        styleName={style.name}
                      />

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4 min-w-0">
                        <div className="space-y-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#C9B8B0]">
                            <span className="text-[#E8A598] font-medium">
                              {style.maintenanceLevel} maintenance · {style.suitableLength}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[#C9B8B0]">
                              <Clock className="w-3.5 h-3.5 text-[#E8A598]" aria-hidden="true" />
                              <span>{style.maintenanceTime}</span>
                            </span>
                          </div>

                          <h3 className="font-serif text-2xl font-semibold text-[#F5EBE6] leading-snug">
                            {style.name}
                          </h3>

                          <p className="text-xs sm:text-sm text-[#C9B8B0] leading-relaxed">
                            {style.description}
                          </p>

                          <p className="text-xs text-[#F5EBE6]/90 leading-relaxed">
                            <strong className="text-[#E8A598]">Placement &amp; parting:</strong>{' '}
                            {style.placementGuidance}
                          </p>
                        </div>

                        <div className="space-y-2.5">
                          <p className="text-xs text-[#C9B8B0] leading-relaxed">
                            <strong className="text-[#F5EBE6]">Best with:</strong>{' '}
                            {style.bestWithTexture}
                          </p>

                          <div className="p-3 rounded-xl bg-[#1A1414] border border-[rgba(232,165,152,0.2)]">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#E8A598] mb-0.5">
                              <Sparkles className="w-3 h-3" aria-hidden="true" />
                              <span>Why This Fits You</span>
                            </span>
                            <p className="text-xs text-[#F5EBE6] leading-relaxed">
                              {style.whySuitsFaceShape ?? style.whyRecommended}
                            </p>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* Facial Hair & Grooming Card (if selected) */}
            {recommendations.facialHairGuidance && (
              <article className="luxury-glass luxury-card-hover rounded-2xl p-6 sm:p-7 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-[#E8A598]">
                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" aria-hidden="true" />
                    <span>Facial Hair &amp; Jawline Grooming</span>
                  </span>
                  <span className="text-[#C9B8B0]">
                    {recommendations.facialHairGuidance.maintenanceTime}
                  </span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#F5EBE6]">
                  {recommendations.facialHairGuidance.title}
                </h3>
                <p className="text-sm text-[#C9B8B0] leading-relaxed">
                  {recommendations.facialHairGuidance.description}
                </p>
                <div className="p-3.5 rounded-xl bg-[#1A1414] border border-[rgba(232,165,152,0.2)]">
                  <span className="text-[11px] font-semibold text-[#E8A598] block mb-0.5">
                    Why This Fits You
                  </span>
                  <p className="text-xs text-[#F5EBE6] leading-relaxed">
                    {recommendations.facialHairGuidance.whyRecommended}
                  </p>
                </div>
              </article>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: MORNING & EVENING CARE ROUTINE                        */}
        {/* ============================================================ */}
        {activeTab === 'routine' && (
          <section
            aria-labelledby="care-plan-heading"
            className="luxury-glass rounded-2xl p-6 sm:p-8 space-y-6 animate-fade-up"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2
                  id="care-plan-heading"
                  className="font-serif text-3xl sm:text-4xl font-semibold text-[#F5EBE6]"
                >
                  Morning &amp; Evening Care Routine
                </h2>
                <p className="text-xs sm:text-sm text-[#C9B8B0] mt-1">
                  Cosmetic daily steps calibrated to {recommendations.activeSummary.budgetLabel} ·{' '}
                  {recommendations.activeSummary.maintenanceLabel}.
                </p>
              </div>

              <div
                role="tablist"
                aria-label="AM or PM routine"
                className="inline-flex p-1 rounded-full bg-[#120E0E] border border-[rgba(232,165,152,0.18)] self-start sm:self-auto"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={routineTab === 'am'}
                  onClick={() => setRoutineTab('am')}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 transition-colors duration-150 cursor-pointer whitespace-nowrap ${
                    routineTab === 'am'
                      ? 'bg-[#E8A598] text-[#120E0E] font-semibold'
                      : 'text-[#C9B8B0] hover:text-[#F5EBE6]'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Morning (AM)</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={routineTab === 'pm'}
                  onClick={() => setRoutineTab('pm')}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 transition-colors duration-150 cursor-pointer whitespace-nowrap ${
                    routineTab === 'pm'
                      ? 'bg-[#E8A598] text-[#120E0E] font-semibold'
                      : 'text-[#C9B8B0] hover:text-[#F5EBE6]'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Evening (PM)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {activeRoutine.map((step) => (
                <div
                  key={`${routineTab}-${step.stepNumber}`}
                  className="p-5 rounded-xl bg-[#1A1414] border border-[rgba(232,165,152,0.16)] luxury-card-hover flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-[#E8A598] tabular-nums">
                        Step {step.stepNumber} · {step.category}
                      </span>
                      <span className="text-[#C9B8B0]">{step.frequency}</span>
                    </div>
                    <h3 className="font-serif text-2xl font-semibold text-[#F5EBE6]">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#C9B8B0] leading-relaxed">
                      {step.instruction}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#120E0E] border border-[rgba(232,165,152,0.16)]">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#E8A598] mb-0.5">
                      <Sparkles className="w-3 h-3" aria-hidden="true" />
                      <span>Why This Fits You</span>
                    </span>
                    <p className="text-xs text-[#F5EBE6] leading-relaxed">{step.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* TAB 3: EYEWEAR & FEATURE BALANCE                             */}
        {/* ============================================================ */}
        {activeTab === 'eyewear' && (
          <section
            aria-label="Eyewear and feature balance guidance"
            className="space-y-6 animate-fade-up"
          >
            {recommendations.eyewearTip ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <article className="lg:col-span-7 luxury-glass luxury-card-hover rounded-2xl p-6 sm:p-8 space-y-5 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-[#E8A598]">
                      <Glasses className="w-4 h-4" aria-hidden="true" />
                      <span>
                        Eyewear Geometry · {recommendations.eyewearTip.faceShape} Face
                      </span>
                    </div>
                    <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#F5EBE6]">
                      {recommendations.eyewearTip.recommendedFrames}
                    </h2>
                    <p className="text-sm text-[#C9B8B0] leading-relaxed">
                      {recommendations.eyewearTip.proportionNote}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#1A1414] border border-[rgba(232,165,152,0.2)]">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#E8A598] mb-1">
                      <Sparkles className="w-3 h-3" aria-hidden="true" />
                      <span>Why This Fits You</span>
                    </span>
                    <p className="text-xs sm:text-sm text-[#F5EBE6] leading-relaxed">
                      {recommendations.eyewearTip.whyRecommended}
                    </p>
                  </div>
                </article>

                <article className="lg:col-span-5 luxury-glass luxury-card-hover rounded-2xl p-6 sm:p-8 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-xs font-medium text-[#E8A598] block">
                      Feature Balance Checklist
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#F5EBE6]">
                      Bridge, Brow &amp; Framing Harmony
                    </h3>
                    <ul className="space-y-2.5 text-xs sm:text-sm text-[#C9B8B0] list-disc list-inside leading-relaxed">
                      <li>
                        Match frame width closely to cheekbone width so temples sit comfortably
                        without pinching or flaring.
                      </li>
                      <li>
                        Keep top frame rims aligned near the natural brow arch to preserve clear
                        upper-third proportion.
                      </li>
                      <li>
                        Pair brushed titanium, warm tortoiseshell, or dark acetate finishes with
                        neat brow grooming for an effortless look.
                      </li>
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#1A1414] border border-[rgba(232,165,152,0.16)]">
                    <span className="text-[11px] font-semibold text-[#E8A598] block mb-0.5">
                      Why This Fits You
                    </span>
                    <p className="text-xs text-[#F5EBE6] leading-relaxed">
                      Calibrated for {recommendations.eyewearTip.faceShape.toLowerCase()}{' '}
                      proportions so eyewear and hairline reinforce each other cleanly.
                    </p>
                  </div>
                </article>
              </div>
            ) : (
              <div className="luxury-glass rounded-2xl p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="space-y-1.5">
                  <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#F5EBE6]">
                    Add a front-facing portrait for personalized eyewear geometry
                  </h2>
                  <p className="text-sm text-[#C9B8B0] leading-relaxed">
                    Your current session analyzed hair only. Add a face photo to unlock frame
                    width, bridge height, and brow-balance recommendations.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleAddMissingPhoto('face')}
                  className="shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Face Analysis</span>
                </Button>
              </div>
            )}
          </section>
        )}

        {/* Bottom CTA to Product Discovery */}
        <div className="bg-[#1A1414] border border-[rgba(232,165,152,0.2)] rounded-2xl p-7 sm:p-9 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="font-serif text-3xl font-semibold text-[#F5EBE6]">
              Discover products curated for every step
            </h2>
            <p className="text-sm text-[#C9B8B0] mt-1">
              Filter by category or budget and compare up to 3 grooming essentials side by
              side.
            </p>
          </div>
          <Link to="/products" className="shrink-0 w-full sm:w-auto">
            <Button variant="primary" size="lg" fullWidth>
              <span>Explore Matched Products</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
