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
