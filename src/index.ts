import { InferPaths, RootRoute, Route, WebApplication } from "./router";
import z from "zod";

const rootRoute = new RootRoute({ path: "/api" });

const postsRoute = new Route({
  path: "/posts",
  get: {
    handler: ({ event }) => {
      return "lol from handler";
    },
  },
  post: {
    body: z.object({
      name: z.string(),
    }),
    handler: ({ body }) => {
      return {
        name: `lol ${body.name}`,
      };
    },
  },
  getParentRoute() {
    return rootRoute;
  },
});

const postDetailsRoute = new Route({
  path: "/:id",
  getParentRoute() {
    // I have no idea why this is giving a typescript error
    return postsRoute;
  },
  get: {
    handler: ({ event }) => {
      return `hello from posts/${event.context.params?.id}`;
    },
  },
});

const routeTree = rootRoute.addChildren([
  postsRoute.addChildren([postDetailsRoute]),
]);

const webApp = new WebApplication(routeTree);
export const app = webApp.getApp();

type RoutePaths = InferPaths<typeof routeTree>;
