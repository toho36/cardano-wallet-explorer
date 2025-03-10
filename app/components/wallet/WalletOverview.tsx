import { WalletData } from "@/types/wallet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface WalletOverviewProps {
  data: WalletData;
  address: string;
}

// Helper function to format lovelace to ADA
const formatLovelace = (lovelace: string | undefined): string => {
  if (!lovelace) return "0";
  return (parseInt(lovelace) / 1000000).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
};

export function WalletOverview({ data, address }: WalletOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Overview</CardTitle>
        <CardDescription>
          Address: {address.slice(0, 20)}...{address.slice(-8)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="text-lg font-medium mb-2">Balance</h3>
            <div className="text-2xl font-semibold">
              {data.balance ? `${data.balance.lovelace / 1000000} ₳` : "0 ₳"}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="text-lg font-medium mb-2">Assets</h3>
            <div className="text-lg">
              {data.assets ? data.assets.length : 0} Different Assets
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="text-lg font-medium mb-2">Delegation Status</h3>
            {data.delegation ? (
              data.delegation.active ? (
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                    <span className="text-green-700 font-medium">
                      Delegated
                    </span>
                  </div>
                  <div className="text-sm">
                    {data.delegation.pool_ticker && (
                      <span className="font-semibold mr-1">
                        [{data.delegation.pool_ticker}]
                      </span>
                    )}
                    {data.delegation.pool_name || "Unknown pool"}
                  </div>
                  {data.delegation.pool_id && (
                    <div
                      className="text-xs text-gray-500 truncate"
                      title={data.delegation.pool_id}
                    >
                      Pool ID: {data.delegation.pool_id.slice(0, 8)}...
                    </div>
                  )}
                  {data.delegation.rewards_sum && (
                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <div className="text-xs text-gray-500">Total Rewards</div>
                      <div className="text-sm font-medium">
                        {formatLovelace(data.delegation.rewards_sum)} ₳
                      </div>
                    </div>
                  )}
                  {data.delegation.withdrawable_amount && (
                    <div className="mt-1">
                      <div className="text-xs text-gray-500">Withdrawable</div>
                      <div className="text-sm font-medium">
                        {formatLovelace(data.delegation.withdrawable_amount)} ₳
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-red-400 mr-2"></span>
                  <span className="text-red-600 font-medium">
                    Not delegated
                  </span>
                  {data.delegation.stake_address && (
                    <div className="ml-2 text-xs text-gray-500">
                      (Stake address available)
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="text-gray-500">Loading delegation info...</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
