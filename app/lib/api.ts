import axios from "axios";
import { z } from "zod";
import {
  BlockfrostAssetMetadata,
  BlockfrostAssetInfo,
  BlockfrostAmount,
  BlockfrostTransaction,
  BlockfrostTransactionDetails,
  BlockfrostUtxos,
  BlockfrostAddressInfo,
  BlockfrostAddressExtended,
  BlockfrostAddressStake,
  BlockfrostStakePool,
} from "../types/blockfrost";

import {
  Transaction,
  NFT,
  WalletData,
  TransactionDetails,
} from "../types/wallet";

// Blockfrost API configuration
const API_URL = process.env.NEXT_PUBLIC_BLOCKFROST_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY;

// Helper function for Blockfrost API calls using Axios
export const blockfrostFetch = async <T>(endpoint: string): Promise<T> => {
  try {
    const response = await axios.get<T>(`${API_URL}${endpoint}`, {
      headers: {
        project_id: API_KEY || "",
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data?.message ||
          `API request failed with status ${error.response.status}`
      );
    }
    throw error;
  }
};

// Add a new validation function that doesn't affect the main API calls
export const validateData = <T>(data: T, schema: z.ZodType<T>): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.warn("Validation warning:", error.issues);
    }
    // Return the original data even if validation fails
    return data;
  }
};

