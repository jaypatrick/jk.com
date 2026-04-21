export const env = {
  ASSETS: {
    fetch: async (_request: RequestInfo | URL): Promise<Response> =>
      new Response('Test stub: ASSETS.fetch not implemented', { status: 500 }),
  },
};
