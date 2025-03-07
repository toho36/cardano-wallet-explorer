"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchFeaturedNFTs } from "@/lib/api";
import { NFT } from "@/types/wallet";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

export function FeaturedNFTs() {
  const limit = 24;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTouching, setIsTouching] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [dragStart, setDragStart] = useState(0);
  const [dragEnd, setDragEnd] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    data: nfts,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["featuredNFTs", limit],
    queryFn: () => fetchFeaturedNFTs(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Number of items to show per slide
  const getItemsPerSlide = () => {
    if (typeof window === "undefined") return 4;
    if (window.innerWidth < 640) return 1; // Mobile
    if (window.innerWidth < 768) return 2; // Small tablets
    if (window.innerWidth < 1024) return 3; // Tablets
    return 4; // Desktop
  };

  const [itemsPerSlide, setItemsPerSlide] = useState(getItemsPerSlide());

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setItemsPerSlide(getItemsPerSlide());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const nextSlide = useCallback(() => {
    if (!nfts) return;
    setCurrentIndex((prevIndex) =>
      prevIndex + itemsPerSlide >= nfts.length ? 0 : prevIndex + itemsPerSlide
    );
  }, [nfts, itemsPerSlide]);

  // Auto-play slider
  useEffect(() => {
    if (!nfts || isTouching || isDragging) return;

    const startAutoplay = () => {
      intervalRef.current = setInterval(() => {
        nextSlide();
      }, 5000); // Change slide every 5 seconds
    };

    startAutoplay();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [nfts, currentIndex, isTouching, isDragging, itemsPerSlide, nextSlide]);

  const prevSlide = () => {
    if (!nfts) return;
    setCurrentIndex((prevIndex) =>
      prevIndex - itemsPerSlide < 0
        ? Math.max(0, nfts.length - itemsPerSlide)
        : prevIndex - itemsPerSlide
    );
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsTouching(true);
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(e.targetTouches[0].clientX);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
    if (!nfts) return;

    const diff = touchEnd - touchStart;
    const containerWidth = sliderRef.current?.clientWidth || 1;
    const itemWidth = containerWidth / itemsPerSlide;
    const percentPerPixel = 100 / (nfts.length * itemWidth);

    // Calculate drag percentage based on touch movement
    const dragPercentage = diff * percentPerPixel;
    setDragOffset(dragPercentage);
  };

  const handleTouchEnd = () => {
    setIsTouching(false);
    if (!nfts) return;

    const threshold = 50; // Minimum distance required for swipe
    const diff = touchStart - touchEnd;

    // Calculate how many slides to move based on drag distance
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe left (next)
        nextSlide();
      } else {
        // Swipe right (prev)
        prevSlide();
      }
    }

    // Reset drag offset after slide transition
    setDragOffset(0);
  };

  // Mouse event handlers for desktop drag and slide
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart(e.clientX);
    setDragEnd(e.clientX);
    setDragOffset(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !nfts) return;

    setDragEnd(e.clientX);
    const diff = dragEnd - dragStart;
    const containerWidth = sliderRef.current?.clientWidth || 1;
    const itemWidth = containerWidth / itemsPerSlide;
    const percentPerPixel = 100 / (nfts.length * itemWidth);

    // Calculate drag percentage based on mouse movement
    const dragPercentage = diff * percentPerPixel;
    setDragOffset(dragPercentage);
  };

  const handleMouseUp = () => {
    if (!isDragging || !nfts) return;

    const threshold = 50; // Minimum distance required for drag
    const diff = dragStart - dragEnd;

    // Calculate how many slides to move based on drag distance
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Drag left (next)
        nextSlide();
      } else {
        // Drag right (prev)
        prevSlide();
      }
    }

    setIsDragging(false);
    setDragOffset(0);
  };

  // Handle mouse leave to prevent issues if the user drags outside the window
  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragOffset(0);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32 sm:h-48">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2">Loading marketplace...</span>
      </div>
    );
  }

  if (isError || !nfts || nfts.length === 0) {
    return (
      <div className="text-center py-6 bg-gray-50 rounded-lg">
        <p className="text-gray-500">
          No featured items available at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        {/* Slider container */}
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
                (currentIndex * 100) / nfts.length
              }% + ${dragOffset}%))`,
              width: `${(nfts.length / itemsPerSlide) * 100}%`,
            }}
          >
            {nfts.map((nft) => (
              <div
                key={nft.asset}
                className="px-1.5 flex-shrink-0"
                style={{ width: `${100 / nfts.length}%` }}
              >
                <NFTCard nft={nft} />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation buttons - hidden on mobile */}
        <button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md z-10 hidden sm:flex items-center justify-center hover:bg-white"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md z-10 hidden sm:flex items-center justify-center hover:bg-white"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Pagination indicators */}
        <div className="flex justify-center mt-4 gap-1.5">
          {Array.from({ length: Math.ceil(nfts.length / itemsPerSlide) }).map(
            (_, idx) => (
              <button
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  Math.floor(currentIndex / itemsPerSlide) === idx
                    ? "w-6 bg-primary"
                    : "w-2 bg-gray-300"
                }`}
                onClick={() => setCurrentIndex(idx * itemsPerSlide)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}

function NFTCard({ nft }: { nft: NFT }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/NFTDetailPage/${encodeURIComponent(nft.asset)}`);
  };

  return (
    <div
      className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]"
      onClick={handleClick}
    >
      {/* Mobile-optimized image container with fixed aspect ratio */}
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        {nft.image ? (
          <Image
            src={nft.image}
            alt={nft.name || "NFT"}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            className="object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              if (target.parentElement) {
                target.parentElement.innerHTML =
                  '<div class="flex items-center justify-center h-full w-full text-gray-500">No Image</div>';
              }
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full text-gray-500">
            No Image
          </div>
        )}
      </div>

      {/* Compact but readable NFT info with larger touch targets */}
      <div className="p-2 sm:p-3">
        <h3 className="font-medium truncate text-sm sm:text-base">
          {nft.name || "Unnamed NFT"}
        </h3>
        {nft.collection && (
          <p className="text-xs sm:text-sm text-gray-500 truncate mt-0.5">
            {nft.collection}
          </p>
        )}
      </div>
    </div>
  );
}
