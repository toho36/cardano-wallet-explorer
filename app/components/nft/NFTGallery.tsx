import { NFT } from "@/types/wallet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NFTCard } from "@/components/nft/NFTCard";

interface NFTGalleryProps {
  nfts: NFT[];
  walletAddress: string;
}

export function NFTGallery({ nfts, walletAddress }: NFTGalleryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>NFT Collection</CardTitle>
        <CardDescription>NFTs owned by this wallet</CardDescription>
      </CardHeader>
      <CardContent>
        {nfts && nfts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {nfts.map((nft, index) => (
              <NFTCard key={index} nft={nft} walletAddress={walletAddress} />
            ))}
          </div>
        ) : (
          <p className="text-center py-10 text-gray-500">
            No NFTs found in this wallet
          </p>
        )}
      </CardContent>
    </Card>
  );
}
