"use client"
import { useBalanceStore } from '@/store/balance'

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
        <div className="opacity-75 mt-1 mb-2 px-3 py-1 bg-black border border-white rounded-full flex items-center space-x-2">
            <span className="text-xs font-semibold text-gray-300">Credits</span>
            <span className="text-sm font-bold text-white">{formattedBalance}</span>
        </div>
    )
}
