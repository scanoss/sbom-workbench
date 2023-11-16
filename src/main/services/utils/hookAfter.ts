export function After(callback: (data: any)=> Promise<void>) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const next = descriptor.value;

    // Your logic before the function call
    descriptor.value = async function (...args: any[]) {
      try {
        const result = await next.apply(this, args);
        await callback(args[0]);
        return result;
      } catch (e: any) {
        throw new Error(e);
      }
    };
  };
}
