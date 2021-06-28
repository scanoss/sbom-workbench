const { ScannableItem } = require ('./ScannableItem');


class AbstractScannable {
    
    //Called only once before iterate over the ItemsScannables 
    //Return the total files to be scanned. In case is not possible to known it, just return return -1
    async prepare() {
        return -1;
    }


    //Each call must return the next ScannableItem wrapped in a promise
    async getNextScannableItem() {
        return new ScannableItem();
    }  

    
    hasNextScannableItem(){}

}


module.exports = {
    AbstractScannable,
}