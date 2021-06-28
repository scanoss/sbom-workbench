const path = require('path');
const { readFile } = require ('fs/promises');
const fs = require('fs');

const { AbstractScannable } = require('./AbstractScannable');
const { ScannableItem } = require('./ScannableItem');

class ScannableFolder extends AbstractScannable {

    //Private properties
    #folderPath;
    
    #generator;
    #genHasNext;

    constructor( folderPath ) {
        super();
        this.#folderPath = folderPath; 
    }

    async * #walk(dir) {
        for await (const d of await fs.promises.opendir(dir)) {
            const entry = path.join(dir, d.name);
            // const stats = fs.lstatSync(filepath);
            if (d.isDirectory() && !d.isSymbolicLink())
                yield* this.#walk(entry);
            else if (d.isFile() && !d.isSymbolicLink()) {
                let fileContent = await readFile(entry);
                yield new ScannableItem(entry,fileContent);                
            }  
        }
      }



    async getNextScannableItem() {
        let obj = await this.#generator.next();
        this.#genHasNext = obj.done ? false : true;
        return obj.value;
    }

    hasNextScannableItem() {
        return this.#genHasNext;
    }

    prepare() {
        this.#generator=this.#walk(this.#folderPath);
    }
}


module.exports = {
    ScannableFolder,
}