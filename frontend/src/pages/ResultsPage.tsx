import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit3,
  Eye,
  Plus,
  RefreshCw,
  ScanFace,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
} from 'lucide-react';
import PageShell from '../components/Layout';
import { Button, EmptyState, Modal } from '../components/ui';
import { useAllure } from '../state';
import {
  ANALYSIS_MODE_LABELS,
  FACE_SHAPE_OPTIONS,
  HAIR_TEXTURE_OPTIONS,
  SECONDARY_TENDENCY_OPTIONS,
  SKIN_OBSERVATION_PRESETS,
  STYLE_PREFERENCE_LABELS,
} from '../data';
import {
  analyzePhotos,
  buildPersonalizedReport,
  formatHistoryDateTime,
  hasAssessedFaceShape,
  historyEntryToPhotoAnalysis,
} from '../services';
import { FaceShapeOption, HairTextureOption, HistoryEntry } from '../types';

const SKIN_PRESET_KEYS = Object.keys(SKIN_OBSERVATION_PRESETS);

function capitalizeLabel(value: string): string {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

export default function Results({
  initialShowHistory = false,
}: {
  initialShowHistory?: boolean;
} = {}) {
  const navigate = useNavigate();
  const { id: historyId } = useParams<{ id?: string }>();

  const {
    analysisMode,
    setAnalysisMode,
    preferences: livePreferences,
    facePhoto,
    hairPhoto,
    photoAnalysis: livePhotoAnalysis,
    setPhotoAnalysis,
    updateConfirmedAnalysis,
    loadSampleProfilePhotos,
    historyEntries,
    saveAnalysisToHistory,
    deleteHistoryEntry,
    clearAllHistory,
    activateHistoryEntry,
  } = useAllure();

  const savedEntry: HistoryEntry | undefined = useMemo(
    () => (historyId ? historyEntries.find((entry) => entry.id === historyId) : undefined),
    [historyId, historyEntries]
  );

  const isReadOnly = Boolean(savedEntry);

  const photoAnalysis = useMemo(
    () => (savedEntry ? historyEntryToPhotoAnalysis(savedEntry) : livePhotoAnalysis),
    [savedEntry, livePhotoAnalysis]
  );

  const preferences = savedEntry ? savedEntry.questionnaireAnswers : livePreferences;

  const [showHistoryPanel, setShowHistoryPanel] = useState(initialShowHistory);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const [showRecaptureGuidance, setShowRecaptureGuidance] = useState(false);
  const [editingFace, setEditingFace] = useState(false);
  const [editingHair, setEditingHair] = useState(false);
  const [editingSkin, setEditingSkin] = useState(false);

  useEffect(() => {
    if (initialShowHistory) {
      setShowHistoryPanel(true);
    }
  }, [initialShowHistory]);

  // Automatically persist completed report to localStorage History when /results is reached
  useEffect(() => {
    if (isReadOnly || !livePhotoAnalysis) return;
    saveAnalysisToHistory(livePhotoAnalysis, livePreferences);
  }, [
    isReadOnly,
    livePhotoAnalysis?.analysisId,
    saveAnalysisToHistory,
    livePhotoAnalysis,
    livePreferences,
  ]);

  const handleInstantSampleRun = async () => {
    loadSampleProfilePhotos('sample-b', analysisMode);
    const result = await analyzePhotos({
      mode: analysisMode,
      hasFacePhoto: analysisMode !== 'hair',
      hasHairPhoto: analysisMode !== 'face',
      sampleProfileUsed: 'sample-b',
    });
    setPhotoAnalysis(result);
  };

  const handleAddMissingAnalysis = (missing: 'face' | 'hair') => {
    setAnalysisMode('both');
    navigate(`/analysis?add=${missing}`);
  };

  const handleConfirmDelete = (entryId: string) => {
    deleteHistoryEntry(entryId);
    setPendingDeleteId(null);
  };

  const handleConfirmClearAll = () => {
    clearAllHistory();
    setConfirmClearOpen(false);
    setPendingDeleteId(null);
  };

  const renderRecentAnalysesSection = () => (
    <section
      id="recent-analyses"
      aria-labelledby="recent-analyses-heading"
      className="luxury-glass rounded-2xl p-6 sm:p-8 space-y-6 text-left"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#E8A598] mb-1">
            Saved Sessions
          </p>
          <h2
            id="recent-analyses-heading"
            className="font-serif text-2xl sm:text-3xl font-semibold text-[#F5EBE6]"
          >
            Recent Analyses ({historyEntries.length})
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {historyEntries.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmClearOpen(true)}
              className="border-red-400/30 text-red-200 hover:border-red-400/60 hover:bg-red-950/30"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Clear all</span>
            </Button>
          )}
          <Link to="/onboarding">
            <Button variant="secondary" size="sm">
              <span>New analysis</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-[#1A1414] border border-[rgba(232,165,152,0.16)] rounded-xl px-4 py-3.5 flex items-start gap-3">
        <ShieldCheck
          className="w-4 h-4 text-[#E8A598] shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <p className="text-xs text-[#C9B8B0] leading-relaxed">
          <strong className="text-[#F5EBE6]">
            Your photos are never saved. History is stored only in this browser.
          </strong>{' '}
          Up to 20 structured analysis summaries are kept locally so you can compare updates
          or reload any session into ALLURE Chatbot.
        </p>
      </div>

      {historyEntries.length === 0 ? (
        <p className="text-sm text-[#C9B8B0] py-4 text-center">
          No saved analyses yet. Complete a portrait scan to save your first structured
          summary here.
        </p>
      ) : (
        <div className="space-y-3.5">
          {historyEntries.map((entry) => {
            const isActive = livePhotoAnalysis?.analysisId === entry.id;
            const isConfirmingDelete = pendingDeleteId === entry.id;

            const faceDisplay =
              entry.analysisMode === 'hair'
                ? 'Not analysed (Hair only)'
                : entry.faceShape
                ? hasAssessedFaceShape(entry.faceShape)
                  ? `${entry.faceShape}${
                      entry.secondaryTendency && entry.secondaryTendency !== 'None'
                        ? ` · ${entry.secondaryTendency}`
                        : ''
                    }`
                  : 'Uncertain / Unable to assess'
                : 'Not assessed';

            const hairDisplay =
              entry.analysisMode === 'face'
                ? 'Not analysed (Face only)'
                : entry.hairTexture ?? 'Not assessed';

            return (
              <article
                key={entry.id}
                className={`bg-[#1A1414] border rounded-xl p-5 space-y-4 transition-colors duration-150 ${
                  isActive
                    ? 'border-[#E8A598]/60'
                    : 'border-[rgba(232,165,152,0.14)]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#F5EBE6]">
                      <Clock className="w-3.5 h-3.5 text-[#E8A598]" aria-hidden="true" />
                      <time dateTime={entry.createdAt}>
                        {formatHistoryDateTime(entry.createdAt)}
                      </time>
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#120E0E] border border-[rgba(232,165,152,0.22)] text-[#E8A598]">
                      {ANALYSIS_MODE_LABELS[entry.analysisMode]}
                    </span>
                    {isActive && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#E8A598]/15 border border-[#E8A598]/40 text-[#E8A598]">
                        Active in Chatbot
                      </span>
                    )}
                  </div>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-[#120E0E] border border-[rgba(232,165,152,0.12)]">
                    <dt className="text-[11px] text-[#C9B8B0]">Face Shape</dt>
                    <dd className="text-xs sm:text-sm font-semibold text-[#F5EBE6] mt-0.5">
                      {faceDisplay}
                    </dd>
                  </div>
                  <div className="p-3 rounded-lg bg-[#120E0E] border border-[rgba(232,165,152,0.12)]">
                    <dt className="text-[11px] text-[#C9B8B0]">Hair Texture</dt>
                    <dd className="text-xs sm:text-sm font-semibold text-[#F5EBE6] mt-0.5">
                      {hairDisplay}
                    </dd>
                  </div>
                  <div className="p-3 rounded-lg bg-[#120E0E] border border-[rgba(232,165,152,0.12)]">
                    <dt className="text-[11px] text-[#C9B8B0]">Budget Tier</dt>
                    <dd className="text-xs sm:text-sm font-semibold text-[#E8A598] mt-0.5">
                      {capitalizeLabel(entry.budgetTier)}
                    </dd>
                  </div>
                </dl>

                <div className="pt-3 border-t border-[rgba(232,165,152,0.1)] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link to={`/history/${entry.id}`}>
                      <Button variant="secondary" size="sm">
                        <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>View report</span>
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => activateHistoryEntry(entry.id, true)}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#E8A598]" aria-hidden="true" />
                      <span>Open in Chatbot</span>
                    </Button>
                  </div>

                  {isConfirmingDelete ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-[#C9B8B0]">Delete?</span>
                      <button
                        type="button"
                        onClick={() => handleConfirmDelete(entry.id)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500/20 hover:bg-red-500/30 border border-red-400/50 text-red-200 transition-colors duration-150 cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDeleteId(null)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#120E0E] border border-[rgba(232,165,152,0.2)] text-[#C9B8B0] hover:text-[#F5EBE6] transition-colors duration-150 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPendingDeleteId(entry.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-red-300/90 hover:text-red-200 bg-transparent hover:bg-red-950/40 border border-red-400/20 hover:border-red-400/50 transition-colors duration-150 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );

  // /history/:id not found guard
  if (historyId && !savedEntry) {
    return (
      <PageShell>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <EmptyState
            icon={<Clock className="w-6 h-6" />}
            title="Saved analysis not found"
            description="This history entry may have been deleted or cleared from this browser. Return to Recent Analyses or start a fresh consultation."
            actionLabel="View Recent Analyses"
            actionTo="/history"
            secondaryLabel="Start a new analysis"
            secondaryTo="/onboarding"
          />
        </div>
      </PageShell>
    );
  }

  const report = useMemo(() => {
    if (!photoAnalysis) return null;
    return buildPersonalizedReport(
      photoAnalysis,
      preferences,
      isReadOnly ? false : showRecaptureGuidance
    );
  }, [photoAnalysis, preferences, isReadOnly, showRecaptureGuidance]);

  if (!photoAnalysis || !report) {
    return (
      <PageShell>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <EmptyState
            icon={<ScanFace className="w-6 h-6" />}
            title="No active analysis yet"
            description="Complete your profile preferences and upload a portrait — or try with a studio sample portrait — to unlock your personalized appearance dashboard."
            actionLabel="Start Guided Profile"
            actionTo="/onboarding"
            secondaryLabel="Upload Portrait"
            secondaryTo="/analysis"
          />
          <div className="text-center">
            <button
              type="button"
              onClick={handleInstantSampleRun}
              className="text-xs font-medium text-[#E8A598] hover:text-[#F5EBE6] underline underline-offset-4 cursor-pointer"
            >
              Or explore with a sample studio portrait now
            </button>
          </div>

          {(initialShowHistory || historyEntries.length > 0) && renderRecentAnalysesSection()}
        </div>

        <Modal
          isOpen={confirmClearOpen}
          onClose={() => setConfirmClearOpen(false)}
          title="Clear all saved history?"
          subtitle="This removes every saved analysis record from this browser."
        >
          <div className="space-y-5">
            <p className="text-sm text-[#C9B8B0] leading-relaxed">
              All {historyEntries.length} saved{' '}
              {historyEntries.length === 1 ? 'entry' : 'entries'} will be permanently
              removed from local storage in this browser.
            </p>
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setConfirmClearOpen(false)}>
                Cancel
              </Button>
              <button
                type="button"
                onClick={handleConfirmClearAll}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-red-500/20 hover:bg-red-500/30 border border-red-400/50 text-red-100 transition-colors duration-150 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Yes, clear all history</span>
              </button>
            </div>
          </div>
        </Modal>
      </PageShell>
    );
  }

  const { faceSection, hairSection, skinSection, constraintsSection } = report;
  const activeMode = report.analysisMode;
  const previewThumb = isReadOnly ? null : facePhoto ?? hairPhoto;

  const confirmField = (field: 'face' | 'hair' | 'skin') => {
    updateConfirmedAnalysis({
      userConfirmed: {
        face: photoAnalysis.userConfirmed?.face ?? false,
        hair: photoAnalysis.userConfirmed?.hair ?? false,
        skin: photoAnalysis.userConfirmed?.skin ?? false,
        [field]: true,
      },
    });
    if (field === 'face') setEditingFace(false);
    if (field === 'hair') setEditingHair(false);
    if (field === 'skin') setEditingSkin(false);
  };

  const changeFaceShape = (shape: FaceShapeOption, secondary?: string) => {
    setShowRecaptureGuidance(false);
    updateConfirmedAnalysis({
      faceShape: shape,
      secondaryTendency: secondary ?? photoAnalysis.secondaryTendency,
      quality: 'good',
      userConfirmed: {
        face: true,
        hair: photoAnalysis.userConfirmed?.hair ?? false,
        skin: photoAnalysis.userConfirmed?.skin ?? false,
      },
      userChanged: {
        face: true,
        hair: photoAnalysis.userChanged?.hair ?? false,
        skin: photoAnalysis.userChanged?.skin ?? false,
      },
    });
  };

  const changeHairTexture = (texture: HairTextureOption) => {
    updateConfirmedAnalysis({
      hairTexture: texture,
      quality: 'good',
      userConfirmed: {
        face: photoAnalysis.userConfirmed?.face ?? false,
        hair: true,
        skin: photoAnalysis.userConfirmed?.skin ?? false,
      },
      userChanged: {
        face: photoAnalysis.userChanged?.face ?? false,
        hair: true,
        skin: photoAnalysis.userChanged?.skin ?? false,
      },
    });
  };

  const changeSkinPreset = (presetKey: string) => {
    updateConfirmedAnalysis({
      skinObservations: SKIN_OBSERVATION_PRESETS[presetKey] ?? [],
      userConfirmed: {
        face: photoAnalysis.userConfirmed?.face ?? false,
        hair: photoAnalysis.userConfirmed?.hair ?? false,
        skin: true,
      },
      userChanged: {
        face: photoAnalysis.userChanged?.face ?? false,
        hair: photoAnalysis.userChanged?.hair ?? false,
        skin: true,
      },
    });
  };

  const currentSkinPresetKey = (() => {
    if (!photoAnalysis.skinObservations || photoAnalysis.skinObservations.length === 0) {
      return SKIN_PRESET_KEYS[0];
    }
    const firstObs = photoAnalysis.skinObservations[0]?.observation;
    return (
      SKIN_PRESET_KEYS.find(
        (k) => SKIN_OBSERVATION_PRESETS[k][0]?.observation === firstObs
      ) ?? SKIN_PRESET_KEYS[0]
    );
  })();

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
        {/* Saved History Read-Only Banner (/history/:id) */}
        {savedEntry && (
          <div className="luxury-glass border-[#E8A598]/40 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-[#E8A598] shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-[#F5EBE6]">
                  Saved analysis from {formatHistoryDateTime(savedEntry.createdAt)}
                </p>
                <p className="text-xs text-[#C9B8B0] mt-0.5">
                  Saved profile snapshot in this browser. No portraits were stored.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link to="/history">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Recent Analyses</span>
                </Button>
              </Link>
              <Button
                variant="primary"
                size="sm"
                onClick={() => activateHistoryEntry(savedEntry.id, true)}
              >
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Open in Chatbot</span>
              </Button>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="flex items-center gap-4 min-w-0">
            {previewThumb ? (
              <div className="w-16 h-20 rounded-xl overflow-hidden border border-[rgba(232,165,152,0.28)] bg-[#221A1A] shrink-0">
                <img
                  src={previewThumb.objectUrl}
                  alt="In-session portrait thumbnail"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            ) : (
              <div className="w-16 h-20 rounded-xl border border-[rgba(232,165,152,0.18)] bg-[#221A1A] flex flex-col items-center justify-center text-[#C9B8B0] shrink-0">
                <Camera className="w-4 h-4 text-[#E8A598]" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#E8A598] mb-1">
                {isReadOnly
                  ? 'Saved Report · Read-Only Snapshot'
                  : 'Step 3 of 3 · Analysis Results Dashboard'}
              </p>
              <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-[#F5EBE6]">
                Your Appearance Overview
              </h1>
            </div>
          </div>

          {!isReadOnly && (
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setShowHistoryPanel((prev) => !prev)}
                aria-expanded={showHistoryPanel}
                aria-controls="recent-analyses"
              >
                <Clock className="w-4 h-4 text-[#E8A598]" aria-hidden="true" />
                <span>Recent Analyses ({historyEntries.length})</span>
                {showHistoryPanel ? (
                  <ChevronUp className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <ChevronDown className="w-4 h-4" aria-hidden="true" />
                )}
              </Button>

              {activeMode === 'face' && (
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => handleAddMissingAnalysis('hair')}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Hair Analysis</span>
                </Button>
              )}
              {activeMode === 'hair' && (
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => handleAddMissingAnalysis('face')}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Face Analysis</span>
                </Button>
              )}
              {activeMode === 'both' && (
                <Link to="/analysis">
                  <Button variant="outline" size="md">
                    <RefreshCw className="w-4 h-4" />
                    <span>Retake Portrait</span>
                  </Button>
                </Link>
              )}
              <Link to="/recommendations">
                <Button variant="primary" size="md">
                  <span>View Personalized Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Toggleable Recent Analyses Section (auto-open on /history) */}
        {!isReadOnly && showHistoryPanel && renderRecentAnalysesSection()}

        {/* Hair-only banner */}
        {activeMode === 'hair' && !isReadOnly && (
          <div className="luxury-glass rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#F5EBE6]">
                Face-based cut &amp; eyewear suggestions need a front-facing portrait
              </p>
              <p className="text-xs sm:text-sm text-[#C9B8B0] mt-1">
                Your report currently focuses on hair texture care and compatible cuts. Add
                a face portrait anytime to unlock proportion-matched guidance.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleAddMissingAnalysis('face')}
              className="shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Face Analysis</span>
            </Button>
          </div>
        )}

        {/* Main Analysis Cards */}
        <div
          className={`grid grid-cols-1 gap-6 items-stretch ${
            faceSection && hairSection ? 'lg:grid-cols-12' : ''
          }`}
        >
          {/* 1. FACE SHAPE CARD */}
          {faceSection && (
            <section
              aria-labelledby="face-card-title"
              className={`${
                hairSection ? 'lg:col-span-7' : ''
              } luxury-glass rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6`}
            >
              <div className="space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="text-xs text-[#C9B8B0]">Shared Geometric Model</span>
                    <h2
                      id="face-card-title"
                      className="font-serif text-3xl font-semibold text-[#F5EBE6]"
                    >
                      Face Shape Analysis
                    </h2>
                  </div>

                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => setShowRecaptureGuidance((prev) => !prev)}
                      className="px-3.5 py-1.5 rounded-full text-xs font-medium border border-[rgba(232,165,152,0.24)] bg-[#1A1414] hover:border-[#E8A598] text-[#F5EBE6] transition-colors duration-150 cursor-pointer"
                    >
                      {faceSection.isUncertain
                        ? 'Restore Verified Geometry'
                        : 'Low-Confidence / Re-Capture View'}
                    </button>
                  )}
                </div>

                {faceSection.isUncertain && (
                  <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-400/30 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm text-amber-100 leading-relaxed">
                      <strong className="block text-amber-200 mb-0.5">
                        Lighting &amp; Re-Capture Guidance
                      </strong>
                      {faceSection.uncertainMessage}
                    </div>
                  </div>
                )}

                <div className="pb-5 border-b border-[rgba(232,165,152,0.14)] space-y-4">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="font-serif text-4xl sm:text-5xl font-semibold text-[#E8A598]">
                      {faceSection.primaryShape}
                    </span>
                    {faceSection.secondaryTendency && (
                      <span className="text-sm text-[#C9B8B0]">
                        · {faceSection.secondaryTendency}
                      </span>
                    )}
                  </div>

                  {!isReadOnly && (
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#1A1414] border border-[rgba(232,165,152,0.16)]">
                      <span className="text-xs text-[#C9B8B0]">Does this look right?</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => confirmField('face')}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 cursor-pointer ${
                            photoAnalysis.userConfirmed?.face
                              ? 'bg-[#E8A598] text-[#120E0E] font-semibold'
                              : 'bg-[#221A1A] border border-[rgba(232,165,152,0.22)] text-[#F5EBE6] hover:border-[#E8A598]'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>
                            {photoAnalysis.userConfirmed?.face ? 'Confirmed' : 'Confirm'}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingFace((prev) => !prev)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#221A1A] border border-[rgba(232,165,152,0.22)] text-[#C9B8B0] hover:text-[#F5EBE6] hover:border-[#E8A598] transition-colors duration-150 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{editingFace ? 'Done' : 'Refine'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {!isReadOnly && editingFace && (
                    <div className="p-4 rounded-xl bg-[#1A1414] border border-[rgba(232,165,152,0.2)] space-y-4">
                      <div>
                        <span className="block text-xs text-[#C9B8B0] mb-2">
                          Select primary face shape
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {FACE_SHAPE_OPTIONS.map((shape) => (
                            <button
                              key={shape}
                              type="button"
                              onClick={() => changeFaceShape(shape)}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 cursor-pointer ${
                                photoAnalysis.faceShape === shape
                                  ? 'bg-[#E8A598] text-[#120E0E] font-semibold'
                                  : 'bg-[#120E0E] border border-[rgba(232,165,152,0.18)] text-[#C9B8B0] hover:text-[#F5EBE6]'
                              }`}
                            >
                              {shape}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="results-secondary-tendency"
                          className="block text-xs text-[#C9B8B0] mb-1.5"
                        >
                          Optional secondary tendency
                        </label>
                        <select
                          id="results-secondary-tendency"
                          value={photoAnalysis.secondaryTendency ?? 'None'}
                          onChange={(e) => {
                            const primary: FaceShapeOption = hasAssessedFaceShape(
                              photoAnalysis.faceShape
                            )
                              ? photoAnalysis.faceShape
                              : 'Oval';
                            changeFaceShape(primary, e.target.value);
                          }}
                          className="w-full sm:w-72 px-3 py-2 rounded-lg bg-[#120E0E] border border-[rgba(232,165,152,0.22)] text-xs sm:text-sm text-[#F5EBE6] focus:outline-none focus:border-[#E8A598]"
                        >
                          {SECONDARY_TENDENCY_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-[#C9B8B0] leading-relaxed">
                    {faceSection.explanation}
                  </p>
                  <div className="p-3.5 rounded-xl bg-[#1A1414] border border-[rgba(232,165,152,0.16)]">
                    <span className="text-[11px] font-semibold text-[#E8A598] block mb-0.5">
                      Styling Balance Note
                    </span>
                    <p className="text-xs text-[#F5EBE6] leading-relaxed">
                      {faceSection.whyRecommended}
                    </p>
                  </div>
                </div>

                {/* Interactive Geometric Breakdown */}
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-[#F5EBE6]">
                      Geometric Breakdown
                    </h3>
                    <span className="text-xs text-[#C9B8B0]">
                      Normalized proportion indices
                    </span>
                  </div>

                  <div className="space-y-4">
                    {faceSection.metrics.map((metric) => (
                      <div key={metric.label} className="space-y-1.5">
                        <div className="flex items-baseline justify-between gap-2 text-xs sm:text-sm">
                          <span className="font-medium text-[#F5EBE6]">{metric.label}</span>
                          <span className="text-[#E8A598] font-medium tabular-nums">
                            {metric.valueLabel}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#120E0E] border border-[rgba(232,165,152,0.14)] overflow-hidden">
                          <div
                            className="h-full bg-[#E8A598] rounded-full transition-all duration-300"
                            style={{ width: `${metric.normalizedScore}%` }}
                          />
                        </div>
                        <p className="text-xs text-[#C9B8B0]">{metric.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#C9B8B0]/80 pt-4 border-t border-[rgba(232,165,152,0.12)]">
                Evaluated geometry spectrum: Oval · Round · Square · Oblong · Heart · Diamond
              </p>
            </section>
          )}

          {/* 2. HAIR TEXTURE CARD */}
          {hairSection && (
            <section
              aria-labelledby="hair-card-title"
              className={`${
                faceSection ? 'lg:col-span-5' : ''
              } luxury-glass rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6`}
            >
              <div className="space-y-5">
                <div>
                  <span className="text-xs text-[#C9B8B0]">Hair Texture &amp; Length</span>
                  <h2
                    id="hair-card-title"
                    className="font-serif text-3xl font-semibold text-[#F5EBE6]"
                  >
                    Hair Texture Profile
                  </h2>
                </div>

                {hairSection.texture === 'Unable to assess' && (
                  <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-400/30 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-amber-100 leading-relaxed">
                      Low lighting clarity on hair portrait. Select your natural dry
                      texture using &ldquo;Refine&rdquo; below, or retake in brighter light.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#1A1414] border border-[rgba(232,165,152,0.14)]">
                    <span className="text-xs text-[#C9B8B0] block">Detected Texture</span>
                    <span className="font-serif text-2xl sm:text-3xl font-semibold text-[#E8A598] mt-1 block">
                      {hairSection.texture}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#1A1414] border border-[rgba(232,165,152,0.14)]">
                    <span className="text-xs text-[#C9B8B0] block">Selected Length</span>
                    <span className="text-sm font-semibold text-[#F5EBE6] mt-2 block leading-snug">
                      {hairSection.lengthLabel}
                    </span>
                  </div>
                </div>

                {!isReadOnly && (
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#1A1414] border border-[rgba(232,165,152,0.16)]">
                    <span className="text-xs text-[#C9B8B0]">Does this look right?</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => confirmField('hair')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 cursor-pointer ${
                          photoAnalysis.userConfirmed?.hair
                            ? 'bg-[#E8A598] text-[#120E0E] font-semibold'
                            : 'bg-[#221A1A] border border-[rgba(232,165,152,0.22)] text-[#F5EBE6] hover:border-[#E8A598]'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>
                          {photoAnalysis.userConfirmed?.hair ? 'Confirmed' : 'Confirm'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingHair((prev) => !prev)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#221A1A] border border-[rgba(232,165,152,0.22)] text-[#C9B8B0] hover:text-[#F5EBE6] hover:border-[#E8A598] transition-colors duration-150 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{editingHair ? 'Done' : 'Refine'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {!isReadOnly && editingHair && (
                  <div className="p-4 rounded-xl bg-[#1A1414] border border-[rgba(232,165,152,0.2)]">
                    <span className="block text-xs text-[#C9B8B0] mb-2">
                      Select natural dry hair texture
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {HAIR_TEXTURE_OPTIONS.map((tex) => (
                        <button
                          key={tex}
                          type="button"
                          onClick={() => changeHairTexture(tex)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 cursor-pointer ${
                            photoAnalysis.hairTexture === tex
                              ? 'bg-[#E8A598] text-[#120E0E] font-semibold'
                              : 'bg-[#120E0E] border border-[rgba(232,165,152,0.18)] text-[#C9B8B0] hover:text-[#F5EBE6]'
                          }`}
                        >
                          {tex}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-[#1A1414] border border-[rgba(232,165,152,0.14)]">
                  <span className="text-xs text-[#C9B8B0] block">Styling Habit</span>
                  <span className="text-sm font-semibold text-[#F5EBE6] mt-1 block">
                    {hairSection.stylingLabel}
                  </span>
                </div>

                <p className="text-sm text-[#C9B8B0] leading-relaxed">{hairSection.summary}</p>

                <div className="p-3.5 rounded-xl bg-[#1A1414] border border-[rgba(232,165,152,0.16)]">
                  <span className="text-[11px] font-semibold text-[#E8A598] block mb-0.5">
                    Why This Fits You
                  </span>
                  <p className="text-xs text-[#F5EBE6] leading-relaxed">
                    {hairSection.whyRecommended}
                  </p>
                </div>

                <ul className="space-y-2 text-xs sm:text-sm text-[#C9B8B0] list-disc list-inside">
                  {hairSection.notes.map((note, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {note}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-xs text-[#C9B8B0]/80 pt-4 border-t border-[rgba(232,165,152,0.12)]">
                Texture categories: Straight · Wavy · Curly · Coily
              </p>
            </section>
          )}
        </div>

        {/* 3. VISIBLE SKIN CHARACTERISTICS CARD */}
        {skinSection && (
          <section
            aria-labelledby="skin-card-title"
            className="luxury-glass rounded-2xl p-6 sm:p-8 space-y-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="text-xs text-[#C9B8B0]">
                  Cosmetic Observations · Self-reported feel:{' '}
                  <strong className="text-[#F5EBE6]">{skinSection.selfReportedFeel}</strong>
                </span>
                <h2
                  id="skin-card-title"
                  className="font-serif text-3xl font-semibold text-[#F5EBE6]"
                >
                  Visible Skin Characteristics
                </h2>
              </div>

              {!isReadOnly && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-[#C9B8B0] mr-1">Does this look right?</span>
                  <button
                    type="button"
                    onClick={() => confirmField('skin')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 cursor-pointer ${
                      photoAnalysis.userConfirmed?.skin
                        ? 'bg-[#E8A598] text-[#120E0E] font-semibold'
                        : 'bg-[#1A1414] border border-[rgba(232,165,152,0.22)] text-[#F5EBE6] hover:border-[#E8A598]'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{photoAnalysis.userConfirmed?.skin ? 'Confirmed' : 'Confirm'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingSkin((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#1A1414] border border-[rgba(232,165,152,0.22)] text-[#C9B8B0] hover:text-[#F5EBE6] hover:border-[#E8A598] transition-colors duration-150 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{editingSkin ? 'Done' : 'Refine'}</span>
                  </button>
                </div>
              )}
            </div>

            {!isReadOnly && editingSkin && (
              <div className="p-4 rounded-xl bg-[#1A1414] border border-[rgba(232,165,152,0.2)] space-y-2">
                <span className="block text-xs text-[#C9B8B0]">
                  Choose the closest everyday surface appearance
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SKIN_PRESET_KEYS.map((presetKey) => (
                    <button
                      key={presetKey}
                      type="button"
                      onClick={() => changeSkinPreset(presetKey)}
                      className={`text-left px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-colors duration-150 cursor-pointer ${
                        currentSkinPresetKey === presetKey
                          ? 'bg-[#E8A598]/15 border-[#E8A598] text-[#F5EBE6]'
                          : 'bg-[#120E0E] border-[rgba(232,165,152,0.16)] text-[#C9B8B0] hover:text-[#F5EBE6]'
                      }`}
                    >
                      {presetKey}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs sm:text-sm text-[#C9B8B0] leading-relaxed">
              {skinSection.whyRecommended}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {skinSection.observations.map((obs) => (
                <div
                  key={obs.zone}
                  className="p-5 rounded-xl bg-[#1A1414] border border-[rgba(232,165,152,0.14)] space-y-2"
                >
                  <span className="text-xs text-[#E8A598] font-medium block">{obs.zone}</span>
                  <h3 className="font-sans text-sm font-semibold text-[#F5EBE6]">
                    {obs.observation}
                  </h3>
                  <p className="text-xs text-[#C9B8B0] leading-relaxed">{obs.cosmeticTip}</p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-[#1A1414] border border-[rgba(232,165,152,0.2)] flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-[#E8A598] shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-xs sm:text-sm text-[#C9B8B0] leading-relaxed">
                <strong className="text-[#F5EBE6]">Educational Cosmetic Note:</strong>{' '}
                {skinSection.disclaimer}
              </p>
            </div>
          </section>
        )}

        {/* 4. ACTIVE PREFERENCES & CONSTRAINTS SUMMARY */}
        <section
          aria-labelledby="constraints-card-title"
          className="luxury-glass rounded-2xl p-6 sm:p-8 space-y-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <SlidersHorizontal className="w-4 h-4 text-[#E8A598]" aria-hidden="true" />
              <h2
                id="constraints-card-title"
                className="font-serif text-3xl font-semibold text-[#F5EBE6]"
              >
                Active Preferences &amp; Constraints
              </h2>
            </div>
            {!isReadOnly && (
              <Link to="/onboarding">
                <Button variant="outline" size="sm">
                  Edit Profile
                </Button>
              </Link>
            )}
          </div>

          <p className="text-xs sm:text-sm text-[#C9B8B0] leading-relaxed">
            {constraintsSection.whyRecommended}
          </p>

          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#1A1414] border border-[rgba(232,165,152,0.14)]">
              <dt className="text-xs text-[#C9B8B0]">Styling Focus</dt>
              <dd className="text-sm font-semibold text-[#F5EBE6] mt-1">
                {STYLE_PREFERENCE_LABELS[preferences.stylePreference ?? 'all']}
              </dd>
            </div>
            <div className="p-4 rounded-xl bg-[#1A1414] border border-[rgba(232,165,152,0.14)]">
              <dt className="text-xs text-[#C9B8B0]">Daily Routine Time</dt>
              <dd className="text-sm font-semibold text-[#F5EBE6] mt-1">
                {constraintsSection.dailyTimeLabel}
              </dd>
            </div>
            <div className="p-4 rounded-xl bg-[#1A1414] border border-[rgba(232,165,152,0.14)]">
              <dt className="text-xs text-[#C9B8B0]">Monthly Budget</dt>
              <dd className="text-sm font-semibold text-[#E8A598] mt-1">
                {constraintsSection.budgetLabel}
              </dd>
            </div>
            <div className="p-4 rounded-xl bg-[#1A1414] border border-[rgba(232,165,152,0.14)]">
              <dt className="text-xs text-[#C9B8B0]">Sensitivities</dt>
              <dd className="text-sm font-semibold text-[#F5EBE6] mt-1">
                {constraintsSection.sensitivitiesLabel}
              </dd>
            </div>
          </dl>

          {constraintsSection.youAlsoMentioned.length > 0 && (
            <div className="p-4 rounded-xl bg-[#1A1414] border border-[rgba(232,165,152,0.16)] space-y-2.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-xs font-semibold text-[#E8A598]">
                  Personal Notes Included:
                </h3>
                <span className="text-[11px] text-[#C9B8B0]">
                  Cosmetic preference context only
                </span>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm text-[#F5EBE6]">
                {constraintsSection.youAlsoMentioned.map((note) => (
                  <li key={`${note.category}-${note.text}`} className="leading-relaxed">
                    <span className="text-[#C9B8B0]">{note.category}: </span>
                    <span className="break-words">{note.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Bottom Primary CTA */}
        <div className="bg-[#1A1414] border border-[rgba(232,165,152,0.2)] rounded-2xl p-7 sm:p-9 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="font-serif text-3xl font-semibold text-[#F5EBE6]">
              {savedEntry
                ? 'Explore this saved grooming plan'
                : 'Your tailored plan is ready'}
            </h2>
            <p className="text-sm text-[#C9B8B0] mt-1">
              {savedEntry
                ? 'Activate this saved profile to inspect its hairstyles, AM/PM routines, and eyewear recommendations.'
                : 'Explore hairstyles, morning & evening care routines, and eyewear proportions matched to your profile.'}
            </p>
          </div>

          {savedEntry ? (
            <div className="flex flex-wrap items-center gap-3 shrink-0 w-full sm:w-auto">
              <Button
                variant="outline"
                size="md"
                onClick={() => activateHistoryEntry(savedEntry.id, true)}
              >
                <Sparkles className="w-4 h-4 text-[#E8A598]" aria-hidden="true" />
                <span>Open in Chatbot</span>
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  activateHistoryEntry(savedEntry.id, false);
                  navigate('/recommendations');
                }}
              >
                <span>View Personalized Plan</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
          ) : (
            <Link to="/recommendations" className="shrink-0 w-full sm:w-auto">
              <Button variant="primary" size="lg" fullWidth>
                <span>View Personalized Plan</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Clear All History Confirmation Modal */}
      <Modal
        isOpen={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        title="Clear all saved history?"
        subtitle="This removes every saved analysis record from this browser."
      >
        <div className="space-y-5">
          <p className="text-sm text-[#C9B8B0] leading-relaxed">
            All {historyEntries.length} saved{' '}
            {historyEntries.length === 1 ? 'entry' : 'entries'} will be permanently removed
            from local storage in this browser. Your current active session can still be
            re-run anytime from Photo Analysis.
          </p>
          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setConfirmClearOpen(false)}>
              Cancel
            </Button>
            <button
              type="button"
              onClick={handleConfirmClearAll}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-red-500/20 hover:bg-red-500/30 border border-red-400/50 text-red-100 transition-colors duration-150 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Yes, clear all history</span>
            </button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}
