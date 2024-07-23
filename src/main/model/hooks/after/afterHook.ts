import { ModelAdapter } from "main/model/adapters/adapter";

export function After<TInput, TOutput>(adapter: ModelAdapter<TInput, TOutput>){
    return function (target, key, descriptor){
        const originalMethod = descriptor.value;
    
        descriptor.value = async function (...args) {
          const input = await originalMethod.apply(this, args);
          return await adapter.run(input);      
        };
    
        return descriptor;
      };
  }