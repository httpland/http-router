/** HTTP request method.
 *
 * @deprecated rename to {@link HttpMethod}
 */
export type Method =
  /** RFC 9110, 9.3.1 */
  | "GET"
  /** RFC 9110, 9.3.2 */
  | "HEAD"
  /** RFC 9110, 9.3.3 */
  | "POST"
  /** RFC 9110, 9.3.4 */
  | "PUT"
  /** RFC 9110, 9.3.5 */
  | "DELETE"
  /** RFC 9110, 9.3.6 */
  | "CONNECT"
  /** RFC 9110, 9.3.7 */
  | "OPTIONS"
  /** RFC 9110, 9.3.8 */
  | "TRACE"
  /** RFC 5789 */
  | "PATCH";

/** HTTP request method. */
export type HttpMethod = Method;
