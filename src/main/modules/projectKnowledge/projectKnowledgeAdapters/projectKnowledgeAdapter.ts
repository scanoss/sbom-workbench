import { ExternalFile, InventoryExtraction, InventoryKnowledgeExtraction } from "../../../../api/types";

export function inventoryToInventoryKnowledgeExtraction(inputData: any): InventoryKnowledgeExtraction{
  const inventoryMapper= new Map<string,{
    inventories: Array<InventoryExtraction>,
    localFiles: Array<string>
  }>();
  inputData.forEach((i)=>{
    i.inventories.forEach((inv)=>{
      if(!inventoryMapper.has(inv.md5_file)) {
        inventoryMapper.set(inv.md5_file, { inventories: [inventoryExtraction(i,inv)], localFiles:[inv.targetFiles] });
      }else{
        const extractedInventories = inventoryMapper.get(inv.md5_file);
        const index = isSameComponent(extractedInventories.inventories,inv); // If the component is the same
        if(index >= 0) {
        if(!isSameProject(extractedInventories.inventories[index].externalFiles,i.projectName, inv.path))  // Check if not the same project
          extractedInventories.inventories[index].externalFiles.push({
            projectName: i.projectName,
            path: inv.path
          });
        }
        else
          extractedInventories.inventories.push(inventoryExtraction(i,inv));
        if(!extractedInventories.localFiles.includes(inv.targetFiles)) extractedInventories.localFiles.push(inv.targetFiles);
      }
    });
  });

  function isSameProject(externalFiles: Array<ExternalFile>,projectName: string, path: string): boolean{
    const i =  externalFiles.findIndex((files: ExternalFile) => {
     return  files.projectName === projectName && files.path === path;
    });
    return i >= 0;
  }

  function isSameComponent(extractedInventories: Array<InventoryExtraction>,inventoryToBeAdded: any): number{
    return  extractedInventories.findIndex(inv => {
      return inv.version === inventoryToBeAdded.version && inv.licenseName===inventoryToBeAdded.licenseName
        && inv.url === inventoryToBeAdded.url && inv.usage === inventoryToBeAdded.usage && inv.name=== inventoryToBeAdded.name;
    });
  }


  function inventoryExtraction(project,inventory): InventoryExtraction{
    return {
      externalFiles: [{
        projectName: project.projectName,
        path: inventory.path
      }],
      purl: inventory.purl,
      name: inventory.name,
      url: inventory.url,
      version: inventory.version,
      spdxid: inventory.inventoryLicense,
      licenseName: inventory.licenseName,
      usage: inventory.usage,
      notes: inventory.notes,
    };
  }
  return Object.fromEntries(inventoryMapper);
}
