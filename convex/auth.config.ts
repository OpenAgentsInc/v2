export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_URL,
      applicationID: "convex",
    },
  ]
};
