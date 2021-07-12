import { Inventory } from "../../api/types";

export interface Component {
  id?: number;
  name: string;
  vendor: string;
  version: string;
  latest: string;
  url: string;
  purl: string[];
  licenses: any[];
  files: string[];
  inventories: Inventory[];
  count: {
    all: number;
    pending: number;
    ignored: number;
    identified: number;
  };
}
