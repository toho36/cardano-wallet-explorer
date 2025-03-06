'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { fetchWalletData } from '@/lib/api';
import { WalletOverview } from '@/components/WalletOverview';
import { NFTGallery } from '@/components/NFTGallery';
import { TransactionList } from '@/components/TransactionList';
import { Marketplace } from '@/components/Marketplace';

// Default address to use if none provided
const DEFAULT_ADDRESS = process.env.NEXT_PUBLIC_DEFAULT_ADDRESS!;

export default function Home() {
  const [address, setAddress] = useState(DEFAULT_ADDRESS);
  const [inputAddress, setInputAddress] = useState(DEFAULT_ADDRESS);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['wallet', address],
    queryFn: () => fetchWalletData(address),
    retry: 2,
    // enabled: !!address, // Only run query if address is provided
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAddress(inputAddress);
  };
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">
          Cardano Wallet Explorer
        </h1>

        {/* Marketplace Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Marketplace
          </h2>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <Marketplace />
            </CardContent>
          </Card>
        </section>

        {/* Search Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Wallet Explorer
          </h2>
          <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
            <Input
              value={inputAddress}
              onChange={(e) => setInputAddress(e.target.value)}
              placeholder="Enter Cardano wallet address"
              className="flex-grow"
            />
            <Button type="submit">Search</Button>
          </form>

          {isLoading && (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading wallet data...</span>
            </div>
          )}

          {isError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-600">Error: {error.message}</p>
              </CardContent>
            </Card>
          )}

          {data && !isLoading && (
            <div className="space-y-6">
              <WalletOverview data={data} address={address} />

              <Tabs defaultValue="nfts" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="nfts">NFTs</TabsTrigger>
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                </TabsList>
                <TabsContent value="nfts">
                  {data.nfts.length > 0 ? (
                    <NFTGallery nfts={data.nfts} walletAddress={address} />
                  ) : (
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <p className="text-gray-500">
                          No NFTs found in this wallet.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                <TabsContent value="transactions">
                  {data.transactions.length > 0 ? (
                    <TransactionList transactions={data.transactions} />
                  ) : (
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <p className="text-gray-500">
                          No transactions found for this wallet.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
