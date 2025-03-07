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
  amount?: BlockfrostAmount[];
}

export interface BlockfrostAddressExtended {
  amount?: BlockfrostAmount[];
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
  amount: z.array(BlockfrostAmountSchema).optional(),
});

export const BlockfrostAddressExtendedSchema = z.object({
  amount: z.array(BlockfrostAmountSchema).optional(),
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
