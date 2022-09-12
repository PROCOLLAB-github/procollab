import { DayjsPipe } from './dayjs.pipe';

describe('DayjsPipe', () => {
  it('create an instance', () => {
    const pipe = new DayjsPipe();
    expect(pipe).toBeTruthy();
  });
});
