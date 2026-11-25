import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Button, Modal } from './ui';

const PRIMARY_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Features', to: '/features' },
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'About', to: '/about' },
  { label: 'Products', to: '/products' },
];

const QUICK_FLOW_ROUTES = [
  { label: 'Preferences', to: '/onboarding' },
  { label: 'Photo Analysis', to: '/analysis' },
  { label: 'Results', to: '/results' },
  { label: 'Recommendations', to: '/recommendations' },
  { label: 'History', to: '/history' },
];

const FOOTER_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Features', to: '/features' },
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'About', to: '/about' },
  { label: 'Products', to: '/products' },
  { label: 'History', to: '/history' },
  { label: 'Preferences', to: '/onboarding' },
  { label: 'Photo Analysis', to: '/analysis' },
  { label: 'Analysis Results', to: '/results' },
  { label: 'Recommendations', to: '/recommendations' },
];

const ROUTE_TITLES: Record<string, string> = {
  '/': 'ALLURE — Personal Appearance & Grooming Advisor',
  '/features': 'Features | ALLURE',
  '/how-it-works': 'How It Works | ALLURE',
  '/about': 'About | ALLURE',
  '/analysis': 'Photo Analysis | ALLURE',
  '/onboarding': 'Preferences | ALLURE',
  '/results': 'Analysis Results | ALLURE',
  '/recommendations': 'Recommendations | ALLURE',
  '/products': 'Products | ALLURE',
  '/history': 'History | ALLURE',
};

