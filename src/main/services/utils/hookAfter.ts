import log from 'electron-log';

export function After(callback: (data: any) => Promise<void>, { dispatch } = { dispatch: false }) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const next = descriptor.value;

    // Your logic before the function call
    descriptor.value = async function (...args: any[]) {
      const result = await next.apply(this, args);

      try {
        await callback(args[0]);
      } catch (e: any) {
        log.error('AfterHook', e);
        if (dispatch) {
          throw new Error(e);
        }
      }

      return result;
    };
  };
}
