/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import i18next, { i18n } from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import { i18nextPlugin } from 'translation-check'

/* const rsb = resourcesToBackend((language, namespace, callback) => {
  import(`/assets/i18n/${language}/${namespace}.json`)
    .then((resources) => {
      return callback(null, resources)
    })
    .catch((error) => {
      callback(error, null)
    })
}); */

export enum AppI18nContext {
  MAIN,
  RENDERER,
}

 export class AppI18n {

  private static languages: Record<string, string> = {
    'en': "English",
    'es': "Español",
    'zh': '简体中文',
  }

  private static lng: string;

  private static i18next: i18n;

  public static getLanguages():  Array<Record<string, string>> {
    return Object.entries(this.languages)
      .reduce( (acc, [key, value]: any) => ([...acc, {key, value}]), []);
  }

  public static setLng(lng: string) {
    AppI18n.lng = lng;
  }

  public static getLng() {
    return AppI18n.lng;
  }

  public static getI18n(): i18n {
    return AppI18n.i18next;
  }

  private static getResources() {
    return Object.entries(this.languages).reduce( (acc, [key, value]: any) => {
      return {
        ...acc,
        [key]: {
          AppMenu: require(`../../../assets/i18n/${key}/AppMenu.json`),
          Common: require(`../../../assets/i18n/${key}/Common.json`),
          Title: require(`../../../assets/i18n/${key}/Title.json`),
          Table: require(`../../../assets/i18n/${key}/Table.json`),
          Tooltip: require(`../../../assets/i18n/${key}/Tooltip.json`),
          Button: require(`../../../assets/i18n/${key}/Button.json`),
          Dialog: require(`../../../assets/i18n/${key}/Dialog.json`),
        },
      }
    }, {})
  }

  public static init(context: AppI18nContext = AppI18nContext.RENDERER): i18n {
    if (context === AppI18nContext.RENDERER) i18next.use(initReactI18next)
    if (context === AppI18nContext.RENDERER) i18next.use(i18nextPlugin);

    // .use(LanguageDetector)
    // .use(rsb)

    i18next.init({
      debug: false,
      lng: this.lng,
      fallbackLng: 'en',
      initImmediate: false,
      saveMissing: true,
      ns: ['AppMenu', 'Common', 'Title', 'Table',  'Tooltip', 'Dialog', 'Button'],
      defaultNS: 'Common',

      resources: this.getResources(),
    });

    AppI18n.i18next = i18next
    return AppI18n.i18next;
  }
 }
