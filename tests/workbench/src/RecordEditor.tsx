import { useState, type FormEvent } from 'react';
import {
  Alert, Button, Checkbox, Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, Form, Input, Select,
  SelectContent, SelectItem, SelectTrigger, SelectValue, Upload,
  type UploadFile, type UploadRequestHandlers,
} from '@oxygen-design/ui';

export interface DemoRecord {
  id: number;
  name: string;
  status: 'enabled' | 'disabled';
  attachments: UploadFile[];
}

interface RecordEditorProps {
  record: DemoRecord;
  onClose: () => void;
  onSave: (record: DemoRecord) => void;
  restoreFocus: () => void;
}

export function RecordEditor({ record, onClose, onSave, restoreFocus }: RecordEditorProps) {
  const [name, setName] = useState(record.name);
  const [status, setStatus] = useState(record.status);
  const [attachments, setAttachments] = useState(record.attachments);
  const [invalid, setInvalid] = useState(false);
  const [failUpload, setFailUpload] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const unsettled = attachments.some((file) => file.status !== 'done');

  function upload(_file: File, handlers: UploadRequestHandlers) {
    if (handlers.signal.aborted) return;
    handlers.onProgress(25);
    const timer = window.setTimeout(() => {
      handlers.signal.removeEventListener('abort', cancel);
      if (failUpload) handlers.onError(new Error('模拟上传失败，请移除后重新选择。'));
      else handlers.onSuccess();
    }, 800);
    function cancel() {
      window.clearTimeout(timer);
    }
    handlers.signal.addEventListener('abort', cancel, { once: true });
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setInvalid(true);
      return;
    }
    if (unsettled) return;
    onSave({ ...record, name: name.trim(), status, attachments });
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="workbench-editor" onCloseAutoFocus={(event) => {
        event.preventDefault();
        restoreFocus();
      }}>
        <DialogHeader>
          <DialogTitle>编辑记录</DialogTitle>
          <DialogDescription>修改名称、状态或附件，保存后更新当前列表。</DialogDescription>
        </DialogHeader>
        <Form noValidate onSubmit={save}>
          <Form.Item label="名称" name="record-name" required
            help={invalid ? '请输入名称' : '最多 80 个字符'}
            validateStatus={invalid ? 'error' : undefined}>
            <Input maxLength={80} value={name} onChange={(event) => {
              setName(event.target.value);
              setInvalid(false);
            }} />
          </Form.Item>
          <Form.Item label="状态" name="record-status">
            <Select value={status} onValueChange={(value) => setStatus(value as DemoRecord['status'])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="enabled">启用中</SelectItem>
                <SelectItem value="disabled">已停用</SelectItem>
              </SelectContent>
            </Select>
          </Form.Item>
          <section className="workbench-attachments" aria-labelledby="attachment-title">
            <h2 id="attachment-title">附件</h2>
            <p>支持单个 1 MB 以内的文本文件。此处仅模拟上传，不发送文件。</p>
            <Upload aria-label="选择附件" accept=".txt,text/plain" maxCount={1}
              fileList={attachments} onChange={setAttachments} customRequest={upload}
              beforeUpload={(file) => {
                setUploadError('');
                if (!file.name.toLowerCase().endsWith('.txt') || file.size > 1024 * 1024) {
                  throw new Error('请选择 1 MB 以内的 .txt 文件。');
                }
                return true;
              }}
              onError={(_file, error) => setUploadError(error?.message ?? '上传失败')}
              onRemove={() => setUploadError('')} />
            <label className="workbench-check">
              <Checkbox checked={failUpload} onCheckedChange={(checked) => setFailUpload(checked === true)} />
              模拟上传失败
            </label>
            {uploadError ? <Alert tone="error">{uploadError}</Alert> : null}
            {unsettled ? <p role="status">请等待上传完成，或移除失败附件后保存。</p> : null}
          </section>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>取消</Button>
            <Button type="submit" disabled={unsettled}>保存</Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
