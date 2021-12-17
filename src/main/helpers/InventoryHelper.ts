class InventoryHelper {
  public AddComponentIdToInventory(components: any, inventories: any) {
    inventories.forEach((inventory) => {
      const index = this.getComponentId(components, inventory.purl, inventory.version);
      inventory.cvid = components[index].compid;
      inventory.component = components[index];
    });
    return inventories;
  }

  private getComponentId(components: any, purl: string, version: string): number {
    return components.findIndex((c) => {
      return c.purl === purl && c.version === version;
    });
    return null;
  }
}
export const inventoryHelper = new InventoryHelper();
