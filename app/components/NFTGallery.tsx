import { NFT } from '@/types/wallet';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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

interface NFTCardProps {
  nft: NFT;
  walletAddress: string;
}

function NFTCard({ nft }: NFTCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/NFTDetailPage/${encodeURIComponent(nft.asset)}`);
  };

  return (
    <div
      className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]"
      onClick={handleClick}
    >
      {nft.image ? (
        <div className="aspect-square overflow-hidden bg-gray-100 relative">
          <Image
            src={nft.image}
            alt={nft.name || 'NFT'}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
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
        </div>
      ) : (
        <div className="aspect-square overflow-hidden bg-gray-100 flex items-center justify-center text-gray-500">
          No Image
        </div>
      )}
      <div className="p-3">
        <h3 className="font-medium truncate">{nft.name || 'Unnamed NFT'}</h3>
        {nft.collection && (
          <p className="text-sm text-gray-500 truncate">{nft.collection}</p>
        )}
      </div>
    </div>
  );
}
