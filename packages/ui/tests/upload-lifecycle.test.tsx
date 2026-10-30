import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Upload, type UploadRequestHandlers } from '../src/components/Upload';

function deferred() {
  let reject!: (error: Error) => void;
  const promise = new Promise<boolean>((_resolve, fail) => { reject = fail; });
  return { promise, reject };
}

describe('upload lifecycle boundaries', () => {
  it('aborts all requests on unmount and ignores every late request callback', async () => {
    const requests: UploadRequestHandlers[] = [];
    const onChange = vi.fn();
    const onProgress = vi.fn();
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const { unmount } = render(<Upload multiple onChange={onChange} onProgress={onProgress}
      onSuccess={onSuccess} onError={onError} customRequest={(_file, handlers) => { requests.push(handlers); }} />);
    fireEvent.change(screen.getByLabelText('上传'), { target: { files: [new File(['a'], 'a.txt'), new File(['b'], 'b.txt')] } });
    await waitFor(() => expect(requests).toHaveLength(2));
    onChange.mockClear();
    unmount();
    expect(requests.every((request) => request.signal.aborted)).toBe(true);
    act(() => {
      for (const request of requests) {
        request.onProgress(50);
        request.onSuccess('/late');
        request.onError(new Error('late failure'));
      }
    });
    expect(onChange).not.toHaveBeenCalled();
    expect(onProgress).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it('reports a rejected custom request as an upload failure', async () => {
    const error = new Error('connection lost');
    const onError = vi.fn();
    render(<Upload onError={onError} customRequest={() => Promise.reject(error)} />);
    fireEvent.change(screen.getByLabelText('上传'), { target: { files: [new File(['a'], 'failed.txt')] } });
    await screen.findByText('上传失败');
    expect(onError).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ name: 'failed.txt', status: 'error' }), error);
  });

  it('does not report a late validation rejection after unmount', async () => {
    const validation = deferred();
    const onError = vi.fn();
    const { unmount } = render(<Upload beforeUpload={() => validation.promise} onError={onError} />);
    fireEvent.change(screen.getByLabelText('上传'), { target: { files: [new File(['a'], 'validate.txt')] } });
    unmount();
    await act(async () => validation.reject(new Error('late validation')));
    expect(onError).not.toHaveBeenCalled();
  });

  it('does not report a late removal rejection after unmount', async () => {
    const removal = deferred();
    const onError = vi.fn();
    const { unmount } = render(<Upload onRemove={() => removal.promise} onError={onError}
      defaultFileList={[{ id: 'a', name: 'remove.txt', file: new File(['a'], 'remove.txt'), status: 'done' }]} />);
    fireEvent.click(screen.getByRole('button', { name: '移除 remove.txt' }));
    unmount();
    await act(async () => removal.reject(new Error('late removal')));
    expect(onError).not.toHaveBeenCalled();
  });
});
