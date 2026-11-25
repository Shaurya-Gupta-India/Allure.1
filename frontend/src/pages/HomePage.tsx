import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CalendarCheck,
  Check,
  ChevronDown,
  Compass,
  Droplets,
  Eye,
  HeartHandshake,
  Lock,
  MessageSquareText,
  Minus,
  ScanFace,
  ShoppingBag,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import PageShell from '../components/Layout';
import { Button } from '../components/ui';
import {
  ABOUT_LIMITATIONS,
  ASSETS,
  FEATURE_NOT_DONE_LIST,
  HOME_HOW_IT_WORKS_STEPS,
  HOME_SAMPLE_RESULT_BULLETS,
  HOW_IT_WORKS_FAQ,
  PHOTO_TIPS_AVOID,
  PHOTO_TIPS_DO,
} from '../data';

const FEATURE_STRIP = [
  { icon: ScanFace, label: 'AI Analysis' },
  { icon: SlidersHorizontal, label: 'Personalized Plan' },
  { icon: ShoppingBag, label: 'Product Recommendations' },
  { icon: Compass, label: 'Expert Guidance' },
  { icon: CalendarCheck, label: 'Track Progress' },
];

const ABOUT_PRINCIPLES = [
  {
    icon: HeartHandshake,
    title: 'Inclusive by design',
    description:
      'Built equally for men and women using one unified interface and shared appearance models—never segregated portals or stereotyped presets.',
  },
  {
    icon: Eye,
    title: 'Honest about limits',
    description:
      'Unclear portraits return an honest uncertain state rather than forcing a guess, every estimate is editable, and guidance stays cosmetic and practical.',
  },
  {
    icon: Lock,
    title: 'Privacy first',
    description:
      'Requires explicit consent before upload, keeps photos strictly in temporary session memory without storage or training, and never infers identity.',
  },
  {
    icon: MessageSquareText,
    title: 'Explainable suggestions',
    description:
      'Every hairstyle, eyewear note, and routine step explains in plain language how it connects to your confirmed features, daily time, and budget.',
  },
];

function FaceShapeDiagram() {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M28 7C19.5 7 14 13.8 14 24.2C14 35.6 19.6 46.8 28 49C36.4 46.8 42 35.6 42 24.2C42 13.8 36.5 7 28 7Z"
        stroke="#E8A598"
        strokeWidth="1.4"
      />
      <line
        x1="12"
        y1="17"
        x2="44"
        y2="17"
        stroke="#C9B8B0"
        strokeWidth="1.2"
        strokeDasharray="2 2.5"
      />
      <line
        x1="9"
        y1="27"
        x2="47"
        y2="27"
        stroke="#E8A598"
        strokeWidth="1.2"
        strokeDasharray="2 2.5"
      />
      <line
        x1="14"
        y1="38"
        x2="42"
        y2="38"
        stroke="#C9B8B0"
        strokeWidth="1.2"
        strokeDasharray="2 2.5"
      />
    </svg>
  );
}

