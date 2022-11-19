import { UserRolePipe } from "./user-role.pipe";

describe('UserRolePipe', () => {
  it('create an instance', () => {
    const pipe = new UserRolePipe();
    expect(pipe).toBeTruthy();
  });
});
