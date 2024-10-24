"use client"

import React, { useState } from "react"
import { useRepoStore } from "../store/repo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function GitHubTokenInput() {
  const [token, setToken] = useState('');
  const setGithubToken = useRepoStore((state) => state.setGithubToken);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGithubToken(token);
    setToken(''); // Clear the input field after submission
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
      <Input
        type="text"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Enter your GitHub token"
        className="w-full"
      />
      <Button type="submit" className="w-full">
        Set GitHub Token
      </Button>
    </form>
  );
}