import { ZodTypeAny, z } from "zod";
import { OptionalValidation } from "./typeUtils";

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

export type EndpointConfig<
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

export type AnyEndpoint = Endpoint<any, any, any, any, any, any, any, any>;

export class Endpoint<
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