// Function to extract image URL from metadata
export const extractImageUrl = (
  metadata: BlockfrostAssetMetadata
): string | null => {
  try {
    // Case 1: No image property
    if (!metadata.image) {
      // Return null instead of placeholder for NFTs without images
      return null;
    }

    // Case 2: Image is a string
    if (typeof metadata.image === "string") {
      // Handle IPFS protocol
      if (metadata.image.startsWith("ipfs://")) {
        return `https://ipfs.io/ipfs/${metadata.image.replace("ipfs://", "")}`;
      }
      return metadata.image;
    }

    // Case 3: Image is an array (common in some Cardano NFTs)
    if (Array.isArray(metadata.image)) {
      // Join all array elements to form the complete path
      const joinedPath = metadata.image.join("");

      // Check if the joined path contains an IPFS URL
      if (joinedPath.includes("ipfs://")) {
        return `https://ipfs.io/ipfs/${joinedPath.replace("ipfs://", "")}`;
      }

      // If it's already a full URL, use it directly
      if (joinedPath.startsWith("http")) {
        return joinedPath;
      }

      // Handle case where array elements need to be joined for IPFS path
      const firstElement = metadata.image[0];
      if (
        typeof firstElement === "string" &&
        firstElement.startsWith("ipfs://")
      ) {
        // This handles the special case where the IPFS URL is split across array elements
        return `https://ipfs.io/ipfs/${metadata.image
          .join("")
          .replace("ipfs://", "")}`;
      }

      return joinedPath;
    }

    // Case 4: Image is an object (might have src, uri, or other properties)
    if (typeof metadata.image === "object") {
      const possibleKeys = ["src", "uri", "url", "link"];
      for (const key of possibleKeys) {
        if (metadata.image[key] && typeof metadata.image[key] === "string") {
          const imgSrc = metadata.image[key];
          // Handle IPFS protocol
          if (imgSrc.startsWith("ipfs://")) {
            return `https://ipfs.io/ipfs/${imgSrc.replace("ipfs://", "")}`;
          }
          return imgSrc;
        }
      }
    }

    // Return null instead of a fallback image
    return null;
  } catch (e) {
    console.error("Error extracting image URL:", e);
    return null;
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

    // Fetch delegation information
    let delegation: {
      active: boolean;
      stake_address?: string;
      pool_id?: string;
      pool_name?: string;
      pool_ticker?: string;
      rewards_sum?: string;
      withdrawable_amount?: string;
    } = {
      active: false,
    };

    try {
      // Get the stake address directly from the address info
      const stake_address = addressInfo.stake_address;

      if (stake_address) {
        // Fetch account info for the stake address
        const accountInfo = await blockfrostFetch<BlockfrostAddressStake>(
          `/accounts/${stake_address}`
        );

        if (accountInfo.active && accountInfo.pool_id) {
          // Fetch pool details
          const poolInfo = await blockfrostFetch<BlockfrostStakePool>(
            `/pools/${accountInfo.pool_id}`
          );

          // Get pool metadata if it's available
          let poolName = "Unknown Pool";
          let poolTicker = undefined;

          if (poolInfo.metadata) {
            poolName = poolInfo.metadata.name || poolName;
            poolTicker = poolInfo.metadata.ticker;
          } else {
            // Attempt to fetch pool metadata separately
            try {
              interface PoolMetadata {
                name?: string;
                ticker?: string;
                description?: string;
                homepage?: string;
              }

              const poolMetadata = await blockfrostFetch<PoolMetadata>(
                `/pools/${accountInfo.pool_id}/metadata`
              );
              if (poolMetadata) {
                poolName = poolMetadata.name || poolName;
                poolTicker = poolMetadata.ticker;
              }
            } catch (metadataError) {
              console.warn("Could not fetch pool metadata:", metadataError);
            }
          }

          delegation = {
            active: true,
            stake_address,
            pool_id: accountInfo.pool_id,
            pool_name: poolName,
            pool_ticker: poolTicker,
            rewards_sum: accountInfo.rewards_sum,
            withdrawable_amount: accountInfo.withdrawable_amount,
          };
        } else {
          // Wallet has a stake address but is not delegated or not active
          delegation = {
            active: !!accountInfo.active,
            stake_address,
          };
        }
      }
    } catch (error) {
      console.error("Error fetching delegation info:", error);
      // Default to not delegated if there's an error
      delegation = {
        active: false,
      };
    }

    return {
      address,
      balance: {
        lovelace: parseInt(
          addressInfo.amount?.find((a) => a.unit === "lovelace")?.quantity ||
            "0"
        ),
      },
      assets: assets.amount || [],
      nfts,
      transactions,
      delegation,
    };
  } catch (error) {
    console.error("Error fetching wallet data:", error);
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
        const lovelaceAmount = input.amount.find((a) => a.unit === "lovelace");
        if (lovelaceAmount) {
          amount -= parseInt(lovelaceAmount.quantity);
        }
      }
    });

    utxos.outputs.forEach((output) => {
      if (output.address === address) {
        const lovelaceAmount = output.amount.find((a) => a.unit === "lovelace");
        if (lovelaceAmount) {
          amount += parseInt(lovelaceAmount.quantity);
        }
      }
    });
  } catch (error) {
    // If we can't get detailed transaction info, just skip amount
    console.error("Error processing transaction:", error);
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

  // Filter out lovelace (ADA)
  const nonLovelaceAssets = assets.filter((asset) => asset.unit !== "lovelace");

  // Process each non-lovelace asset
  for (const asset of nonLovelaceAssets) {
    try {
      const assetInfo = await blockfrostFetch<BlockfrostAssetInfo>(
        `/assets/${asset.unit}`
      );

      // Check if this is likely an NFT (quantity 1 with metadata)
      const metadata = assetInfo.onchain_metadata || assetInfo.metadata;
      const isLikelyNFT = asset.quantity === "1" && !!metadata;

      if (isLikelyNFT) {
        const imageUrl = extractImageUrl(metadata);
        const assetName =
          metadata.name || assetInfo.asset_name || "Unknown Asset";

        nfts.push({
          asset: asset.unit,
          name: assetName,
          image: imageUrl,
          collection:
            metadata.collection ||
            (assetInfo.policy_id
              ? assetInfo.policy_id.slice(0, 10)
              : undefined),
          policyId: assetInfo.policy_id,
          assetName: assetInfo.asset_name,
          fingerprint: assetInfo.fingerprint,
          description: metadata.description as string,
          initialMintTxHash: assetInfo.initial_mint_tx_hash,
          metadata: metadata,
        });
      }
      // Assets that aren't NFTs simply won't be added to the nfts array
    } catch (error) {
      console.error(`Failed to fetch metadata for asset ${asset.unit}`, error);
    }

    // Limit to 50 NFTs to prevent too many requests
    if (nfts.length >= 50) break;
  }

  return nfts;
}

