export class IndexerAdapter {
    public getFileIndex(filePath: string): string {
        const map : Record<string,string> = { 'reg.cfg.json': 'cfg', 'reg.cfg.map.ctx.json':'ctx', 'reg.cfg.map.json':'map','reg.json':'reg' };
        return map[filePath];
    }
}

