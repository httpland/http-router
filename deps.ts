// Copyright 2022-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

export {
  isIterable,
  isTruthy,
} from "https://deno.land/x/isx@1.0.0-beta.21/mod.ts";
export {
  Status,
  STATUS_TEXT,
} from "https://deno.land/std@0.157.0/http/http_status.ts";
export { mapKeys } from "https://deno.land/std@0.157.0/collections/map_keys.ts";
export {
  type Handler,
  type HttpMethod,
} from "https://deno.land/x/http_utils@1.0.0-beta.2/mod.ts";
export { AssertionError } from "https://deno.land/x/assertion@1.0.0-beta.1/mod.ts";
import {
  Status,
  STATUS_TEXT,
} from "https://deno.land/std@0.157.0/http/http_status.ts";

export function duplicateBy<T>(
  value: Iterable<T>,
  selector: (el: T, prev: T) => boolean,
): T[] {
  const selectedValues: T[] = [];
  const ret: T[] = [];

  for (const element of value) {
    const has = selectedValues.some((v) => selector(element, v));

    if (has) {
      ret.push(element);
    } else {
      selectedValues.push(element);
    }
  }

  return ret;
}

export async function safeResponse(
  fn: () => Response | Promise<Response>,
  onError?: (error: unknown) => Response | Promise<Response>,
): Promise<Response> {
  try {
    return await fn();
  } catch (e) {
    const status = Status.InternalServerError;
    const response = new Response(null, {
      status,
      statusText: STATUS_TEXT[status],
    });

    try {
      return onError?.(e) ?? response;
    } catch {
      return response;
    }
  }
}
