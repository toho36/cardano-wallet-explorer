"use client";

import { NFT } from "@/types/wallet";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface NFTCardProps {
  nft: NFT;
  walletAddress?: string;
}

// Helper function to ensure image URLs are properly formatted
const getFormattedImageUrl = (
  imageUrl: string | null | undefined
): string | null => {
  if (!imageUrl || imageUrl.trim() === "") return null;

  // Detect data URLs (especially SVG placeholders) and treat them as no image
  if (imageUrl.startsWith("data:")) return null;

  // Check if it's already a valid URL
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // Check if it's an IPFS CID or path
  if (imageUrl.startsWith("ipfs://")) {
    // Replace ipfs:// with a gateway URL
    return imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
  }

  // Handle bare IPFS CIDs or paths that don't have a protocol
  if (imageUrl.startsWith("Qm") || imageUrl.includes("/Qm")) {
    return `https://ipfs.io/ipfs/${imageUrl}`;
  }

  // If it's a relative path, make sure it starts with /
  if (!imageUrl.startsWith("/")) {
    return `/${imageUrl}`;
  }

  return imageUrl;
};

export function NFTCard({ nft }: NFTCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/nft/${encodeURIComponent(nft.asset)}`);
  };

  const imageUrl = getFormattedImageUrl(nft.image);

  return (
    <div
      className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]"
      onClick={handleClick}
    >
      {imageUrl ? (
        <div className="aspect-square overflow-hidden bg-gray-100 relative">
          <Image
            src={imageUrl}
            alt={nft.name || "NFT"}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
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
        </div>
      ) : (
        <div className="aspect-square overflow-hidden bg-gray-100 flex items-center justify-center text-gray-500">
          No Image
        </div>
      )}
      <div className="p-3">
        <h3 className="font-medium truncate">{nft.name || "Unnamed NFT"}</h3>
        {nft.collection && (
          <p className="text-sm text-gray-500 truncate">{nft.collection}</p>
        )}
      </div>
    </div>
  );
}
