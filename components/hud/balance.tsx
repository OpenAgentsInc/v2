"use client"
import { useBalanceStore } from '@/store/balance'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import AddCreditsForm from '@/components/AddCreditsForm'

export const Balance = () => {
    const balanceInCents = useBalanceStore(state => state.balance)
    const balanceInDollars = Math.floor(balanceInCents) / 100
    const formattedBalance = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(balanceInDollars)

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="opacity-75 mt-1 mb-2 px-3 py-1 bg-black border border-white rounded-full flex items-center space-x-2 cursor-pointer hover:opacity-100 transition-opacity">
                    <span className="text-xs font-semibold text-gray-300">Credits</span>
                    <span className="text-sm font-bold text-white">{formattedBalance}</span>
                </div>
            </DialogTrigger>
            <DialogContent className="z-[10000]">
                <DialogHeader>
                    <DialogTitle>Add Credits</DialogTitle>
                    <DialogDescription>
                        Select the amount of credits you want to add to your account.
                    </DialogDescription>
                </DialogHeader>
                <AddCreditsForm uiMode="hosted" />
            </DialogContent>
        </Dialog>
    )
}