import { ZodTypeAny, z } from "zod";

type UpcaseHttpMethod =
  | "GET"
  | "HEAD"
  | "PATCH"
  | "POST"
  | "PUT"
  | "DELETE"
  | "CONNECT"
  | "OPTIONS"
  | "TRACE";

type HttpMethod = Lowercase<UpcaseHttpMethod>;

type OptionalValidation = ZodTypeAny | undefined;

type EndpointConfig<
  TPath extends string,
  TMethod extends HttpMethod,
  TParentEndpoint extends AnyEndpoint,
  THandlerReturn extends unknown,
  TQuery extends OptionalValidation,
  TBody extends OptionalValidation
> = {
  method: TMethod;
  getParentRoute: () => TParentEndpoint;
  path: TPath;
  query?: TQuery;
} & (TMethod extends "GET" | "HEAD"
  ? {
      handler: (opts: {
        queryParams: TQuery extends ZodTypeAny ? z.infer<TQuery> : undefined;
      }) => THandlerReturn;
    }
  : {
      body?: TBody;
      handler: (opts: {
        queryParams: TQuery extends ZodTypeAny ? z.infer<TQuery> : undefined;
        body: TBody extends ZodTypeAny ? z.infer<TBody> : undefined;
      }) => THandlerReturn;
    });

type AnyEndpoint = Endpoint<any, any, any, any, any, any, any>;

export class Endpoint<
  TPath extends string = string,
  TMethod extends HttpMethod = HttpMethod,
  TChildren extends AnyEndpoint[] = AnyEndpoint[],
  TParentEndpoint extends AnyEndpoint = AnyEndpoint,
  THandlerReturn extends unknown = unknown,
  TQuery extends OptionalValidation = undefined,
  TBody extends OptionalValidation = undefined
> {
  config: EndpointConfig<
    TPath,
    TMethod,
    TParentEndpoint,
    THandlerReturn,
    TQuery,
    TBody
  >;

  children?: TChildren;

  constructor(
    config: EndpointConfig<
      TPath,
      TMethod,
      TParentEndpoint,
      THandlerReturn,
      TQuery,
      TBody
    >
  ) {
    this.config = config;
  }

  addChildren<TNewChildren extends AnyEndpoint[]>(
    children: TNewChildren
  ): Endpoint<
    TPath,
    TMethod,
    TNewChildren,
    TParentEndpoint,
    THandlerReturn,
    TQuery,
    TBody
  > {
    this.children = children as any;
    return this as any;
  }
}

export class EndpointGroup<TBasePrefix extends string = "/"> extends Endpoint<
  TBasePrefix,
  any,
  any,
  any,
  any,
  any
> {
  constructor(
    options?: Omit<
      EndpointConfig<TBasePrefix, any, any, any, any, any>,
      "getParentRoute" | "query" | "body" | "handler" | "method"
    >
  ) {
    super(options as any);
  }
}

const root = new EndpointGroup({ path: "/api" });

const getUsers = new Endpoint({
  getParentRoute: () => root,
  path: "//users",
  method: "get",
  handler: ({ queryParams }) => [] as string[],
  query: z.object({ limit: z.number() }),
});

const postUsers = new Endpoint({
  getParentRoute: () => root,
  path: "/users",
  method: "post",
  handler: ({ body, queryParams }) => [] as string[],
  body: z.object({ name: z.string() }),
  query: z.object({ limit: z.number() }),
});

const getPosts = new Endpoint({
  getParentRoute: () => root,
  path: "/posts",
  method: "get",
  handler: () => [] as { id: string; title: string }[],
});

type RemoveLeadingSlash<T extends string> = T extends `/${infer TRest}`
  ? RemoveLeadingSlash<TRest>
  : T;

type RemoveTrailinSlash<T extends string> = T extends `${infer TRest}/`
  ? RemoveTrailinSlash<TRest>
  : T;

type InferPath<T> = T extends Endpoint<infer TPath, any, any, any, any, any>
  ? RemoveLeadingSlash<RemoveTrailinSlash<TPath>>
  : never;

const postsRouter = new EndpointGroup({ path: "/posts" }).addChildren([
  getPosts,
]);

const usersRouter = new EndpointGroup({ path: "/users" }).addChildren([
  getUsers,
  postUsers,
]);

const routeTree = root.addChildren([postsRouter, usersRouter]);

type InferRouteTree<T> = T extends EndpointGroup<infer TBasePrefix>
  ? `${TBasePrefix}/${InferPath<EndpointGroup["children"][number]>}`
  : never;

type Tree = InferRouteTree<typeof routeTree>;
