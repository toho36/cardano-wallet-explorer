"use client";

import { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselProps {
  items: ReactNode[];
  currentIndex: number;
  itemsPerSlide: number;
  dragOffset: number;
  onPrev: () => void;
  onNext: () => void;
  onSelectPage: (index: number) => void;
  sliderRef: React.RefObject<HTMLDivElement | null>;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handleMouseLeave: () => void;
}

export function Carousel({
  items,
  currentIndex,
  itemsPerSlide,
  dragOffset,
  onPrev,
  onNext,
  onSelectPage,
  sliderRef,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleMouseLeave,
}: CarouselProps) {
  return (
    <div className="relative">
      <div
        className="overflow-hidden cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        ref={sliderRef}
      >
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(calc(-${
              (currentIndex * 100) / items.length
            }% + ${dragOffset}%))`,
            width: `${(items.length / itemsPerSlide) * 100}%`,
          }}
        >
          {items.map((item, index) => (
            <div
              key={index}
              className="px-1.5 flex-shrink-0"
              style={{ width: `${100 / items.length}%` }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md z-10 hidden sm:flex items-center justify-center hover:bg-white"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={onNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md z-10 hidden sm:flex items-center justify-center hover:bg-white"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="flex justify-center mt-4 gap-1.5">
        {Array.from({ length: Math.ceil(items.length / itemsPerSlide) }).map(
          (_, idx) => (
            <button
              key={idx}
              className={`h-2 rounded-full transition-all ${
                Math.floor(currentIndex / itemsPerSlide) === idx
                  ? "w-6 bg-primary"
                  : "w-2 bg-gray-300"
              }`}
              onClick={() => onSelectPage(idx * itemsPerSlide)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          )
        )}
      </div>
    </div>
  );
}
