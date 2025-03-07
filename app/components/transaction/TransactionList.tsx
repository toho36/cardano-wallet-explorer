import { Transaction } from "@/types/wallet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Latest transactions for this wallet</CardDescription>
      </CardHeader>
      <CardContent>
        {transactions && transactions.length > 0 ? (
          <div className="space-y-2">
            {transactions.map((tx, index) => (
              <TransactionItem key={index} tx={tx} />
            ))}
          </div>
        ) : (
          <p className="text-center py-10 text-gray-500">
            No recent transactions found
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface TransactionItemProps {
  tx: Transaction;
}

function TransactionItem({ tx }: TransactionItemProps) {
  return (
    <div className="p-3 border rounded-lg hover:bg-gray-50">
      <div className="flex justify-between">
        <span className="font-medium truncate">
          {tx.txHash.slice(0, 10)}...{tx.txHash.slice(-6)}
        </span>
        <span className="text-sm text-gray-500">
          {new Date(tx.timestamp * 1000).toLocaleDateString()}
        </span>
      </div>
      <div className="text-sm mt-1">
        {tx.amount !== undefined &&
          `${tx.amount > 0 ? "+" : ""}${tx.amount / 1000000} ₳`}
      </div>
    </div>
  );
}
