const getClerkDomain = () => {
  if (process.env.NODE_ENV === 'production') {
    return "https://clerk.openagents.com"
  } else {
    return "https://close-boar-57.clerk.accounts.dev"
  }
};

export default {
  providers: [
    {
      domain: "https://clerk.openagents.com",
      applicationID: "convex",
    },
  ]
};
