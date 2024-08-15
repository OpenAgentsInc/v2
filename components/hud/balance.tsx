"use client"
import { useEffect, useState } from 'react';
import { useBalanceStore } from '@/store/balance';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import AddCreditsForm from '@/components/AddCreditsForm';
import { useAuth } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export const Balance = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const setBalance = useBalanceStore(state => state.setBalance);
    const { userId } = useAuth();

    const balance = useQuery(api.users.getUserBalance, userId ? { clerk_user_id: userId } : "skip");

    useEffect(() => {
        if (balance !== undefined) {
            setBalance(balance);
            setLoading(false);
        }
    }, [balance, setBalance]);

    const balanceInCents = useBalanceStore(state => state.balance);
    const balanceInDollars = Math.floor(balanceInCents) / 100;
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
                    <span className="text-sm font-bold text-white">{loading ? 'Loading...' : formattedBalance}</span>
                </div>
            </DialogTrigger>
            <DialogContent className="z-[10000]">
                <DialogHeader>
                    <DialogTitle>Add Credits</DialogTitle>
                    <DialogDescription>
                        Advanced models require credits. Select the amount of credits to buy. Min $5, max $200
                    </DialogDescription>
                </DialogHeader>
                <AddCreditsForm uiMode="hosted" clerkUserId={userId} />
            </DialogContent>
        </Dialog>
    );
};