import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefAttributes,
} from 'react';

import { cn } from '../lib/cn';
import { useOxygenLocale } from './ConfigProvider';
import type { Option } from './shared';
import { treeLabelText } from './tree-utils';

export interface ComboboxProps<T = string>
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'defaultValue' | 'onChange' | 'value'> {
  allowClear?: boolean;
  defaultValue?: NoInfer<T>;
  emptyContent?: ReactNode;
  filterOption?: (input: string, option: Option<T>) => boolean;
  loading?: boolean;
  onChange?: (value: T | undefined, option?: Option<T>) => void;
  onSearch?: (value: string) => void;
  options: Option<T>[];
  value?: NoInfer<T>;
}

function optionText<T>(option?: Option<T>) {
  return option?.textValue ?? treeLabelText(option?.label);
}

function ComboboxInner<T>(allProps: ComboboxProps<T>, ref: Ref<HTMLInputElement>) {
  const {
    allowClear = true, className, defaultValue, disabled = false, emptyContent,
    filterOption, loading = false, onBlur, onChange, onClick, onFocus, onKeyDown,
    onSearch, options, placeholder, readOnly, value: valueProp, ...props
  } = allProps;
  const locale = useOxygenLocale();
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const setInputRef = useCallback((node: HTMLInputElement | null) => {
    inputRef.current = node;
    if (typeof ref === 'function') {
      const cleanup = ref(node);
      if (typeof cleanup === 'function') {
        return () => {
          inputRef.current = null;
          cleanup();
        };
      }
      return;
    }
    if (ref) ref.current = node;
  }, [ref]);
  const controlled = 'value' in allProps;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const selectedValue = controlled ? valueProp : uncontrolledValue;
  const selectedOption = options.find((option) => Object.is(option.value, selectedValue));
  const selectedText = optionText(selectedOption);
  const [inputValue, setInputValue] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  function close() {
    setOpen(false);
    setActiveIndex(-1);
    setSearchValue('');
    setInputValue(null);
  }

  useEffect(() => {
    function handleDocumentPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
        setSearchValue('');
        setInputValue(null);
      }
    }
    document.addEventListener('pointerdown', handleDocumentPointerDown);
    return () => document.removeEventListener('pointerdown', handleDocumentPointerDown);
  }, []);

  useEffect(() => {
    if (disabled || readOnly) {
      setOpen(false);
      setActiveIndex(-1);
    }
  }, [disabled, readOnly]);

  const filteredOptions = useMemo(
    () => options.filter((option) => filterOption
      ? filterOption(searchValue, option)
      : optionText(option).toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())),
    [filterOption, searchValue, options],
  );

  function selectOption(option: Option<T>) {
    if (disabled || readOnly || loading || option.disabled) return;
    if (!controlled) setUncontrolledValue(option.value);
    setInputValue(null);
    setSearchValue('');
    setOpen(false);
    setActiveIndex(-1);
    onChange?.(option.value, option);
  }

  function nextEnabledIndex(start: number, direction: 1 | -1) {
    if (loading || filteredOptions.length === 0) return -1;
    for (let offset = 0; offset < filteredOptions.length; offset += 1) {
      const index = (start + direction * offset + filteredOptions.length) % filteredOptions.length;
      if (!filteredOptions[index]?.disabled) return index;
    }
    return -1;
  }

  const expanded = open && !disabled && !readOnly;
  const activeId = expanded && !loading && activeIndex >= 0 && filteredOptions[activeIndex]
    ? `${listboxId}-option-${activeIndex}` : undefined;

  useEffect(() => {
    const list = listRef.current;
    const option = activeId ? inputRef.current?.ownerDocument.getElementById(activeId) : null;
    if (!list || !option || !list.contains(option)) return;
    const listTop = list.getBoundingClientRect().top + list.clientTop;
    const listBottom = listTop + list.clientHeight;
    const optionBounds = option.getBoundingClientRect();
    if (optionBounds.top < listTop) list.scrollTop += optionBounds.top - listTop;
    else if (optionBounds.bottom > listBottom) list.scrollTop += optionBounds.bottom - listBottom;
  }, [activeId, filteredOptions]);

  return (
    <div
      className={cn('oxygen-combobox', className)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) close();
      }}
      ref={rootRef}
    >
      <div className="oxygen-combobox__control">
        <input
          {...props}
          aria-activedescendant={activeId}
          aria-autocomplete="list"
          aria-controls={expanded ? listboxId : undefined}
          aria-expanded={expanded}
          className="oxygen-combobox__input"
          disabled={disabled}
          onBlur={onBlur}
          onChange={(event) => {
            setInputValue(event.currentTarget.value);
            setSearchValue(event.currentTarget.value);
            setOpen(true);
            setActiveIndex(-1);
            onSearch?.(event.currentTarget.value);
          }}
          onClick={(event) => {
            if (!disabled && !readOnly) setOpen(true);
            onClick?.(event);
          }}
          onFocus={(event) => {
            if (!readOnly) setOpen(true);
            onFocus?.(event);
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented || disabled || readOnly || event.nativeEvent.isComposing) return;
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault();
              setOpen(true);
              const direction = event.key === 'ArrowDown' ? 1 : -1;
              setActiveIndex((index) => nextEnabledIndex(
                !expanded || index < 0 ? direction === 1 ? 0 : filteredOptions.length - 1 : index + direction,
                direction,
              ));
            } else if (event.key === 'Enter' && expanded && activeIndex >= 0) {
              event.preventDefault();
              const option = filteredOptions[activeIndex];
              if (option) selectOption(option);
            } else if (event.key === 'Escape') {
              if (expanded) event.preventDefault();
              close();
            }
          }}
          placeholder={placeholder ?? locale.common.search}
          readOnly={readOnly}
          ref={setInputRef}
          role="combobox"
          value={expanded ? inputValue ?? selectedText : selectedText}
        />
        {allowClear && (selectedValue !== undefined || inputValue) ? (
          <button
            aria-label={locale.common.clear}
            className="oxygen-combobox__clear"
            disabled={disabled || readOnly}
            onClick={() => {
              if (!controlled) setUncontrolledValue(undefined);
              setInputValue(null);
              setSearchValue('');
              setActiveIndex(-1);
              setOpen(true);
              inputRef.current?.focus({ preventScroll: true });
              onChange?.(undefined);
            }}
            type="button"
          >{locale.common.clear}</button>
        ) : null}
      </div>
      {expanded ? (
        <div className="oxygen-combobox__menu" id={listboxId} ref={listRef} role="listbox" tabIndex={-1} aria-busy={loading || undefined}>
          {loading ? <div className="oxygen-combobox__empty">{locale.common.loading}</div>
            : filteredOptions.length > 0 ? filteredOptions.map((option, index) => (
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus -- The input handles keyboard selection and retains DOM focus via aria-activedescendant.
              <div
                aria-disabled={option.disabled || undefined}
                aria-selected={Object.is(option.value, selectedValue)}
                className={cn('oxygen-combobox__option', index === activeIndex && 'oxygen-combobox__option--active', option.disabled && 'oxygen-combobox__option--disabled')}
                id={`${listboxId}-option-${index}`}
                key={index}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectOption(option)}
                role="option"
              >{option.label}</div>
            )) : <div className="oxygen-combobox__empty">{emptyContent ?? locale.common.noOptions}</div>}
        </div>
      ) : null}
    </div>
  );
}

const ComboboxWithRef = forwardRef(ComboboxInner);
ComboboxWithRef.displayName = 'Combobox';
export const Combobox = ComboboxWithRef as <T = string>(
  props: ComboboxProps<T> & RefAttributes<HTMLInputElement>,
) => ReactElement;
