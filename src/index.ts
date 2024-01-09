import { addUser, users } from "./usersDatabase";
import { InferPaths, RootRoute, Route, WebApplication } from "./router";
import z from "zod";

const rootRoute = new RootRoute({ path: "/api" });

const usersRoute = new Route({
  path: "/users",
  get: {
    handler: ({ event }) => {
      return users;
    },
  },
  post: {
    body: z.object({
      name: z.string(),
    }),
    handler: ({ body }) => {
      const user = addUser(body.name);
      return user;
    },
  },
  getParentRoute() {
    return rootRoute;
  },
});

const userDetailsRoute = new Route({
  path: "/:id",
  getParentRoute() {
    // I have no idea why this is giving a typescript error
    return usersRoute;
  },
  get: {
    handler: ({ event }) => {
      const userId = event.context.params?.id;
      const user = users.find((user) => user.id === Number(userId));
      return user;
    },
  },
});

const routeTree = rootRoute.addChildren([
  usersRoute.addChildren([userDetailsRoute]),
]);

const webApp = new WebApplication(routeTree);
export const app = webApp.getApp();

type RoutePaths = InferPaths<typeof routeTree>;
