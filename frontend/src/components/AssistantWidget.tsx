import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, RotateCcw, Send, Sparkles, X } from 'lucide-react';
import {
  ASSISTANT_SUGGESTIONS_WITHOUT_RESULTS,
  ASSISTANT_SUGGESTIONS_WITH_RESULTS,
} from '../data';
import {
  askAssistant,
  buildAssistantContext,
  hasAssessedFaceShape,
  hasAssessedHairTexture,
} from '../services';
import { useAllure } from '../state';
import { AssistantContext, AssistantMessage } from '../types';

function createInitialMessages(context: AssistantContext): AssistantMessage[] {
  if (!context.hasAnalysis) {
    return [
      {
        id: 'chatbot-welcome-empty',
        role: 'assistant',
        text: "Welcome to ALLURE Chatbot. Ask about hairstyles for your face shape, quick morning routines, or curated products — or complete your profile for tailored guidance.",
        ctaLabel: 'Start Your Profile',
        ctaTo: '/onboarding',
        createdAt: new Date().toISOString(),
      },
    ];
  }

  const parts: string[] = [];
  if (hasAssessedFaceShape(context.faceShape)) {
    parts.push(
      `${context.faceShape} face shape${
        context.secondaryTendency ? ` (${context.secondaryTendency.toLowerCase()})` : ''
      }`
    );
  } else if (context.faceShape === 'Unable to assess') {
    parts.push('Refining face shape');
  }

  if (hasAssessedHairTexture(context.hairTexture)) {
    parts.push(`${context.hairTexture} hair`);
  } else if (context.hairTexture === 'Unable to assess') {
    parts.push('Refining hair texture');
  }

  const traitSummary = parts.length > 0 ? parts.join(' · ') : 'your active styling profile';

  return [
    {
      id: 'chatbot-welcome-active',
      role: 'assistant',
      text: `Welcome back to ALLURE Chatbot. I'm synced with your profile (${traitSummary}). Ask me about matched hairstyles, eyewear geometry, morning/evening routines, or products within your budget.`,
      createdAt: new Date().toISOString(),
    },
  ];
}

