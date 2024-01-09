import {
  App,
  H3Event,
  Router,
  createApp,
  createRouter,
  eventHandler,
  readBody,
} from "h3";
import z, { ZodTypeAny } from "zod";
import { stripLeadingSlash } from "./util";

type AnyRoute = Route<any, any, any, any>;

type ExtractPath<T> = T extends Route<infer TPath, any, any, any>
  ? TPath extends `/${infer Rest}`
    ? Rest
    : TPath
  : never;

export type InferPaths<T> = `/${ConcatenatePaths<T>}`;

type ConcatenatePaths<T> = T extends Route<any, any, infer TChildren, any>
  ? TChildren extends Route<any, any, any, any>[]
    ?
        | `${ExtractPath<T>}`
        | `${ExtractPath<T>}/${ConcatenatePaths<TChildren[number]>}`
    : ExtractPath<T>
  : never;

type MethodHandlerOptions<TOutput> = {
  handler: (ctx: { event: H3Event }) => TOutput;
};

type MethodHandlerWithBodyOptions<
  TOutput,
  TInput extends ZodTypeAny = ZodTypeAny
> = {
  body?: TInput;
  handler: (ctx: { body: z.infer<TInput>; event: H3Event }) => TOutput;
};

type RouteConfig<
  TPath extends string,
  TParentRoute extends AnyRoute = AnyRoute,
  TGetOutput extends unknown = unknown,
  TPostOutput extends unknown = unknown,
  TPostInput extends ZodTypeAny = ZodTypeAny
> = {
  path: TPath;
  getParentRoute: () => TParentRoute;
  get?: MethodHandlerOptions<TGetOutput>;
  post?: MethodHandlerWithBodyOptions<TPostOutput, TPostInput>;
};

export class Route<
  TPath extends string = string,
  TParentRoute extends Route = AnyRoute,
  TChildren extends unknown = unknown,
  TGetOutput extends unknown = unknown,
  TPostOutput extends unknown = unknown,
  TPostInput extends ZodTypeAny = ZodTypeAny
> {
  config: RouteConfig<TPath, TParentRoute, TGetOutput, TPostOutput, TPostInput>;
  children?: TChildren;

  constructor(
    config?: RouteConfig<
      TPath,
      TParentRoute,
      TGetOutput,
      TPostOutput,
      TPostInput
    >
  ) {
    this.config = config ?? ({} as any);
  }

  addChildren<TNewChildren extends AnyRoute[]>(
    children: TNewChildren
  ): Route<TPath, TParentRoute, TNewChildren, TGetOutput> {
    this.children = children as any;
    return this as any;
  }
}

export class RootRoute<TBasePrefix extends string = "/"> extends Route<
  TBasePrefix,
  any,
  any,
  any,
  any,
  any
> {
  constructor(
    options?: Omit<RouteConfig<TBasePrefix, any>, "getParentRoute" | "get">
  ) {
    super(options as any);
  }
}

export class WebApplication<TRouteTree extends AnyRoute = AnyRoute> {
  routeTree: TRouteTree;

  private app: App = createApp();
  private router: Router = createRouter();

  constructor(routeTree: TRouteTree) {
    this.routeTree = routeTree;

    this.init();
  }

  private init() {
    this.connectHandlers(this.routeTree);
    this.app.use(this.router);
  }

  private connectHandlers(route: AnyRoute) {
    const handlers = ["get" as const] as const;
    const handlersWithBody = ["post" as const] as const;

    for (const handler of handlers) {
      this.connectHandler(route, handler);
    }

    for (const handler of handlersWithBody) {
      this.connectHandlerWithBody(route, handler);
    }

    if (route.children) {
      for (const child of route.children) {
        this.connectHandlers(child);
      }
    }
  }

  private connectHandlerWithBody(route: AnyRoute, method: "post") {
    const methodOptions = route.config[method];

    if (methodOptions?.handler) {
      const path = this.buildRoutePath(route);

      this.router[method](
        path,
        eventHandler(async (event) => {
          let body: any;

          if (methodOptions.body) {
            const rawBody = await readBody(event);
            body = methodOptions.body.parse(rawBody);
          }

          const result = await methodOptions.handler({ event, body });
          return result;
        })
      );

      console.log("[Router]", `Mapped route [${method}] ${path}`);
    }
  }

  private connectHandler(route: AnyRoute, method: "get") {
    const methodOptions = route.config[method];

    if (methodOptions?.handler) {
      const path = this.buildRoutePath(route);

      this.router[method](
        path,
        eventHandler(async (event) => {
          const result = await methodOptions.handler({ event });
          return result;
        })
      );

      console.log("[Router]", `Mapped route [${method}] ${path}`);
    }
  }

  private buildRoutePath(
    route: AnyRoute,
    childPathParts: string[] = []
  ): string {
    const parentRoute = route.config?.getParentRoute?.();

    if (parentRoute?.config?.path) {
      return this.buildRoutePath(parentRoute, [
        stripLeadingSlash(route.config.path),
        ...childPathParts,
      ]);
    }

    const joinedParts = [
      stripLeadingSlash(route.config.path),
      ...childPathParts,
    ].join("/");

    return `/${joinedParts}`;
  }

  public getApp() {
    return this.app;
  }
}
