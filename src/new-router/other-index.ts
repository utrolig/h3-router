import { H3Event } from "h3";
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

type EndpointConfig<
  TPath extends string,
  TMethod extends HttpMethod,
  TParentRoute extends any,
  THandlerReturn extends unknown,
  TQueryParams extends ZodTypeAny,
  TBody extends object
> = {
  getParentRoute: () => TParentRoute;
  queryParams?: TQueryParams;
  method: TMethod;
  handler: (ctx: { event: H3Event }) => THandlerReturn;
  path: TPath;
} & (TMethod extends "GET" | "HEAD" ? {} : { body?: TBody });

type AnyEndpoint = Endpoint<any, any, any, any, any, any>;

class Endpoint<
  TPath extends string = string,
  TMethod extends HttpMethod = HttpMethod,
  TParentRoute extends any = any,
  THandlerReturn extends unknown = unknown,
  TChildren extends unknown = unknown,
  TQueryParams extends ZodTypeAny = ZodTypeAny,
  TBody extends object = object
> {
  options: EndpointConfig<
    TPath,
    TMethod,
    TParentRoute,
    THandlerReturn,
    TQueryParams,
    TBody
  >;
  children?: TChildren;

  constructor(
    options: EndpointConfig<
      TPath,
      TMethod,
      TParentRoute,
      THandlerReturn,
      TQueryParams,
      TBody
    >
  ) {
    this.options = options;
  }

  addChildren<TNewChildren extends AnyEndpoint[]>(
    children: TNewChildren
  ): Endpoint<
    TPath,
    TMethod,
    TParentRoute,
    THandlerReturn,
    TNewChildren,
    TQueryParams,
    TBody
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
      EndpointConfig<TBasePrefix, any, any, any, any, any>,
      "getParentRoute" | "get" | "method" | "queryParams" | "handler"
    >
  ) {
    super(options as any);
  }
}

const rootEndpoint = new RootEndpoint({ path: "/api" });

const getUsers = new Endpoint({
  getParentRoute: () => rootEndpoint,
  method: "POST",
  path: "/users/cake/post",
  queryParams: z.object({
    name: z.string(),
  }),
  handler: async () => "kek" as const,
});

const routeTree = rootEndpoint.addChildren([getUsers]);

type ExtractPath<T> = T extends Endpoint<infer TPath, any, any, any, any, any>
  ? TPath extends `/${infer Rest}`
    ? Rest
    : TPath
  : never;

type InferPaths<T> = `/${ConcatenatePaths<T>}`;
type InferMethod<T> = T extends Endpoint<any, infer TMethod, any, any, any, any>
  ? TMethod
  : never;
type ConcatenatePaths<T> = T extends Endpoint<
  any,
  any,
  any,
  any,
  infer TChildren,
  any,
  any
>
  ? TChildren extends Endpoint<any, any, any, any, any, any>[]
    ?
        | `${ExtractPath<T>}`
        | `${ExtractPath<T>}/${ConcatenatePaths<TChildren[number]>}`
    : ExtractPath<T>
  : never;

type InferRoutePath<T> = T extends Endpoint<
  any,
  any,
  infer TParentRoute,
  any,
  any,
  any
>
  ? TParentRoute extends Endpoint<any, any, any, any, any, any, any>
    ? `/${ExtractPath<TParentRoute>}/${ExtractPath<T>}`
    : ExtractPath<T>
  : never;

type InferRouteReturn<T> = T extends Endpoint<any, any, any, infer TRouteReturn>
  ? TRouteReturn
  : never;

type InferQueryParams<T> = T extends Endpoint<
  any,
  any,
  any,
  any,
  any,
  infer TQueryParams
>
  ? z.infer<TQueryParams>
  : never;

type InferEndpointTypes<T> = {
  path: InferRoutePath<T>;
  method: InferMethod<T>;
  return: InferRouteReturn<T>;
  queryParams: InferQueryParams<T>;
};

type AllPaths = InferPaths<typeof routeTree>;
type UsersPath = InferRoutePath<typeof getUsers>;
type UsersMethod = InferMethod<typeof getUsers>;
type UsersReturn = InferRouteReturn<typeof getUsers>;
type UsersQueryParams = InferQueryParams<typeof getUsers>;

type UsersEndpointTypes = InferEndpointTypes<typeof getUsers>;
