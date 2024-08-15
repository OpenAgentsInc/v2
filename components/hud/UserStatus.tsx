import React from 'react'
import { Pane } from './pane'
import { useUser } from '@clerk/nextjs'
import Image from 'next/image'

export const UserStatus: React.FC = () => {
  const { user } = useUser()

  if (!user) return null

  return (
    <>
      {user && (
        <Pane title={'You'} id="user-status" x={10} y={10} height={130} width={200} dismissable={false}>
          <div className="flex items-center space-x-4 p-4">
            <Image
              src={user.imageUrl}
              alt="Profile"
              width={50}
              height={50}
              className="rounded-full"
            />
            <div>
              <p className="font-semibold">{user.fullName}</p>
              <p className="text-sm text-gray-500">{user.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
        </Pane>
      )}
    </>
  )
}