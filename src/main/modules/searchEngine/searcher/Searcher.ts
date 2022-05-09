export class Searcher {
    private index: any;


    public search(query: string): number[]{
        return this.index.search(query);
    }

    public setIndex(index: any){
        this.index = index;
    }

}

export const searcher = new Searcher();

