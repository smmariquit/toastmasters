'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Play,
  Clock,
  MessageSquare,
  BookOpen,
  Trophy,
  Star,
  TrendingUp
} from 'lucide-react';

export interface WrappedSlide {
  type: 'intro' | 'stat' | 'list' | 'highlight' | 'summary';
  title: string;
  subtitle?: string;
  value?: string | number;
  unit?: string;
  items?: { label: string; value: string | number; highlight?: boolean }[];
  icon?: 'clock' | 'message' | 'book' | 'trophy' | 'star' | 'trending';
  color?: 'burgundy' | 'gold' | 'navy' | 'green' | 'red' | 'gradient';
}

interface WrappedPresentationProps {
  slides: WrappedSlide[];
  onClose: () => void;
  title: string;
}

const iconMap = {
  clock: Clock,
  message: MessageSquare,
  book: BookOpen,
  trophy: Trophy,
  star: Star,
  trending: TrendingUp,
};

const colorMap = {
  burgundy: 'from-[#772432] to-[#5a1b26]',
  gold: 'from-[#c4a052] to-[#a88b3d]',
  navy: 'from-[#004165] to-[#002f4a]',
  green: 'from-green-500 to-green-700',
  red: 'from-red-500 to-red-700',
  gradient: 'from-[#772432] via-[#004165] to-[#c4a052]',
};

