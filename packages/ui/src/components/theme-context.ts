import { createContext, useContext } from 'react';

/** Explicit modes supported by ConfigProvider and data-oxygen-theme boundaries. */
export type OxygenTheme = 'light' | 'dark' | 'system';

// Undefined keeps providers transparent to a host's CSS theme boundary.
export const OxygenThemeContext = createContext<OxygenTheme | undefined>(undefined);

/** Carry the React origin through Portals without changing their DOM structure. */
export function useOxygenThemeAttributes() {
  return { 'data-oxygen-theme': useContext(OxygenThemeContext) };
}
