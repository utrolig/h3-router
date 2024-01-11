import { ZodTypeAny } from "zod";

type MethodWithoutBody = "GET" | "HEAD";
type MethodWithBody =
  | "PATCH"
  | "POST"
  | "PUT"
  | "DELETE"
  | "CONNECT"
  | "OPTIONS"
  | "TRACE";

type HttpMethod = MethodWithoutBody | MethodWithBody;

type BaseEndpointOptions<
  TParentRoute extends any = string,
  TPath extends string = string,
  TQueryParams extends ZodTypeAny = ZodTypeAny,
  TBody extends ZodTypeAny = ZodTypeAny
> = {
  getParentRoute: TParentRoute;
  path: TPath;
  method: Lowercase<HttpMethod>;
  queryParams?: TQueryParams;
  body?: TBody;
};

type EndpointWithoutBodyOptions<
  TParentRoute extends any = any,
  TPath extends string = string,
  TQueryParams extends ZodTypeAny = ZodTypeAny
> = Omit<BaseEndpointOptions<TParentRoute, TPath, TQueryParams>, "body"> & {
  method: MethodWithoutBody;
};

type EndpointWithBodyOptions<
  TParentRoute extends any = string,
  TPath extends string = string,
  TQueryParams extends ZodTypeAny = ZodTypeAny,
  TBody extends ZodTypeAny = ZodTypeAny
> = BaseEndpointOptions<TParentRoute, TPath, TQueryParams, TBody> & {
  method: MethodWithBody;
};

type GetEndpointOptions<
  TParentRoute extends any = any,
  TPath extends string = string,
  TQueryParams extends ZodTypeAny = ZodTypeAny
> = EndpointWithoutBodyOptions<TParentRoute, TPath, TQueryParams> & {
  method: "get";
};

type PostEndpointOptions<
  TParentRoute extends any = string,
  TPath extends string = string,
  TQueryParams extends ZodTypeAny = ZodTypeAny,
  TBody extends ZodTypeAny = ZodTypeAny
> = EndpointWithBodyOptions<TParentRoute, TPath, TQueryParams, TBody> & {
  method: "post";
};

class Endpoint<
  TParentRoute extends any = any,
  TPath extends string = string,
  TQueryParams extends ZodTypeAny = ZodTypeAny,
  TBody extends ZodTypeAny = ZodTypeAny
> {
  constructor(options: GetEndpointOptions<TParentRoute, TPath, TQueryParams>);
  constructor(
    options: PostEndpointOptions<TParentRoute, TPath, TQueryParams, TBody>
  );
  constructor(
    public options: BaseEndpointOptions<
      TParentRoute,
      TPath,
      TQueryParams,
      TBody
    >
  ) {}
}