// Function to fetch a single NFT by asset ID
export async function fetchNFTData(assetId: string): Promise<NFT | null> {
  try {
    // Make sure we're using the correct format for the API call
    // assetId should already be formatted as policyId + hexEncodedAssetName
    const assetInfo = await blockfrostFetch<BlockfrostAssetInfo>(
      `/assets/${assetId}`
    );

    if (!assetInfo) {
      console.error("Asset not found:", assetId);
      return null;
    }

    // Fetch address that owns this asset
    let owner = null;
    try {
      const addresses = await blockfrostFetch<{ address: string }[]>(
        `/assets/${assetId}/addresses`
      );

      if (addresses && addresses.length > 0) {
        owner = addresses[0].address;
      }
    } catch (ownerError) {
      console.error("Failed to fetch asset owner:", ownerError);
    }

    // Process the metadata (onchain_metadata has priority over metadata)
    const metadata = assetInfo.onchain_metadata || assetInfo.metadata;

    if (metadata) {
      const imageUrl = extractImageUrl(metadata);
      const assetName =
        metadata.name || assetInfo.asset_name || "Unknown Asset";

      return {
        asset: assetId,
        name: assetName,
        image: imageUrl,
        collection:
          metadata.collection ||
          (assetInfo.policy_id ? assetInfo.policy_id.slice(0, 10) : undefined),
        policyId: assetInfo.policy_id,
        assetName: assetInfo.asset_name,
        fingerprint: assetInfo.fingerprint,
        description: metadata.description as string,
        initialMintTxHash: assetInfo.initial_mint_tx_hash,
        metadata: metadata,
        owner: owner || undefined,
      };
    }
    return null;
  } catch (error) {
    console.error(`Failed to fetch NFT data for asset ${assetId}`, error);
    return null;
  }
}

export async function fetchFeaturedNFTs(limit: number = 16): Promise<NFT[]> {
  try {
    // Get a larger number of assets to ensure we find enough with images
    const searchLimit = limit * 3; // Fetch more assets to ensure we get enough with images

    // Fetch some recent or popular assets from Blockfrost
    const assets = await blockfrostFetch<{ asset: string }[]>(
      `/assets?order=desc&count=${searchLimit}`
    );

    const nfts: NFT[] = [];

    // Process each asset to determine if it's an NFT
    for (const assetItem of assets) {
      try {
        const assetInfo = await blockfrostFetch<BlockfrostAssetInfo>(
          `/assets/${assetItem.asset}`
        );

        // Check if this is likely an NFT
        const metadata = assetInfo.onchain_metadata || assetInfo.metadata;
        // For marketplace, we only want items with images
        if (metadata && assetInfo.quantity === "1") {
          const imageUrl = extractImageUrl(metadata);

          // Only add NFTs that have images
          if (imageUrl) {
            // Ensure name is always a non-null string
            const assetName =
              metadata.name || assetInfo.asset_name || "Unknown Asset";

            // Create NFT object matching your NFT type
            const nft: NFT = {
              asset: assetItem.asset,
              name: assetName,
              image: imageUrl,
              collection:
                metadata.collection ||
                (assetInfo.policy_id ? assetInfo.policy_id.slice(0, 10) : "") ||
                "",
              policyId: assetInfo.policy_id || "",
              assetName: assetInfo.asset_name || "",
              fingerprint: assetInfo.fingerprint || "",
              description: (metadata.description as string) || "",
              initialMintTxHash: assetInfo.initial_mint_tx_hash || "",
              metadata: metadata,
            };

            nfts.push(nft);
          }
        }
      } catch (error) {
        console.error(`Failed to process asset ${assetItem.asset}:`, error);
      }

      // Stop if we have enough NFTs with images (at least 12, or the specified limit)
      if (nfts.length >= Math.max(12, limit)) break;
    }

    return nfts;
  } catch (error) {
    console.error("Error fetching featured NFTs:", error);
    return [];
  }
}

// Function to fetch detailed transaction data
export async function fetchTransactionDetails(
  txHash: string
): Promise<TransactionDetails> {
  try {
    // Fetch transaction details
    const txData = await blockfrostFetch<TransactionDetails>(`/txs/${txHash}`);

    return txData;
  } catch (error) {
    console.error("Error fetching transaction details:", error);
    throw error;
  }
}
