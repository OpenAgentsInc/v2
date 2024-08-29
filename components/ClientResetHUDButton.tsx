"use client";

import React from 'react';
import { useAuth, ClerkProvider } from "@clerk/nextjs";
import ResetHUDButton from "./ResetHUDButton";

const AuthenticatedResetHUDButton: React.FC = () => {
  const { isSignedIn } = useAuth();
  
  if (!isSignedIn) {
    return null;
  }

  return <ResetHUDButton />;
};

const ClientResetHUDButton: React.FC = () => {
  return (
    <ClerkProvider>
      <AuthenticatedResetHUDButton />
    </ClerkProvider>
  );
};

export default ClientResetHUDButton;