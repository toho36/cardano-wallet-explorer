import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Transaction } from "@/types/wallet";
import { fetchTransactionDetails } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface TransactionItemProps {
  tx: Transaction;
}

// Helper function to format lovelace to ADA
const formatLovelace = (lovelace: string): string => {
  return (parseInt(lovelace) / 1000000).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
};

// Helper to format token unit to readable name
const formatTokenName = (unit: string): string => {
  if (unit === "lovelace") return "ADA";

  // For native tokens, try to extract readable name from hex
  if (unit.length > 56) {
    const assetNameHex = unit.slice(56);
    try {
      // Convert hex to text if possible
      const assetNameText = Buffer.from(assetNameHex, "hex").toString();
      // Check if the result contains printable ASCII characters
      if (/^[\x20-\x7E]+$/.test(assetNameText)) {
        return assetNameText;
      }
    } catch (error) {
      // Silently fail and use fallback
      console.error("Error formatting token name:", error);
    }
    return `Asset (${unit.slice(0, 8)}...)`;
  }

  return unit;
};

export function TransactionItem({ tx }: TransactionItemProps) {
  const [open, setOpen] = useState(false);

  // Only fetch details when dialog is opened
  const { data: txDetails, isLoading } = useQuery({
    queryKey: ["transaction", tx.txHash],
    queryFn: () => fetchTransactionDetails(tx.txHash),
    enabled: open,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const formattedDate = new Date(tx.timestamp * 1000).toLocaleString();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
          <div className="flex justify-between">
            <span className="font-medium truncate" title={tx.txHash}>
              {tx.txHash.slice(0, 10)}...{tx.txHash.slice(-6)}
            </span>
            <span className="text-sm text-gray-500">{formattedDate}</span>
          </div>
          <div className="text-sm mt-1">
            {tx.amount !== undefined &&
              `${tx.amount > 0 ? "+" : ""}${tx.amount / 1000000} ₳`}
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : txDetails ? (
          <div className="py-4 space-y-4">
            {/* Transaction ID */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Transaction ID
              </h3>
              <p className="text-sm font-mono break-all">{txDetails.hash}</p>
            </div>

            {/* Date & Time */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Date & Time
              </h3>
              <p className="text-sm">
                {new Date(txDetails.block_time * 1000).toLocaleString()}
              </p>
            </div>

            {/* Transferred Assets */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Transferred Assets
              </h3>
              <div className="space-y-2">
                {txDetails.output_amount.map((asset, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{formatTokenName(asset.unit)}</span>
                    <span className="font-medium">
                      {asset.unit === "lovelace"
                        ? `${formatLovelace(asset.quantity)} ₳`
                        : asset.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fee */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Transaction Fee
              </h3>
              <p className="text-sm">{formatLovelace(txDetails.fees)} ₳</p>
            </div>

            {/* Block Info */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Block Information
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Height:</span>{" "}
                  {txDetails.block_height}
                </div>
                <div>
                  <span className="text-gray-500">Size:</span> {txDetails.size}{" "}
                  bytes
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="pt-2 border-t">
              <a
                href={`https://cardanoscan.io/transaction/${txDetails.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                View on Cardanoscan
              </a>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-red-500">
            Unable to load transaction details
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
