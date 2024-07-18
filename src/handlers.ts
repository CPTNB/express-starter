import express from "express";
import type { Result } from "ts-results-es";

/**
 * Get keys from T whose values are not `never`
 */
type RemoveNeverKeys<T> = {
  [P in keyof T]: T[P] extends never ? never : P;
}[keyof T];
/**
 * Utility type to remove fields with `never` type from T
 */
type RemoveNevers<T> = Pick<T, RemoveNeverKeys<T>>;

/**
 * FERN SERVICE METHODS
 */
/**
 * Service method type.
 */
type ServiceMethod = (
  req: never,
  res: ServiceResponseArg,
  next: express.NextFunction,
) => void | Promise<void>;
/**
 * Get the request argument type from a Fern service method (the first argument).
 */
type GetMethodRequestArg<Method extends ServiceMethod> = Parameters<Method>[0];
/**
 * Get the response argument type from a Fern service method (the second argument).
 */
type GetMethodResponseArg<Method extends ServiceMethod> = Parameters<Method>[1];

/**
 * Type for the `response` argument passed to a Fern service method.
 */
type ServiceResponseArg = {
  send: (responseBody?: unknown) => Promise<void>;
  cookie: (
    cookie: string,
    value: string,
    options?: express.CookieOptions,
  ) => void;
  locals: unknown;
};
/**
 * Get the response body type from a Fern service method (the first argument to the `send` method).
 */
type GetResponseBodyType<Arg extends ServiceResponseArg> = Parameters<
  Arg["send"]
>[0];

/**
 * ROUTE HANDLERS
 */
/**
 * Arguments passed to a route handler.
 */
type RouteHandlerArgs<Query, Params, ReqBody> = {
  query: Query;
  params: Params;
  body: ReqBody;
};
/**
 * Type for a route handler, which is an abstraction over Fern methods that has a
 * more idiomatic API.
 */
type RouteHandler<Query, Params, ReqBody, ResBody> = (
  args: RemoveNevers<RouteHandlerArgs<Query, Params, ReqBody>>,
) => Promise<Result<ResBody, Error>>;

/**
 * Utility type to convert a Fern service method to a route handler.
 */
type HandlerFromMethod<Method extends ServiceMethod> = RouteHandler<
  GetMethodRequestArg<Method>["query"],
  GetMethodRequestArg<Method>["params"],
  GetMethodRequestArg<Method>["body"],
  GetResponseBodyType<GetMethodResponseArg<Method>>
>;
/**
 * Utility type to convert a record (dict) of Fern service methods to a record of route handlers.
 */
type Handlers<ServiceMethods extends Record<string, ServiceMethod>> = {
  [K in keyof ServiceMethods]: HandlerFromMethod<ServiceMethods[K]>;
};
/**
 * Function to provide type safety/inference for defining handlers.
 * @param handlers
 * @returns
 */
export const defineServiceHandlers = <
  Methods extends Record<keyof Methods, ServiceMethod>,
>(
  handlers: Handlers<Methods>,
) => {
  return handlers;
};

/**
 * Utility function to convert a route handler to a Fern service method.
 */
export const handlerToMethod = (
  handler: RouteHandler<unknown, unknown, unknown, unknown>,
): ((
  req: express.Request<unknown, unknown, unknown, unknown>,
  res: ServiceResponseArg,
) => void | Promise<void>) => {
  return async (req, res) => {
    const result = await handler({
      query: req.query,
      params: req.params,
      body: req.body,
    });
    if (result.isErr()) {
      // eslint-disable-next-line custom-rules/no-throw
      throw result.error;
    }
    res.send(result.value);
  };
};
/**
 * Utility function to convert a record (dict) of route handlers to a record of Fern service methods.
 */
export const createServiceMethodsFromHandlers = <
  Methods extends Record<keyof Methods, ServiceMethod>,
>(
  handlers: Record<keyof Methods, unknown>,
): Methods => {
  return Object.fromEntries(
    Object.entries(handlers).map(([key, handler]) => [
      key,
      handlerToMethod(
        handler as RouteHandler<unknown, unknown, unknown, unknown>,
      ),
    ]),
  ) as unknown as Methods;
};