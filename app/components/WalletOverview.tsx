import { WalletData } from '@/types/wallet';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface WalletOverviewProps {
  data: WalletData;
  address: string;
}

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="text-lg font-medium mb-2">Balance</h3>
            <div className="text-2xl font-semibold">
              {data.balance ? `${data.balance.lovelace / 1000000} ₳` : '0 ₳'}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="text-lg font-medium mb-2">Assets</h3>
            <div className="text-lg">
              {data.assets ? data.assets.length : 0} Different Assets
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
