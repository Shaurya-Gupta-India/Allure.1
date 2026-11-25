import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  DEFAULT_PREFERENCES,
  EMPTY_CUSTOM_OTHER,
  SAMPLE_DEMO_PROFILES,
} from './data';
import {
  buildAnalysisUpdateMessage,
  buildHistoryEntryFromState,
  deleteHistoryEntryById,
  deriveBudgetTier,
  historyEntryToPhotoAnalysis,
  loadHistoryEntries,
  saveHistoryEntries,
  upsertHistoryEntry,
} from './services';
import {
  AnalysisMode,
  AnalysisUpdateEvent,
  HistoryEntry,
  PhotoAnalysisResponse,
  SampleProfileType,
  UploadedPhoto,
  UserPreferences,
} from './types';

const STORAGE_PREFS_KEY = 'allure_flow_prefs_v3';
const STORAGE_ANALYSIS_KEY = 'allure_flow_analysis_v3';
const STORAGE_MODE_KEY = 'allure_flow_mode_v3';

interface AllureContextValue {
  analysisMode: AnalysisMode;
  setAnalysisMode: (mode: AnalysisMode) => void;

  preferences: UserPreferences;
  updatePreferences: (patch: Partial<UserPreferences>) => void;
  resetAllState: () => void;

  // Strictly in-session memory-only photo previews (never written to localStorage)
  facePhoto: UploadedPhoto | null;
  hairPhoto: UploadedPhoto | null;
  setFacePhotoFile: (file: File) => void;
  setHairPhotoFile: (file: File) => void;
  loadSampleProfilePhotos: (
    profileType: SampleProfileType,
    modeOverride?: AnalysisMode
  ) => void;
  removeFacePhoto: () => void;
  removeHairPhoto: () => void;

  // Photo analysis + user Confirm/Change corrections (persisted to localStorage)
  photoAnalysis: PhotoAnalysisResponse | null;
  setPhotoAnalysis: (
    value:
      | PhotoAnalysisResponse
      | null
      | ((prev: PhotoAnalysisResponse | null) => PhotoAnalysisResponse | null)
  ) => void;
  updateConfirmedAnalysis: (patch: Partial<PhotoAnalysisResponse>) => void;

  // Live Assistant panel state & change notifications (no photos ever passed)
  assistantOpen: boolean;
  setAssistantOpen: React.Dispatch<React.SetStateAction<boolean>>;
  analysisUpdateEvent: AnalysisUpdateEvent | null;

  // History of past analyses (persisted to localStorage without photos)
  historyEntries: HistoryEntry[];
  saveAnalysisToHistory: (
    analysisOverride?: PhotoAnalysisResponse,
    prefsOverride?: UserPreferences
  ) => void;
  deleteHistoryEntry: (id: string) => void;
  clearAllHistory: () => void;
  activateHistoryEntry: (id: string, openPanel?: boolean) => HistoryEntry | null;
}

const AllureContext = createContext<AllureContextValue | undefined>(undefined);

function readStoredMode(): AnalysisMode {
  try {
    const raw = window.localStorage.getItem(STORAGE_MODE_KEY);
    if (raw === 'face' || raw === 'hair' || raw === 'both') return raw;
    return 'both';
  } catch {
    return 'both';
  }
}

function readStoredPrefs(): UserPreferences {
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFS_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      customOther: {
        ...EMPTY_CUSTOM_OTHER,
        ...(parsed.customOther ?? {}),
      },
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function readStoredAnalysis(): PhotoAnalysisResponse | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_ANALYSIS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PhotoAnalysisResponse;
    if (!parsed.analysisMode) {
      parsed.analysisMode =
        parsed.faceShape && parsed.hairTexture
          ? 'both'
          : parsed.hairTexture
          ? 'hair'
          : 'face';
    }
    return parsed;
  } catch {
    return null;
  }
}

