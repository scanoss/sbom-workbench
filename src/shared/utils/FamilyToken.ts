class FamilyToken {
  private families: Map<string, Set<string>>;

  constructor() {
    this.families = new Map<string, Set<string>>();
    this.setDefaults();
  }

  public addFamily(newFamily: Array<string>): void {
    const familyToLowerCase = newFamily.map((element) => {
      return element.toLowerCase();
    });
    const family = new Set<string>(familyToLowerCase);
    newFamily.forEach((keyWord) => {
      const aux = keyWord.toLowerCase();
      if (!this.families.has(aux)) this.families.set(aux, family);
    });
  }

  public getFamily(keyWord: string): Array<string> {
    const families = this.families.get(keyWord.toLowerCase());
    if (families !== undefined) return Array.from(families).filter((f) => f !== keyWord);
    return null;
  }

  private setDefaults() {
    this.addFamily(['license', 'licenses', 'licensed', 'licence']);
  }
}

export const familyToken = new FamilyToken();
