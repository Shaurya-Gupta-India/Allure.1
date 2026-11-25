import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Database,
  Eye,
  GraduationCap,
  HeartHandshake,
  KeyRound,
  Lock,
  MessageSquareText,
  Server,
  ShieldCheck,
} from 'lucide-react';
import PageShell from '../components/Layout';
import { Button, StatusChip } from '../components/ui';
import {
  ABOUT_DEMO_TECH,
  ABOUT_LIMITATIONS,
  ABOUT_PLANNED_TECH,
  ABOUT_ROADMAP_ITEMS,
} from '../data';
import { RoadmapStatus, StatusChipTone } from '../types';

const PHILOSOPHY_PRINCIPLES = [
  {
    icon: HeartHandshake,
    title: 'Inclusive by design',
    description:
      'Built equally for men and women using one unified Dark Luxury interface and shared appearance models—never segregated portals or gender-stereotyped presets.',
  },
  {
    icon: Eye,
    title: 'Honest about limits',
    description:
      'Unclear portraits return an honest uncertain state rather than forcing a guess, every estimate is editable, and all advice stays strictly cosmetic and practical.',
  },
  {
    icon: Lock,
    title: 'Privacy first',
    description:
      'Requires explicit consent before upload, keeps portraits strictly in temporary session memory without training reuse, and never infers identity or protected attributes.',
  },
  {
    icon: MessageSquareText,
    title: 'Explainable guidance',
    description:
      'Every hairstyle, eyewear contour, and routine step explains in plain language how it connects to your confirmed features, daily time, and monthly budget.',
  },
];

const SECURITY_PILLARS = [
  {
    icon: KeyRound,
    title: 'Supabase JWT Authentication',
    badge: 'Token-Scoped Sessions',
    description:
      'Designed around short-lived, cryptographically verified Supabase JSON Web Tokens (JWTs) so every authenticated profile action and API request is strictly bound to the active user identity.',
  },
  {
    icon: Database,
    title: 'Row Level Security (RLS)',
    badge: 'Per-User Isolation',
    description:
      'Database tables enforce PostgreSQL Row Level Security policies tied directly to auth.uid(), guaranteeing that saved preferences and historical grooming reports are readable and editable solely by their owner.',
  },
  {
    icon: Server,
    title: 'Private Storage & Memory Processing',
    badge: 'Zero Public Exposure',
    description:
      'Portraits uploaded during analysis remain in temporary in-memory buffers during inference and are never exposed in public storage buckets, shared with third parties, or repurposed for external AI training.',
  },
];

const ROADMAP_TONE: Record<RoadmapStatus, StatusChipTone> = {
  Done: 'demo',
  'In progress': 'progress',
  Planned: 'planned',
  'Only if suitable data exists': 'conditional',
  Later: 'later',
};

function RoadmapChip({ status }: { status: RoadmapStatus }) {
  return <StatusChip label={status} tone={ROADMAP_TONE[status]} />;
}

