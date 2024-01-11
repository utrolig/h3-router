import { z } from "zod";
import { Endpoint, RootEndpoint } from "./router";
import {
  InferGetHandlerReturn,
  InferGetQueryParams,
  InferPath,
  InferPostBody,
  InferPostHandlerReturn,
  InferPostQueryParams,
} from "./typeUtils";

const rootEndpoint = new RootEndpoint({ path: "/api" });

const usersEndpoint = new Endpoint({
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

const routeTree = rootEndpoint.addChildren([usersEndpoint]);

type UsersGetReturn = InferGetHandlerReturn<typeof usersEndpoint>;
type UsersGetQuery = InferGetQueryParams<typeof usersEndpoint>;

type UsersPostReturn = InferPostHandlerReturn<typeof usersEndpoint>;
type UsersPostQuery = InferPostQueryParams<typeof usersEndpoint>;
type UsersPostBody = InferPostBody<typeof usersEndpoint>;
