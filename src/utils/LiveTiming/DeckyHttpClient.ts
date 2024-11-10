// Licensed to the .NET Foundation under one or more agreements.
// The .NET Foundation licenses this file to you under the MIT license.

import { fetchNoCors } from "@decky/api";
import { AbortError, HttpClient, HttpError, HttpRequest, HttpResponse, ILogger, LogLevel, TimeoutError } from "@microsoft/signalr";
import { debug } from "../Logger";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isArrayBuffer = (val: any): val is ArrayBuffer => {
  return val && typeof ArrayBuffer !== "undefined"
    && (val instanceof ArrayBuffer
      // Sometimes we get an ArrayBuffer that doesn't satisfy instanceof
      || (val.constructor && val.constructor.name === "ArrayBuffer"));
};

const deserializeContent = (response: Response, responseType?: XMLHttpRequestResponseType): Promise<string | ArrayBuffer> => {
  let content;
  switch (responseType) {
    case "arraybuffer":
      content = response.arrayBuffer();
      break;
    case "text":
      content = response.text();
      break;
    case "blob":
    case "document":
    case "json":
      throw new Error(`${responseType} is not supported.`);
    default:
      content = response.text();
      break;
  }

  return content;
};

/**
 * Re-implementation of the FetchHttpClient that uses the fetchNoCors API.
 */
export class DeckyHttpClient extends HttpClient {
  private readonly _logger: ILogger;

  public constructor(logger: ILogger) {
    super();
    this._logger = logger;
  }

  async send(request: HttpRequest): Promise<HttpResponse> {
    debug("DeckyHttpClient.send", request);

    // Check that abort was not signaled before calling send
    if (request.abortSignal && request.abortSignal.aborted)
      throw new AbortError();

    if (!request.method)
      throw new Error("No method defined.");

    if (!request.url)
      throw new Error("No url defined.");

    const abortController = new AbortController();

    let error: unknown;

    // Hook our abortSignal into the abort controller
    if (request.abortSignal)
      request.abortSignal.onabort = () => {
        abortController.abort();
        error = new AbortError();
      };

    // If a timeout has been passed in, setup a timeout to call abort
    // Type needs to be any to fit window.setTimeout and NodeJS.setTimeout
    let timeoutId: number | null = null;
    if (request.timeout) {
      const msTimeout = request.timeout!;
      timeoutId = window.setTimeout(() => {
        abortController.abort();
        this._logger.log(LogLevel.Warning, `Timeout from HTTP request.`);
        error = new TimeoutError();
      }, msTimeout);
    }

    if (request.content === "")
      request.content = undefined;

    if (request.content) {
      // Explicitly setting the Content-Type header for React Native on Android platform.
      request.headers = request.headers || {};
      request.headers["Content-Type"] = isArrayBuffer(request.content)
        ? "application/octet-stream"
        : "text/plain;charset=UTF-8";
    }

    let response: Response;

    try {
      response = await fetchNoCors(request.url!, {
        body: request.content,
        cache: "no-cache",
        credentials: request.withCredentials === true ? "include" : "same-origin",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          ...request.headers,
        },
        method: request.method!,
        redirect: "follow",
        signal: abortController.signal,
      });
    }

    catch (e) {
      if (error)
        throw error;

      this._logger.log(
        LogLevel.Warning,
        `Error from HTTP request. ${e}.`,
      );

      throw e;
    }

    finally {
      if (timeoutId)
        window.clearTimeout(timeoutId);

      if (request.abortSignal)
        request.abortSignal.onabort = null;
    }

    if (!response.ok) {
      const errorMessage = await deserializeContent(response, "text") as string;
      throw new HttpError(errorMessage || response.statusText, response.status);
    }

    const content = deserializeContent(response, request.responseType);
    const payload = await content;

    return new HttpResponse(
      response.status,
      response.statusText,
      payload,
    );
  }
}
