import { z } from "zod";

export const NFTSchema = z.object({
  asset: z.string(),
  name: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  collection: z.string().nullable().optional(),
  policyId: z.string().nullable().optional(),
  assetName: z.string().nullable().optional(),
  fingerprint: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  initialMintTxHash: z.string().nullable().optional(),
  metadata: z.any().optional(),
});

export type NFT = z.infer<typeof NFTSchema>;

export const NFTArraySchema = z.array(NFTSchema);
