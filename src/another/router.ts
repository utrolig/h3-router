import { ZodTypeAny, z } from "zod";

type PathParams<T extends string> = string extends T
  ? Record<string, string>
  : T extends `${infer _Start}:${infer Param}/${infer Rest}`
  ? { [K in Param | keyof PathParams<Rest>]: string }
  : T extends `${infer _Start}:${infer Param}`
  ? { [K in Param]: string }
  : never;

type RouteParams<T extends string> = T extends `${infer _Start}:${infer Param}`
  ? { routeParams: PathParams<T> }
  : T extends string
  ? {}
  : never;

type HttpMethod =
  | "get"
  | "head"
  | "patch"
  | "post"
  | "put"
  | "delete"
  | "connect"
  | "options"
  | "trace";

type OptionalValidation = ZodTypeAny | undefined;

type AnyEndpoint = Endpoint<any, any, any, any, any, any, any>;

type BaseEndpointOptions<
  TPath extends string,
  TMethod extends HttpMethod,
  TParentEndpoint extends AnyEndpoint
> = {
  path: TPath;
  method: TMethod;
  getParentEndpoint: () => TParentEndpoint;
};

export class Endpoint<
  TPath extends string = string,
  TMethod extends HttpMethod = HttpMethod,
  TChildren extends AnyEndpoint[] = AnyEndpoint[],
  TParentEndpoint extends AnyEndpoint = AnyEndpoint,
  THandlerReturn extends unknown = unknown,
  TQuery extends OptionalValidation = undefined,
  TBody extends OptionalValidation = undefined
> {
  children?: TChildren;

  constructor(
    config: BaseEndpointOptions<TPath, TMethod, TParentEndpoint> & {
      handler: (options: RouteParams<TPath>) => THandlerReturn;
      query?: undefined;
      body?: undefined;
    }
  );

  constructor(
    config: BaseEndpointOptions<TPath, TMethod, TParentEndpoint> & {
      handler: (
        options: RouteParams<TPath> & {
          query: TQuery extends ZodTypeAny ? z.infer<TQuery> : undefined;
        }
      ) => THandlerReturn;
      query: TQuery;
      body?: undefined;
    }
  );

  constructor(
    config: BaseEndpointOptions<TPath, TMethod, TParentEndpoint> & {
      handler: (
        options: RouteParams<TPath> & {
          body: TBody extends ZodTypeAny ? z.infer<TBody> : undefined;
        }
      ) => THandlerReturn;
      query?: undefined;
      body: TBody;
    }
  );

  constructor(
    config: BaseEndpointOptions<TPath, TMethod, TParentEndpoint> & {
      handler: (
        options: RouteParams<TPath> & {
          query: TQuery extends ZodTypeAny ? z.infer<TQuery> : undefined;
          body: TBody extends ZodTypeAny ? z.infer<TBody> : undefined;
        }
      ) => THandlerReturn;
      query: TQuery;
      body: TBody;
    }
  );

  constructor(public config: any) {
    this.config = config;
  }
}

export class EndpointGroup<TBasePrefix extends string = "/"> extends Endpoint<
  TBasePrefix,
  any,
  any,
  any,
  any,
  any,
  any
> {
  constructor(options?: { path: TBasePrefix }) {
    super(options as any);
  }
}

export class WebApplication<
  TRouteTree extends AnyEndpoint = AnyEndpoint,
  TApplicationContext extends object = {}
> {
  routeTree: TRouteTree;
  applicationContext?: TApplicationContext;

  constructor({
    routeTree,
    applicationContext,
  }: {
    routeTree: TRouteTree;
    applicationContext?: TApplicationContext;
  }) {
    this.routeTree = routeTree;
  }
}

const root = new EndpointGroup({ path: "/api" });

const rootGet = new Endpoint({
  path: "/users/:id",
  method: "get",
  getParentEndpoint: () => root,
  handler: ({ body }) => "hello",
  body: z.object({ asdf: z.string() }),
});

const userDetails = new Endpoint({
  path: "/users",
  method: "get",
  getParentEndpoint: () => root,
  handler: () => {},
});
