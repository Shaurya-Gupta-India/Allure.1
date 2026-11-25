import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  Camera,
  Check,
  ChevronDown,
  Cpu,
  Edit3,
  Layers,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import PageShell from '../components/Layout';
import { Button } from '../components/ui';
import {
  HOW_IT_WORKS_FAQ,
  PHOTO_TIPS_AVOID,
  PHOTO_TIPS_DO,
  PLANNED_ARCHITECTURE_NODES,
} from '../data';

const WORKFLOW_STEPS = [
  {
    number: '01',
    icon: ShieldCheck,
    title: 'Secure Consent & Profile Setup',
    subtitle: 'Privacy-first session controls and personal lifestyle calibration',
    description:
      'Before any image is selected, ALLURE presents an explicit session privacy gate explaining that photos are processed strictly in temporary session memory and are never shared, sold, or used for model training. You then complete a calm 3-step onboarding questionnaire covering styling preferences, goals, hair length, skin feel, daily time window, and monthly budget.',
    youDo: 'Confirm session privacy and select your routine time, budget, and grooming goals.',
    behindTheScenes:
      'Initializes a scoped local profile context so visual inferences are weighted against your real-world constraints.',
  },
  {
    number: '02',
    icon: Camera,
    title: 'Photo Capture & Quality Checks',
    subtitle: 'Guided framing validation and automatic clarity diagnostics',
    description:
      'Choose Face only, Hair only, or Face + Hair, and upload a front-facing portrait and/or hair texture image—or test immediately with a built-in studio sample portrait. Automated pre-checks verify file integrity, lighting balance, head angle, and clarity, flagging obstructed, tilted, or blurry images before inference runs.',
    youDo: 'Upload clear JPG, PNG, or WebP portraits in even light, or select a sample portrait.',
    behindTheScenes:
      'Validates resolution, face alignment, and exposure in temporary memory without writing raw photos to persistent storage.',
  },
  {
    number: '03',
    icon: Cpu,
    title: 'AI Model Inference',
    subtitle: 'Landmark geometry, strand pattern extraction, and transparent uncertainty',
    description:
      'Facial landmarks are mapped to extract normalized proportion indices (face aspect ratio, jaw-to-cheek ratio, and forehead balance), while hair imagery is classified across straight, wavy, curly, and coily strand patterns. ALLURE evaluates every portrait neutrally without demographic stereotyping, surfaces mixed-shape tendencies when proportions sit between categories, and lets you confirm or refine every label.',
    youDo: 'Watch the biometric scan progress, review your report, and confirm or refine any trait.',
    behindTheScenes:
      'Computes geometric ratios and cosmetic surface cues while preserving an honest low-confidence / re-capture fallback.',
  },
  {
    number: '04',
    icon: SlidersHorizontal,
    title: 'Tailored Recommendation Engine',
    subtitle: 'Explainable styling, AM/PM routines, and budget-aligned product matches',
    description:
      'Confirmed visual traits are combined with your daily time budget, monthly spend ceiling, hair length, and ingredient sensitivities to generate hairstyles, optional facial hair contours, eyewear geometry, and morning/evening care steps. Every card includes a "Why This Fits You" rationale, connects directly to matched products, and syncs live with the ALLURE Chatbot.',
    youDo: 'Filter live by maintenance level or budget, compare up to 3 products, or ask ALLURE Chatbot.',
    behindTheScenes:
      'Scores hairstyles, routines, and Haircare/Skincare/Tool picks deterministically against your active profile.',
  },
];

