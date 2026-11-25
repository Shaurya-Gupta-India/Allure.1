import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Check,
  Image as ImageIcon,
  Info,
  RefreshCw,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import {
  HairLength,
  HairTextureOption,
  SilhouetteVariant,
  StatusChipTone,
  UploadedPhoto,
} from '../types';

// ============================================================================
// Button
// ============================================================================

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap shrink-0 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A598] focus-visible:ring-offset-2 focus-visible:ring-offset-[#120E0E] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer';

  const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary:
      'bg-[#E8A598] hover:bg-[#D98A7C] text-[#120E0E] font-semibold shadow-[0_8px_24px_-12px_rgba(232,165,152,0.65)]',
    secondary:
      'bg-[#221A1A] hover:bg-[#2B2121] text-[#F5EBE6] border border-[rgba(232,165,152,0.2)]',
    outline:
      'bg-transparent hover:bg-[#221A1A]/80 text-[#F5EBE6] border border-[rgba(232,165,152,0.28)] hover:border-[#E8A598]',
    ghost: 'bg-transparent hover:bg-[#221A1A] text-[#C9B8B0] hover:text-[#F5EBE6]',
  };

  const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-sm sm:text-base',
  };

  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// ============================================================================
// Badges & StatusChip
// ============================================================================

