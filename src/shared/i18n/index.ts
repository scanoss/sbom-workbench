/* eslint-disable global-require */
import i18next, { i18n } from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';

const rsb = resourcesToBackend((language, namespace, callback) => {
  import(`/assets/i18n/${language}/${namespace}.json`)
    .then((resources) => {
      return callback(null, resources)
    })
    .catch((error) => {
      callback(error, null)
    })
});

 export class AppI18n {

  private static lng: string;

  private static i18next: i18n;

  public static setLng(lng: string) {
    AppI18n.lng = lng;
  }

  public static getLng() {
    return AppI18n.lng;
  }

  public static getI18n(): i18n {
    return AppI18n.i18next;
  }

  public static init(): i18n {
    i18next
    .use(initReactI18next)
    // .use(LanguageDetector)
    // .use(rsb)
    .init({
      debug: true,
      lng: this.lng,
      fallbackLng: 'en',
      initImmediate: false,
      saveMissing: true,
      ns: ['AppMenu', 'Common', 'Title', 'Table',  'Tooltip', 'Dialog'],
      defaultNS: 'Common',
      resources: {
        'en': {
          AppMenu: require('../../../assets/i18n/en/AppMenu.json'),
          Common: require('../../../assets/i18n/en/Common.json'),
          Title: require('../../../assets/i18n/en/Title.json'),
          Table: require('../../../assets/i18n/en/Table.json'),
          Tooltip: require('../../../assets/i18n/en/Tooltip.json'),
          Button: require('../../../assets/i18n/en/Button.json'),
          Dialog: require('../../../assets/i18n/en/Dialog.json'),
        },
        'es': {
          AppMenu: require('../../../assets/i18n/es/AppMenu.json'),
          Common: require('../../../assets/i18n/es/Common.json'),
          Title: require('../../../assets/i18n/es/Title.json'),
          Table: require('../../../assets/i18n/es/Table.json'),
          Tooltip: require('../../../assets/i18n/es/Tooltip.json'),
          Button: require('../../../assets/i18n/es/Button.json'),
          Dialog: require('../../../assets/i18n/es/Dialog.json'),
        }
      }
    });

    AppI18n.i18next = i18next
    return AppI18n.i18next;
  }
 }
