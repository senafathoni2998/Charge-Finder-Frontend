// Shared types for profile page data loaders/actions.
export type ProfileLoaderData = {
  user: {
    name?: string | null;
    region?: string | null;
    role?: string | null;
    image?: string | null;
  } | null;
  vehicles: unknown[] | null;
  activeCarId: string | null;
};
