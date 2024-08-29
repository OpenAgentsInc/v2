"use client";

import React from 'react';
import { useAuth } from "@clerk/nextjs";
import ResetHUDButton from "./ResetHUDButton";

const ClientResetHUDButton: React.FC = () => {
  const { isSignedIn } = useAuth();
  
  if (!isSignedIn) {
    return null;
  }

  return <ResetHUDButton />;
};

export default ClientResetHUDButton;