export function WrappedPresentation({ slides, onClose, title }: WrappedPresentationProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Reset animation state when slide changes
    setIsAnimating(true);
    setShowContent(false);
    
    const timer1 = setTimeout(() => setShowContent(true), 100);
    const timer2 = setTimeout(() => setIsAnimating(false), 1500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [currentSlide]);

  const handleNext = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    }
  }, [currentSlide, slides.length]);

  const handlePrev = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  }, [currentSlide]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, onClose]);

  const slide = slides[currentSlide];
  const IconComponent = slide.icon ? iconMap[slide.icon] : null;
  const bgGradient = slide.color ? colorMap[slide.color] : colorMap.gradient;

  return (
    <div className={`fixed inset-0 z-[100] bg-gradient-to-br ${bgGradient} overflow-hidden`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 h-full w-full animate-slow-spin rounded-full bg-white/5" />
        <div className="absolute -bottom-1/2 -right-1/2 h-full w-full animate-slow-spin-reverse rounded-full bg-white/5" />
        <div className="absolute top-1/4 right-1/4 h-64 w-64 animate-pulse rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 h-48 w-48 animate-pulse rounded-full bg-white/10 blur-3xl" style={{ animationDelay: '1s' }} />
      </div>

      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Title */}
      <div className="absolute top-4 left-4 z-10">
        <span className="text-white/60 text-sm uppercase tracking-wider">{title}</span>
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
            }`}
            onClick={() => setCurrentSlide(idx)}
          />
        ))}
      </div>

      {/* Navigation arrows */}
      {currentSlide > 0 && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 md:left-4 top-1/2 z-10 -translate-y-1/2 text-white hover:bg-white/20 h-10 w-10 md:h-12 md:w-12"
          onClick={handlePrev}
        >
          <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
        </Button>
      )}
      {currentSlide < slides.length - 1 && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 md:right-4 top-1/2 z-10 -translate-y-1/2 text-white hover:bg-white/20 h-10 w-10 md:h-12 md:w-12"
          onClick={handleNext}
        >
          <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
        </Button>
      )}

      {/* Slide content */}
      <div className="relative flex h-full w-full items-center justify-center p-4 md:p-8 pt-16 pb-24">
        <div className={`w-full max-w-4xl text-center text-white transition-all duration-700 ${
          showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          {/* Intro slide */}
          {slide.type === 'intro' && (
            <div className="space-y-4 md:space-y-6">
              {IconComponent && (
                <div className="mx-auto mb-6 md:mb-8 flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-full bg-white/20 animate-bounce-slow">
                  <IconComponent className="h-10 w-10 md:h-12 md:w-12 text-white" />
                </div>
              )}
              <h1 className="text-4xl sm:text-5xl font-bold md:text-7xl animate-fade-in text-white">{slide.title}</h1>
              {slide.subtitle && (
                <p className="text-lg md:text-xl lg:text-2xl text-white/80 animate-fade-in-delay">{slide.subtitle}</p>
              )}
            </div>
          )}

          {/* Stat slide */}
          {slide.type === 'stat' && (
            <div className="space-y-4">
              <p className="text-xl md:text-2xl text-white/80 uppercase tracking-wider animate-fade-in">
                {slide.title}
              </p>
              <div className="flex flex-wrap items-baseline justify-center gap-2 md:gap-4">
                <span className="text-6xl sm:text-8xl font-bold md:text-[10rem] animate-scale-in text-white">
                  {slide.value}
                </span>
                {slide.unit && (
                  <span className="text-xl sm:text-3xl md:text-4xl text-white/80">{slide.unit}</span>
                )}
              </div>
              {slide.subtitle && (
                <p className="mt-4 text-base md:text-lg text-white/60 animate-fade-in-delay">{slide.subtitle}</p>
              )}
            </div>
          )}

          {/* List slide */}
          {slide.type === 'list' && (
            <div className="space-y-6">
              <h2 className="mb-6 md:mb-8 text-2xl md:text-3xl font-bold lg:text-5xl animate-fade-in text-white">{slide.title}</h2>
              <div className="grid gap-3 md:gap-4 sm:grid-cols-2 max-h-[60vh] overflow-y-auto px-2">
                {slide.items?.map((item, idx) => (
                  <Card
                    key={idx}
                    className={`bg-white/10 border-white/20 p-3 md:p-4 text-left backdrop-blur-sm transition-all duration-500 hover:bg-white/20 ${
                      item.highlight ? 'ring-2 ring-white/50' : ''
                    }`}
                    style={{ 
                      animationDelay: `${idx * 100}ms`,
                      animation: showContent ? 'slideInUp 0.5s ease forwards' : 'none',
                      opacity: 0,
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-white/80 text-sm md:text-base truncate">{item.label}</span>
                      <span className="text-lg md:text-xl font-bold text-white flex-shrink-0">{item.value}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Highlight slide */}
          {slide.type === 'highlight' && (
            <div className="space-y-4 md:space-y-6">
              {IconComponent && (
                <div className="mx-auto mb-4 flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-white/20">
                  <IconComponent className="h-8 w-8 md:h-10 md:w-10 text-white" />
                </div>
              )}
              <p className="text-lg md:text-xl text-white/80 uppercase tracking-wider animate-fade-in">{slide.title}</p>
              <h2 className="text-2xl sm:text-4xl font-bold md:text-6xl animate-scale-in text-white break-words">{slide.value}</h2>
              {slide.subtitle && (
                <p className="text-base md:text-lg text-white/60 animate-fade-in-delay">{slide.subtitle}</p>
              )}
            </div>
          )}

          {/* Summary slide */}
          {slide.type === 'summary' && (
            <div className="space-y-6 md:space-y-8">
              <h2 className="text-2xl md:text-3xl font-bold lg:text-5xl animate-fade-in text-white">{slide.title}</h2>
              <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                {slide.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="text-center min-w-[80px]"
                    style={{ 
                      animationDelay: `${idx * 150}ms`,
                      animation: showContent ? 'scaleIn 0.4s ease forwards' : 'none',
                      opacity: 0,
                    }}
                  >
                    <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">{item.value}</div>
                    <div className="text-xs md:text-sm text-white/60 uppercase tracking-wider">{item.label}</div>
                  </div>
                ))}
              </div>
              {slide.subtitle && (
                <p className="mt-6 md:mt-8 text-lg md:text-xl text-white/80 animate-fade-in-delay">{slide.subtitle}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Click to advance hint */}
      {currentSlide < slides.length - 1 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-white/40 text-xs md:text-sm animate-pulse hidden sm:block">
          Press → or Space to continue
        </div>
      )}
      
      {/* Mobile swipe hint */}
      {currentSlide < slides.length - 1 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-white/40 text-xs animate-pulse sm:hidden">
          Tap arrows to continue
        </div>
      )}
      
      {/* Close hint on last slide */}
      {currentSlide === slides.length - 1 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2">
          <Button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 text-white"
          >
            Close Presentation
          </Button>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slow-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes slow-spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        
        .animate-slow-spin {
          animation: slow-spin 60s linear infinite;
        }
        
        .animate-slow-spin-reverse {
          animation: slow-spin-reverse 45s linear infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce 2s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: slideInUp 0.6s ease forwards;
        }
        
        .animate-fade-in-delay {
          animation: slideInUp 0.6s ease 0.3s forwards;
          opacity: 0;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.5s ease 0.2s forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
