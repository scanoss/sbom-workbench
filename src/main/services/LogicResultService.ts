

class LogicResultService{

    public async getResultsByids(ids: number[]){

        let response={};
        resultDb.forEach(element => {
          if(!response.hasOwnProperty(element.path)){      
              response[element.path]= element.identified===1 ? 'identified'
              : element.ignored===1 ? 'ignored'
              : 'pending';
    }

}