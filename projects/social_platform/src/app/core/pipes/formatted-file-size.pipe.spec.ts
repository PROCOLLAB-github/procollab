import { FormatedFileSizePipe } from "./formatted-file-size.pipe";

describe('FormatedFileSizePipe', () => {

  let pipe: FormatedFileSizePipe;

  beforeEach(() => {
    pipe = new FormatedFileSizePipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return 0 Bytes for 0 bytes', () => {
    expect(pipe.transform(0)).toEqual('0 Bytes');
  });

  it('should return 1.5 Bytes for 1.5 bytes', () => {
    expect(pipe.transform(1.5)).toEqual('1.5 Bytes');
  });

  it('should return 1 KB for 1024 bytes', () => {
    expect(pipe.transform(1024)).toEqual('1 KB');
  });


  it('should return 1.5 KB for 1536 bytes', () => {
    expect(pipe.transform(1536)).toEqual('1.5 KB');
  });

  it('should return 1 MB for 1024 * 1024 bytes', () => {
    expect(pipe.transform(1024 * 1024)).toEqual('1 MB');
  });

  it('should return 1.5 MB for 1.5 * 1024 * 1024 bytes', () => {
    expect(pipe.transform(1.5 * 1024 * 1024)).toEqual('1.5 MB');
  });

  it('should return 1 GB for 1024 * 1024 * 1024 bytes', () => {
    expect(pipe.transform(1024 * 1024 * 1024)).toEqual('1 GB');
  });

  it('should return 1.5 GB for 1.5 * 1024 * 1024 * 1024 bytes', () => {
    expect(pipe.transform(1.5 * 1024 * 1024 * 1024)).toEqual('1.5 GB');
  });

});
