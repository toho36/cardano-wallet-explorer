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

// Schema for detailed transaction information when a transaction is selected
export const TransactionDetailsSchema = z.object({
  hash: z.string(),
  block: z.string(),
  block_height: z.number(),
  block_time: z.number(),
  slot: z.number(),
  output_amount: z.array(
    z.object({
      unit: z.string(),
      quantity: z.string(),
    })
  ),
  fees: z.string(),
  deposit: z.string(),
  size: z.number(),
  invalid_hereafter: z.string().nullable(),
  utxo_count: z.number(),
  valid_contract: z.boolean(),
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
  delegation: z
    .object({
      active: z.boolean(),
      stake_address: z.string().optional(),
      pool_id: z.string().optional(),
      pool_name: z.string().optional(),
      pool_ticker: z.string().optional(),
      rewards_sum: z.string().optional(),
      withdrawable_amount: z.string().optional(),
    })
    .optional(),
});

// Export types from schemas
export type Transaction = z.infer<typeof TransactionSchema>;
export type TransactionDetails = z.infer<typeof TransactionDetailsSchema>;
export type NFT = z.infer<typeof NFTSchema>;
export type WalletData = z.infer<typeof WalletDataSchema>;
