"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchFeaturedNFTs } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useCarousel } from "@/hooks/useCarousel";
import { Carousel } from "@/components/ui/carousel";
import { NFTCard } from "@/components/nft/NFTCard";

export function FeaturedNFTs() {
  // Set limit to at least 12 NFTs to display
  const limit = 24;

  const {
    data: nfts,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["featuredNFTs", limit],
    queryFn: () => fetchFeaturedNFTs(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const carouselProps = useCarousel(nfts?.length || 0);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32 sm:h-48">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2">Loading featured NFTs...</span>
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

  // Filter out NFTs without images - this should be redundant now since the API should
  // return only NFTs with images, but kept as a safety check
  const nftsWithImages = nfts.filter((nft) => nft.image);

  if (nftsWithImages.length === 0) {
    return (
      <div className="text-center py-6 bg-gray-50 rounded-lg">
        <p className="text-gray-500">
          No featured items with images available at the moment.
        </p>
      </div>
    );
  }

  // Create cards for all NFTs with images
  const nftCards = nftsWithImages.map((nft) => (
    <NFTCard key={nft.asset} nft={nft} />
  ));

  return (
    <div className="space-y-4">
      <Carousel
        items={nftCards}
        currentIndex={carouselProps.currentIndex}
        itemsPerSlide={carouselProps.itemsPerSlide}
        dragOffset={carouselProps.dragOffset}
        onPrev={carouselProps.prevSlide}
        onNext={carouselProps.nextSlide}
        onSelectPage={carouselProps.goToSlide}
        sliderRef={carouselProps.sliderRef}
        handleTouchStart={carouselProps.handleTouchStart}
        handleTouchMove={carouselProps.handleTouchMove}
        handleTouchEnd={carouselProps.handleTouchEnd}
        handleMouseDown={carouselProps.handleMouseDown}
        handleMouseMove={carouselProps.handleMouseMove}
        handleMouseUp={carouselProps.handleMouseUp}
        handleMouseLeave={carouselProps.handleMouseLeave}
      />
    </div>
  );
}
