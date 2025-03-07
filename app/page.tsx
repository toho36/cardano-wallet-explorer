"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { fetchWalletData } from "@/lib/api";
import { WalletOverview } from "@/components/WalletOverview";
import { NFTGallery } from "@/components/NFTGallery";
import { TransactionList } from "@/components/TransactionList";
import { Marketplace } from "@/components/MarketPlace";
// Default address to use if none provided
const DEFAULT_ADDRESS = process.env.NEXT_PUBLIC_DEFAULT_ADDRESS!;

export default function Home() {
  const [address, setAddress] = useState(DEFAULT_ADDRESS);
  const [inputAddress, setInputAddress] = useState(DEFAULT_ADDRESS);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["wallet", address],
    queryFn: () => fetchWalletData(address),
    retry: 2,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAddress(inputAddress);
  };
  console.log(data?.nfts, "data");
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">
          Cardano Wallet Explorer
        </h1>

        <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
          <Input
            value={inputAddress}
            onChange={(e) => setInputAddress(e.target.value)}
            placeholder="Enter Cardano wallet address"
            className="flex-grow"
          />
          <Button type="submit">Search</Button>
        </form>

        {isLoading && (
          <div className="flex justify-center items-center h-64">
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
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="nfts">NFTs</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <WalletOverview data={data} address={address} />
            </TabsContent>

            <TabsContent value="nfts">
              <NFTGallery nfts={data.nfts} walletAddress={address} />
            </TabsContent>

            <TabsContent value="transactions">
              <TransactionList transactions={data.transactions} />
            </TabsContent>
          </Tabs>
        )}
        <Marketplace />
      </div>
    </main>
  );
}
