import { create } from "zustand";

type CarouselState = {
  currentIndex: number;
  itemsPerSlide: number;
  isDragging: boolean;
  isTouching: boolean;
  dragOffset: number;
  hasMoved: boolean;
  touchStart: number;
  touchEnd: number;
  dragStart: number;
  dragEnd: number;

  setCurrentIndex: (index: number) => void;
  setItemsPerSlide: (count: number) => void;
  setIsDragging: (isDragging: boolean) => void;
  setIsTouching: (isTouching: boolean) => void;
  setDragOffset: (offset: number) => void;
  setHasMoved: (hasMoved: boolean) => void;
  setTouchStart: (pos: number) => void;
  setTouchEnd: (pos: number) => void;
  setDragStart: (pos: number) => void;
  setDragEnd: (pos: number) => void;
  nextSlide: (totalItems: number) => void;
  prevSlide: (totalItems: number) => void;
  resetDrag: () => void;
};

export const useCarouselStore = create<CarouselState>((set) => ({
  currentIndex: 0,
  itemsPerSlide: 4,
  isDragging: false,
  isTouching: false,
  dragOffset: 0,
  hasMoved: false,
  touchStart: 0,
  touchEnd: 0,
  dragStart: 0,
  dragEnd: 0,

  setCurrentIndex: (index) => set({ currentIndex: index }),
  setItemsPerSlide: (count) => set({ itemsPerSlide: count }),
  setIsDragging: (isDragging) => set({ isDragging }),
  setIsTouching: (isTouching) => set({ isTouching }),
  setDragOffset: (offset) => set({ dragOffset: offset }),
  setHasMoved: (hasMoved) => set({ hasMoved }),
  setTouchStart: (pos) => set({ touchStart: pos }),
  setTouchEnd: (pos) => set({ touchEnd: pos }),
  setDragStart: (pos) => set({ dragStart: pos }),
  setDragEnd: (pos) => set({ dragEnd: pos }),

  nextSlide: (totalItems) =>
    set((state) => ({
      currentIndex:
        state.currentIndex + state.itemsPerSlide >= totalItems
          ? 0
          : state.currentIndex + state.itemsPerSlide,
    })),

  prevSlide: (totalItems) =>
    set((state) => ({
      currentIndex:
        state.currentIndex - state.itemsPerSlide < 0
          ? Math.max(0, totalItems - state.itemsPerSlide)
          : state.currentIndex - state.itemsPerSlide,
    })),

  resetDrag: () => set({ dragOffset: 0, hasMoved: false }),
}));
