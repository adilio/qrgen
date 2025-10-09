import { useEffect, useRef, useState } from 'react'

export const useDebouncedValue = <T>(value: T, delay: number) => {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debounced
}

export const usePrefersReducedMotion = () => {
  const mediaQuery = '(prefers-reduced-motion: reduce)'
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(mediaQuery).matches : false,
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    const query = window.matchMedia(mediaQuery)
    const update = (event: MediaQueryListEvent | MediaQueryList) =>
      setPrefersReducedMotion(event.matches)

    update(query)

    const listener = (event: MediaQueryListEvent) => update(event)
    query.addEventListener('change', listener)
    return () => query.removeEventListener('change', listener)
  }, [])

  return prefersReducedMotion
}

export const useStableCallback = <Args extends unknown[], Return>(
  callback: (...args: Args) => Return,
) => {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  return (...args: Args) => callbackRef.current(...args)
}
