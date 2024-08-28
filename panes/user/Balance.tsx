"use client"
import { useQuery } from "convex/react"
import { useEffect, useState } from "react"
import AddCreditsForm from "@/components/credits/AddCreditsForm"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { api } from "@/convex/_generated/api"
import { useBalanceStore } from "@/store/balance"
import { useAuth } from "@clerk/nextjs"

export const Balance = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const setBalance = useBalanceStore(state => state.setBalance);
  const { userId } = useAuth();

  const balance = useQuery(api.users.getUserBalance.getUserBalance, userId ? { clerk_user_id: userId } : "skip");

  useEffect(() => {
    if (balance !== undefined) {
      if (typeof balance === 'number' && !isNaN(balance)) {
        setBalance(balance);
        setLoading(false);
        setError(null);
      } else {
        setError("Invalid balance received");
        setLoading(false);
      }
    }
  }, [balance, setBalance]);

  const balanceInCents = useBalanceStore(state => state.balance);
  const balanceInDollars = typeof balanceInCents === 'number' && !isNaN(balanceInCents) ? Math.floor(balanceInCents) / 100 : 0;
  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(balanceInDollars);

  if (!userId) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="opacity-75 mt-1 mb-2 px-3 py-1 bg-black border border-white rounded-full flex items-center space-x-2 cursor-pointer hover:opacity-100 transition-opacity">
          <span className="text-xs font-semibold text-gray-300">Credits</span>
          <span className="text-sm font-bold text-white">
            {loading ? 'Loading...' : error ? 'Error' : formattedBalance}
          </span>
        </div>
      </DialogTrigger>
      <DialogContent className="z-[10000]">
        <DialogHeader>
          <DialogTitle>Add Credits</DialogTitle>
          <DialogDescription>
            Advanced models require credits. Select the amount of credits to buy. Min $5, max $1000
          </DialogDescription>
        </DialogHeader>
        <AddCreditsForm uiMode="hosted" clerkUserId={userId} />
      </DialogContent>
    </Dialog>
  );
};