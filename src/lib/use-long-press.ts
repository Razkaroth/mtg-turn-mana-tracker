import { useCallback, useRef } from 'react';

interface LongPressOptions {
  threshold?: number;
  onCancel?: () => void;
}

interface LongPressCallbackArgs<T> {
  context: T;
}

export function useLongPress<T = unknown>(
  callback: (event: React.MouseEvent | React.TouchEvent, args: LongPressCallbackArgs<T>) => void,
  options: LongPressOptions = {}
) {
  const { threshold = 500, onCancel } = options;
  
  const timerRef = useRef<number | null>(null);
  const isLongPressActive = useRef(false);
  
  const start = useCallback(
    (event: React.MouseEvent | React.TouchEvent, context: T) => {
      if (event.defaultPrevented) return;
      
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      
      isLongPressActive.current = true;
      timerRef.current = window.setTimeout(() => {
        if (isLongPressActive.current) {
          callback(event, { context });
        }
      }, threshold);
    },
    [callback, threshold]
  );
  
  const cancel = useCallback(() => {
    isLongPressActive.current = false;
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
      if (onCancel) onCancel();
    }
  }, [onCancel]);
  
  const clickHandler = useCallback(
    () => {
      // Prevent long press from triggering when it's just a normal click
      if (timerRef.current && isLongPressActive.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
        isLongPressActive.current = false;
      }
    },
    []
  );
  
  return useCallback(
    (contextData?: T) => ({
      onMouseDown: (e: React.MouseEvent) => start(e, contextData as T),
      onMouseUp: cancel,
      onMouseLeave: cancel,
      onTouchStart: (e: React.TouchEvent) => start(e, contextData as T),
      onTouchEnd: cancel,
      onClick: clickHandler,
    }),
    [start, cancel, clickHandler]
  );
} 