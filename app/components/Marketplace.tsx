'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchFeaturedNFTs } from '@/lib/api';
import { NFT } from '@/types/wallet';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

export function Marketplace() {
  // State to track how many NFTs to display
  const [limit, setLimit] = useState(8); // Start with fewer items on mobile
  // Create state to store all loaded NFTs
  const [allNFTs, setAllNFTs] = useState<NFT[]>([]);

  const {
    data: newNFTs,
    isLoading,
    isError,
    isFetching,
  } = useQuery({
    queryKey: ['featuredNFTs', limit],
    queryFn: () => fetchFeaturedNFTs(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update allNFTs when new data comes in
  useEffect(() => {
    if (newNFTs && newNFTs.length > 0) {
      setAllNFTs((prev) => {
        // Get existing asset IDs to avoid duplicates
        const existingAssets = new Set(prev.map((nft) => nft.asset));

        // Filter out any NFTs we already have
        const uniqueNewNFTs = newNFTs.filter(
          (nft) => !existingAssets.has(nft.asset)
        );

        // Combine previous NFTs with new unique ones
        return [...prev, ...uniqueNewNFTs];
      });
    }
  }, [newNFTs]);

  const handleViewMore = () => {
    setLimit((prevLimit) => prevLimit + 8); // Load 8 more NFTs at a time
  };

  // Display loading state only on initial load
  if (isLoading && allNFTs.length === 0) {
    return (
      <div className="flex justify-center items-center h-32 sm:h-48">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2">Loading marketplace...</span>
      </div>
    );
  }

  if (isError && allNFTs.length === 0) {
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {allNFTs.map((nft) => (
          <NFTCard key={nft.asset} nft={nft} />
        ))}
      </div>

      <div className="flex justify-center mt-6">
        {isFetching ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm">Loading more...</span>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={handleViewMore}
            className="w-full sm:w-auto px-6"
            // disabled={newNFTs && newNFTs.length < limit} // Disable if no more NFTs to load
          >
            View More
          </Button>
        )}
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
            alt={nft.name || 'NFT'}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            className="object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
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
          {nft.name || 'Unnamed NFT'}
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
