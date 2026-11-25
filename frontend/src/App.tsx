import { HashRouter, Route, Routes } from 'react-router-dom';
import { AllureProvider } from './state';
import Layout, { ScrollToTopAndTitle } from './components/Layout';
import AssistantWidget from './components/AssistantWidget';
import { EmptyState } from './components/ui';
import HomePage from './pages/HomePage';
import FeaturesPage from './pages/FeaturesPage';
import HowItWorksPage from './pages/HowItWorksPage';
import AboutPage from './pages/AboutPage';
import OnboardingPage from './pages/OnboardingPage';
import AnalysisPage from './pages/AnalysisPage';
import ResultsPage from './pages/ResultsPage';
import RecommendationsPage from './pages/RecommendationsPage';
import ProductsPage from './pages/ProductsPage';

function NotFoundPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EmptyState
          title="Page not found"
          description="That route doesn't exist in ALLURE. Return to the homepage to explore your personalized grooming blueprint."
          actionLabel="Return Home"
          actionTo="/"
        />
      </div>
    </Layout>
  );
}

export default function App() {
  return (
    <AllureProvider>
      <HashRouter>
        <ScrollToTopAndTitle />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/history" element={<ResultsPage initialShowHistory />} />
          <Route path="/history/:id" element={<ResultsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <AssistantWidget />
      </HashRouter>
    </AllureProvider>
  );
}
