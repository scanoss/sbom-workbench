export interface ModelAdapter<T1,T2> {
    run(input: T1): Promise<T2>;
}