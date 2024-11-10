import { IRetryPolicy, RetryContext } from "@microsoft/signalr";

import { debug } from "../Logger";

export class DeckyRetryPolicy implements IRetryPolicy {
  constructor(private maxRetryCount: number = 6) {}

  nextRetryDelayInMilliseconds(retryContext: RetryContext): number | null {
    debug("SignalR Connection Retry Context", retryContext);

    // stop retrying if we exceed maxRetryCount
    if (retryContext.previousRetryCount === this.maxRetryCount)
      return null;

    // exponentially back-off retry attempts
    return Math.pow(2, retryContext.previousRetryCount) * 1000;
  }
};
