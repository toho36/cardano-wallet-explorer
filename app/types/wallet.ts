export interface Asset {
  unit: string;
  quantity: string;
  name?: string;
  fingerprint?: string;
}

export interface Transaction {
  txHash: string;
  timestamp: number;
  block: string;
  amount?: number;
  fee?: number;
}

export interface NFT {
  asset: string;
  name: string;
  image: string;
  collection?: string;
  policyId?: string;
  assetName?: string;
  fingerprint?: string;
  description?: string;
  initialMintTxHash?: string;
  metadata?: unknown;
}

export interface WalletData {
  address: string;
  balance: {
    lovelace: number;
  };
  assets: Asset[];
  nfts: NFT[];
  transactions: Transaction[];
}
