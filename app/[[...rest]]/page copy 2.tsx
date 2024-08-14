"use client"
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { useConvexAuth } from "convex/react";
import { useClerk } from '@clerk/nextjs'

export default function App() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signOut } = useClerk()
  // pull in what we need to log out
  console.log(isLoading, isAuthenticated)
  // if (!isAuthenticated) {
  //   signOut()
  // }
  return (
    <div className="App">
      <Authenticated>Logged in</Authenticated>
      <Unauthenticated>Logged out</Unauthenticated>
      <AuthLoading>Still loading</AuthLoading>
    </div>
  );
}
