"use client"
import { useUser } from '@clerk/nextjs'
import { Balance } from '@/panes/user/Balance'
import { Pane } from '@/panes/Pane'
import { UserButton } from '@clerk/nextjs'

export const UserStatus = () => {
  const { user } = useUser()
  if (!user) {
    return null
  }
  return (
    <Pane title='You' id="you" type="default" x={10} y={10} height={130} width={200} dismissable={false}>
      <div className="h-full w-full flex flex-col justify-evenly items-center">
        <div className="h-10 w-full flex justify-center items-center">
          <UserButton showName={true} />
        </div>
        <div className="flex justify-center items-center">
          <Balance />
        </div>
      </div>
    </Pane>
  )
}
