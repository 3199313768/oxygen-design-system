import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { FileText, Inbox, Upload as UploadIcon } from 'lucide-react';

import { cn } from '../lib/cn';
import type { UploadFile } from './shared';
import { useOxygenLocale } from './ConfigProvider';
import { Progress } from './Progress';

export interface UploadRequestHandlers {
  onError: (error?: Error) => void;
  onProgress: (percent: number) => void;
  onSuccess: (url?: string) => void;
}

export interface UploadProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'onError' | 'onProgress'> {
  accept?: string;
  beforeUpload?: (file: File) => boolean | Promise<boolean>;
  children?: ReactNode;
  customRequest?: (file: File, handlers: UploadRequestHandlers) => void | Promise<void>;
  defaultFileList?: UploadFile[];
  disabled?: boolean;
  drag?: boolean;
  fileList?: UploadFile[];
  maxCount?: number;
  maxSize?: number;
  multiple?: boolean;
  onChange?: (fileList: UploadFile[]) => void;
  onError?: (file: UploadFile, error?: Error) => void;
  onPreview?: (file: UploadFile) => void;
  onProgress?: (file: UploadFile, percent: number) => void;
  onRemove?: (file: UploadFile) => void | boolean | Promise<void | boolean>;
  onSuccess?: (file: UploadFile) => void;
  showUploadList?: boolean;
}

let nextUploadId = 0;

function createUploadFile(file: File): UploadFile {
  return {
    file,
    id: `oxygen-upload-${++nextUploadId}`,
    name: file.name,
    status: 'pending',
  };
}

