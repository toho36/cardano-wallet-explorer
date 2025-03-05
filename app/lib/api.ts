import {
  BlockfrostAssetMetadata,
  BlockfrostAssetInfo,
  BlockfrostAmount,
  BlockfrostTransaction,
  BlockfrostTransactionDetails,
  BlockfrostUtxos,
  BlockfrostAddressInfo,
  BlockfrostAddressExtended,
} from '../types/blockfrost';

import { Transaction, NFT, WalletData } from '../types/wallet';

// Blockfrost API configuration
const API_URL = process.env.NEXT_PUBLIC_BLOCKFROST_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY;

// Helper function for Blockfrost API calls
export const blockfrostFetch = async <T>(endpoint: string): Promise<T> => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: new Headers({
      project_id: API_KEY || '',
      'Content-Type': 'application/json',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(
      error?.message || `API request failed with status ${response.status}`
    );
  }

  return response.json();
};

// Function to extract image URL from metadata
export const extractImageUrl = (metadata: BlockfrostAssetMetadata): string => {
  try {
    // Case 1: No image property
    if (!metadata.image) {
      return '/images/no-image-placeholder.png'; // Local placeholder image
    }

    // Case 2: Image is a string
    if (typeof metadata.image === 'string') {
      // Handle IPFS protocol
      if (metadata.image.startsWith('ipfs://')) {
        return `https://ipfs.io/ipfs/${metadata.image.replace('ipfs://', '')}`;
      }
      return metadata.image;
    }

    // Case 3: Image is an object (might have src, uri, or other properties)
    if (typeof metadata.image === 'object') {
      const possibleKeys = ['src', 'uri', 'url', 'link'];
      for (const key of possibleKeys) {
        if (metadata.image[key] && typeof metadata.image[key] === 'string') {
          const imgSrc = metadata.image[key];
          // Handle IPFS protocol
          if (imgSrc.startsWith('ipfs://')) {
            return `https://ipfs.io/ipfs/${imgSrc.replace('ipfs://', '')}`;
          }
          return imgSrc;
        }
      }
    }

    // Fallback
    return '/images/no-image-placeholder.png'; // Local placeholder image
  } catch (e) {
    console.error('Error parsing image metadata:', e);
    return '/images/no-image-placeholder.png'; // Local placeholder image
  }
};

// Function to fetch wallet data from Blockfrost
export async function fetchWalletData(address: string): Promise<WalletData> {
  try {
    // Fetch address info (includes balance)
    const addressInfo = await blockfrostFetch<BlockfrostAddressInfo>(
      `/addresses/${address}`
    );

    // Fetch assets owned by the address
    const assets = await blockfrostFetch<BlockfrostAddressExtended>(
      `/addresses/${address}/extended`
    );

    // Fetch transactions for the address (limited to recent 20)
    const txs = await blockfrostFetch<BlockfrostTransaction[]>(
      `/addresses/${address}/transactions?count=20`
    );

    // Process transactions to get more details
    const transactions = await Promise.all(
      txs.map(async (tx) => {
        const txDetails = await blockfrostFetch<BlockfrostTransactionDetails>(
          `/txs/${tx.tx_hash}`
        );
        return processTransaction(tx, txDetails, address);
      })
    );

    // Process NFTs from assets
    const nfts = await processNFTs(assets.amount || []);

    return {
      address,
      balance: {
        lovelace: parseInt(
          addressInfo.amount?.find((a) => a.unit === 'lovelace')?.quantity ||
            '0'
        ),
      },
      assets: assets.amount || [],
      nfts,
      transactions,
    };
  } catch (error) {
    console.error('Error fetching wallet data:', error);
    throw error;
  }
}

// Helper function to process transaction data
async function processTransaction(
  tx: BlockfrostTransaction,
  txDetails: BlockfrostTransactionDetails,
  address: string
): Promise<Transaction> {
  // Calculate net amount for this address (simplified)
  let amount = 0;
  try {
    const utxos = await blockfrostFetch<BlockfrostUtxos>(
      `/txs/${tx.tx_hash}/utxos`
    );

    // Calculate balance change for this address
    utxos.inputs.forEach((input) => {
      if (input.address === address) {
        const lovelaceAmount = input.amount.find((a) => a.unit === 'lovelace');
        if (lovelaceAmount) {
          amount -= parseInt(lovelaceAmount.quantity);
        }
      }
    });

    utxos.outputs.forEach((output) => {
      if (output.address === address) {
        const lovelaceAmount = output.amount.find((a) => a.unit === 'lovelace');
        if (lovelaceAmount) {
          amount += parseInt(lovelaceAmount.quantity);
        }
      }
    });
  } catch (error) {
    // If we can't get detailed transaction info, just skip amount
    console.error('Error processing transaction:', error);
  }

  return {
    txHash: tx.tx_hash,
    timestamp: txDetails.block_time,
    block: tx.block_height,
    amount: amount,
    fee: txDetails.fees ? parseInt(txDetails.fees) : undefined,
  };
}

// Helper function to process NFTs
async function processNFTs(assets: BlockfrostAmount[]): Promise<NFT[]> {
  const nfts: NFT[] = [];

  // Filter for potential NFTs (non-lovelace with quantity 1)
  const potentialNFTs = assets.filter(
    (asset) => asset.unit !== 'lovelace' && asset.quantity === '1'
  );

  // Fetch metadata for each potential NFT
  for (const asset of potentialNFTs) {
    try {
      const assetInfo = await blockfrostFetch<BlockfrostAssetInfo>(
        `/assets/${asset.unit}`
      );
      const metadata = assetInfo.onchain_metadata || assetInfo.metadata;

      if (metadata) {
        const imageUrl = extractImageUrl(metadata);
        const assetName =
          metadata.name || assetInfo.asset_name || 'Unknown Asset';

        nfts.push({
          asset: asset.unit,
          name: assetName,
          image: imageUrl,
          collection:
            metadata.collection ||
            (assetInfo.policy_id
              ? assetInfo.policy_id.slice(0, 10)
              : undefined),
          metadata: metadata,
        });
      }
    } catch (error) {
      // Skip assets that can't be processed
      console.error(`Failed to fetch metadata for asset ${asset.unit}`, error);
    }

    // Limit to 50 NFTs to prevent too many requests
    if (nfts.length >= 50) break;
  }

  return nfts;
}
