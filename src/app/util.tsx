import type { ReactNode } from "react";

type Falsy = false | 0 | 0n | "" | null | undefined;
type Truthy<T> = T extends Falsy ? never : T;


export async function $<T, U extends boolean>(props: {
  children: (
    res: U extends false ? Awaited<T> : Truthy<Awaited<T>>
  ) => ReactNode;
  catch?: (error: unknown) => ReactNode;
  await: T;
  truthy?: U;
}) {
  try {
    const res = await props.await
    if (props.truthy && !res) {
      return null
    }
    return props.children(res as U extends false ? Awaited<T> : Truthy<Awaited<T>>)
  } catch (error) {
    return props.catch?.(error)
  }
}

export async function withDelay<T>(promise: Promise<T>, delay: number = 500) {
  return new Promise<T>((resolve, reject) => {
    setTimeout(() => {
      promise.then(resolve).catch(reject);
    }, delay);
  });
}