export default function AssistantWidget() {
  const {
    photoAnalysis,
    preferences,
    assistantOpen,
    setAssistantOpen,
    analysisUpdateEvent,
  } = useAllure();

  // Structured context ONLY — uploaded photos are never passed to the concierge
  const context = useMemo(
    () => buildAssistantContext(photoAnalysis, preferences),
    [photoAnalysis, preferences]
  );

  const [messages, setMessages] = useState<AssistantMessage[]>(() =>
    createInitialMessages(context)
  );
  const [inputValue, setInputValue] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [hasUnreadUpdate, setHasUnreadUpdate] = useState(false);

  const triggerBtnRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastHandledEventIdRef = useRef<number>(analysisUpdateEvent?.eventId ?? 0);
  const pendingRequestRef = useRef(0);
  const shouldRestoreFocusRef = useRef(false);

  const suggestedQuestions = context.hasAnalysis
    ? ASSISTANT_SUGGESTIONS_WITH_RESULTS
    : ASSISTANT_SUGGESTIONS_WITHOUT_RESULTS;

  const closePanel = useCallback(
    (restoreFocus = true) => {
      shouldRestoreFocusRef.current = restoreFocus;
      setAssistantOpen(false);
    },
    [setAssistantOpen]
  );

  // Sync live analysis completions, profile refinements, and History activations
  useEffect(() => {
    if (!analysisUpdateEvent) return;
    if (analysisUpdateEvent.eventId <= lastHandledEventIdRef.current) return;

    if (assistantOpen) {
      lastHandledEventIdRef.current = analysisUpdateEvent.eventId;
      setHasUnreadUpdate(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `concierge-sync-${analysisUpdateEvent.eventId}`,
          role: 'assistant',
          text: analysisUpdateEvent.summaryMessage,
          createdAt: new Date().toISOString(),
        },
      ]);
    } else {
      setHasUnreadUpdate(true);
    }
  }, [analysisUpdateEvent, assistantOpen]);

  // Focus input when opening panel; close on Escape and return focus to button on close
  useEffect(() => {
    if (assistantOpen) {
      const timer = window.setTimeout(() => {
        inputRef.current?.focus();
      }, 30);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          closePanel(true);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else if (shouldRestoreFocusRef.current) {
      shouldRestoreFocusRef.current = false;
      triggerBtnRef.current?.focus();
    }
  }, [assistantOpen, closePanel]);

  useEffect(() => {
    if (!assistantOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isPending, assistantOpen]);

  const handleClearChat = () => {
    pendingRequestRef.current += 1;
    setIsPending(false);
    setInputValue('');
    setMessages(createInitialMessages(context));
    inputRef.current?.focus();
  };

  const sendMessage = async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || isPending) return;

    const userMsg: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsPending(true);

    const requestId = ++pendingRequestRef.current;

    try {
      const reply = await askAssistant(trimmed, context);
      if (pendingRequestRef.current !== requestId) return;

      const assistantMsg: AssistantMessage = {
        id: `concierge-${Date.now()}`,
        role: 'assistant',
        text: reply.text,
        suggestions: reply.suggestions,
        sources: reply.sources,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      if (pendingRequestRef.current !== requestId) return;
      setMessages((prev) => [
        ...prev,
        {
          id: `concierge-err-${Date.now()}`,
          role: 'assistant',
          text: 'Connection briefly interrupted. Please ask your styling question again.',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      if (pendingRequestRef.current === requestId) {
        setIsPending(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(inputValue);
  };

  return (
    <>
      {/* Mobile backdrop scrim when bottom sheet is open */}
      {assistantOpen && (
        <div
          aria-hidden="true"
          onClick={() => closePanel(true)}
          className="sm:hidden fixed inset-0 z-[59] bg-black/70 backdrop-blur-xs"
        />
      )}

      {/* Floating AI Chatbot Launcher Button (Icon-Only) */}
      {!assistantOpen && (
        <button
          ref={triggerBtnRef}
          type="button"
          onClick={() => {
            setHasUnreadUpdate(false);
            setAssistantOpen(true);
          }}
          aria-label="Open ALLURE Chatbot"
          aria-expanded={false}
          aria-haspopup="dialog"
          className="fixed bottom-5 right-5 z-[60] group flex items-center justify-center w-14 h-14 rounded-full bg-[#221A1A]/95 backdrop-blur-md hover:bg-[#2C2121] text-[#E8A598] border border-[rgba(232,165,152,0.38)] hover:border-[#E8A598] shadow-[0_14px_38px_-10px_rgba(0,0,0,0.85),0_0_24px_-6px_rgba(232,165,152,0.4)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A598] focus-visible:ring-offset-2 focus-visible:ring-offset-[#120E0E]"
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-[#E8A598]/20 animate-rose-pulse pointer-events-none"
          />
          <span className="relative flex items-center justify-center w-9 h-9 rounded-full bg-[#E8A598] text-[#120E0E] group-hover:bg-[#D98A7C] transition-colors duration-200">
            <Sparkles className="w-5 h-5" aria-hidden="true" />
          </span>
          {hasUnreadUpdate && (
            <span
              aria-hidden="true"
              className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-[#E8A598] ring-2 ring-[#120E0E]"
            />
          )}
        </button>
      )}

      {/* Animated Glassmorphic ALLURE Chatbot Drawer */}
      {assistantOpen && (
        <section
          role="dialog"
          aria-label="ALLURE Chatbot"
          aria-modal="false"
          className="fixed z-[60] inset-x-0 bottom-0 h-[85dvh] max-h-[85dvh] rounded-t-2xl sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[392px] sm:max-w-[calc(100vw-2.5rem)] sm:h-[min(580px,calc(100dvh-96px))] sm:max-h-[min(580px,calc(100dvh-96px))] sm:rounded-2xl bg-[#1A1414]/95 backdrop-blur-xl border border-[rgba(232,165,152,0.22)] shadow-[0_28px_72px_-16px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-left animate-drawer-in"
        >
          {/* Header */}
          <header className="px-4 py-3.5 bg-[#221A1A]/90 border-b border-[rgba(232,165,152,0.16)] flex items-center justify-between gap-2 shrink-0">
            <div className="min-w-0 flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-full bg-[#E8A598]/15 border border-[#E8A598]/40 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-[#E8A598]" aria-hidden="true" />
                <span
                  aria-hidden="true"
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#E8A598] ring-2 ring-[#221A1A] animate-rose-pulse"
                />
              </div>
              <div className="min-w-0">
                <h2 className="font-serif text-lg font-semibold text-[#F5EBE6] leading-tight truncate">
                  ALLURE Chatbot
                </h2>
                <p className="text-[11px] text-[#C9B8B0] leading-tight">
                  Personal Style &amp; Grooming Advisor
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleClearChat}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#C9B8B0] hover:text-[#F5EBE6] hover:bg-[#120E0E] border border-transparent hover:border-[rgba(232,165,152,0.18)] transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A598]"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reset</span>
              </button>
              <button
                type="button"
                onClick={() => closePanel(true)}
                aria-label="Close ALLURE Chatbot"
                className="w-8 h-8 rounded-full bg-[#120E0E] border border-[rgba(232,165,152,0.2)] hover:border-[#E8A598] text-[#F5EBE6] flex items-center justify-center transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A598]"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </header>

          {/* Message List */}
          <div
            aria-live="polite"
            aria-relevant="additions text"
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#120E0E]/80"
          >
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-line break-words ${
                      isUser
                        ? 'bg-[#E8A598]/20 border border-[#E8A598]/40 text-[#F5EBE6] rounded-br-sm'
                        : 'bg-[#221A1A] border border-[rgba(232,165,152,0.16)] text-[#F5EBE6] rounded-bl-sm'
                    }`}
                  >
                    <p>{msg.text}</p>

                    {msg.ctaTo && msg.ctaLabel && (
                      <div className="mt-3">
                        <Link
                          to={msg.ctaTo}
                          onClick={() => closePanel(false)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#E8A598] hover:bg-[#D98A7C] text-[#120E0E] text-xs font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5EBE6]"
                        >
                          <span>{msg.ctaLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </Link>
                      </div>
                    )}

                    {msg.sources && msg.sources.length > 0 && (
                      <p className="mt-2 pt-2 border-t border-[rgba(232,165,152,0.12)] text-[11px] text-[#C9B8B0]">
                        Tailored to: {msg.sources.join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {isPending && (
              <div className="flex items-start">
                <div className="rounded-2xl rounded-bl-sm px-3.5 py-2 bg-[#221A1A] border border-[rgba(232,165,152,0.16)] text-xs text-[#C9B8B0] inline-flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E8A598] animate-rose-pulse" />
                  <span>Preparing your styling notes...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick-Prompt Pills */}
          <div className="px-3.5 pt-2.5 pb-2 bg-[#1A1414] border-t border-[rgba(232,165,152,0.14)] shrink-0">
            <div className="flex flex-wrap gap-1.5">
              {suggestedQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  disabled={isPending}
                  onClick={() => void sendMessage(question)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#120E0E] hover:bg-[#221A1A] text-[#E8A598] border border-[rgba(232,165,152,0.22)] hover:border-[#E8A598] transition-colors duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A598]"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSubmit}
            className="px-3.5 pb-2.5 pt-1 bg-[#1A1414] flex items-center gap-2 shrink-0"
          >
            <label htmlFor="allure-chatbot-input" className="sr-only">
              Ask ALLURE Chatbot
            </label>
            <input
              ref={inputRef}
              id="allure-chatbot-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about hairstyles, routines, or products..."
              maxLength={400}
              disabled={isPending}
              className="flex-1 min-w-0 px-3.5 py-2 rounded-full bg-[#120E0E] border border-[rgba(232,165,152,0.2)] focus:border-[#E8A598] text-base sm:text-sm text-[#F5EBE6] placeholder:text-[#C9B8B0]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A598] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isPending || inputValue.trim().length === 0}
              aria-label="Send message"
              className="w-10 h-10 rounded-full bg-[#E8A598] hover:bg-[#D98A7C] text-[#120E0E] flex items-center justify-center shrink-0 transition-colors duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A598]"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>

          {/* Subtle Cosmetic Disclaimer Footer */}
          <div className="px-4 py-2 bg-[#120E0E] border-t border-[rgba(232,165,152,0.12)] shrink-0">
            <p className="text-[11px] text-[#C9B8B0]/80 leading-snug text-center">
              Cosmetic styling guidance · Not medical advice.
            </p>
          </div>
        </section>
      )}
    </>
  );
}
