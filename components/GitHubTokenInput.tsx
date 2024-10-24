"use client"

import React, { useState } from "react"
import { useRepoStore } from "../store/repo"

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
      <input
        type="text"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Enter your GitHub token"
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Set GitHub Token
      </button>
    </form>
  );
}
