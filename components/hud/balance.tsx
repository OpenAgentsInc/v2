"use client"
import { useBalanceStore } from '@/store/balance'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

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
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Credits</DialogTitle>
                    <DialogDescription>
                        Choose a payment method to add credits to your account.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                            Credit Card
                        </button>
                        <button className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors">
                            Bitcoin
                        </button>
                    </div>
                    <p className="text-sm text-gray-500">
                        Select a payment method to proceed. You will be redirected to a secure payment page.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}