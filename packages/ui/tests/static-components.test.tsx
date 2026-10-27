import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Check,
  Field,
  FieldError,
  Input,
  Label,
} from '../src';

describe('static components', () => {
  it('links a field error to its input', () => {
    render(
      <Field>
        <Label htmlFor="email">邮箱</Label>
        <Input aria-describedby="email-error" aria-invalid id="email" />
        <FieldError id="email-error">请输入邮箱</FieldError>
      </Field>,
    );

    expect(screen.getByLabelText('邮箱')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('邮箱')).toHaveAccessibleDescription('请输入邮箱');
    expect(screen.getByText('请输入邮箱')).toHaveAttribute('role', 'alert');
  });

  it('forwards native input properties and refs', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input disabled name="query" placeholder="搜索" ref={ref} />);

    expect(ref.current).toBe(screen.getByPlaceholderText('搜索'));
    expect(ref.current).toBeDisabled();
    expect(ref.current).toHaveAttribute('name', 'query');
  });

  it('forwards a button ref and exposes destructive intent', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Button ref={ref} variant="destructive">
        永久删除
      </Button>,
    );

    expect(ref.current).toBe(screen.getByRole('button', { name: '永久删除' }));
    expect(ref.current).toHaveAttribute('data-variant', 'destructive');
    expect(ref.current).toHaveAttribute('data-oxygen-control', 'true');
  });

  it('supports composing a button style onto a link', () => {
    render(
      <Button asChild>
        <a href="/files">查看文件</a>
      </Button>,
    );

    expect(screen.getByRole('link', { name: '查看文件' })).toHaveAttribute(
      'href',
      '/files',
    );
  });

  it('renders status surfaces with stable semantic attributes', () => {
    render(
      <>
        <Badge variant="success">已完成</Badge>
        <Alert tone="error">
          <AlertDescription>网络异常，请重试</AlertDescription>
        </Alert>
      </>,
    );

    expect(screen.getByText('已完成')).toHaveAttribute('data-variant', 'success');
    expect(screen.getByRole('alert')).toHaveAttribute('data-tone', 'error');
  });

  it('renders card composition and curated icons from the root export', () => {
    render(
      <Card>
        <CardHeader>
          <Check aria-label="已选择" />
          <CardTitle>知识库</CardTitle>
          <CardDescription>统一管理团队资料</CardDescription>
        </CardHeader>
        <CardContent>暂无文件</CardContent>
      </Card>,
    );

    expect(screen.getByLabelText('已选择')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '知识库' })).toBeInTheDocument();
    expect(screen.getByText('暂无文件')).toBeInTheDocument();
  });
});
