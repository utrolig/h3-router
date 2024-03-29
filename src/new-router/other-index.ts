import { ZodTypeAny, z } from "zod";

export type HttpMethod =
  | "GET"
  | "HEAD"
  | "PATCH"
  | "POST"
  | "PUT"
  | "DELETE"
  | "CONNECT"
  | "OPTIONS"
  | "TRACE";

type OptionalValidation = ZodTypeAny | undefined;

type EndpointWithoutBodyConfig<
  THandlerReturn extends unknown,
  TQueryParams extends OptionalValidation
> = {
  handler: (opts: {
    queryParams: TQueryParams extends ZodTypeAny
      ? z.infer<TQueryParams>
      : undefined;
  }) => THandlerReturn;
  queryParams?: TQueryParams;
};

type EndpointWithBodyConfig<
  THandlerReturn extends unknown,
  TQueryParams extends OptionalValidation,
  TBody extends OptionalValidation
> = {
  handler: (opts: {
    queryParams: TQueryParams extends ZodTypeAny
      ? z.infer<TQueryParams>
      : undefined;
    body: TBody extends ZodTypeAny ? z.infer<TBody> : undefined;
  }) => THandlerReturn;
  queryParams?: TQueryParams;
  body?: TBody;
};

type EndpointMethods<
  TGetHandlerReturn extends unknown,
  TGetQueryParams extends OptionalValidation,
  TPostHandlerReturn extends unknown,
  TPostQueryParams extends OptionalValidation,
  TPostBody extends OptionalValidation
> = {
  get?: EndpointWithoutBodyConfig<TGetHandlerReturn, TGetQueryParams>;
  post?: EndpointWithBodyConfig<
    TPostHandlerReturn,
    TPostQueryParams,
    TPostBody
  >;
};

type EndpointConfig<
  TPath extends string,
  TParentRoute extends any,
  TGetHandlerReturn extends unknown,
  TGetQueryParams extends OptionalValidation,
  TPostHandlerReturn extends unknown,
  TPostQueryParams extends OptionalValidation,
  TPostBody extends OptionalValidation
> = {
  getParentRoute: () => TParentRoute;
  path: TPath;
} & EndpointMethods<
  TGetHandlerReturn,
  TGetQueryParams,
  TPostHandlerReturn,
  TPostQueryParams,
  TPostBody
>;

type AnyEndpoint = Endpoint<any, any, any, any, any, any, any, any>;

class Endpoint<
  TPath extends string = string,
  TParentRoute extends any = any,
  TChildren extends unknown = unknown,
  TGetHandlerReturn extends unknown = unknown,
  TGetQueryParams extends OptionalValidation = undefined,
  TPostHandlerReturn extends unknown = unknown,
  TPostQueryParams extends OptionalValidation = undefined,
  TPostBody extends OptionalValidation = undefined
> {
  options: EndpointConfig<
    TPath,
    TParentRoute,
    TGetHandlerReturn,
    TGetQueryParams,
    TPostHandlerReturn,
    TPostQueryParams,
    TPostBody
  >;
  children?: TChildren;

  constructor(
    options: EndpointConfig<
      TPath,
      TParentRoute,
      TGetHandlerReturn,
      TGetQueryParams,
      TPostHandlerReturn,
      TPostQueryParams,
      TPostBody
    >
  ) {
    this.options = options;
  }

  addChildren<TNewChildren extends AnyEndpoint[]>(
    children: TNewChildren
  ): Endpoint<
    TPath,
    TParentRoute,
    TNewChildren,
    TGetHandlerReturn,
    TGetQueryParams,
    TPostHandlerReturn,
    TPostQueryParams,
    TPostBody
  > {
    this.children = children as any;
    return this as any;
  }
}

export class RootEndpoint<TBasePrefix extends string = "/"> extends Endpoint<
  TBasePrefix,
  any,
  any,
  any,
  any,
  any
> {
  constructor(
    options?: Omit<
      EndpointConfig<TBasePrefix, any, any, any, any, any, any>,
      "getParentRoute" | "get" | "post"
    >
  ) {
    super(options as any);
  }
}

const rootEndpoint = new RootEndpoint({ path: "/api" });

const getUsers = new Endpoint({
  getParentRoute: () => rootEndpoint,
  path: "/users/cake/post",
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

type InferGetHandlerReturn<T> = T extends Endpoint<
  any,
  any,
  any,
  infer TGetHandlerReturn,
  any,
  any,
  any,
  any
>
  ? TGetHandlerReturn
  : never;
type InferGetQueryParams<T> = T extends Endpoint<
  any,
  any,
  any,
  any,
  infer TGetQueryParams,
  any,
  any,
  any
>
  ? TGetQueryParams extends ZodTypeAny
    ? z.infer<TGetQueryParams>
    : never
  : never;

type InferPostHandlerReturn<T> = T extends Endpoint<
  any,
  any,
  any,
  any,
  any,
  infer TPostHandlerReturn,
  any,
  any
>
  ? TPostHandlerReturn
  : never;

type InferPostQueryParams<T> = T extends Endpoint<
  any,
  any,
  any,
  any,
  any,
  any,
  infer TPostQueryParams,
  any
>
  ? TPostQueryParams extends ZodTypeAny
    ? z.infer<TPostQueryParams>
    : never
  : never;

type InferPostBody<T> = T extends Endpoint<
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  infer TPostBody
>
  ? TPostBody extends ZodTypeAny
    ? z.infer<TPostBody>
    : never
  : never;

type UsersGetReturn = InferGetHandlerReturn<typeof getUsers>;
type UsersGetQuery = InferGetQueryParams<typeof getUsers>;

type UsersPostReturn = InferPostHandlerReturn<typeof getUsers>;
type UsersPostQuery = InferPostQueryParams<typeof getUsers>;
type UsersPostBody = InferPostBody<typeof getUsers>;