export function AllureProvider({ children }: { children: React.ReactNode }) {
  const [analysisMode, setAnalysisModeState] = useState<AnalysisMode>(readStoredMode);
  const [preferences, setPreferences] = useState<UserPreferences>(readStoredPrefs);
  const [photoAnalysis, setPhotoAnalysisRaw] =
    useState<PhotoAnalysisResponse | null>(readStoredAnalysis);
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>(loadHistoryEntries);

  const [assistantOpen, setAssistantOpen] = useState(false);
  const [analysisUpdateEvent, setAnalysisUpdateEvent] =
    useState<AnalysisUpdateEvent | null>(null);

  const [facePhoto, setFacePhoto] = useState<UploadedPhoto | null>(null);
  const [hairPhoto, setHairPhoto] = useState<UploadedPhoto | null>(null);

  const faceBlobRef = useRef<string | null>(null);
  const hairBlobRef = useRef<string | null>(null);
  const eventCounterRef = useRef(0);

  const preferencesRef = useRef(preferences);
  const photoAnalysisRef = useRef(photoAnalysis);
  const historyEntriesRef = useRef(historyEntries);

  preferencesRef.current = preferences;
  photoAnalysisRef.current = photoAnalysis;
  historyEntriesRef.current = historyEntries;

  const emitAnalysisUpdate = useCallback((analysis: PhotoAnalysisResponse) => {
    eventCounterRef.current += 1;
    setAnalysisUpdateEvent({
      eventId: eventCounterRef.current,
      analysisId: analysis.analysisId,
      mode: analysis.analysisMode ?? 'both',
      summaryMessage: buildAnalysisUpdateMessage(analysis),
    });
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_MODE_KEY, analysisMode);
    } catch {
      // Ignore storage quota errors
    }
  }, [analysisMode]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_PREFS_KEY, JSON.stringify(preferences));
    } catch {
      // Ignore storage quota errors
    }
  }, [preferences]);

  useEffect(() => {
    try {
      if (photoAnalysis) {
        window.localStorage.setItem(STORAGE_ANALYSIS_KEY, JSON.stringify(photoAnalysis));
      } else {
        window.localStorage.removeItem(STORAGE_ANALYSIS_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }, [photoAnalysis]);

  useEffect(() => {
    return () => {
      if (faceBlobRef.current) URL.revokeObjectURL(faceBlobRef.current);
      if (hairBlobRef.current) URL.revokeObjectURL(hairBlobRef.current);
    };
  }, []);

  const setAnalysisMode = useCallback((mode: AnalysisMode) => {
    setAnalysisModeState(mode);
  }, []);

  const setPhotoAnalysis = useCallback(
    (
      value:
        | PhotoAnalysisResponse
        | null
        | ((prev: PhotoAnalysisResponse | null) => PhotoAnalysisResponse | null)
    ) => {
      const prev = photoAnalysisRef.current;
      const next = typeof value === 'function' ? value(prev) : value;
      photoAnalysisRef.current = next;
      setPhotoAnalysisRaw(next);
      if (next) {
        emitAnalysisUpdate(next);
      }
    },
    [emitAnalysisUpdate]
  );

  const updatePreferences = useCallback((patch: Partial<UserPreferences>) => {
    const prev = preferencesRef.current;
    const next: UserPreferences = { ...prev, ...patch };
    if (typeof patch.monthlyBudgetINR === 'number' && !patch.budgetTier) {
      next.budgetTier = deriveBudgetTier(patch.monthlyBudgetINR);
    }
    preferencesRef.current = next;
    setPreferences(next);

    const activeAnalysis = photoAnalysisRef.current;
    if (
      activeAnalysis &&
      historyEntriesRef.current.some((e) => e.id === activeAnalysis.analysisId)
    ) {
      const entry = buildHistoryEntryFromState(activeAnalysis, next);
      const updatedEntries = upsertHistoryEntry(historyEntriesRef.current, entry);
      historyEntriesRef.current = updatedEntries;
      setHistoryEntries(updatedEntries);
      saveHistoryEntries(updatedEntries);
    }
  }, []);

  const updateConfirmedAnalysis = useCallback(
    (patch: Partial<PhotoAnalysisResponse>) => {
      const prev = photoAnalysisRef.current;
      if (!prev) return;

      const valueChanged =
        'faceShape' in patch ||
        'secondaryTendency' in patch ||
        'hairTexture' in patch ||
        'skinObservations' in patch;

      const next: PhotoAnalysisResponse = { ...prev, ...patch };
      photoAnalysisRef.current = next;
      setPhotoAnalysisRaw(next);

      if (valueChanged) {
        emitAnalysisUpdate(next);
      }

      // If this analysis is already saved in history, update its saved record in place
      if (historyEntriesRef.current.some((e) => e.id === next.analysisId)) {
        const updatedEntry = buildHistoryEntryFromState(next, preferencesRef.current);
        const nextEntries = upsertHistoryEntry(historyEntriesRef.current, updatedEntry);
        historyEntriesRef.current = nextEntries;
        setHistoryEntries(nextEntries);
        saveHistoryEntries(nextEntries);
      }
    },
    [emitAnalysisUpdate]
  );

  const saveAnalysisToHistory = useCallback(
    (analysisOverride?: PhotoAnalysisResponse, prefsOverride?: UserPreferences) => {
      const targetAnalysis = analysisOverride ?? photoAnalysisRef.current;
      if (!targetAnalysis) return;
      const targetPrefs = prefsOverride ?? preferencesRef.current;
      const entry = buildHistoryEntryFromState(targetAnalysis, targetPrefs);
      setHistoryEntries((prev) => {
        const next = upsertHistoryEntry(prev, entry);
        saveHistoryEntries(next);
        return next;
      });
    },
    []
  );

  const deleteHistoryEntry = useCallback((id: string) => {
    setHistoryEntries((prev) => {
      const next = deleteHistoryEntryById(prev, id);
      saveHistoryEntries(next);
      return next;
    });
  }, []);

  const clearAllHistory = useCallback(() => {
    setHistoryEntries([]);
    saveHistoryEntries([]);
  }, []);

  const activateHistoryEntry = useCallback(
    (id: string, openPanel = false): HistoryEntry | null => {
      const entry = historyEntriesRef.current.find((e) => e.id === id);
      if (!entry) return null;

      const restoredAnalysis = historyEntryToPhotoAnalysis(entry);
      if (faceBlobRef.current) {
        URL.revokeObjectURL(faceBlobRef.current);
        faceBlobRef.current = null;
      }
      if (hairBlobRef.current) {
        URL.revokeObjectURL(hairBlobRef.current);
        hairBlobRef.current = null;
      }
      setFacePhoto(null);
      setHairPhoto(null);

      setAnalysisModeState(entry.analysisMode);
      setPreferences(entry.questionnaireAnswers);
      setPhotoAnalysisRaw(restoredAnalysis);
      emitAnalysisUpdate(restoredAnalysis);

      if (openPanel) {
        setAssistantOpen(true);
      }

      return entry;
    },
    [emitAnalysisUpdate]
  );

  const resetAllState = useCallback(() => {
    setAnalysisModeState('both');
    setPreferences(DEFAULT_PREFERENCES);
    setPhotoAnalysisRaw(null);
    if (faceBlobRef.current) {
      URL.revokeObjectURL(faceBlobRef.current);
      faceBlobRef.current = null;
    }
    if (hairBlobRef.current) {
      URL.revokeObjectURL(hairBlobRef.current);
      hairBlobRef.current = null;
    }
    setFacePhoto(null);
    setHairPhoto(null);
  }, []);

  const setFacePhotoFile = useCallback((file: File) => {
    if (faceBlobRef.current) URL.revokeObjectURL(faceBlobRef.current);
    const url = URL.createObjectURL(file);
    faceBlobRef.current = url;
    setFacePhoto({
      objectUrl: url,
      fileName: file.name,
      fileSizeBytes: file.size,
      isSample: false,
    });
  }, []);

  const setHairPhotoFile = useCallback((file: File) => {
    if (hairBlobRef.current) URL.revokeObjectURL(hairBlobRef.current);
    const url = URL.createObjectURL(file);
    hairBlobRef.current = url;
    setHairPhoto({
      objectUrl: url,
      fileName: file.name,
      fileSizeBytes: file.size,
      isSample: false,
    });
  }, []);

  const loadSampleProfilePhotos = useCallback(
    (profileType: SampleProfileType, modeOverride?: AnalysisMode) => {
      const targetMode = modeOverride ?? analysisMode;
      const sample = SAMPLE_DEMO_PROFILES[profileType];

      if (targetMode === 'face' || targetMode === 'both') {
        if (faceBlobRef.current) {
          URL.revokeObjectURL(faceBlobRef.current);
          faceBlobRef.current = null;
        }
        setFacePhoto({
          objectUrl: sample.faceImageUrl,
          fileName: sample.faceFileName,
          fileSizeBytes: 420 * 1024,
          isSample: true,
          sampleProfile: profileType,
        });
      } else {
        if (faceBlobRef.current) {
          URL.revokeObjectURL(faceBlobRef.current);
          faceBlobRef.current = null;
        }
        setFacePhoto(null);
      }

      if (targetMode === 'hair' || targetMode === 'both') {
        if (hairBlobRef.current) {
          URL.revokeObjectURL(hairBlobRef.current);
          hairBlobRef.current = null;
        }
        setHairPhoto({
          objectUrl: sample.hairImageUrl,
          fileName: sample.hairFileName,
          fileSizeBytes: 380 * 1024,
          isSample: true,
          sampleProfile: profileType,
        });
      } else {
        if (hairBlobRef.current) {
          URL.revokeObjectURL(hairBlobRef.current);
          hairBlobRef.current = null;
        }
        setHairPhoto(null);
      }
    },
    [analysisMode]
  );

  const removeFacePhoto = useCallback(() => {
    if (faceBlobRef.current) {
      URL.revokeObjectURL(faceBlobRef.current);
      faceBlobRef.current = null;
    }
    setFacePhoto(null);
  }, []);

  const removeHairPhoto = useCallback(() => {
    if (hairBlobRef.current) {
      URL.revokeObjectURL(hairBlobRef.current);
      hairBlobRef.current = null;
    }
    setHairPhoto(null);
  }, []);

  return (
    <AllureContext.Provider
      value={{
        analysisMode,
        setAnalysisMode,
        preferences,
        updatePreferences,
        resetAllState,
        facePhoto,
        hairPhoto,
        setFacePhotoFile,
        setHairPhotoFile,
        loadSampleProfilePhotos,
        removeFacePhoto,
        removeHairPhoto,
        photoAnalysis,
        setPhotoAnalysis,
        updateConfirmedAnalysis,
        assistantOpen,
        setAssistantOpen,
        analysisUpdateEvent,
        historyEntries,
        saveAnalysisToHistory,
        deleteHistoryEntry,
        clearAllHistory,
        activateHistoryEntry,
      }}
    >
      {children}
    </AllureContext.Provider>
  );
}

export function useAllure(): AllureContextValue {
  const ctx = useContext(AllureContext);
  if (!ctx) {
    throw new Error('useAllure must be used inside AllureProvider');
  }
  return ctx;
}

