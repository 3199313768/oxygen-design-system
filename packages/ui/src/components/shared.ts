import type { ReactNode } from 'react';

export interface Option<T = string> {
  disabled?: boolean;
  label: ReactNode;
  value: T;
}

export interface TreeNode<T = string> {
  children?: TreeNode<T>[];
  disabled?: boolean;
  /** Globally unique key within an acyclic tree. */
  key: T;
  label: ReactNode;
  /** Search/accessibility text for custom component labels; ordinary DOM labels and fragments are read automatically. */
  textValue?: string;
}

export type UploadFileStatus = 'error' | 'done' | 'uploading' | 'pending';

export interface UploadFile {
  file: File;
  id: string;
  name: string;
  percent?: number;
  status: UploadFileStatus;
  url?: string;
}
