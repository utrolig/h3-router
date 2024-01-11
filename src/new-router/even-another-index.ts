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

type RouteOptions<
  TPath extends string = string,
  TMethod extends HttpMethod = HttpMethod,
  TReturnType extends unknown = unknown,
  TQueryParams extends ZodTypeAny = ZodTypeAny,
  TBody extends ZodTypeAny = ZodTypeAny
> = {
  method: TMethod;
  path: TPath;
  handler: (params: { queryParams: TQueryParams }) => TReturnType;
  queryParams?: TQueryParams;
  body?: TBody;
};

type GetOptions<
  TPath extends string,
  TReturnType extends unknown,
  TQueryParams extends ZodTypeAny
> = Omit<
  RouteOptions<TPath, "GET", TReturnType, TQueryParams>,
  "body" | "method"
>;

type PostOptions<
  TPath extends string,
  TReturnType extends unknown,
  TQueryParams extends ZodTypeAny,
  TBody extends ZodTypeAny
> = Omit<
  RouteOptions<TPath, "POST", TReturnType, TQueryParams, TBody>,
  "method"
>;

type AnyRouteOption = RouteOptions<any, any, any, any>;

class RouteGroup<
  TBasePrefix extends string = string,
  TRoutes extends AnyRouteOption[] = AnyRouteOption[]
> {
  /** @internal */
  x_prefix?: TBasePrefix;

  /** @internal */
  x_routes: TRoutes = [] as any;

  constructor(prefix?: TBasePrefix) {
    this.x_prefix = prefix;
  }

  get<
    TPath extends string,
    TReturnType extends unknown = unknown,
    TQueryParams extends ZodTypeAny = ZodTypeAny
  >(
    options: GetOptions<TPath, TReturnType, TQueryParams>
  ): RouteGroup<
    TBasePrefix,
    TRoutes & GetOptions<TPath, TReturnType, TQueryParams>[]
  > {
    const method: HttpMethod = "GET";
    this.x_routes.push({ ...options, method });
    return this as any;
  }

  post<
    TPath extends string,
    TReturnType extends unknown = unknown,
    TQueryParams extends ZodTypeAny = ZodTypeAny,
    TBody extends ZodTypeAny = ZodTypeAny
  >(
    options: PostOptions<TPath, TReturnType, TQueryParams, TBody>
  ): RouteGroup<
    TBasePrefix,
    TRoutes & PostOptions<TPath, TReturnType, TQueryParams, TBody>[]
  > {
    const method: HttpMethod = "POST";
    this.x_routes.push({ ...options, method });
    return this as any;
  }
}

const routes = new RouteGroup("/api")
  .get({
    handler: () => "hello" as const,
    path: "/",
  })
  .post({
    handler: () => "hello" as const,
    path: "/",
    body: z.object({
      name: z.string(),
    }),
  });
