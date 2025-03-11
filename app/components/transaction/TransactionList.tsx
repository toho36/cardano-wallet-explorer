import { Transaction } from "@/types/wallet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TransactionItem } from "./TransactionItem";

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
            {transactions.map((tx) => (
              <TransactionItem key={tx.txHash} tx={tx} />
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
