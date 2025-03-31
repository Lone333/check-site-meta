/* eslint-disable @typescript-eslint/no-explicit-any */



export type FuncRet<
  T extends (...args: any) => (Promise<any> | any)
  > = Awaited<ReturnType<T>>