function HairPatternsDiagram() {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <svg width="22" height="44" viewBox="0 0 22 44" fill="none">
        <path d="M11 5V39" stroke="#C9B8B0" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <svg width="24" height="44" viewBox="0 0 24 44" fill="none">
        <path
          d="M12 5C16.5 10.5 7.5 16.5 12 22C16.5 27.5 7.5 33.5 12 39"
          stroke="#E8A598"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
      <svg width="26" height="44" viewBox="0 0 26 44" fill="none">
        <path
          d="M13 5C18 8 18 14 13 16.5C8 19 8 25 13 27.5C18 30 18 36 13 39"
          stroke="#C9B8B0"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
      <svg width="26" height="44" viewBox="0 0 26 44" fill="none">
        <path
          d="M13 5C17.5 5.5 17.5 10 13 10.8C8.5 11.6 8.5 16 13 16.8C17.5 17.6 17.5 22 13 22.8C8.5 23.6 8.5 28 13 28.8C17.5 29.6 17.5 34 13 34.8C9 35.5 9.5 38.5 13 39"
          stroke="#E8A598"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function SkincareVisual() {
  return (
    <div
      className="w-14 h-14 rounded-full bg-[#120E0E] border border-[rgba(232,165,152,0.2)] flex items-center justify-center text-[#E8A598]"
      aria-hidden="true"
    >
      <Droplets className="w-6 h-6" strokeWidth={1.4} />
    </div>
  );
}

const FEATURE_CARDS = [
  {
    id: 'face',
    visual: <FaceShapeDiagram />,
    title: 'Face Shape Analysis',
    eyebrow: 'Shared Geometric Model',
    description:
      'Evaluates forehead, cheekbone, and jawline ratios with secondary contour notes to recommend flattering cuts and frames — equally calibrated for every user.',
  },
  {
    id: 'hair',
    visual: <HairPatternsDiagram />,
    title: 'Hair Analysis',
    eyebrow: 'Texture & Length Mapping',
    description:
      'Distinguishes straight, wavy, curly, and coily patterns alongside current length so your styling plan works with your natural hair rather than against it.',
  },
  {
    id: 'skin',
    visual: <SkincareVisual />,
    title: 'Skincare Insights',
    eyebrow: 'Cosmetic Guidance Only',
    description:
      'Highlights visible surface characteristics like shine or dryness and pairs them with calm, gentle daily routines — never medical diagnoses or clinical claims.',
  },
];

export default function Home() {
  return (
    <PageShell noPadding>
      {/* ============================================================ */}
      {/* 1. INTEGRATED CINEMATIC DUAL-PORTRAIT HERO                   */}
      {/* ============================================================ */}
      <section
        id="hero"
        className="relative bg-[#120E0E] overflow-hidden lg:min-h-[640px] xl:min-h-[700px] flex flex-col lg:flex-row lg:items-center scroll-mt-20"
      >
        {/* Foreground Text Column (~45% width on desktop) */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 sm:pt-16 sm:pb-10 lg:py-24">
          <div className="w-full lg:w-[45%] text-left">
            <p className="text-xs font-medium tracking-[0.22em] uppercase text-[#E8A598] mb-5 animate-fade-up">
              Personal Appearance &amp; Grooming Intelligence
            </p>

            <h1 className="font-serif text-5xl sm:text-6xl lg:text-[66px] xl:text-[72px] font-semibold tracking-tight leading-[1.04] mb-6 animate-fade-up animate-delay-100">
              <span className="block text-[#F5EBE6]">Look Better.</span>
              <span className="block italic font-normal text-[#E8A598]">
                Feel Confident.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#C9B8B0] max-w-lg leading-relaxed mb-9 animate-fade-up animate-delay-200">
              An inclusive AI grooming advisor designed equally for men and women.
              Understand your natural proportions, build an effortless daily routine, and
              discover essentials matched to your time and budget.
            </p>

            <div className="flex flex-wrap items-center gap-4 animate-fade-up animate-delay-300">
              <Link to="/onboarding">
                <Button variant="primary" size="lg">
                  <span>Get Your Analysis</span>
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

        {/* Seamless Full-Bleed Dual Portrait */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[500px] lg:max-h-none lg:aspect-auto lg:absolute lg:inset-y-0 lg:right-0 lg:w-[58%] xl:w-[57%] select-none">
          <img
            src={ASSETS.heroDualPortrait}
            alt="A man and a woman in dark knit tops against a dark studio background"
            loading="eager"
            fetchPriority="high"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-[50%_18%] pointer-events-none"
          />

          <div
            className="hero-rose-ambient absolute inset-0 pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="hero-fade-left-desktop hidden lg:block absolute inset-0 pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="hero-fade-top absolute inset-x-0 top-0 h-20 lg:h-24 pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="hero-fade-bottom absolute inset-x-0 bottom-0 h-24 lg:h-32 pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="hero-fade-right absolute inset-y-0 right-0 w-16 lg:w-28 pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="hero-fade-left-mobile lg:hidden absolute inset-y-0 left-0 w-12 pointer-events-none"
            aria-hidden="true"
          />
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. HERO DIVIDER, SCROLL CUE & 5-ITEM FEATURE STRIP           */}
      {/* ============================================================ */}
      <section
        aria-label="Core capabilities"
        className="bg-[#120E0E] border-t border-[rgba(232,165,152,0.16)]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 lg:pt-8 lg:pb-10">
          <div className="flex flex-col items-center justify-center gap-1 mb-6 text-[#C9B8B0]/80 select-none">
            <span className="text-[11px] font-medium tracking-[0.2em] uppercase">
              Scroll
            </span>
            <ChevronDown className="w-4 h-4 text-[#E8A598]" aria-hidden="true" />
          </div>

          <div className="luxury-glass rounded-2xl lg:rounded-full px-5 py-4 animate-fade-up">
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 lg:gap-2 items-center">
              {FEATURE_STRIP.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className={`flex items-center justify-start lg:justify-center gap-2.5 min-w-0 ${
                      idx > 0
                        ? 'lg:border-l lg:border-[rgba(232,165,152,0.14)] lg:pl-4'
                        : ''
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#E8A598] shrink-0" aria-hidden="true" />
                    <span className="text-xs sm:text-sm font-medium text-[#F5EBE6] truncate">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. HOW IT WORKS (4-STEP FLOW + PHOTO TIPS + FAQ)             */}
      {/* ============================================================ */}
      <section
        id="how-it-works"
        className="py-16 lg:py-24 bg-[#120E0E] scroll-mt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl text-left">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#E8A598] mb-3">
              How It Works
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-[#F5EBE6] leading-tight">
              Four calm steps from portrait to personalized routine
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOME_HOW_IT_WORKS_STEPS.map((step) => (
              <div
                key={step.number}
                className="luxury-glass luxury-card-hover rounded-2xl p-6 text-left flex flex-col justify-between"
              >
                <div>
                  <span className="font-serif text-3xl font-semibold text-[#E8A598] block mb-4 tabular-nums">
                    {step.number}.
                  </span>
                  <h3 className="font-serif text-2xl font-semibold text-[#F5EBE6] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#C9B8B0] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Photo Framing Tips (Do / Avoid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="luxury-glass rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-[#E8A598]/15 border border-[#E8A598]/40 flex items-center justify-center text-[#E8A598]">
                  <Check className="w-4 h-4" aria-hidden="true" />
                </span>
                <h3 className="font-serif text-2xl font-semibold text-[#F5EBE6]">
                  Best Portrait Tips
                </h3>
              </div>
              <ul className="space-y-2.5 text-sm text-[#F5EBE6]">
                {PHOTO_TIPS_DO.map((tip) => (
                  <li key={tip} className="flex items-start gap-2.5">
                    <Check
                      className="w-4 h-4 text-[#E8A598] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="luxury-glass rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-[#120E0E] border border-[rgba(232,165,152,0.24)] flex items-center justify-center text-[#C9B8B0]">
                  <X className="w-4 h-4" aria-hidden="true" />
                </span>
                <h3 className="font-serif text-2xl font-semibold text-[#F5EBE6]">
                  What to Avoid
                </h3>
              </div>
              <ul className="space-y-2.5 text-sm text-[#C9B8B0]">
                {PHOTO_TIPS_AVOID.map((tip) => (
                  <li key={tip} className="flex items-start gap-2.5">
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

          {/* Concise FAQ Accordion */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left pt-2">
            <div className="lg:col-span-4 space-y-2">
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#E8A598]">
                Common Questions
              </p>
              <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#F5EBE6] leading-tight">
                Privacy, clarity &amp; accuracy
              </h3>
              <p className="text-sm text-[#C9B8B0] leading-relaxed">
                Straightforward answers on how ALLURE processes portraits and builds your
                grooming plan.
              </p>
            </div>

            <div className="lg:col-span-8 space-y-3">
              {HOW_IT_WORKS_FAQ.map((item) => (
                <details
                  key={item.question}
                  className="group luxury-glass open:border-[rgba(232,165,152,0.38)] rounded-2xl transition-colors duration-150"
                >
                  <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer px-5 py-4 flex items-center justify-between gap-4 text-left text-sm sm:text-base font-medium text-[#F5EBE6] hover:text-[#E8A598] transition-colors duration-150 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A598]">
                    <span>{item.question}</span>
                    <ChevronDown
                      className="w-4 h-4 text-[#E8A598] shrink-0 group-open:rotate-180 transition-transform duration-150"
                      aria-hidden="true"
                    />
                  </summary>
                  <div className="px-5 pb-4 pt-1 border-t border-[rgba(232,165,152,0.12)] text-xs sm:text-sm text-[#C9B8B0] leading-relaxed">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>

          <div className="text-left">
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#E8A598] hover:text-[#F5EBE6] underline underline-offset-4 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A598] rounded"
            >
              <span>See the full technical workflow</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. ANALYSIS PREVIEW ("WHAT YOU'LL GET")                      */}
      {/* ============================================================ */}
      <section
        id="sample-result"
        className="py-16 lg:py-24 bg-[#1A1414] border-t border-[rgba(232,165,152,0.16)] scroll-mt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10 lg:mb-12 text-left">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#E8A598] mb-3">
              What You&apos;ll Get
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-[#F5EBE6] leading-tight">
              A clear picture, in plain language
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 luxury-glass rounded-2xl p-6 sm:p-8 text-left space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs text-[#C9B8B0] block mb-1">
                    Personal Profile Overview
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#F5EBE6]">
                    Appearance &amp; Routine Summary
                  </h3>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-[#E8A598] bg-[#120E0E] border border-[rgba(232,165,152,0.24)] whitespace-nowrap shrink-0">
                  Example Profile
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[rgba(232,165,152,0.12)]">
                <div className="p-4 rounded-xl bg-[#1A1414] border border-[rgba(232,165,152,0.14)]">
                  <span className="text-xs text-[#C9B8B0] block mb-1">Face shape</span>
                  <span className="text-sm sm:text-base font-semibold text-[#F5EBE6]">
                    Oval, with some Diamond tendencies
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#1A1414] border border-[rgba(232,165,152,0.14)]">
                  <span className="text-xs text-[#C9B8B0] block mb-1">Hair texture</span>
                  <span className="text-sm sm:text-base font-semibold text-[#F5EBE6]">
                    Wavy
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#1A1414] border border-[rgba(232,165,152,0.14)] space-y-2">
                <span className="text-xs font-medium text-[#E8A598] block">
                  Morning routine
                </span>
                <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-[#F5EBE6]">
                  <li>1. Gentle cleanse</li>
                  <li>2. Light moisturizer with SPF</li>
                </ol>
              </div>

              <div className="pt-4 border-t border-[rgba(232,165,152,0.12)] space-y-1">
                <span className="text-xs font-medium text-[#E8A598] block">
                  Why this fits you
                </span>
                <p className="text-sm text-[#C9B8B0] leading-relaxed">
                  Based on a balanced face outline, defined cheekbones, and wavy hair,
                  these recommendations require minimal daily styling time.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5 text-left space-y-8">
              <ul className="space-y-4">
                {HOME_SAMPLE_RESULT_BULLETS.map((point) => (
                  <li key={point} className="flex items-start gap-3.5">
                    <span
                      className="w-5 h-5 mt-0.5 rounded-full bg-[#221A1A] border border-[rgba(232,165,152,0.3)] flex items-center justify-center text-[#E8A598] shrink-0"
                      aria-hidden="true"
                    >
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </span>
                    <span className="text-sm sm:text-base text-[#F5EBE6] leading-relaxed">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>

              <div>
                <Link to="/onboarding">
                  <Button variant="primary" size="lg">
                    <span>Try it yourself</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. CORE INTELLIGENCE & FEATURES + SILK ROSE CTA BANNER       */}
      {/* ============================================================ */}
      <section
        id="features"
        className="py-16 lg:py-24 bg-[#120E0E] border-t border-[rgba(232,165,152,0.16)] scroll-mt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl text-left">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#E8A598] mb-3">
              Features &amp; Core Intelligence
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-[#F5EBE6] leading-tight">
              Thoughtful insights built for everyday grooming
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURE_CARDS.map((card) => (
              <div
                key={card.id}
                className="luxury-glass luxury-card-hover rounded-2xl p-7 text-left flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-6 min-h-[56px]">
                    {card.visual}
                    <span className="text-xs text-[#C9B8B0] text-right">
                      {card.eyebrow}
                    </span>
                  </div>
                  <h3 className="font-serif text-3xl font-semibold text-[#F5EBE6] mb-3">
                    {card.title}
                  </h3>
                  <p className="text-sm text-[#C9B8B0] leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}

            {/* Silk-Rose CTA Banner */}
            <div className="silk-rose-surface rounded-2xl p-7 sm:p-9 text-left text-[#120E0E] flex flex-col justify-between border border-[rgba(245,235,230,0.28)]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#120E0E]/75 mb-3">
                  Ready to Begin?
                </p>
                <h3 className="font-serif text-3xl sm:text-4xl font-semibold leading-tight mb-4 text-[#120E0E]">
                  Take the first step towards your best self.
                </h3>
                <p className="text-sm text-[#120E0E]/80 leading-relaxed max-w-md mb-8">
                  Share your grooming goals and routine window, upload a clear portrait,
                  and unlock tailored hairstyles, eyewear geometry, and skincare plans.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link to="/onboarding">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#120E0E] hover:bg-[#221A1A] text-[#F5EBE6] text-sm font-semibold transition-colors duration-150 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#120E0E]"
                  >
                    <span>Start Guided Analysis</span>
                    <ArrowRight className="w-4 h-4 text-[#E8A598]" aria-hidden="true" />
                  </button>
                </Link>
                <Link
                  to="/products"
                  className="text-sm font-semibold text-[#120E0E] underline underline-offset-4 hover:text-[#120E0E]/75 transition-colors duration-150 px-2 py-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#120E0E]"
                >
                  Explore Product Catalog
                </Link>
              </div>
            </div>
          </div>

          {/* Clear Ethical Boundaries */}
          <div className="luxury-glass rounded-2xl p-6 sm:p-8 text-left">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-4 space-y-2">
                <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#E8A598]">
                  Clear Boundaries
                </p>
                <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#F5EBE6]">
                  What ALLURE does not do
                </h3>
                <p className="text-sm text-[#C9B8B0] leading-relaxed">
                  Knowing where an advisor stops is just as important as knowing where it
                  helps.
                </p>
              </div>
              <ul className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm text-[#F5EBE6]">
                {FEATURE_NOT_DONE_LIST.map((item) => (
                  <li
                    key={item}
                    className="p-3.5 rounded-xl bg-[#1A1414] border border-[rgba(232,165,152,0.14)] flex items-start gap-2.5"
                  >
                    <Minus
                      className="w-4 h-4 text-[#E8A598] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-left">
            <Link
              to="/features"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#E8A598] hover:text-[#F5EBE6] underline underline-offset-4 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A598] rounded"
            >
              <span>Explore all features in detail</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. ABOUT ALLURE (PRINCIPLES, PHILOSOPHY & TRANSPARENCY)      */}
      {/* ============================================================ */}
      <section
        id="about"
        className="py-16 lg:py-24 bg-[#1A1414] border-t border-[rgba(232,165,152,0.16)] scroll-mt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-left">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            <div className="lg:col-span-5">
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#E8A598] mb-3">
                About ALLURE
              </p>
              <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-[#F5EBE6] leading-tight">
                One unified advisor built around real individuality
              </h2>
            </div>

            <div className="lg:col-span-7 luxury-glass rounded-2xl p-6 sm:p-8 space-y-3 text-sm sm:text-base text-[#C9B8B0] leading-relaxed">
              <p className="text-[#F5EBE6]">
                ALLURE is a personal appearance and grooming advisor designed equally for
                men and women. It helps you understand your natural features and build a
                calm, realistic routine that fits your time and budget.
              </p>
              <p>
                Facial geometry and hair texture models evaluate every individual neutrally
                within one unified Dark Luxury experience—never segregated portals or rigid
                beauty ideals.
              </p>
            </div>
          </div>

          {/* 4 Core Principles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ABOUT_PRINCIPLES.map((principle) => {
              const Icon = principle.icon;
              return (
                <div
                  key={principle.title}
                  className="luxury-glass luxury-card-hover rounded-2xl p-6 space-y-3"
                >
                  <div className="w-10 h-10 rounded-full bg-[#120E0E] border border-[rgba(232,165,152,0.2)] flex items-center justify-center text-[#E8A598]">
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <h3 className="font-serif text-2xl font-semibold text-[#F5EBE6]">
                    {principle.title}
                  </h3>
                  <p className="text-sm text-[#C9B8B0] leading-relaxed">
                    {principle.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Limitations & Cosmetic Disclaimer */}
          <div className="bg-[#120E0E] border border-[rgba(232,165,152,0.16)] rounded-2xl p-6 sm:p-7 space-y-4">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#E8A598]">
              Transparency &amp; Cosmetic Disclaimer
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm text-[#C9B8B0]">
              {ABOUT_LIMITATIONS.map((point) => (
                <li key={point} className="flex items-start gap-2.5 leading-relaxed">
                  <AlertCircle
                    className="w-4 h-4 text-[#E8A598] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-left">
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#E8A598] hover:text-[#F5EBE6] underline underline-offset-4 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A598] rounded"
            >
              <span>Read more about our philosophy &amp; security</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
