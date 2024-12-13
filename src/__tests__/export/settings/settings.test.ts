import { Leaf } from '../../../main/modules/export/format/Settings/identification-tree/leaf';
import { BomLeafProcessor } from '../../../main/modules/export/format/Settings/processors/bom-leaf-proccessor';

describe('export settings tests', () => {

  /** ************* Unit tests leaf processor ************** */

  it('Bom leaf processor include', async () => {
    const leaf = new Leaf('scanner.c', 'pkg:github/scanoss/scanner.c', 'pkg:github/scanoss/scanner.c', 1, 0);
    const bomLeaftProccesor = new BomLeafProcessor();
    bomLeaftProccesor.process(leaf);
    const bom = leaf.getBom();
    expect(bom).toEqual({
      include: [{ path: 'scanner.c', purl: 'pkg:github/scanoss/scanner.c' }],
      remove: [],
      replace: [],
    });
  });

  it('Bom leaf processor remove', async () => {
    const leaf = new Leaf('scanner.c', 'pkg:github/scanoss/scanner.c', 'pkg:github/scanoss/scanner.c', 0, 1);
    const bomLeaftProccesor = new BomLeafProcessor();
    bomLeaftProccesor.process(leaf);
    const bom = leaf.getBom();
    expect(bom).toEqual({
      include: [],
      remove: [{ path: 'scanner.c', purl: 'pkg:github/scanoss/scanner.c' }],
      replace: [],
    });
  });

  it('Bom leaf processor replace', async () => {
    const leaf = new Leaf('scanner.c', 'pkg:github/scanoss/scanner.c', 'pkg:github/scanoss/engine', 1, 0);
    const bomLeaftProccesor = new BomLeafProcessor();
    bomLeaftProccesor.process(leaf);
    const bom = leaf.getBom();
    expect(bom).toEqual({
      include: [],
      remove: [],
      replace: [{ paths: ['scanner.c'], purl: 'pkg:github/scanoss/scanner.c', replace_with: 'pkg:github/scanoss/engine' }],
    });
  });

  it('Bom leaf processor include no match file', async () => {
    const leaf = new Leaf('scanner.c', null, 'pkg:github/scanoss/scanner.c', 1, 0);
    const bomLeaftProccesor = new BomLeafProcessor();
    bomLeaftProccesor.process(leaf);
    const bom = leaf.getBom();
    expect(bom).toEqual({
      include: [{ path: 'scanner.c', purl: 'pkg:github/scanoss/scanner.c' }],
      remove: [],
      replace: [],
    });
  });

  it('Bom leaf processor pending', async () => {
    const leaf = new Leaf('scanner.c', null, 'pkg:github/scanoss/scanner.c', 0, 0);
    const bomLeaftProccesor = new BomLeafProcessor();
    bomLeaftProccesor.process(leaf);
    const bom = leaf.getBom();
    expect(bom).toEqual({
      include: [],
      remove: [],
      replace: [],
    });
  });

  /** ************* Unit tests folder processor ************** */
});