export default function HowItWorksPage() {
  return (
    <PageShell noPadding>
      {/* Page Header */}
      <section className="py-16 lg:py-24 bg-[#120E0E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-5 animate-fade-up">
          <p className="text-xs font-medium tracking-[0.22em] uppercase text-[#E8A598]">
            How It Works
          </p>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#F5EBE6] leading-[1.06] max-w-3xl">
            From secure consent to a tailored grooming blueprint
          </h1>

          <p className="text-base sm:text-lg text-[#C9B8B0] max-w-2xl leading-relaxed">
            A transparent four-stage technical workflow that keeps portraits strictly in
            session memory, explains every proportion ratio in plain language, and puts you
            in full control of your final plan.
          </p>
        </div>
      </section>

      {/* 1. Four-Stage Visual Technical Guide */}
      <section className="py-16 lg:py-24 bg-[#1A1414] border-t border-[rgba(232,165,152,0.16)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <div className="max-w-2xl mb-10 lg:mb-12 space-y-3">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#E8A598]">
              Step-by-Step Technical Workflow
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#F5EBE6] leading-tight">
              Four transparent stages end to end
            </h2>
          </div>

          <ol className="relative space-y-6 before:hidden sm:before:block sm:before:absolute sm:before:left-6 sm:before:top-6 sm:before:bottom-6 sm:before:w-px sm:before:bg-[rgba(232,165,152,0.22)]">
            {WORKFLOW_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <li key={step.number} className="relative sm:pl-16">
                  <span
                    aria-hidden="true"
                    className="hidden sm:flex absolute left-0 top-6 w-12 h-12 rounded-full bg-[#120E0E] border border-[#E8A598]/45 items-center justify-center font-serif text-lg font-semibold text-[#E8A598] tabular-nums"
                  >
                    {step.number}
                  </span>

                  <div className="luxury-glass luxury-card-hover rounded-2xl p-6 sm:p-8 space-y-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="sm:hidden font-serif text-2xl font-semibold text-[#E8A598] tabular-nums">
                            {step.number}.
                          </span>
                          <span className="text-xs font-medium text-[#E8A598]">
                            Step {step.number}
                          </span>
                        </div>
                        <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#F5EBE6]">
                          {step.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#C9B8B0]">{step.subtitle}</p>
                      </div>

                      <div className="w-10 h-10 rounded-full bg-[#120E0E] border border-[rgba(232,165,152,0.22)] flex items-center justify-center text-[#E8A598] shrink-0">
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </div>
                    </div>

                    <p className="text-sm sm:text-base text-[#C9B8B0] leading-relaxed">
                      {step.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-4 border-t border-[rgba(232,165,152,0.12)] text-xs sm:text-sm">
                      <div className="p-4 rounded-xl bg-[#140F0F] border border-[rgba(232,165,152,0.12)]">
                        <span className="text-[#E8A598] font-semibold block mb-1">
                          What you do
                        </span>
                        <span className="text-[#F5EBE6] leading-relaxed">{step.youDo}</span>
                      </div>
                      <div className="p-4 rounded-xl bg-[#140F0F] border border-[rgba(232,165,152,0.12)]">
                        <span className="text-[#E8A598] font-semibold block mb-1">
                          Behind the scenes
                        </span>
                        <span className="text-[#C9B8B0] leading-relaxed">
                          {step.behindTheScenes}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* 2. Photo Capture & Quality Guidelines */}
      <section className="py-16 lg:py-24 bg-[#120E0E] border-t border-[rgba(232,165,152,0.16)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <div className="max-w-2xl mb-10 lg:mb-12 space-y-3">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#E8A598]">
              Quality Diagnostics
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#F5EBE6] leading-tight">
              Photo capture tips for clear landmark mapping
            </h2>
            <p className="text-sm sm:text-base text-[#C9B8B0] leading-relaxed">
              Even diffuse light and straight-on framing let our geometric checks read
              proportions cleanly without triggering low-confidence warnings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="luxury-glass rounded-2xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-[#E8A598]/15 border border-[#E8A598]/40 flex items-center justify-center text-[#E8A598]">
                  <Check className="w-4 h-4" aria-hidden="true" />
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#F5EBE6]">
                  Recommended Framing
                </h3>
              </div>

              <ul className="space-y-3 text-sm text-[#F5EBE6]">
                {PHOTO_TIPS_DO.map((tip) => (
                  <li key={tip} className="flex items-start gap-3">
                    <Check
                      className="w-4 h-4 text-[#E8A598] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="luxury-glass rounded-2xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-[#120E0E] border border-[rgba(232,165,152,0.24)] flex items-center justify-center text-[#C9B8B0]">
                  <X className="w-4 h-4" aria-hidden="true" />
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#F5EBE6]">
                  Avoid for Best Accuracy
                </h3>
              </div>

              <ul className="space-y-3 text-sm text-[#C9B8B0]">
                {PHOTO_TIPS_AVOID.map((tip) => (
                  <li key={tip} className="flex items-start gap-3">
                    <X
                      className="w-4 h-4 text-[#C9B8B0] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. System Pipeline Strip */}
      <section className="py-16 lg:py-24 bg-[#1A1414] border-t border-[rgba(232,165,152,0.16)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#E8A598]">
                System Architecture
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#F5EBE6] leading-tight">
                Stateless biometric inference pipeline
              </h2>
            </div>

            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#120E0E] border border-[rgba(232,165,152,0.28)] text-[#E8A598] self-start md:self-auto">
              FastAPI REST contract · In-memory processing
            </span>
          </div>

          <div
            role="list"
            aria-label="Analysis pipeline"
            className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5 lg:gap-2"
          >
            {PLANNED_ARCHITECTURE_NODES.map((node, idx) => (
              <div
                key={node.label}
                role="listitem"
                className="flex flex-col lg:flex-row items-center gap-2.5 lg:gap-2 flex-1 min-w-0"
              >
                <div className="w-full h-full luxury-glass rounded-xl p-4 text-left flex flex-col justify-between gap-1.5">
                  <span className="text-[11px] font-medium text-[#E8A598] tabular-nums">
                    {node.step}
                  </span>
                  <span className="font-serif text-lg font-semibold text-[#F5EBE6] leading-snug">
                    {node.label}
                  </span>
                  <span className="text-xs text-[#C9B8B0]">{node.detail}</span>
                </div>

                {idx < PLANNED_ARCHITECTURE_NODES.length - 1 && (
                  <div
                    className="flex items-center justify-center text-[#E8A598]/70 shrink-0"
                    aria-hidden="true"
                  >
                    <ArrowRight className="hidden lg:block w-4 h-4" />
                    <ArrowDown className="lg:hidden w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="text-xs sm:text-sm text-[#C9B8B0] max-w-3xl leading-relaxed">
            Images are validated for framing and exposure, mapped to geometric landmarks,
            converted into normalized length and width ratios, evaluated alongside your
            onboarding preferences, and discarded from session memory once your explainable
            report is generated.
          </p>
        </div>
      </section>

      {/* 4. Handling Uncertainty */}
      <section className="py-16 lg:py-24 bg-[#120E0E] border-t border-[rgba(232,165,152,0.16)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-10">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#E8A598]">
              Built for Honesty
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#F5EBE6] leading-tight">
              How ALLURE handles uncertainty
            </h2>
            <p className="text-sm sm:text-base text-[#C9B8B0] leading-relaxed">
              Real-world lighting and natural feature overlap vary from portrait to portrait.
              Instead of forcing a brittle label, ALLURE surfaces confidence transparently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="luxury-glass luxury-card-hover rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#120E0E] border border-[rgba(232,165,152,0.2)] flex items-center justify-center text-[#E8A598]">
                <AlertTriangle className="w-4 h-4" aria-hidden="true" />
              </div>
              <h3 className="font-serif text-2xl font-semibold text-[#F5EBE6]">
                Uncertain instead of guessing
              </h3>
              <p className="text-sm text-[#C9B8B0] leading-relaxed">
                When shadows, lens tilt, or hair occlusion reduce landmark clarity, ALLURE
                returns a clear re-capture prompt rather than outputting an unreliable guess.
              </p>
            </div>

            <div className="luxury-glass luxury-card-hover rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#120E0E] border border-[rgba(232,165,152,0.2)] flex items-center justify-center text-[#E8A598]">
                <Layers className="w-4 h-4" aria-hidden="true" />
              </div>
              <h3 className="font-serif text-2xl font-semibold text-[#F5EBE6]">
                Primary &amp; secondary tendencies
              </h3>
              <p className="text-sm text-[#C9B8B0] leading-relaxed">
                When proportions blend two face shapes, ALLURE reports both your primary
                contour and secondary tendency so cuts and eyewear stay well balanced.
              </p>
            </div>

            <div className="luxury-glass luxury-card-hover rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#120E0E] border border-[rgba(232,165,152,0.2)] flex items-center justify-center text-[#E8A598]">
                <Edit3 className="w-4 h-4" aria-hidden="true" />
              </div>
              <h3 className="font-serif text-2xl font-semibold text-[#F5EBE6]">
                Confirm or refine anytime
              </h3>
              <p className="text-sm text-[#C9B8B0] leading-relaxed">
                Every detected face shape, secondary tendency, hair texture, or cosmetic
                skin observation can be updated in one click—recalculating your plan
                instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Frequently Asked Questions */}
      <section className="py-16 lg:py-24 bg-[#1A1414] border-t border-[rgba(232,165,152,0.16)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-4 space-y-3">
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#E8A598]">
                Common Questions
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#F5EBE6] leading-tight">
                Frequently asked questions
              </h2>
              <p className="text-sm text-[#C9B8B0] leading-relaxed">
                Direct answers about portrait privacy, accuracy checks, and personalized
                grooming routines.
              </p>
            </div>

            <div className="lg:col-span-8 space-y-3">
              {HOW_IT_WORKS_FAQ.map((item) => (
                <details
                  key={item.question}
                  className="group luxury-glass open:border-[rgba(232,165,152,0.38)] rounded-2xl transition-colors duration-150"
                >
                  <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer px-6 py-5 flex items-center justify-between gap-4 text-left text-base sm:text-lg font-medium text-[#F5EBE6] hover:text-[#E8A598] transition-colors duration-150 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A598]">
                    <span>{item.question}</span>
                    <ChevronDown
                      className="w-4 h-4 text-[#E8A598] shrink-0 group-open:rotate-180 transition-transform duration-150"
                      aria-hidden="true"
                    />
                  </summary>
                  <div className="px-6 pb-5 pt-1 border-t border-[rgba(232,165,152,0.12)] text-sm sm:text-base text-[#C9B8B0] leading-relaxed">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Closing CTA */}
      <section className="py-16 lg:py-24 bg-[#120E0E] border-t border-[rgba(232,165,152,0.16)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="luxury-glass rounded-2xl p-8 sm:p-12 text-left flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#E8A598]">
                Guided Experience
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#F5EBE6] leading-tight">
                Experience the workflow firsthand
              </h2>
              <p className="text-sm sm:text-base text-[#C9B8B0] leading-relaxed">
                Begin with your preferences, upload a portrait or try a studio sample, and
                review your full grooming plan in under two minutes.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link to="/onboarding">
                <Button variant="primary" size="lg">
                  <span>Start Your Analysis</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Button>
              </Link>
              <Link to="/features">
                <Button variant="outline" size="lg">
                  Explore Features
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