export default function AboutPage() {
  return (
    <PageShell noPadding>
      {/* Page Header */}
      <section className="py-16 lg:py-24 bg-[#120E0E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-5 animate-fade-up">
          <p className="text-xs font-medium tracking-[0.22em] uppercase text-[#E8A598]">
            About ALLURE
          </p>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#F5EBE6] leading-[1.06] max-w-3xl">
            Look Better.{' '}
            <span className="italic font-normal text-[#E8A598]">Feel Confident.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#C9B8B0] max-w-2xl leading-relaxed">
            An inclusive personal appearance and grooming intelligence platform built equally
            for men and women—grounded in ethical AI, transparent proportions, and real
            everyday routines.
          </p>
        </div>
      </section>

      {/* 1. Our Philosophy */}
      <section className="py-16 lg:py-24 bg-[#1A1414] border-t border-[rgba(232,165,152,0.16)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-5 space-y-3">
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#E8A598]">
                Our Philosophy
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#F5EBE6] leading-tight">
                Appearance intelligence without rigid ideals or medical claims
              </h2>
            </div>

            <div className="lg:col-span-7 luxury-glass rounded-2xl p-6 sm:p-8 space-y-4 text-sm sm:text-base text-[#C9B8B0] leading-relaxed">
              <p className="text-[#F5EBE6]">
                &ldquo;Look Better. Feel Confident.&rdquo; means working harmoniously with
                your natural facial geometry, strand texture, and personal schedule—never
                chasing unrealistic beauty standards or attractiveness scores.
              </p>
              <p>
                ALLURE serves male and female users equally through one unified experience.
                By pairing plain-language proportion cues with your actual morning routine
                window and monthly budget, we turn grooming into a calm, confident habit
                rather than guesswork.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {PHILOSOPHY_PRINCIPLES.map((principle) => {
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
        </div>
      </section>

      {/* 2. Privacy & Data Security */}
      <section className="py-16 lg:py-24 bg-[#120E0E] border-t border-[rgba(232,165,152,0.16)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#E8A598]">
                Privacy &amp; Data Security
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#F5EBE6] leading-tight">
                Engineered around strict isolation &amp; minimal retention
              </h2>
              <p className="text-sm sm:text-base text-[#C9B8B0] leading-relaxed">
                Personal appearance tools handle sensitive imagery. ALLURE&apos;s security
                model combines temporary in-memory inference with hardened cloud-ready
                authentication and storage controls.
              </p>
            </div>

            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#1A1414] border border-[rgba(232,165,152,0.28)] text-[#E8A598] self-start md:self-auto">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Zero third-party portrait sharing</span>
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {SECURITY_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="luxury-glass luxury-card-hover rounded-2xl p-6 sm:p-7 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#120E0E] border border-[rgba(232,165,152,0.22)] flex items-center justify-center text-[#E8A598] shrink-0">
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#120E0E] border border-[rgba(232,165,152,0.2)] text-[#E8A598]">
                        {pillar.badge}
                      </span>
                    </div>

                    <h3 className="font-serif text-2xl font-semibold text-[#F5EBE6]">
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-[#C9B8B0] leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. The Team & Research Standards */}
      <section className="py-16 lg:py-24 bg-[#1A1414] border-t border-[rgba(232,165,152,0.16)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            <div className="lg:col-span-7 space-y-4">
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#E8A598]">
                The Team &amp; Research Standards
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#F5EBE6] leading-tight">
                Robust machine learning pipelines meets user-first craft
              </h2>
              <p className="text-sm sm:text-base text-[#C9B8B0] leading-relaxed">
                ALLURE is built as an advanced AI-assisted personal grooming platform
                combining interpretable computer vision pipelines with calm, accessible web
                design. Every architectural decision—from decoupled hair length vs. texture
                modeling to low-confidence re-capture states—follows transparent research
                standards rather than opaque black-box scoring.
              </p>
            </div>

            <div className="lg:col-span-5 luxury-glass rounded-2xl p-6 sm:p-7 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#120E0E] border border-[rgba(232,165,152,0.2)] flex items-center justify-center text-[#E8A598] shrink-0">
                  <GraduationCap className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-semibold text-[#F5EBE6]">
                    Engineering &amp; Research
                  </h3>
                  <p className="text-xs text-[#C9B8B0]">Applied CV &amp; Design Systems</p>
                </div>
              </div>
              <p className="text-sm text-[#C9B8B0] leading-relaxed pt-3 border-t border-[rgba(232,165,152,0.12)]">
                Built around ethical AI guardrails: zero attractiveness scoring, zero
                demographic inference, explainable recommendation rationales, and complete
                user editability across every detected trait.
              </p>
            </div>
          </div>

          {/* Technology Stack Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="luxury-glass rounded-2xl p-6 sm:p-7 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-serif text-2xl font-semibold text-[#F5EBE6]">
                  Frontend Application Stack
                </h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#E8A598]/15 border border-[#E8A598]/40 text-[#E8A598]">
                  Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#C9B8B0] leading-relaxed">
                Modular React &amp; TypeScript interface with a typed REST client service
                layer structured for direct FastAPI integration.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {ABOUT_DEMO_TECH.map((tech) => (
                  <span
                    key={tech}
                    className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-[#140F0F] border border-[rgba(232,165,152,0.18)] text-[#F5EBE6]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="luxury-glass rounded-2xl p-6 sm:p-7 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-serif text-2xl font-semibold text-[#F5EBE6]">
                  Backend, Security &amp; Vision Stack
                </h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#120E0E] border border-[rgba(232,165,152,0.24)] text-[#C9B8B0]">
                  Service Architecture
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#C9B8B0] leading-relaxed">
                Stateless image inference paired with Supabase JWT authentication, RLS
                database policies, and private storage controls.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {[...ABOUT_PLANNED_TECH, 'Supabase JWT & RLS'].map((tech) => (
                  <span
                    key={tech}
                    className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-[#140F0F] border border-[rgba(232,165,152,0.16)] text-[#C9B8B0]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Roadmap */}
      <section className="py-16 lg:py-24 bg-[#120E0E] border-t border-[rgba(232,165,152,0.16)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-8">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#E8A598]">
              Roadmap
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#F5EBE6] leading-tight">
              Platform milestones
            </h2>
            <p className="text-sm sm:text-base text-[#C9B8B0] leading-relaxed">
              A transparent overview of completed platform modules and ongoing research
              tracks.
            </p>
          </div>

          <div className="luxury-glass rounded-2xl overflow-hidden">
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3.5 bg-[#140F0F] border-b border-[rgba(232,165,152,0.12)] text-xs font-semibold uppercase tracking-wider text-[#C9B8B0]">
              <div className="md:col-span-3">Milestone</div>
              <div className="md:col-span-6">Scope</div>
              <div className="md:col-span-3 text-right">Status</div>
            </div>

            <ul className="divide-y divide-[rgba(232,165,152,0.12)]">
              {ABOUT_ROADMAP_ITEMS.map((item) => (
                <li
                  key={item.milestone}
                  className="px-6 py-5 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-start md:items-center"
                >
                  <div className="md:col-span-3 font-serif text-xl font-semibold text-[#F5EBE6]">
                    {item.milestone}
                  </div>
                  <div className="md:col-span-6 text-xs sm:text-sm text-[#C9B8B0] leading-relaxed">
                    {item.summary}
                  </div>
                  <div className="md:col-span-3 md:text-right pt-1 md:pt-0">
                    <RoadmapChip status={item.status} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 5. Limitations, Cosmetic Disclaimer & Closing CTA */}
      <section className="py-16 lg:py-24 bg-[#1A1414] border-t border-[rgba(232,165,152,0.16)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-3">
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#E8A598]">
                Transparency
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#F5EBE6] leading-tight">
                Honest limitations
              </h2>
              <p className="text-sm text-[#C9B8B0] leading-relaxed">
                Grooming tools serve you best when assumptions and boundaries are stated
                clearly.
              </p>
            </div>

            <div className="lg:col-span-7 luxury-glass rounded-2xl p-6 sm:p-8">
              <ul className="space-y-4">
                {ABOUT_LIMITATIONS.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-3 text-sm sm:text-base text-[#F5EBE6] leading-relaxed"
                  >
                    <AlertCircle
                      className="w-4 h-4 text-[#E8A598] shrink-0 mt-1"
                      aria-hidden="true"
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-[#120E0E] border border-[rgba(232,165,152,0.16)] rounded-2xl p-6 sm:p-7 space-y-2">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#E8A598]">
              Cosmetic Guidance Disclaimer
            </h3>
            <p className="text-xs sm:text-sm text-[#C9B8B0] leading-relaxed">
              ALLURE provides cosmetic styling and everyday personal grooming guidance only.
              It never offers medical diagnosis or clinical advice and does not replace a
              licensed dermatologist, physician, or professional stylist.
            </p>
          </div>

          <div className="luxury-glass rounded-2xl p-8 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#E8A598]">
                Ready to Begin?
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#F5EBE6] leading-tight">
                Start your personalized grooming profile
              </h2>
              <p className="text-sm sm:text-base text-[#C9B8B0] leading-relaxed">
                Choose Face only, Hair only, or Face + Hair using your own session-only
                portrait or a built-in studio sample portrait.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link to="/onboarding">
                <Button variant="primary" size="lg">
                  <span>Start Your Analysis</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button variant="outline" size="lg">
                  How It Works
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
