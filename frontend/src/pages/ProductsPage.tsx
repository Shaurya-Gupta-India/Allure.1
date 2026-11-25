import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Columns2,
  ExternalLink,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react';
import PageShell from '../components/Layout';
import { Button, EmptyState, Modal, SafeImage } from '../components/ui';
import { useAllure } from '../state';
import { CURATED_PRODUCTS } from '../data';
import { fetchSampleProducts, formatSamplePrice } from '../services';
import { CurrencyCode, ProductCategory, ProductItem } from '../types';

const CATEGORIES: (ProductCategory | 'All')[] = [
  'All',
  'Haircare',
  'Skincare',
  'Grooming Tools',
];

export default function Products() {
  const { preferences, updatePreferences } = useAllure();

  const [products, setProducts] = useState<ProductItem[]>(CURATED_PRODUCTS);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'All'>('All');
  const [maxPriceINR, setMaxPriceINR] = useState(1500);
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc'>(
    'recommended'
  );

  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [retailerNotedId, setRetailerNotedId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchSampleProducts({
      search: searchQuery,
      category: activeCategory,
      maxPriceINR,
      sortBy,
    })
      .then((items) => {
        if (active) setProducts(items);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [searchQuery, activeCategory, maxPriceINR, sortBy]);

  const compareProducts = useMemo(
    () => CURATED_PRODUCTS.filter((p) => compareIds.includes(p.id)),
    [compareIds]
  );

  const toggleCompare = (product: ProductItem) => {
    setCompareIds((prev) => {
      if (prev.includes(product.id)) return prev.filter((id) => id !== product.id);
      if (prev.length >= 3) return prev;
      return [...prev, product.id];
    });
  };

  const resetFilters = () => {
    setSearchQuery('');
    setActiveCategory('All');
    setMaxPriceINR(1500);
    setSortBy('recommended');
  };

  const maxPriceDisplay =
    preferences.currency === 'USD'
      ? `$${Math.round(maxPriceINR / 40)}`
      : `₹${maxPriceINR.toLocaleString('en-IN')}`;

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#E8A598] mb-2">
              Curated Essentials · Matched to Your Plan
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#F5EBE6]">
              Product Discovery
            </h1>
            <p className="text-sm text-[#C9B8B0] mt-2 max-w-2xl leading-relaxed">
              Explore grooming formulas and precision tools mapped to your morning and
              evening routine steps. Select 2 to 3 products to compare benefits and budget
              fit side by side.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="inline-flex p-1 rounded-lg bg-[#1A1414] border border-[rgba(232,165,152,0.18)]">
              {(['INR', 'USD'] as const).map((curr) => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => updatePreferences({ currency: curr })}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 cursor-pointer ${
                    preferences.currency === curr
                      ? 'bg-[#E8A598] text-[#120E0E] font-semibold'
                      : 'text-[#C9B8B0] hover:text-[#F5EBE6]'
                  }`}
                >
                  {curr === 'INR' ? 'INR ₹' : 'USD $'}
                </button>
              ))}
            </div>

            {compareProducts.length >= 2 && (
              <Button
                variant="primary"
                size="md"
                onClick={() => setCompareModalOpen(true)}
              >
                <Columns2 className="w-4 h-4" />
                <span>Compare Products ({compareProducts.length})</span>
              </Button>
            )}
          </div>
        </div>

        {/* Filter & Control Toolbar */}
        <div className="luxury-glass rounded-2xl p-5 sm:p-6 space-y-5">
          {/* Interactive Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer ${
                    active
                      ? 'bg-[#E8A598] text-[#120E0E] font-semibold'
                      : 'bg-[#1A1414] text-[#C9B8B0] hover:text-[#F5EBE6] border border-[rgba(232,165,152,0.16)]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search + Budget Filter + Sort */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-5">
              <label
                htmlFor="catalog-search"
                className="block text-xs font-medium text-[#C9B8B0] mb-1.5"
              >
                Search Essentials
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-[#C9B8B0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="catalog-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search niacinamide, matte clay, SPF, comb..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1A1414] border border-[rgba(232,165,152,0.18)] text-sm text-[#F5EBE6] placeholder:text-[#C9B8B0]/60 focus:outline-none focus:border-[#E8A598]"
                />
              </div>
            </div>

            <div className="md:col-span-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <label htmlFor="budget-ceiling" className="font-medium text-[#C9B8B0]">
                  Budget Filter (Max Price)
                </label>
                <span className="font-semibold text-[#E8A598] tabular-nums">
                  {maxPriceDisplay}
                </span>
              </div>
              <input
                id="budget-ceiling"
                type="range"
                min={450}
                max={1500}
                step={50}
                value={maxPriceINR}
                onChange={(e) => setMaxPriceINR(Number(e.target.value))}
                className="w-full luxury-range my-2"
              />
            </div>

            <div className="md:col-span-3">
              <label
                htmlFor="sort-products"
                className="block text-xs font-medium text-[#C9B8B0] mb-1.5"
              >
                Sort By
              </label>
              <select
                id="sort-products"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as 'recommended' | 'price-asc' | 'price-desc')
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1414] border border-[rgba(232,165,152,0.18)] text-sm text-[#F5EBE6] focus:outline-none focus:border-[#E8A598]"
              >
                <option value="recommended">Recommended Match</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[rgba(232,165,152,0.12)] text-xs text-[#C9B8B0]">
            <span>
              Showing{' '}
              <strong className="text-[#F5EBE6] tabular-nums">{products.length}</strong>{' '}
              curated essentials · Select up to 3 items to compare side by side
            </span>

            {compareIds.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-[#E8A598] font-medium tabular-nums">
                  {compareIds.length} / 3 selected
                </span>
                {compareIds.length >= 2 && (
                  <button
                    type="button"
                    onClick={() => setCompareModalOpen(true)}
                    className="font-semibold text-[#F5EBE6] underline underline-offset-4 cursor-pointer"
                  >
                    Compare now
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setCompareIds([])}
                  className="text-[#C9B8B0] hover:text-[#F5EBE6] cursor-pointer"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-96 rounded-2xl bg-[#221A1A] border border-[rgba(232,165,152,0.14)] animate-pulse"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="w-6 h-6" />}
            title="No products match your current filters"
            description="Try raising your price ceiling, switching categories, or clearing the search term."
            actionLabel="Reset Filters"
            onActionClick={resetFilters}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currency={preferences.currency}
                isSelectedForCompare={compareIds.includes(product.id)}
                canSelectMoreForCompare={compareIds.length < 3}
                onToggleCompare={toggleCompare}
                onViewProduct={(item) => {
                  setRetailerNotedId(null);
                  setSelectedProduct(item);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <Modal
        isOpen={!!selectedProduct}
        onClose={() => {
          setSelectedProduct(null);
          setRetailerNotedId(null);
        }}
        title={selectedProduct?.title}
        subtitle={
          selectedProduct
            ? `${selectedProduct.brand} · ${selectedProduct.category}`
            : undefined
        }
        maxWidthClass="max-w-2xl"
      >
        {selectedProduct && (
          <div className="space-y-5 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
              <div className="sm:col-span-5 aspect-[4/3] rounded-xl overflow-hidden bg-[#120E0E] border border-[rgba(232,165,152,0.18)]">
                <SafeImage
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="sm:col-span-7 space-y-3">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#E8A598] font-medium">
                    <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{selectedProduct.routineStepMatch}</span>
                  </span>
                  <div className="text-right">
                    <span className="block text-[10px] uppercase tracking-wider text-[#C9B8B0]">
                      Price
                    </span>
                    <span className="text-xl font-semibold text-[#F5EBE6] tabular-nums">
                      {formatSamplePrice(
                        selectedProduct.priceINR,
                        selectedProduct.priceUSD,
                        preferences.currency
                      )}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-[#C9B8B0] leading-relaxed">
                  {selectedProduct.fullDescription}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#221A1A] border border-[rgba(232,165,152,0.16)] space-y-2">
              <h3 className="text-xs font-semibold text-[#F5EBE6]">
                Active Ingredients &amp; Key Benefits
              </h3>
              <ul className="space-y-1.5 text-sm text-[#C9B8B0]">
                {selectedProduct.keyBenefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#E8A598] shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-[#120E0E] border border-[rgba(232,165,152,0.14)] space-y-1.5">
              <span className="text-xs font-semibold text-[#E8A598] block">
                Best Suited For
              </span>
              <p className="text-xs sm:text-sm text-[#C9B8B0]">
                {selectedProduct.suitableFor.join(' · ')}
              </p>
            </div>

            {retailerNotedId === selectedProduct.id && (
              <div className="p-3.5 rounded-xl bg-[#E8A598]/15 border border-[#E8A598]/40 text-xs text-[#F5EBE6]">
                Saved <strong className="text-[#E8A598]">{selectedProduct.title}</strong> to
                your shopping note. Search &ldquo;{selectedProduct.brand}{' '}
                {selectedProduct.title}&rdquo; at your preferred beauty or grooming retailer.
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <Button
                variant="primary"
                size="md"
                onClick={() => setRetailerNotedId(selectedProduct.id)}
                className="w-full sm:flex-1"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{selectedProduct.retailerLabel}</span>
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setSelectedProduct(null);
                  setRetailerNotedId(null);
                }}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Side-by-Side Comparison Modal */}
      <Modal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        title="Compare Grooming Essentials"
        subtitle="Side-by-side comparison of active benefits, suitability, and budget fit"
        maxWidthClass="max-w-4xl"
      >
        <ComparisonTable
          products={compareProducts}
          currency={preferences.currency}
          monthlyBudgetINR={preferences.monthlyBudgetINR}
          onRemoveProduct={(id) => {
            const next = compareIds.filter((item) => item !== id);
            setCompareIds(next);
            if (next.length < 2) setCompareModalOpen(false);
          }}
        />
      </Modal>
    </PageShell>
  );
}

function ProductCard({
  product,
  currency,
  isSelectedForCompare,
  canSelectMoreForCompare,
  onToggleCompare,
  onViewProduct,
}: {
  product: ProductItem;
  currency: CurrencyCode;
  isSelectedForCompare: boolean;
  canSelectMoreForCompare: boolean;
  onToggleCompare: (product: ProductItem) => void;
  onViewProduct: (product: ProductItem) => void;
}) {
  return (
    <article className="luxury-glass luxury-card-hover rounded-2xl overflow-hidden flex flex-col justify-between text-left">
      <div>
        <div className="aspect-[4/3] bg-[#1A1414] overflow-hidden border-b border-[rgba(232,165,152,0.12)]">
          <SafeImage
            src={product.imageUrl}
            alt={`${product.title} by ${product.brand}`}
            fallbackLabel={product.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-xs text-[#C9B8B0]">
            <span className="font-medium text-[#E8A598]">{product.brand}</span>
            <span aria-hidden="true">·</span>
            <span>{product.category}</span>
          </div>

          <h3 className="font-serif text-xl font-semibold text-[#F5EBE6] leading-snug">
            {product.title}
          </h3>

          <p className="inline-flex items-center gap-1.5 text-xs text-[#E8A598] font-medium">
            <Sparkles className="w-3 h-3 shrink-0" aria-hidden="true" />
            <span>Match: {product.routineStepMatch}</span>
          </p>

          <p className="text-xs sm:text-sm text-[#C9B8B0] leading-relaxed line-clamp-2">
            {product.shortDescription}
          </p>

          <p className="text-xs text-[#C9B8B0]/85 pt-1">
            {product.keyBenefits.join(' · ')}
          </p>
        </div>
      </div>

      <div className="px-5 pb-5 pt-4 border-t border-[rgba(232,165,152,0.12)] flex flex-col gap-3">
        <div className="flex items-end justify-between gap-2">
          <div>
            <span className="text-[11px] text-[#C9B8B0] block">Price</span>
            <span className="text-lg font-semibold text-[#F5EBE6] tabular-nums">
              {formatSamplePrice(product.priceINR, product.priceUSD, currency)}
            </span>
          </div>

          <button
            type="button"
            disabled={!isSelectedForCompare && !canSelectMoreForCompare}
            onClick={() => onToggleCompare(product)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors duration-150 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isSelectedForCompare
                ? 'bg-[#E8A598] text-[#120E0E] border-[#E8A598] font-semibold'
                : 'bg-[#1A1414] text-[#F5EBE6] border-[rgba(232,165,152,0.22)] hover:border-[#E8A598]'
            }`}
          >
            {isSelectedForCompare ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Selected</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Compare</span>
              </>
            )}
          </button>
        </div>

        <Button variant="outline" size="sm" fullWidth onClick={() => onViewProduct(product)}>
          Inspect &amp; Shop
        </Button>
      </div>
    </article>
  );
}