export const Upload = forwardRef<HTMLDivElement, UploadProps>(
  (
    {
      accept,
      'aria-label': ariaLabel,
      beforeUpload,
      children,
      className,
      customRequest,
      defaultFileList = [],
      disabled = false,
      drag = false,
      fileList: fileListProp,
      maxCount,
      maxSize,
      multiple = false,
      onChange,
      onError,
      onPreview,
      onProgress,
      onRemove,
      onSuccess,
      showUploadList = true,
      ...props
    },
    ref,
  ) => {
    const locale = useOxygenLocale();
    const hintId = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const [uncontrolledFiles, setUncontrolledFiles] = useState(defaultFileList);
    const fileList = fileListProp ?? uncontrolledFiles;

    const latestFiles = useRef(fileList);
    const previousControlledFiles = useRef(fileListProp);
    const requests = useRef(new Map<string, symbol>());
    const mounted = useRef(true);
    const latest = useRef({ disabled, fileListProp, onChange, onError, onProgress, onSuccess });
    latest.current = { disabled, fileListProp, onChange, onError, onProgress, onSuccess };

    // A new controlled list is authoritative; pending callbacks read it rather
    // than the list captured when a request started.
    if (previousControlledFiles.current !== fileListProp) {
      for (const id of requests.current.keys()) {
        const previousFile = latestFiles.current.find((file) => file.id === id);
        if (!fileList.some((file) => file.id === id && file.file === previousFile?.file)) {
          requests.current.delete(id);
        }
      }
      latestFiles.current = fileList;
      previousControlledFiles.current = fileListProp;
    }

    useEffect(() => {
      mounted.current = true;
      return () => {
        mounted.current = false;
        requests.current.clear();
      };
    }, []);

    function updateFiles(nextFiles: UploadFile[]) {
      if (!mounted.current) return;
      latestFiles.current = nextFiles;
      for (const id of requests.current.keys()) {
        if (!nextFiles.some((file) => file.id === id)) requests.current.delete(id);
      }
      if (latest.current.fileListProp === undefined) setUncontrolledFiles(nextFiles);
      latest.current.onChange?.(nextFiles);
    }

    function beginRequest(uploadFile: UploadFile) {
      if (!customRequest) return;
      const token = Symbol(uploadFile.id);
      requests.current.set(uploadFile.id, token);

      function setStatus(patch: Partial<UploadFile>, complete = false) {
        if (!mounted.current || requests.current.get(uploadFile.id) !== token) return;
        const current = latestFiles.current.find(
          (file) => file.id === uploadFile.id && file.file === uploadFile.file,
        );
        if (!current) return;
        const nextFile = { ...current, ...patch };
        if (complete) requests.current.delete(uploadFile.id);
        updateFiles(latestFiles.current.map((file) => file === current ? nextFile : file));
        return nextFile;
      }

      const fail = (error?: Error) => {
        const file = setStatus({ status: 'error' }, true);
        if (file) latest.current.onError?.(file, error);
      };
      setStatus({ status: 'uploading', percent: 0 });
      void Promise.resolve()
        .then(() => {
          if (requests.current.get(uploadFile.id) !== token) return;
          return customRequest(uploadFile.file, {
            onError: fail,
            onProgress: (percent) => {
              if (!Number.isFinite(percent)) return;
              const progress = Math.min(100, Math.max(0, percent));
              const file = setStatus({ percent: progress, status: 'uploading' });
              if (file) latest.current.onProgress?.(file, progress);
            },
            onSuccess: (url) => {
              const file = setStatus({ percent: 100, status: 'done', url }, true);
              if (file) latest.current.onSuccess?.(file);
            },
          });
        })
        .catch((error: unknown) => fail(error instanceof Error ? error : new Error(String(error))));
    }

    async function handleFiles(files: File[]) {
      if (latest.current.disabled) return;
      const accepted: UploadFile[] = [];
      for (const file of multiple ? files : files.slice(0, 1)) {
        if (maxSize !== undefined && file.size > maxSize) continue;
        try {
          if (beforeUpload && !(await beforeUpload(file))) continue;
          accepted.push(createUploadFile(file));
        } catch (error) {
          latest.current.onError?.(
            { ...createUploadFile(file), status: 'error' },
            error instanceof Error ? error : new Error(String(error)),
          );
        }
      }
      if (!mounted.current || latest.current.disabled || accepted.length === 0) return;
      const nextFiles = [...(multiple ? latestFiles.current : []), ...accepted];
      const limit = maxCount === undefined ? undefined : Math.max(0, Math.floor(maxCount));
      const finalFiles = limit === undefined ? nextFiles : limit === 0 ? [] : nextFiles.slice(-limit);
      updateFiles(finalFiles);
      finalFiles.filter((file) => accepted.includes(file)).forEach(beginRequest);
    }

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
      void handleFiles(Array.from(event.currentTarget.files ?? []));
      event.currentTarget.value = '';
    }

    async function handleRemove(file: UploadFile) {
      if (latest.current.disabled) return;
      try {
        const result = await onRemove?.(file);
        if (result === false || !mounted.current) return;
        updateFiles(latestFiles.current.filter((item) => item.id !== file.id || item.file !== file.file));
      } catch (error) {
        latest.current.onError?.(file, error instanceof Error ? error : new Error(String(error)));
      }
    }

    return (
      <div className={cn('oxygen-upload', className)} ref={ref} {...props}>
        <input
          accept={accept}
          aria-label={ariaLabel ?? locale.common.upload}
          className="oxygen-visually-hidden"
          disabled={disabled}
          multiple={multiple}
          onChange={handleChange}
          ref={inputRef}
          type="file"
        />
        <button
          aria-label={children == null ? locale.common.browse : undefined}
          aria-describedby={drag && children == null ? hintId : undefined}
          className={cn('oxygen-upload__trigger', drag && 'oxygen-upload__trigger--drag')}
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            if (!drag) return;
            event.preventDefault();
            event.dataTransfer.dropEffect = disabled ? 'none' : 'copy';
          }}
          onDrop={(event) => {
            if (!drag) return;
            event.preventDefault();
            if (!disabled) void handleFiles(Array.from(event.dataTransfer.files));
          }}
          type="button"
        >
          {children ?? (
            <>
              {drag ? <Inbox aria-hidden="true" className="oxygen-upload__trigger-icon" /> : <UploadIcon aria-hidden="true" className="oxygen-upload__trigger-icon" />}
              <span className="oxygen-upload__trigger-label">{locale.common.browse}</span>
              {drag ? <span className="oxygen-upload__hint" id={hintId}>{locale.upload.dragHint ?? locale.common.browse}</span> : null}
            </>
          )}
        </button>
        {showUploadList ? (
          <ul className="oxygen-upload__list">
            {fileList.map((file) => (
              <li className="oxygen-upload__item" data-status={file.status} key={file.id}>
                <FileText aria-hidden="true" className="oxygen-upload__file-icon" />
                <div className="oxygen-upload__details">
                  {onPreview ? <button
                    className="oxygen-upload__name"
                    onClick={() => onPreview?.(file)}
                    type="button"
                  >
                    {file.name}
                  </button> : <span className="oxygen-upload__name">{file.name}</span>}
                  <span
                    className={cn(
                      'oxygen-upload__status',
                      file.status === 'error' && 'oxygen-upload__status--error',
                    )}
                  >
                    {file.status === 'uploading' && file.percent !== undefined
                      ? `${locale.upload.uploading} ${file.percent}%`
                      : locale.upload[file.status]}
                  </span>
                  {file.status === 'uploading' ? (
                    <Progress
                      aria-label={file.name}
                      className="oxygen-upload__progress"
                      percent={file.percent}
                      showInfo={false}
                      status="active"
                    />
                  ) : null}
                </div>
                <button
                  aria-label={`${locale.common.remove} ${file.name}`}
                  className="oxygen-upload__remove"
                  disabled={disabled}
                  onClick={() => void handleRemove(file)}
                  type="button"
                >
                  {locale.common.remove}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  },
);

Upload.displayName = 'Upload';
