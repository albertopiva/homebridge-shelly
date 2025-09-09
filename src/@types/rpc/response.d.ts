import { JSONRPCErrorResponse, JSONRPCSuccessResponse } from 'json-rpc-2.0';

/**
 * ResponseFrame when the request is successful.
 * result: The result of the invoked procedure and is returned if the request is successful. result and error re mutually exclusive.
 */
export interface ShellyRPCSuccessResponse extends JSONRPCSuccessResponse {
  dst: string;
}

/**
 * ResponseFrame when the request fails.
 * error: Contains description of the error occurred and is returned if the request is unsuccessful.
 * Result and error re mutually exclusive.
 */
export interface ShellyRPCErrorResponse extends JSONRPCErrorResponse {
  dst: string;
}

export type ShellyRPCResponse =
  | ShellyRPCSuccessResponse
  | ShellyRPCErrorResponse;

/**
 * The notification frame is a JSON object, similar to a request but not expecting a response.
 * It contains the following attributes:
 * - src: Name of the source of the response.
 * - dst: Name of the destination.
 * - method: The method invoked.
 * - params: The parameters of the notification.
 */
export interface ShellyRPCNotificationFrame {
  src: string;
  dst: string;
  method: string;
  params: object;
}