function AllureStarMark({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="text-[#E8A598] shrink-0"
    >
      <path
        d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8L12 2Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ScrollToTopAndTitle() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (pathname.startsWith('/history/')) {
      document.title = 'Saved Analysis | ALLURE';
    } else {
      document.title = ROUTE_TITLES[pathname] ?? 'Page Not Found | ALLURE';
    }

    if (hash) {
      const targetId = hash.replace(/^#/, '');
      const timer = window.setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 40);
      return () => window.clearTimeout(timer);
    }

    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname, hash]);

  return null;
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.hash]);

  return (
    <header className="sticky top-0 z-50 bg-[rgba(18,14,14,0.88)] backdrop-blur-md border-b border-[rgba(232,165,152,0.16)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-4 lg:gap-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 font-serif text-2xl font-semibold tracking-[0.22em] text-[#F5EBE6] hover:text-[#E8A598] transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A598] rounded"
        >
          <AllureStarMark size={18} />
          <span>ALLURE</span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-4 lg:gap-8 text-sm font-medium"
        >
          {PRIMARY_LINKS.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={`relative py-1 transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A598] rounded ${
                  active ? 'text-[#E8A598]' : 'text-[#C9B8B0] hover:text-[#F5EBE6]'
                }`}
              >
                <span>{item.label}</span>
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 -bottom-1 h-[2px] rounded-full bg-[#E8A598]"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-4 lg:gap-6 shrink-0">
          {(() => {
            const historyActive =
              location.pathname === '/history' || location.pathname.startsWith('/history/');
            return (
              <Link
                to="/history"
                aria-current={historyActive ? 'page' : undefined}
                className={`relative py-1 text-sm font-medium transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A598] rounded ${
                  historyActive
                    ? 'text-[#E8A598]'
                    : 'text-[#C9B8B0] hover:text-[#F5EBE6]'
                }`}
              >
                <span>History</span>
                {historyActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 -bottom-1 h-[2px] rounded-full bg-[#E8A598]"
                  />
                )}
              </Link>
            );
          })()}

          <Link to="/onboarding">
            <Button variant="primary" size="sm" className="px-5 py-2.5">
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Button>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          className="md:hidden w-11 h-11 flex items-center justify-center rounded-lg text-[#F5EBE6] hover:text-[#E8A598] transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A598]"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-[#1A1414] border-t border-[rgba(232,165,152,0.16)] px-6 py-6 space-y-6">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-3">
            {PRIMARY_LINKS.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active ? 'page' : undefined}
                  className={`text-left font-serif text-2xl py-1 transition-colors duration-150 inline-flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A598] rounded ${
                    active
                      ? 'text-[#E8A598] underline underline-offset-8 decoration-[#E8A598]'
                      : 'text-[#F5EBE6] hover:text-[#E8A598]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-[rgba(232,165,152,0.14)]">
            <p className="text-xs text-[#C9B8B0] mb-3">Quick navigation</p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_FLOW_ROUTES.map((route) => {
                const active =
                  location.pathname === route.to ||
                  (route.to === '/history' && location.pathname.startsWith('/history/'));
                return (
                  <Link
                    key={route.to}
                    to={route.to}
                    aria-current={active ? 'page' : undefined}
                    className={`px-3 py-2.5 rounded-lg text-xs font-medium border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A598] ${
                      active
                        ? 'bg-[#221A1A] border-[#E8A598] text-[#E8A598]'
                        : 'bg-[#120E0E] border-[rgba(232,165,152,0.14)] text-[#C9B8B0] hover:text-[#F5EBE6]'
                    }`}
                  >
                    {route.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <Link to="/onboarding" className="block">
            <Button variant="primary" size="md" fullWidth>
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
    <>
      <footer className="bg-[#120E0E] border-t border-[rgba(232,165,152,0.14)] pt-14 pb-10 text-[#C9B8B0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-[rgba(232,165,152,0.12)]">
            <div className="md:col-span-4 text-left space-y-3">
              <Link
                to="/"
                className="inline-flex items-center gap-2 font-serif text-2xl font-semibold tracking-[0.22em] text-[#F5EBE6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A598] rounded"
              >
                <AllureStarMark size={16} />
                <span>ALLURE</span>
              </Link>
              <p className="text-sm text-[#C9B8B0] max-w-sm leading-relaxed">
                Inclusive personal appearance and grooming intelligence designed equally
                for every user. Practical proportions, effortless routines, zero rigid ideals.
              </p>
            </div>

            <div className="md:col-span-5 text-left">
              <h3 className="font-sans text-xs font-semibold tracking-wider text-[#F5EBE6] mb-3.5">
                Explore ALLURE
              </h3>
              <ul className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-sm">
                {FOOTER_LINKS.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="text-[#C9B8B0] hover:text-[#E8A598] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A598] rounded"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-3 text-left space-y-3">
              <h3 className="font-sans text-xs font-semibold tracking-wider text-[#F5EBE6]">
                Privacy &amp; Transparency
              </h3>
              <p className="text-xs text-[#C9B8B0] leading-relaxed">
                Your photos are analyzed securely for cosmetic and grooming guidance and
                never shared or sold. Cosmetic styling advice only — never medical diagnosis.
              </p>
              <button
                type="button"
                onClick={() => setPrivacyOpen(true)}
                className="text-xs font-medium text-[#E8A598] hover:text-[#F5EBE6] underline underline-offset-4 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A598] rounded"
              >
                Read Privacy &amp; Session Notice
              </button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#C9B8B0]/75">
            <p>&copy; {new Date().getFullYear()} ALLURE. Personal Grooming Intelligence.</p>
            <p>Photos remain in-session memory only · Not a clinical diagnostic tool</p>
          </div>
        </div>
      </footer>

      <Modal
        isOpen={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
        title="Privacy & Session Processing Notice"
        subtitle="How ALLURE protects your portraits and styling profile"
      >
        <div className="space-y-4 text-sm text-[#C9B8B0] leading-relaxed">
          <p>
            <strong className="text-[#F5EBE6]">In-session photos only:</strong> Any portrait
            you upload stays strictly in temporary session memory during analysis. Photos
            are never stored permanently, shared with third parties, or sold.
          </p>
          <p>
            <strong className="text-[#F5EBE6]">Local preference persistence:</strong>{' '}
            Your styling preferences (hair length, daily routine time, monthly budget,
            and cosmetic sensitivities) are saved locally in your browser so your plan
            remains seamless across visits.
          </p>
          <p>
            <strong className="text-[#F5EBE6]">Cosmetic education, not diagnosis:</strong>{' '}
            ALLURE provides styling recommendations and non-diagnostic cosmetic observations.
            Consult a certified dermatologist or clinician for any medical skin or scalp
            condition.
          </p>
        </div>
      </Modal>
    </>
  );
}

export default function Layout({
  children,
  noPadding = false,
}: {
  children: React.ReactNode;
  noPadding?: boolean;
}) {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen flex flex-col bg-[#120E0E] text-[#F5EBE6]">
      <Navbar />
      <main
        key={pathname}
        className={`flex-1 animate-page-in ${noPadding ? '' : 'py-10 sm:py-14'}`}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}
