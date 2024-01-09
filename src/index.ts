import { addPost, posts } from "./posts";
import { InferPaths, RootRoute, Route, WebApplication } from "./router";
import z from "zod";

const rootRoute = new RootRoute({ path: "/api" });

const postsRoute = new Route({
  path: "/posts",
  get: {
    handler: ({ event }) => {
      return posts;
    },
  },
  post: {
    body: z.object({
      title: z.string(),
    }),
    handler: ({ body }) => {
      const post = addPost(body.title);
      return post;
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
      const postId = event.context.params?.id;
      const post = posts.find((post) => post.id === Number(postId));
      return post;
    },
  },
});

const routeTree = rootRoute.addChildren([
  postsRoute.addChildren([postDetailsRoute]),
]);

const webApp = new WebApplication(routeTree);
export const app = webApp.getApp();

type RoutePaths = InferPaths<typeof routeTree>;
