import { createContext, createElement, useContext, type ReactNode } from 'react';

export interface FieldContextValue {
  controlId: string;
  descriptionId: string;
  errorId: string;
  hasDescription: boolean;
  hasError: boolean;
  invalid: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

export function FieldContextProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: FieldContextValue;
}) {
  return createElement(FieldContext.Provider, { value }, children);
}

export function useFieldContext() {
  return useContext(FieldContext);
}
