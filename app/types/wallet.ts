import { z } from "zod";
import {
  BlockfrostAmountSchema,
  BlockfrostAssetMetadataSchema,
} from "./blockfrost";

export interface Asset {
  unit: string;
  quantity: string;
  name?: string;
  fingerprint?: string;
}

// Define your schemas
export const TransactionSchema = z.object({
  txHash: z.string(),
  timestamp: z.number(),
  block: z.string(),
  amount: z.number(),
  fee: z.number().optional(),
});

export const NFTSchema = z.object({
  asset: z.string(),
  name: z.string(),
  image: z.string().nullable(),
  collection: z.string().optional(),
  policyId: z.string().optional(),
  assetName: z.string().optional(),
  fingerprint: z.string().optional(),
  description: z.string().optional(),
  initialMintTxHash: z.string().optional(),
  metadata: BlockfrostAssetMetadataSchema,
});

export const WalletDataSchema = z.object({
  address: z.string(),
  balance: z.object({
    lovelace: z.number(),
  }),
  assets: z.array(BlockfrostAmountSchema),
  nfts: z.array(NFTSchema),
  transactions: z.array(TransactionSchema),
});

// Export types from schemas
export type Transaction = z.infer<typeof TransactionSchema>;
export type NFT = z.infer<typeof NFTSchema>;
export type WalletData = z.infer<typeof WalletDataSchema>;
