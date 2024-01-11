import { ZodTypeAny, z } from "zod";
import { Endpoint } from "./router";

export type OptionalValidation = ZodTypeAny | undefined;

export type InferGetHandlerReturn<T> = T extends Endpoint<
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

export type InferGetQueryParams<T> = T extends Endpoint<
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

export type InferPostHandlerReturn<T> = T extends Endpoint<
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

export type InferPostQueryParams<T> = T extends Endpoint<
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

export type InferPostBody<T> = T extends Endpoint<
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

export type RemoveLeadingSlash<T extends string> = T extends `/${infer TRest}`
  ? RemoveLeadingSlash<TRest>
  : T;

export type RemoveTrailinSlash<T extends string> = T extends `${infer TRest}/`
  ? RemoveTrailinSlash<TRest>
  : T;

export type InferPath<T> = T extends Endpoint<
  infer TPath,
  any,
  any,
  any,
  any,
  any
>
  ? RemoveLeadingSlash<RemoveTrailinSlash<TPath>>
  : never;
