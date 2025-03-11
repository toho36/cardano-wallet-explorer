import { z } from "zod";

export interface BlockfrostAssetMetadata {
  name?: string;
  image?: string | { [key: string]: string };
  collection?: string;
  [key: string]: unknown;
}

export interface BlockfrostAssetInfo {
  asset_name?: string;
  policy_id?: string;
  fingerprint?: string;
  initial_mint_tx_hash?: string;
  onchain_metadata?: BlockfrostAssetMetadata;
  metadata?: BlockfrostAssetMetadata;
  quantity?: string;
}

export interface BlockfrostAmount {
  unit: string;
  quantity: string;
}

export interface BlockfrostUtxoInput {
  address: string;
  amount: BlockfrostAmount[];
}

export interface BlockfrostUtxoOutput {
  address: string;
  amount: BlockfrostAmount[];
}

export interface BlockfrostUtxos {
  inputs: BlockfrostUtxoInput[];
  outputs: BlockfrostUtxoOutput[];
}

export interface BlockfrostTransaction {
  tx_hash: string;
  block_height: string;
}

export interface BlockfrostTransactionDetails {
  block_time: number;
  fees?: string;
}

export interface BlockfrostAddressInfo {
  address?: string;
  amount?: BlockfrostAmount[];
  stake_address?: string;
  type?: string;
  script?: boolean;
}

export interface BlockfrostAddressExtended {
  amount?: BlockfrostAmount[];
}

export interface BlockfrostStakePool {
  pool_id: string;
  hex: string;
  vrf_key?: string;
  blocks_minted?: number;
  blocks_epoch?: number;
  live_stake?: string;
  live_size?: number;
  live_saturation?: number;
  live_delegators?: number;
  active_stake?: string;
  active_size?: number;
  declared_pledge?: string;
  live_pledge?: string;
  margin_cost?: number;
  fixed_cost?: string;
  reward_account?: string;
  owners?: string[];
  registration?: string[];
  retirement?: string[];
  metadata?: {
    url?: string;
    hash?: string;
    ticker?: string;
    name?: string;
    description?: string;
    homepage?: string;
  };
}

export interface BlockfrostAddressStake {
  stake_address: string;
  active: boolean;
  active_epoch?: number;
  controlled_amount?: string;
  rewards_sum?: string;
  withdrawals_sum?: string;
  reserves_sum?: string;
  treasury_sum?: string;
  withdrawable_amount?: string;
  pool_id?: string;
}

export const BlockfrostAssetMetadataSchema = z
  .object({
    name: z.string().optional(),
    image: z.union([z.string(), z.record(z.string())]).optional(),
    collection: z.string().optional(),
  })
  .catchall(z.unknown());

export const BlockfrostAssetInfoSchema = z
  .object({
    asset_name: z.string().optional(),
    policy_id: z.string().optional(),
    fingerprint: z.string().optional(),
    initial_mint_tx_hash: z.string().optional(),
    onchain_metadata: BlockfrostAssetMetadataSchema.optional(),
    metadata: BlockfrostAssetMetadataSchema.optional(),
    quantity: z.string().optional(),
  })
  .catchall(z.unknown());

export const BlockfrostAmountSchema = z.object({
  unit: z.string(),
  quantity: z.string(),
});

export const BlockfrostUtxoInputSchema = z.object({
  address: z.string(),
  amount: z.array(BlockfrostAmountSchema),
});

export const BlockfrostUtxoOutputSchema = z.object({
  address: z.string(),
  amount: z.array(BlockfrostAmountSchema),
});

export const BlockfrostUtxosSchema = z.object({
  inputs: z.array(BlockfrostUtxoInputSchema),
  outputs: z.array(BlockfrostUtxoOutputSchema),
});

export const BlockfrostTransactionSchema = z.object({
  tx_hash: z.string(),
  block_height: z.string(),
});

export const BlockfrostTransactionDetailsSchema = z.object({
  block_time: z.number(),
  fees: z.string().optional(),
});

export const BlockfrostAddressInfoSchema = z.object({
  address: z.string().optional(),
  amount: z.array(BlockfrostAmountSchema).optional(),
  stake_address: z.string().optional(),
  type: z.string().optional(),
  script: z.boolean().optional(),
});

export const BlockfrostAddressExtendedSchema = z.object({
  amount: z.array(BlockfrostAmountSchema).optional(),
});

export const BlockfrostStakePoolMetadataSchema = z.object({
  url: z.string().optional(),
  hash: z.string().optional(),
  ticker: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  homepage: z.string().optional(),
});

export const BlockfrostStakePoolSchema = z.object({
  pool_id: z.string(),
  hex: z.string(),
  vrf_key: z.string().optional(),
  blocks_minted: z.number().optional(),
  blocks_epoch: z.number().optional(),
  live_stake: z.string().optional(),
  live_size: z.number().optional(),
  live_saturation: z.number().optional(),
  live_delegators: z.number().optional(),
  active_stake: z.string().optional(),
  active_size: z.number().optional(),
  declared_pledge: z.string().optional(),
  live_pledge: z.string().optional(),
  margin_cost: z.number().optional(),
  fixed_cost: z.string().optional(),
  reward_account: z.string().optional(),
  owners: z.array(z.string()).optional(),
  registration: z.array(z.string()).optional(),
  retirement: z.array(z.string()).optional(),
  metadata: BlockfrostStakePoolMetadataSchema.optional(),
});

export const BlockfrostAddressStakeSchema = z.object({
  stake_address: z.string(),
  active: z.boolean(),
  active_epoch: z.number().optional(),
  controlled_amount: z.string().optional(),
  rewards_sum: z.string().optional(),
  withdrawals_sum: z.string().optional(),
  reserves_sum: z.string().optional(),
  treasury_sum: z.string().optional(),
  withdrawable_amount: z.string().optional(),
  pool_id: z.string().optional(),
});

export type BlockfrostAssetMetadataZod = z.infer<
  typeof BlockfrostAssetMetadataSchema
>;
export type BlockfrostAssetInfoZod = z.infer<typeof BlockfrostAssetInfoSchema>;
export type BlockfrostAmountZod = z.infer<typeof BlockfrostAmountSchema>;
export type BlockfrostUtxoInputZod = z.infer<typeof BlockfrostUtxoInputSchema>;
export type BlockfrostUtxoOutputZod = z.infer<
  typeof BlockfrostUtxoOutputSchema
>;
export type BlockfrostUtxosZod = z.infer<typeof BlockfrostUtxosSchema>;
export type BlockfrostTransactionZod = z.infer<
  typeof BlockfrostTransactionSchema
>;
export type BlockfrostTransactionDetailsZod = z.infer<
  typeof BlockfrostTransactionDetailsSchema
>;
export type BlockfrostAddressInfoZod = z.infer<
  typeof BlockfrostAddressInfoSchema
>;
export type BlockfrostAddressExtendedZod = z.infer<
  typeof BlockfrostAddressExtendedSchema
>;
export type BlockfrostStakePoolMetadataZod = z.infer<
  typeof BlockfrostStakePoolMetadataSchema
>;
export type BlockfrostStakePoolZod = z.infer<typeof BlockfrostStakePoolSchema>;
export type BlockfrostAddressStakeZod = z.infer<
  typeof BlockfrostAddressStakeSchema
>;
