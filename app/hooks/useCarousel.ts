import { useRef, useEffect, useCallback } from "react";
import { useCarouselStore } from "@/store/carouselStore";

export const useCarousel = (totalItems: number, autoPlayInterval = 5000) => {
  const {
    currentIndex,
    itemsPerSlide,
    isDragging,
    isTouching,
    dragOffset,
    hasMoved,
    touchStart,
    touchEnd,
    dragStart,
    dragEnd,
    setCurrentIndex,
    setItemsPerSlide,
    setIsDragging,
    setIsTouching,
    setDragOffset,
    setHasMoved,
    setTouchStart,
    setTouchEnd,
    setDragStart,
    setDragEnd,
    nextSlide,
    prevSlide,
    resetDrag,
  } = useCarouselStore();

  const sliderRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getItemsPerSlide = useCallback(() => {
    if (typeof window === "undefined") return 4;
    if (window.innerWidth < 640) return 1; // Mobile
    if (window.innerWidth < 768) return 2; // Small tablets
    if (window.innerWidth < 1024) return 3; // Tablets
    return 4; // Desktop
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setItemsPerSlide(getItemsPerSlide());
    };

    handleResize(); // Initialize on first render
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getItemsPerSlide, setItemsPerSlide]);

  // Auto-play slider
  useEffect(() => {
    if (totalItems === 0 || isTouching || isDragging) return;

    const startAutoplay = () => {
      intervalRef.current = setInterval(() => {
        nextSlide(totalItems);
      }, autoPlayInterval);
    };

    startAutoplay();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [totalItems, isTouching, isDragging, nextSlide, autoPlayInterval]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setIsTouching(true);
      setTouchStart(e.targetTouches[0].clientX);
      setTouchEnd(e.targetTouches[0].clientX);
      resetDrag();
    },
    [setIsTouching, setTouchStart, setTouchEnd, resetDrag]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (totalItems === 0) return;

      setTouchEnd(e.targetTouches[0].clientX);
      const diff = e.targetTouches[0].clientX - touchStart;

      if (Math.abs(diff) > 10) {
        setHasMoved(true);
      }

      const containerWidth = sliderRef.current?.clientWidth || 1;
      const itemWidth = containerWidth / itemsPerSlide;
      const percentPerPixel = 100 / (totalItems * itemWidth);

      setDragOffset(diff * percentPerPixel);
    },
    [
      totalItems,
      touchStart,
      itemsPerSlide,
      setTouchEnd,
      setHasMoved,
      setDragOffset,
    ]
  );

  const handleTouchEnd = useCallback(() => {
    setIsTouching(false);
    if (totalItems === 0) return;

    const threshold = 50;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        nextSlide(totalItems);
      } else {
        prevSlide(totalItems);
      }
    }

    resetDrag();
  }, [
    totalItems,
    touchStart,
    touchEnd,
    nextSlide,
    prevSlide,
    setIsTouching,
    resetDrag,
  ]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      setDragStart(e.clientX);
      setDragEnd(e.clientX);
      resetDrag();
    },
    [setIsDragging, setDragStart, setDragEnd, resetDrag]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || totalItems === 0) return;

      setDragEnd(e.clientX);
      const diff = e.clientX - dragStart;

      if (Math.abs(diff) > 10) {
        setHasMoved(true);
      }

      const containerWidth = sliderRef.current?.clientWidth || 1;
      const itemWidth = containerWidth / itemsPerSlide;
      const percentPerPixel = 100 / (totalItems * itemWidth);

      setDragOffset(diff * percentPerPixel);
    },
    [
      isDragging,
      totalItems,
      dragStart,
      itemsPerSlide,
      setDragEnd,
      setHasMoved,
      setDragOffset,
    ]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDragging || totalItems === 0) return;

    const threshold = 50;
    const diff = dragStart - dragEnd;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        nextSlide(totalItems);
      } else {
        prevSlide(totalItems);
      }
    }

    setIsDragging(false);
    resetDrag();
  }, [
    isDragging,
    totalItems,
    dragStart,
    dragEnd,
    nextSlide,
    prevSlide,
    setIsDragging,
    resetDrag,
  ]);

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      resetDrag();
    }
  }, [isDragging, setIsDragging, resetDrag]);

  return {
    sliderRef,
    currentIndex,
    itemsPerSlide,
    dragOffset,
    hasMoved,
    nextSlide: () => nextSlide(totalItems),
    prevSlide: () => prevSlide(totalItems),
    goToSlide: setCurrentIndex,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
  };
};
