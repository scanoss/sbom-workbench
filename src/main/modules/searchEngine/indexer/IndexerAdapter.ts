export class IndexerAdapter {
    public getFileIndex(filePath: string): string {
        const map : Record<string,string> = { 'cfg.json': 'cfg', 'ctx.json':'ctx', 'map.json':'map','reg.json':'reg' };
        return map[filePath];
    }
}

