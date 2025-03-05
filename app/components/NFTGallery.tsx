/* eslint-disable @next/next/no-img-element */
import { NFT } from '@/types/wallet';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface NFTGalleryProps {
  nfts: NFT[];
}

export function NFTGallery({ nfts }: NFTGalleryProps) {
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
              <NFTCard key={index} nft={nft} />
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
}

function NFTCard({ nft }: NFTCardProps) {
  return (
    <div className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {nft.image ? (
        <div className="aspect-square overflow-hidden bg-gray-100">
          <img
            src={nft.image}
            alt={nft.name || 'NFT'}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const textDiv = document.createElement('div');
                textDiv.className =
                  'w-full h-full flex items-center justify-center text-gray-500';
                textDiv.textContent = 'No Image';
                parent.appendChild(textDiv);
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
