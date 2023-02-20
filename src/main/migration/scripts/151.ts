import { userSettingService } from "../../services/UserSettingService";

export async function wsMigration151(): Promise<void> {
  userSettingService.setSetting('PAC', '');
  await userSettingService.save();
}
