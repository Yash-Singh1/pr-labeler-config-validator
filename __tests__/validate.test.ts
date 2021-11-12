import validate, { allStrings } from '../src/validate';
import type { Labels } from '../src/labels';

describe('validate', () => {
  it('is a function', () => {
    expect(validate).toBeDefined();
    expect(typeof validate).toEqual('function');
  });

  console.log = jest.fn();

  it('validates correct config', () => {
    expect(
      validate(
        {
          label1: 'label1/*',
          fix: 'fixes/*',
          manyMatches: ['match1', 'match2']
        },
        [{ name: 'label1' }, { name: 'fix' }, { name: 'manyMatches' }] as Labels
      )
    ).toBeTruthy();
    expect(validate({}, [])).toBeTruthy();
  });

  describe('validates incorrect config', () => {
    describe('marks config as invalid', () => {
      it('reports invalid value', () => {
        expect(
          validate({ label1: 2 }, [{ name: 'label1' }] as Labels)
        ).toBeFalsy();
        expect(console.log).toHaveBeenLastCalledWith(
          '\n\n\t❌ Value at "label1" should be a string\n'
        );
        expect(
          validate({ label2: null }, [{ name: 'label2' }] as Labels)
        ).toBeFalsy();
        expect(console.log).toHaveBeenLastCalledWith(
          '\n\n\t❌ Value at "label2" should be a string\n'
        );
      });

      it('reports invalid array elements', () => {
        expect(
          validate({ 'Fixed! good job!': [null] }, [
            { name: 'Fixed! good job!' }
          ] as Labels)
        ).toBeFalsy();
        expect(console.log).toHaveBeenLastCalledWith(
          '\n\n\t❌ Array at "Fixed! good job!" should contain strings only\n'
        );
        expect(
          validate({ 'Fixed! cool job!': [{ john: 'smith' }, 4, 'abc'] }, [
            { name: 'Fixed! cool job!' }
          ] as Labels)
        ).toBeFalsy();
        expect(console.log).toHaveBeenLastCalledWith(
          '\n\n\t❌ Array at "Fixed! cool job!" should contain strings only\n'
        );
      });

      it('reports on both', () => {
        expect(
          validate({ '$$$ Funded': {}, '49ers': ['49ers-ads/*', 45 ** 2] }, [
            { name: '$$$ Funded' },
            { name: '49ers' }
          ] as Labels)
        ).toBeFalsy();
        expect(console.log).toHaveBeenLastCalledWith(
          '\n\n\t❌ Value at "$$$ Funded" should be a string\n\t❌ Array at "49ers" should contain strings only\n'
        );
      });

      it('reports non-object as invalid', () => {
        expect(validate(null, [])).toBeFalsy();
        expect(console.log).toHaveBeenLastCalledWith(
          '\n\n\t❌ Configuration must be an object\n'
        );
        console.log = jest.fn();
        expect(validate([], [])).toBeFalsy();
        expect(console.log).toHaveBeenCalledWith(
          '\n\n\t❌ Configuration must be an object\n'
        );
        console.log = jest.fn();
        expect(validate(8, [])).toBeFalsy();
        expect(console.log).toHaveBeenCalledWith(
          '\n\n\t❌ Configuration must be an object\n'
        );
      });
    });

    it('marks labels as invalid', () => {
      expect(
        validate({ "a label that doesn't exist": 'feature/*' }, [
          { name: 'a label that exists' }
        ] as Labels)
      ).toBeFalsy();
      expect(console.log).toHaveBeenLastCalledWith(
        '\n\n\t❌ Couldn\'t find label "a label that doesn\'t exist"\n'
      );
      expect(
        validate({ "a label that doesn't exist": 'feature/*', a: 'b' }, [
          { name: 'a label that exists' }
        ] as Labels)
      ).toBeFalsy();
      expect(console.log).toHaveBeenLastCalledWith(
        '\n\n\t❌ Couldn\'t find label "a label that doesn\'t exist"\n\t❌ Couldn\'t find label "a"\n'
      );
    });
  });
});

describe('all strings', () => {
  it('is a function', () => {
    expect(allStrings).toBeDefined();
    expect(typeof allStrings).toEqual('function');
  });

  it('recognizes arrays with all strings as array<string>', () => {
    expect(allStrings(['abc', 'yo', 'something'])).toBeTruthy();
    expect(allStrings(['abc'])).toBeTruthy();
  });

  it('marks arrays without strings only as false', () => {
    expect(allStrings([['kid']])).toBeFalsy();
    expect(allStrings([24, 24, 'someone'])).toBeFalsy();
    expect(allStrings([4, {}, null, undefined])).toBeFalsy();
  });
});