export function DemoBadge({
  label = 'AI Cosmetic Intelligence',
  className = '',
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs text-[#E8A598] border border-[rgba(232,165,152,0.22)] bg-[#221A1A]/80 backdrop-blur-md px-3 py-1 rounded-full whitespace-nowrap shrink-0 ${className}`}
    >
      <Info className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

export function StatusChip({
  label,
  tone = 'demo',
}: {
  label: string;
  tone?: StatusChipTone;
}) {
  const styles: Record<StatusChipTone, string> = {
    demo: 'bg-[#E8A598]/15 border-[#E8A598]/40 text-[#E8A598]',
    progress: 'bg-[#F5EBE6]/10 border-[rgba(245,235,230,0.3)] text-[#F5EBE6]',
    planned: 'bg-[#120E0E] border-[rgba(232,165,152,0.24)] text-[#C9B8B0]',
    conditional: 'bg-[#221A1A] border-[rgba(232,165,152,0.22)] text-[#F5EBE6]/85',
    later: 'bg-[#120E0E] border-[rgba(232,165,152,0.16)] text-[#C9B8B0]/80',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${styles[tone]}`}
    >
      {label}
    </span>
  );
}

// ============================================================================
// EmptyState
// ============================================================================

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionTo,
  onActionClick,
  secondaryLabel,
  secondaryTo,
}: {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  onActionClick?: () => void;
  secondaryLabel?: string;
  secondaryTo?: string;
}) {
  return (
    <div className="bg-[#221A1A]/85 backdrop-blur-md border border-[rgba(232,165,152,0.16)] rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto">
      {icon && (
        <div className="w-12 h-12 rounded-full bg-[#120E0E] border border-[rgba(232,165,152,0.22)] text-[#E8A598] flex items-center justify-center mx-auto mb-5">
          {icon}
        </div>
      )}
      <h2 className="font-serif text-3xl font-semibold text-[#F5EBE6] mb-3">{title}</h2>
      <p className="text-sm text-[#C9B8B0] leading-relaxed mb-7">{description}</p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionLabel && actionTo && (
          <Link to={actionTo}>
            <Button variant="primary" size="md">
              {actionLabel}
            </Button>
          </Link>
        )}
        {actionLabel && !actionTo && onActionClick && (
          <Button variant="primary" size="md" onClick={onActionClick}>
            {actionLabel}
          </Button>
        )}
        {secondaryLabel && secondaryTo && (
          <Link to={secondaryTo}>
            <Button variant="outline" size="md">
              {secondaryLabel}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Modal
// ============================================================================

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidthClass = 'max-w-lg',
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidthClass?: string;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`relative z-10 w-full ${maxWidthClass} bg-[#1A1414] rounded-2xl border border-[rgba(232,165,152,0.2)] shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col animate-drawer-in`}
      >
        {(title || subtitle) && (
          <div className="px-6 py-5 bg-[#221A1A] border-b border-[rgba(232,165,152,0.14)] flex items-start justify-between gap-4 shrink-0">
            <div>
              {title && (
                <h2
                  id="modal-title"
                  className="font-serif text-2xl font-semibold text-[#F5EBE6] tracking-tight"
                >
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-xs sm:text-sm text-[#C9B8B0] mt-1">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="w-9 h-9 rounded-full bg-[#120E0E] border border-[rgba(232,165,152,0.18)] hover:border-[#E8A598] flex items-center justify-center text-[#F5EBE6] transition-colors duration-150 shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="p-6 overflow-y-auto flex-1 text-[#F5EBE6]">{children}</div>
      </div>
    </div>
  );
}

// ============================================================================
// SafeImage
// ============================================================================

export function SafeImage({
  src,
  alt,
  className = '',
  fallbackLabel,
  lazy = true,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackLabel?: string;
  lazy?: boolean;
}) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-[#221A1A] border border-[rgba(232,165,152,0.16)] text-[#C9B8B0] select-none p-5 text-center ${className}`}
      >
        <div className="w-10 h-10 rounded-full bg-[#120E0E] border border-[rgba(232,165,152,0.18)] flex items-center justify-center mb-2.5">
          <ImageIcon className="w-4 h-4 text-[#E8A598]" aria-hidden="true" />
        </div>
        <span className="text-xs font-medium tracking-wide text-[#C9B8B0] max-w-[180px] truncate">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={lazy ? 'lazy' : 'eager'}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}

// ============================================================================
// SelectionCard & ToggleChip
// ============================================================================

export function SelectionCard({
  label,
  description,
  selected,
  onClick,
  type = 'radio',
}: {
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
  type?: 'radio' | 'checkbox';
}) {
  return (
    <button
      type="button"
      role={type}
      aria-checked={selected}
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-start justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A598] ${
        selected
          ? 'bg-[#2A2020] border-[#E8A598] text-[#F5EBE6] shadow-[0_8px_24px_-14px_rgba(232,165,152,0.45)]'
          : 'bg-[#1A1414] border-[rgba(232,165,152,0.16)] hover:border-[rgba(232,165,152,0.38)] text-[#F5EBE6]'
      }`}
    >
      <div className="min-w-0">
        <span className="block text-sm font-semibold text-[#F5EBE6]">{label}</span>
        {description && (
          <span className="block text-xs text-[#C9B8B0] mt-1 leading-relaxed">
            {description}
          </span>
        )}
      </div>

      <span
        className={`w-5 h-5 mt-0.5 shrink-0 flex items-center justify-center border transition-colors duration-150 ${
          type === 'radio' ? 'rounded-full' : 'rounded-md'
        } ${
          selected
            ? 'bg-[#E8A598] border-[#E8A598] text-[#120E0E]'
            : 'bg-[#120E0E] border-[rgba(232,165,152,0.3)]'
        }`}
        aria-hidden="true"
      >
        {selected && <Check className="w-3 h-3 stroke-[2.75]" />}
      </span>
    </button>
  );
}

export function ToggleChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium border transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A598] ${
        selected
          ? 'bg-[#E8A598] text-[#120E0E] border-[#E8A598] font-semibold'
          : 'bg-[#1A1414] text-[#C9B8B0] border-[rgba(232,165,152,0.18)] hover:border-[#E8A598] hover:text-[#F5EBE6]'
      }`}
    >
      {label}
    </button>
  );
}

// ============================================================================
// StepProgress
// ============================================================================

export function StepProgress({
  steps,
  currentStep,
  highestVisitedStep,
  onStepClick,
}: {
  steps: { number: number; label: string }[];
  currentStep: number;
  highestVisitedStep: number;
  onStepClick?: (stepNumber: number) => void;
}) {
  const progressPercent =
    steps.length > 1 ? Math.round(((currentStep - 1) / (steps.length - 1)) * 100) : 100;

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between gap-3 mb-3 overflow-x-auto pb-1">
        {steps.map((step) => {
          const isCurrent = step.number === currentStep;
          const isCompleted = step.number < currentStep;
          const canJump = step.number <= highestVisitedStep && !!onStepClick;

          return (
            <button
              key={step.number}
              type="button"
              disabled={!canJump}
              onClick={() => canJump && onStepClick?.(step.number)}
              className={`flex items-center gap-2.5 text-left transition-colors duration-150 shrink-0 rounded-lg px-1 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A598] ${
                canJump ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center border transition-colors duration-150 tabular-nums ${
                  isCurrent
                    ? 'bg-[#E8A598] text-[#120E0E] border-[#E8A598]'
                    : isCompleted
                    ? 'bg-[#2A2020] text-[#E8A598] border-[#E8A598]'
                    : 'bg-[#1A1414] text-[#C9B8B0] border-[rgba(232,165,152,0.2)]'
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : step.number}
              </span>
              <span
                className={`text-xs sm:text-sm whitespace-nowrap ${
                  isCurrent
                    ? 'font-semibold text-[#F5EBE6]'
                    : isCompleted
                    ? 'font-medium text-[#E8A598]'
                    : 'text-[#C9B8B0]'
                }`}
              >
                {step.label}
              </span>
            </button>
          );
        })}
      </div>

      <div
        className="w-full h-1.5 bg-[#221A1A] rounded-full overflow-hidden border border-[rgba(232,165,152,0.14)]"
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-label={`Step ${currentStep} of ${steps.length}`}
      >
        <div
          className="h-full bg-[#E8A598] transition-all duration-300 rounded-full"
          style={{ width: `${Math.max(12, progressPercent)}%` }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// UploadZone
// ============================================================================

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export function UploadZone({
  id,
  title,
  requirementLabel,
  subtitle,
  tips,
  photo,
  disabled = false,
  onFileAccepted,
  onRemove,
}: {
  id: string;
  title: string;
  requirementLabel: 'Required' | 'Optional';
  subtitle: string;
  tips?: string[];
  photo: UploadedPhoto | null;
  disabled?: boolean;
  onFileAccepted: (file: File) => void;
  onRemove: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndLoad = (file: File) => {
    if (disabled) return;
    setErrorMsg(null);
    const mimeOk = ACCEPTED_TYPES.includes(file.type.toLowerCase());
    const extOk = /\.(jpe?g|png|webp)$/i.test(file.name);
    if (!mimeOk && !(file.type === '' && extOk)) {
      setErrorMsg('Unsupported format. Please upload a JPG, PNG, or WebP photo.');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setErrorMsg('File exceeds 5 MB. Please select a lighter image.');
      return;
    }
    onFileAccepted(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndLoad(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndLoad(file);
  };

  return (
    <div
      className={`bg-[#221A1A]/85 backdrop-blur-md border border-[rgba(232,165,152,0.16)] rounded-2xl p-6 flex flex-col justify-between text-left transition-all duration-200 ${
        disabled ? 'opacity-60' : 'hover:border-[rgba(232,165,152,0.3)]'
      }`}
    >
      <div>
        <div className="flex items-baseline justify-between gap-3 mb-1">
          <h3 className="font-serif text-2xl font-semibold text-[#F5EBE6]">{title}</h3>
          <span
            className={`text-xs font-medium shrink-0 ${
              requirementLabel === 'Required' ? 'text-[#E8A598]' : 'text-[#C9B8B0]'
            }`}
          >
            {requirementLabel}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[#C9B8B0] mb-4 leading-relaxed">{subtitle}</p>

        {errorMsg && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-400/30 text-xs text-red-200 flex items-start gap-2"
          >
            <AlertCircle
              className="w-4 h-4 shrink-0 mt-0.5 text-red-300"
              aria-hidden="true"
            />
            <span>{errorMsg}</span>
          </div>
        )}

        <input
          ref={inputRef}
          id={id}
          type="file"
          disabled={disabled}
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          onChange={handleInputChange}
          className="sr-only"
        />

        {photo ? (
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-[#1A1414] border border-[rgba(232,165,152,0.2)]">
            <div className="relative w-28 h-32 rounded-lg overflow-hidden bg-[#120E0E] shrink-0 border border-[rgba(232,165,152,0.18)]">
              <img
                src={photo.objectUrl}
                alt={`${title} preview`}
                className="w-full h-full object-cover object-top"
              />
              <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#E8A598] text-[#120E0E] flex items-center justify-center">
                <Check className="w-3.5 h-3.5 stroke-[2.75]" />
              </span>
            </div>

            <div className="flex-1 min-w-0 text-center sm:text-left">
              <p className="text-xs text-[#E8A598] font-medium">
                {photo.isSample ? 'Sample studio portrait loaded' : 'Ready in session memory'}
              </p>
              <p className="text-sm font-medium text-[#F5EBE6] truncate mt-0.5">
                {photo.fileName}
              </p>
              <p className="text-xs text-[#C9B8B0] mt-0.5 tabular-nums">
                {(photo.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => inputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#221A1A] border border-[rgba(232,165,152,0.22)] hover:border-[#E8A598] text-xs font-medium text-[#F5EBE6] transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Replace</span>
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setErrorMsg(null);
                    onRemove();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#221A1A] border border-red-400/25 hover:border-red-400/60 text-xs font-medium text-red-300 transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <label
            htmlFor={disabled ? undefined : id}
            aria-disabled={disabled}
            onDragOver={(e) => {
              e.preventDefault();
              if (!disabled) setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center p-8 rounded-xl border border-dashed transition-colors duration-150 text-center ${
              disabled
                ? 'border-[rgba(232,165,152,0.14)] bg-[#1A1414] cursor-not-allowed'
                : isDragging
                ? 'border-[#E8A598] bg-[#2A2020] cursor-pointer'
                : 'border-[rgba(232,165,152,0.28)] hover:border-[#E8A598] bg-[#1A1414] cursor-pointer'
            }`}
          >
            <div className="w-11 h-11 rounded-full bg-[#120E0E] border border-[rgba(232,165,152,0.2)] flex items-center justify-center text-[#E8A598] mb-3">
              <UploadCloud className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-[#F5EBE6]">
              {disabled
                ? 'Accept privacy consent above to enable uploads'
                : 'Click to choose a photo or drag & drop'}
            </span>
            <span className="text-xs text-[#C9B8B0] mt-1">
              JPG, PNG, or WebP · Max 5 MB
            </span>
          </label>
        )}
      </div>

      {tips && tips.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[rgba(232,165,152,0.12)]">
          <p className="text-xs font-medium text-[#F5EBE6] mb-1.5">Framing tips</p>
          <p className="text-xs text-[#C9B8B0] leading-relaxed">{tips.join(' · ')}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// HairstyleSilhouette
// ============================================================================

const SILHOUETTE_LENGTH_LABEL: Record<HairLength, string> = {
  shaved: 'Close Crop',
  short: 'Short Length',
  medium: 'Medium Length',
  long: 'Long Length',
  other: 'Custom Length',
};

export function HairstyleSilhouette({
  variant,
  lengthCategory,
  textures,
  styleName,
}: {
  variant: SilhouetteVariant;
  lengthCategory: HairLength;
  textures: HairTextureOption[];
  styleName: string;
}) {
  const renderHairStrokes = () => {
    switch (variant) {
      case 'shaved-fade':
        return (
          <g stroke="#E8A598" strokeWidth="1.4" strokeLinecap="round" fill="none">
            <path d="M51 64 C52 40, 64 31, 80 31 C96 31, 108 40, 109 64" />
            <path d="M54 57 C62 46, 98 46, 106 57" strokeDasharray="2.5 3" strokeOpacity="0.85" />
            <path d="M58 46 C68 40, 92 40, 102 46" strokeDasharray="2 3" strokeOpacity="0.6" />
          </g>
        );
      case 'short-crop':
        return (
          <g stroke="#E8A598" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M49 67 C48 42, 60 28, 80 27 C100 28, 112 42, 111 67" />
            <path d="M53 53 L60 47 L67 54 L76 46 L84 54 L93 47 L101 54 L107 50" />
            <path d="M62 37 C72 32, 88 32, 98 37" strokeOpacity="0.7" />
          </g>
        );
      case 'short-taper-curl':
        return (
          <g stroke="#E8A598" strokeWidth="1.5" strokeLinecap="round" fill="none">
            <path d="M51 66 C50 56, 51 47, 54 41" strokeOpacity="0.75" />
            <path d="M109 66 C110 56, 109 47, 106 41" strokeOpacity="0.75" />
            <path d="M52 44 C48 34, 58 24, 67 27 C72 19, 88 19, 93 27 C102 24, 112 34, 108 44" />
            <path d="M58 42 C63 36, 70 43, 75 37 C80 31, 87 43, 93 37 C98 32, 103 40, 104 43" />
          </g>
        );
      case 'short-side-swept':
        return (
          <g stroke="#E8A598" strokeWidth="1.5" strokeLinecap="round" fill="none">
            <path d="M49 68 C47 40, 62 25, 83 25 C102 25, 113 40, 111 68" />
            <path d="M57 35 C72 33, 92 40, 107 56" />
            <path d="M53 45 C70 43, 88 49, 103 60" strokeOpacity="0.7" />
          </g>
        );
      case 'short-bob':
        return (
          <g stroke="#E8A598" strokeWidth="1.5" strokeLinecap="round" fill="none">
            <path d="M43 96 C41 64, 46 28, 80 26 C114 28, 119 64, 117 96" />
            <path d="M43 96 C46 105, 54 109, 60 107" />
            <path d="M117 96 C114 105, 106 109, 100 107" />
            <path d="M54 54 C64 44, 74 44, 80 48 C86 44, 96 44, 106 54" strokeOpacity="0.75" />
          </g>
        );
      case 'short-coil':
        return (
          <g stroke="#E8A598" strokeWidth="1.5" strokeLinecap="round" fill="none">
            <path d="M50 64 C50 54, 51 47, 54 43" strokeOpacity="0.7" />
            <path d="M110 64 C110 54, 109 47, 106 43" strokeOpacity="0.7" />
            <path d="M52 44 C49 38, 54 31, 60 32 C61 25, 69 22, 74 26 C78 20, 86 20, 90 26 C96 22, 103 26, 103 33 C109 33, 112 40, 108 45" />
            <path d="M59 42 C63 38, 67 42, 71 39 C75 36, 79 41, 83 38 C87 35, 91 41, 95 38 C99 36, 102 41, 104 43" />
          </g>
        );
      case 'medium-curtain':
        return (
          <g stroke="#E8A598" strokeWidth="1.5" strokeLinecap="round" fill="none">
            <path d="M40 112 C38 72, 44 26, 80 24 C116 26, 122 72, 120 112" />
            <path d="M80 26 C75 48, 63 66, 48 80" />
            <path d="M80 26 C85 48, 97 66, 112 80" />
            <path d="M40 112 C45 117, 51 118, 56 115" />
            <path d="M120 112 C115 117, 109 118, 104 115" />
          </g>
        );
      case 'medium-flow':
        return (
          <g stroke="#E8A598" strokeWidth="1.5" strokeLinecap="round" fill="none">
            <path d="M43 106 C38 82, 42 54, 48 40 C56 26, 70 24, 82 24 C100 24, 114 38, 117 64 C119 82, 117 98, 114 108" />
            <path d="M68 27 C58 42, 52 60, 48 88" strokeOpacity="0.75" />
            <path d="M84 26 C98 40, 107 60, 110 92" strokeOpacity="0.75" />
          </g>
        );
      case 'medium-lob':
        return (
          <g stroke="#E8A598" strokeWidth="1.5" strokeLinecap="round" fill="none">
            <path d="M40 120 C39 74, 44 25, 80 24 C116 25, 121 74, 120 120" />
            <path d="M40 120 L57 120" />
            <path d="M103 120 L120 120" />
            <path d="M70 25 C64 46, 56 64, 48 82" strokeOpacity="0.7" />
          </g>
        );
      case 'medium-curl-halo':
        return (
          <g stroke="#E8A598" strokeWidth="1.5" strokeLinecap="round" fill="none">
            <path d="M42 108 C32 98, 32 82, 38 72 C31 60, 35 44, 46 38 C48 25, 62 19, 73 24 C80 17, 92 18, 97 26 C109 23, 120 33, 117 45 C127 52, 128 68, 121 78 C128 88, 125 103, 115 109" />
            <path d="M52 44 C59 38, 68 44, 75 39 C82 34, 90 43, 98 39 C104 36, 108 42, 110 46" strokeOpacity="0.75" />
          </g>
        );
      case 'medium-shag':
        return (
          <g stroke="#E8A598" strokeWidth="1.5" strokeLinecap="round" fill="none">
            <path d="M38 114 C37 86, 41 64, 45 48 C50 30, 64 23, 80 23 C96 23, 110 30, 115 48 C119 64, 123 86, 122 114" />
            <path d="M54 50 L62 44 L70 52 L80 43 L90 52 L98 44 L106 50" />
            <path d="M44 74 L36 86 M116 74 L124 86" strokeOpacity="0.8" />
            <path d="M42 96 L35 108 M118 96 L125 108" strokeOpacity="0.8" />
          </g>
        );
      case 'long-fringe-layers':
        return (
          <g stroke="#E8A598" strokeWidth="1.5" strokeLinecap="round" fill="none">
            <path d="M36 138 C35 88, 40 25, 80 23 C120 25, 125 88, 124 138" />
            <path d="M53 50 C62 47, 72 47, 80 49 C88 47, 98 47, 107 50" />
            <path d="M62 48 L60 56 M74 48 L73 56 M86 48 L87 56 M98 48 L100 56" strokeOpacity="0.7" />
            <path d="M44 90 C46 108, 48 122, 52 135" strokeOpacity="0.65" />
            <path d="M116 90 C114 108, 112 122, 108 135" strokeOpacity="0.65" />
          </g>
        );
      case 'long-waves':
        return (
          <g stroke="#E8A598" strokeWidth="1.5" strokeLinecap="round" fill="none">
            <path d="M38 140 C31 124, 42 108, 36 92 C31 76, 40 58, 44 42 C50 26, 65 22, 80 22 C95 22, 110 26, 116 42 C120 58, 129 76, 124 92 C118 108, 129 124, 122 140" />
            <path d="M46 96 C41 110, 50 124, 46 138" strokeOpacity="0.7" />
            <path d="M114 96 C119 110, 110 124, 114 138" strokeOpacity="0.7" />
            <path d="M74 24 C66 44, 57 60, 48 74" strokeOpacity="0.75" />
          </g>
        );
      case 'long-protective':
        return (
          <g stroke="#E8A598" strokeWidth="1.5" strokeLinecap="round" fill="none">
            <path d="M48 38 C56 26, 68 23, 80 23 C92 23, 104 26, 112 38" />
            <path d="M46 42 L38 138" strokeDasharray="4 3" />
            <path d="M52 46 L46 138" strokeDasharray="4 3" strokeOpacity="0.8" />
            <path d="M41 56 L33 134" strokeDasharray="4 3" strokeOpacity="0.65" />
            <path d="M114 42 L122 138" strokeDasharray="4 3" />
            <path d="M108 46 L114 138" strokeDasharray="4 3" strokeOpacity="0.8" />
            <path d="M119 56 L127 134" strokeDasharray="4 3" strokeOpacity="0.65" />
            <path d="M80 23 L80 39" strokeOpacity="0.7" />
          </g>
        );
    }
  };

  const textureTag = textures.slice(0, 2).join(' · ');

  return (
    <div
      className="w-full sm:w-44 aspect-[4/3] sm:aspect-auto sm:min-h-[220px] bg-[#140F0F] border-b sm:border-b-0 sm:border-r border-[rgba(232,165,152,0.14)] shrink-0 flex flex-col items-center justify-center p-4 select-none"
      aria-label={`${styleName} — ${SILHOUETTE_LENGTH_LABEL[lengthCategory]} silhouette illustration`}
      role="img"
    >
      <svg
        viewBox="0 0 160 156"
        className="w-28 h-28 sm:w-32 sm:h-32 overflow-visible"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="80" cy="78" r="64" stroke="rgba(232,165,152,0.12)" strokeWidth="1" />
        <path
          d="M68 106 L68 118 C58 122, 48 128, 43 138"
          stroke="rgba(201,184,176,0.35)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M92 106 L92 118 C102 122, 112 128, 117 138"
          stroke="rgba(201,184,176,0.35)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M54 64 C54 45, 65 36, 80 36 C95 36, 106 45, 106 64 C106 86, 95 108, 80 110 C65 108, 54 86, 54 64 Z"
          stroke="#C9B8B0"
          strokeWidth="1.3"
          strokeOpacity="0.72"
        />
        {renderHairStrokes()}
      </svg>

      <div className="mt-2 text-center">
        <span className="block text-[11px] font-medium tracking-[0.12em] uppercase text-[#E8A598]">
          {SILHOUETTE_LENGTH_LABEL[lengthCategory]}
        </span>
        {textureTag && (
          <span className="block text-[10px] text-[#C9B8B0]/80 mt-0.5">{textureTag}</span>
        )}
      </div>
    </div>
  );
}
