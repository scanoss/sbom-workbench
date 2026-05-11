import { retryWithBackoff } from '../../main/utils/utils';

function fsError(code: string): NodeJS.ErrnoException {
  const err = new Error(`mock ${code}`) as NodeJS.ErrnoException;
  err.code = code;
  return err;
}

describe('retryWithBackoff', () => {
  it('resolves on first attempt when op succeeds', async () => {
    const op = jest.fn().mockResolvedValue('ok');
    const result = await retryWithBackoff(op, 3, 1);
    expect(result).toBe('ok');
    expect(op).toHaveBeenCalledTimes(1);
  });

  it('retries on a retryable error and eventually resolves', async () => {
    const op = jest.fn()
      .mockRejectedValueOnce(fsError('EPERM'))
      .mockRejectedValueOnce(fsError('EBUSY'))
      .mockResolvedValueOnce('ok');

    const result = await retryWithBackoff(op, 5, 1);
    expect(result).toBe('ok');
    expect(op).toHaveBeenCalledTimes(3);
  });

  it('throws the last error after exhausting attempts', async () => {
    const op = jest.fn().mockRejectedValue(fsError('EBUSY'));
    await expect(retryWithBackoff(op, 3, 1)).rejects.toMatchObject({ code: 'EBUSY' });
    expect(op).toHaveBeenCalledTimes(3);
  });

  it('throws immediately on a non-retryable error without retrying', async () => {
    const op = jest.fn().mockRejectedValue(fsError('ENOENT'));
    await expect(retryWithBackoff(op, 5, 1)).rejects.toMatchObject({ code: 'ENOENT' });
    expect(op).toHaveBeenCalledTimes(1);
  });

  it('honors a custom retryableCodes list', async () => {
    const op = jest.fn()
      .mockRejectedValueOnce(fsError('ETIMEDOUT'))
      .mockResolvedValueOnce('ok');

    const result = await retryWithBackoff(op, 3, 1, ['ETIMEDOUT', 'ECONNRESET']);
    expect(result).toBe('ok');
    expect(op).toHaveBeenCalledTimes(2);
  });

  it('does NOT retry a default-retryable code when custom codes exclude it', async () => {
    const op = jest.fn().mockRejectedValue(fsError('EPERM'));
    await expect(retryWithBackoff(op, 3, 1, ['ETIMEDOUT'])).rejects.toMatchObject({ code: 'EPERM' });
    expect(op).toHaveBeenCalledTimes(1);
  });

  it('waits between retries (timing is roughly exponential)', async () => {
    const op = jest.fn()
      .mockRejectedValueOnce(fsError('EPERM'))
      .mockRejectedValueOnce(fsError('EPERM'))
      .mockResolvedValueOnce('ok');

    const baseDelay = 20;
    const start = Date.now();
    await retryWithBackoff(op, 4, baseDelay);
    const elapsed = Date.now() - start;

    // delays between 3 attempts: 20ms + 40ms = 60ms minimum
    expect(elapsed).toBeGreaterThanOrEqual(50);
    expect(op).toHaveBeenCalledTimes(3);
  });
});
