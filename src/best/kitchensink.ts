import { z } from "zod";
import { Endpoint, RootEndpoint } from "./router";
import {
  InferGetHandlerReturn,
  InferGetQueryParams,
  InferPostBody,
  InferPostHandlerReturn,
  InferPostQueryParams,
} from "./typeUtils";

const rootEndpoint = new RootEndpoint({ path: "/api" });

const getUsers = new Endpoint({
  getParentRoute: () => rootEndpoint,
  path: "/users",
  get: {
    handler: async () => ({ bobby: "mam" as const }),
    queryParams: z.object({ asdf: z.string() }),
  },
  post: {
    handler: ({ body, queryParams }) => {
      return {
        kek: body.name,
        qp: {
          asdf: queryParams.asdf,
        },
      };
    },
    body: z.object({ name: z.string() }),
    queryParams: z.object({ asdf: z.string() }),
  },
});

const routeTree = rootEndpoint.addChildren([getUsers]);

type UsersGetReturn = InferGetHandlerReturn<typeof getUsers>;
type UsersGetQuery = InferGetQueryParams<typeof getUsers>;

type UsersPostReturn = InferPostHandlerReturn<typeof getUsers>;
type UsersPostQuery = InferPostQueryParams<typeof getUsers>;
type UsersPostBody = InferPostBody<typeof getUsers>;
