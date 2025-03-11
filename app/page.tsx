"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { fetchWalletData } from "@/lib/api";
import { WalletOverview } from "@/components/wallet/WalletOverview";
import { NFTGallery } from "@/components/nft/NFTGallery";
import { TransactionList } from "@/components/transaction/TransactionList";
import { FeaturedNFTs } from "@/components/nft/FeaturedNFTs";
import { useWalletStore } from "@/store/walletStore";

export default function Home() {
  const {
    address,
    inputAddress,
    setAddress,
    setInputAddress,
    setWalletData,
    setLoading,
    setError,
  } = useWalletStore();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["wallet", address],
    queryFn: () => fetchWalletData(address),
    retry: 2,
  });

  useEffect(() => {
    setWalletData(data || null);
    setLoading(isLoading);
    if (isError && error) {
      setError(error as Error);
    }
  }, [data, isLoading, isError, error, setWalletData, setLoading, setError]);

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
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Featured NFTs
          </h2>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <FeaturedNFTs />
            </CardContent>
          </Card>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Wallet Explorer
          </h2>
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
        </section>
      </div>
    </main>
  );
}
