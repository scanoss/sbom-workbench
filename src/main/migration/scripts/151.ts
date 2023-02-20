import { userSettingService } from "../../services/UserSettingService";

export async function wsMigration151(): Promise<void> {
  userSettingService.setSetting('PAC', '');
  userSettingService.setSetting('VERSION', '1.5.1');
  await userSettingService.save();
}