function ComparisonTable({
  products,
  currency,
  monthlyBudgetINR,
  onRemoveProduct,
}: {
  products: ProductItem[];
  currency: CurrencyCode;
  monthlyBudgetINR: number;
  onRemoveProduct: (id: string) => void;
}) {
  if (products.length < 2) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[540px]">
        <thead>
          <tr className="border-b border-[rgba(232,165,152,0.16)]">
            <th className="py-3 pr-4 text-xs font-medium text-[#C9B8B0] w-36 align-top">
              Specification
            </th>
            {products.map((p) => (
              <th key={p.id} className="py-3 px-4 align-top">
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="w-16 h-12 rounded-lg overflow-hidden bg-[#120E0E] border border-[rgba(232,165,152,0.16)] shrink-0">
                    <SafeImage
                      src={p.imageUrl}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveProduct(p.id)}
                    aria-label={`Remove ${p.title}`}
                    className="p-1.5 rounded-full hover:bg-[#2A2020] text-[#C9B8B0] hover:text-[#F5EBE6] transition-colors duration-150 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs font-medium text-[#E8A598] block">{p.brand}</span>
                <span className="font-serif text-lg font-semibold text-[#F5EBE6] block leading-tight mt-0.5">
                  {p.title}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgba(232,165,152,0.12)] text-sm">
          <tr>
            <td className="py-3.5 pr-4 text-xs font-medium text-[#C9B8B0]">Category</td>
            {products.map((p) => (
              <td key={p.id} className="py-3.5 px-4 text-[#F5EBE6]">
                {p.category}
              </td>
            ))}
          </tr>
          <tr>
            <td className="py-3.5 pr-4 text-xs font-medium text-[#C9B8B0]">Routine Step</td>
            {products.map((p) => (
              <td key={p.id} className="py-3.5 px-4 text-xs text-[#E8A598]">
                {p.routineStepMatch}
              </td>
            ))}
          </tr>
          <tr>
            <td className="py-3.5 pr-4 text-xs font-medium text-[#C9B8B0]">Price</td>
            {products.map((p) => (
              <td
                key={p.id}
                className="py-3.5 px-4 font-semibold text-[#F5EBE6] tabular-nums"
              >
                {formatSamplePrice(p.priceINR, p.priceUSD, currency)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="py-3.5 pr-4 text-xs font-medium text-[#C9B8B0]">Budget Fit</td>
            {products.map((p) => {
              const fits = p.priceINR <= monthlyBudgetINR * 0.5;
              return (
                <td key={p.id} className="py-3.5 px-4 text-xs text-[#C9B8B0]">
                  <span className={fits ? 'text-[#E8A598] font-medium' : 'text-[#C9B8B0]'}>
                    {fits
                      ? 'Comfortable fit for monthly budget'
                      : 'Higher share of monthly budget'}
                  </span>
                </td>
              );
            })}
          </tr>
          <tr>
            <td className="py-3.5 pr-4 text-xs font-medium text-[#C9B8B0] align-top">
              Active Benefits
            </td>
            {products.map((p) => (
              <td key={p.id} className="py-3.5 px-4 text-xs text-[#C9B8B0] align-top">
                <ul className="space-y-1 list-disc list-inside">
                  {p.keyBenefits.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </td>
            ))}
          </tr>
          <tr>
            <td className="py-3.5 pr-4 text-xs font-medium text-[#C9B8B0] align-top">
              Best Suited For
            </td>
            {products.map((p) => (
              <td key={p.id} className="py-3.5 px-4 text-xs text-[#C9B8B0] align-top">
                <ul className="space-y-1 list-disc list-inside">
                  {p.suitableFor.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
