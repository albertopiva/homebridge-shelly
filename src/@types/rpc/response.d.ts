/**
 * ResponseFrame represents a JSON-RPC response frame.
 * id: Id of the communication.
 * src: Name of the source of the response.
 * dst: Name of the destination (the source of the request).
 */
interface BaseResponseFrame {
  id: number | string;
  src: string;
  dst: string;
}

/**
 * ResponseFrame when the request is successful.
 * result: The result of the invoked procedure and is returned if the request is successful. result and error re mutually exclusive.
 */
export interface SuccessResponseFrame extends BaseResponseFrame {
  result: object;
}

/**
 * ResponseFrame when the request fails.
 * error: Contains description of the error occurred and is returned if the request is unsuccessful.
 * Result and error re mutually exclusive.
 */
export interface ErrorResponseFrame extends BaseResponseFrame {
  error: object;
}

export type ResponseFrame = SuccessResponseFrame | ErrorResponseFrame;

/**
 * The notification frame is a JSON object, similar to a request but not expecting a response.
 * It contains the following attributes:
 * - src: Name of the source of the response.
 * - dst: Name of the destination.
 * - method: The method invoked.
 * - params: The parameters of the notification.
 */
export type NotificationFrame = {
  src: string;
  dst: string;
  method: string;
  params: object;
};
