"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Share2, ExternalLink } from "lucide-react";
import { fetchNFTData } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

// Type definitions for NFT metadata fields
interface NFTLinks {
  discord?: string;
  twitter?: string;
  website?: string;
  [key: string]: string | undefined;
}

export default function NFTDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assetId = decodeURIComponent(params.asset as string);
  const [shareTooltip, setShareTooltip] = useState(false);

  // Fetch NFT data directly by asset ID
  const {
    data: nft,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["nft", assetId],
    queryFn: () => fetchNFTData(assetId),
    retry: 2,
  });

  const handleBack = () => {
    router.back();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: nft?.name || "NFT Details",
          text: `Check out this NFT: ${nft?.name}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Failed to share:", err);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      setShareTooltip(true);
      setTimeout(() => setShareTooltip(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen p-4">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading NFT data...</span>
        </div>
      </div>
    );
  }

  if (isError || !nft) {
    return (
      <div className="flex flex-col min-h-screen p-4">
        <Button
          variant="ghost"
          className="w-fit mb-4 flex items-center gap-1"
          onClick={handleBack}
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">
              {isError ? `Error: ${error.message}` : "NFT not found"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen p-4">
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10 py-2">
        <Button
          variant="ghost"
          className="flex items-center gap-1"
          onClick={handleBack}
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <div className="relative">
          <Button
            variant="outline"
            size="icon"
            onClick={handleShare}
            aria-label="Share NFT"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          {shareTooltip && (
            <div className="absolute right-0 top-full mt-2 px-3 py-1 bg-black text-white text-xs rounded shadow-lg whitespace-nowrap">
              Link copied to clipboard!
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
        <div className="w-full">
          <div className="bg-gray-100 rounded-lg overflow-hidden shadow-md w-full">
            {nft.image ? (
              <div className="relative aspect-square">
                <Image
                  src={nft.image}
                  alt={nft.name || "NFT"}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    if (target.parentElement) {
                      target.parentElement.innerHTML =
                        '<div class="flex items-center justify-center h-full w-full text-gray-500">Image not available</div>';
                    }
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center aspect-square text-gray-500">
                No image available
              </div>
            )}
          </div>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">
                {nft.name || "Unnamed NFT"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {nft.collection && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Collection
                  </h3>
                  <p>{nft.collection}</p>
                </div>
              )}

              {nft.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Description
                  </h3>
                  <p className="mt-1">{nft.description}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-500">Asset ID</h3>
                <p className="mt-1 break-all text-xs md:text-sm font-mono">
                  {nft.asset}
                </p>
              </div>

              {nft.policyId && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Policy ID
                  </h3>
                  <p className="mt-1 break-all text-xs md:text-sm font-mono">
                    {nft.policyId}
                  </p>
                </div>
              )}

              {nft.fingerprint && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Fingerprint
                  </h3>
                  <p className="mt-1 break-all text-xs md:text-sm font-mono">
                    {nft.fingerprint}
                  </p>
                </div>
              )}

              {nft.initialMintTxHash && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Mint Transaction
                  </h3>
                  <a
                    href={`https://preprod.cardanoscan.io/transaction/${nft.initialMintTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                  >
                    View on explorer <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              {/* Display Social Links if they exist */}
              {nft.metadata && "links" in nft.metadata && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Links</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(nft.metadata.links as NFTLinks)?.discord && (
                      <a
                        href={(nft.metadata.links as NFTLinks).discord}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm"
                      >
                        Discord <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {(nft.metadata.links as NFTLinks)?.twitter && (
                      <a
                        href={(nft.metadata.links as NFTLinks).twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm"
                      >
                        Twitter <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {(nft.metadata.links as NFTLinks)?.website && (
                      <a
                        href={(nft.metadata.links as NFTLinks).website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm"
                      >
                        Website <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
