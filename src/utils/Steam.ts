export interface SystemNetworkStore {
  hasInternetConnection: boolean;
  hasNetworkConnection: boolean;
  isAwaitingInitialNetworkState: boolean;
  isConnectingToNetwork: boolean;
}

/**
 * @returns The SystemNetworkStore interface or null if not available.
 */
export const getSystemNetworkStore = (): SystemNetworkStore | null => {
  return (window as unknown as { SystemNetworkStore?: SystemNetworkStore }).SystemNetworkStore ?? null;
};
