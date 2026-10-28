import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Checkbox,
  Field,
  FieldControl,
  FieldLabel,
  Form,
  Input,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
  Typography,
} from '@oxygen-design/ui';

const meta = {
  title: '数据录入/表单控件',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const CheckboxStates: Story = {
  render: () => (
    <section className="story-section">
      <h2 className="story-section__title">
        复选框
      </h2>
      <p className="story-section__description">展示未选中、已选中、半选和禁用状态。</p>
      <div className="story-row">
        <label className="story-choice">
          <Checkbox aria-label="未选中" /> 未选中
        </label>
        <label className="story-choice">
          <Checkbox aria-label="已选中" defaultChecked /> 已选中
        </label>
        <label className="story-choice">
          <Checkbox aria-label="半选" defaultChecked="indeterminate" /> 半选
        </label>
        <label className="story-choice">
          <Checkbox aria-label="禁用" disabled /> 禁用
        </label>
      </div>
    </section>
  ),
};

export const FormLayout: Story = {
  render: () => (
    <section className="story-section">
      <h2 className="story-section__title">
        表单布局
      </h2>
      <p className="story-section__description">展示标签、帮助文本和错误状态。</p>
      <Form layout="vertical">
        <Form.Item help="请输入内容" label="文本" name="text" required>
          <Input placeholder="请输入内容" />
        </Form.Item>
        <Form.Item help="内容格式不正确" label="多行文本" validateStatus="error">
          <Textarea placeholder="请输入内容" />
        </Form.Item>
      </Form>
      <Field>
        <FieldLabel>基础字段</FieldLabel>
        <FieldControl>
          <Input placeholder="请输入内容" />
        </FieldControl>
      </Field>
    </section>
  ),
};

export const SelectionControls: Story = {
  render: () => (
    <section className="story-section">
      <h2 className="story-section__title">
        选择控件
      </h2>
      <p className="story-section__description">展示单选、开关和下拉选择。</p>
      <div className="story-control-grid">
        <div className="story-section">
          <Typography.Text strong>单选</Typography.Text>
          <RadioGroup aria-label="单选项" defaultValue="a">
            <label className="story-choice">
              <RadioGroupItem aria-label="选项一" value="a" /> 选项一
            </label>
            <label className="story-choice">
              <RadioGroupItem aria-label="选项二" value="b" /> 选项二
            </label>
          </RadioGroup>
        </div>
        <div className="story-section">
          <Typography.Text strong>开关</Typography.Text>
          <label className="story-choice">
            <Switch aria-label="启用" defaultChecked /> 启用
          </label>
        </div>
        <div className="story-section">
          <Typography.Text strong>下拉选择</Typography.Text>
          <Select defaultValue="one">
            <SelectTrigger aria-label="下拉选择">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="one">选项一</SelectItem>
              <SelectItem value="two">选项二</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  ),
};
