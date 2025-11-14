export function createDebouncedFunction<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  F extends (...args: any[]) => any,
>({
  func,
  timeoutRef,
  debounce,
}: {
  func: F | undefined;
  timeoutRef: React.RefObject<NodeJS.Timeout | null>;
  debounce: number;
}) {
  if (func == undefined) {
    return undefined;
  }
  return (...args: Parameters<F>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      func(...args);
    }, debounce);
  };
}
