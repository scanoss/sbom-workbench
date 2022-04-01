import { Remove } from "@material-ui/icons";
import { runMain } from "module";
import { Export } from "../main/export/Export";

export interface IAppConfig {
  APP_NAME: string;

  API_URL: string;
  MIN_VERSION_SUPPORTED: string;
  DEFAULT_WORKSPACE_NAME: string;

  // feature flags
  FF_ENABLE_COMPONENT_LOGO: boolean;
  FF_ENABLE_WORKBENCH_FILTERS: boolean;
  FF_EXPORT_FORMAT_OPTIONS: string[];
  FF_ENABLE_AUTO_ACCEPT_AFTER_SCAN: boolean;
}
