import { isFunction, Status, STATUS_TEXT } from "./deps.ts";

/** HTTP request method. */
export type Method =
  /** RFC 7231, 4.3.1 */
  | "GET"
  /** RFC 7231, 4.3.2 */
  | "HEAD"
  /** RFC 7231, 4.3.3 */
  | "POST"
  /** RFC 7231, 4.3.4 */
  | "PUT"
  /** RFC 7231, 4.3.5 */
  | "DELETE"
  /** RFC 7231, 4.3.6 */
  | "CONNECT"
  /** RFC 7231, 4.3.7 */
  | "OPTIONS"
  /** RFC 7231, 4.3.8 */
  | "TRACE"
  /** RFC 7231, */
  | "PATCH"
  // deno-lint-ignore ban-types
  | ({} & string);

/** HTTP request router API. */
export interface Router {
  (req: Request): Response | Promise<Response>;
}

/**
 * A handler for HTTP route requests. Consumes a request and connection information
 * and returns a response.
 *
 * If a handler throws, the server calling the handler will assume the impact
 * of the error is isolated to the individual request. It will catch the error
 * and close the underlying connection.
 */
export type RouteHandler = (
  req: Request,
  params: { readonly [k in string]?: string },
) => Promise<Response> | Response;

/** HTTP router routes. */
export interface Routes {
  readonly [k: string]: RouteHandler | MethodRouteHandler;
}

type MethodRouteHandler = { [k in Method]?: RouteHandler };

function methods(methodRouteHandler: MethodRouteHandler): RouteHandler {
  return (req, params) => {
    if (req.method in methodRouteHandler) {
      return methodRouteHandler[req.method]!(req, params);
    } else {
      const allows = Object.keys(methodRouteHandler);

      return new Response(null, {
        status: Status.MethodNotAllowed,
        statusText: STATUS_TEXT[Status.MethodNotAllowed],
        headers: {
          allow: allows.join(","),
        },
      });
    }
  };
}

/** Create HTTP request router.
 * ```ts
 * import { createRouter } from "https://deno.land/x/http_router@$VERSION/mod.ts";
 * import {
 *   serve,
 *   Status,
 *   STATUS_TEXT,
 * } from "https://deno.land/std@$VERSION/http/mod.ts";
 *
 * const router = createRouter({
 *   "/api/students/:name": {
 *     GET: (req, params) => {
 *       const greeting = `Hello! ${params.name!}`;
 *       return new Response(greeting);
 *     },
 *   },
 *   "/api/status": () => new Response(STATUS_TEXT[Status.OK]), // Any HTTP request method
 * });
 *
 * await serve(router);
 * ```
 * @throws TypeError
 * - The given route path is invalid url path.
 */
export function createRouter(routes: Routes): Router {
  const routeMap = new Map<URLPattern, RouteHandler>();

  for (const route in routes) {
    const url = new URLPattern({ pathname: route });
    const handler = routes[route];

    if (isFunction(handler)) {
      routeMap.set(url, handler);
    } else {
      routeMap.set(url, methods(handler));
    }
  }

  return (req) => {
    for (const [pattern, handler] of routeMap) {
      if (pattern.test(req.url)) {
        const params = pattern.exec(req.url)?.pathname.groups;

        try {
          return handler(req, params ?? {});
        } catch {
          return new Response(null, {
            status: Status.InternalServerError,
            statusText: STATUS_TEXT[Status.InternalServerError],
          });
        }
      }
    }

    return new Response(null, {
      status: Status.NotFound,
      statusText: STATUS_TEXT[Status.NotFound],
    });
  };
}
