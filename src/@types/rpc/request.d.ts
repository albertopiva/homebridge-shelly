import { JSONRPCRequest } from 'json-rpc-2.0';

/**
 * RequestFrame represents a JSON-RPC request frame.
 * jsonrpc: 2.0. The version of jsonrpc used.
 * id: Identifier of this request, will be used to match the response frame.
 * src: Name of the source of the request (you can choose whatever string you like to identify you as the source of the request).
 * method: Name of the procedure to be called.
 * params: Parameters that the method takes (if any).
 */
export interface ShellyRPCRequest extends JSONRPCRequest {
  src: string;
}
