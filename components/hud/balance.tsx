"use client"
import { Pane } from '@/components/hud/pane'
import { useBalanceStore } from '@/store/balance'

export const Balance = () => {
    const balanceInCents = useBalanceStore(state => state.balance)

    // Convert cents to dollars and round down to the nearest penny
    const balanceInDollars = Math.floor(balanceInCents) / 100

    // Format the balance as USD
    const formattedBalance = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(balanceInDollars)

    console.log('Balance in cents:', balanceInCents)
    console.log('Formatted balance:', formattedBalance)

    return (
        <Pane title="Balance" id={0} x={1300} y={100} height={100} width={100} dismissable={false}>
            <div className="h-full w-full flex justify-center items-center">
                {formattedBalance}
            </div>
        </Pane>
    )
}
