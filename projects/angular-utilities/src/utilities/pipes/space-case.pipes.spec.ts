import { SpaceCasePipe } from './space-case.pipes';

const pipe = new SpaceCasePipe();

describe('Space Case Pipe', () => {
	
	it('one word camel case', () => {
    const result = pipe.transform('promissory');
    expect(result).toEqual('Promissory');
  });

	it('one word pascal case', () => {
    const result = pipe.transform('Promissory');
    expect(result).toEqual('Promissory');
  });

  it('two words camel case', () => {
    const result = pipe.transform('promissoryNote');
    expect(result).toEqual('Promissory Note');
  });

	it('two words pascal case', () => {
    const result = pipe.transform('PromissoryNote');
    expect(result).toEqual('Promissory Note');
  });

  it('bunch of capital letters in a row', () => {
    const result = pipe.transform('IRALLCSingleMember');
    expect(result).toEqual('IRALLC Single Member');
  });

	it('underscores', () => {
    const result = pipe.transform('Secured_promissory_Note_more');
    expect(result).toEqual('Secured Promissory Note More');
  });

	it('underscores', () => {
    const result = pipe.transform('IRA_LLCSingleMember');
    expect(result).toEqual('IRA LLC Single Member');
  });

	it('blank', () => {
    const result = pipe.transform('');
    expect(result).toEqual('');
  });
 
});
