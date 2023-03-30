const execa = require('execa');
const fs = require('fs');

test('returns expected output based on Sample Input 1', async () => {
    const { stdout } = await execa('./cli-delivery-arrangement.js', ['--input=samples/challenge2/input1.txt']);
    expect(stdout.trim()).toBe(fs.readFileSync('samples/challenge2/output1.txt', 'utf8').trim());
});

test('return error when input file is not specified', async () => {
    const { stdout, stderr } = await execa('./cli-delivery-arrangement.js').catch(err => err);
    expect(stdout || stderr).toContain('--input, -i  Input file to process  [required]');
});

test(`return error when input file doesn't exist`, async () => {
    const { stdout, stderr } = await execa('./cli-delivery-arrangement.js', ['--input=foo.txt']).catch(err => err);
    expect(stdout || stderr).toContain('ENOENT: no such file or directory');
})

test('return error when input file is empty', async () => {
    const { stdout, stderr } = await execa('./cli-delivery-arrangement.js', ['--input=samples/challenge2/empty-input.txt']).catch(err => err);
    expect(stdout || stderr).toContain('Input file is empty');
});

test('return error when input file has invalid format 1', async () => {
    const { stdout, stderr } = await execa('./cli-delivery-arrangement.js', ['--input=samples/challenge2/invalid-input-1.txt']).catch(err => err);
    expect(stdout || stderr).toContain('Invalid input');
});

test('return error when input file has invalid format 2', async () => {
    const { stdout, stderr } = await execa('./cli-delivery-arrangement.js', ['--input=samples/challenge2/invalid-input-2.txt']).catch(err => err);
    expect(stdout || stderr).toContain('Invalid input');
});

test('return error when input file has invalid format 3', async () => {
    const { stdout, stderr } = await execa('./cli-delivery-arrangement.js', ['--input=samples/challenge2/invalid-input-3.txt']).catch(err => err);
    expect(stdout || stderr).toContain('Invalid input');
});

test('return error when input file has invalid format 4', async () => {
    const { stdout, stderr } = await execa('./cli-delivery-arrangement.js', ['--input=samples/challenge2/invalid-input-4.txt']).catch(err => err);
    expect(stdout || stderr).toContain('Invalid input');
});

test('discount should be 0 when input file has invalid offer codes', async () => {
    const { stdout, stderr } = await execa('./cli-delivery-arrangement.js', ['--input=samples/challenge2/invalid-offer-input.txt']).catch(err => err);
    expect(stdout.trim()).toBe(fs.readFileSync('samples/challenge2/invalid-offer-output.txt', 'utf8').trim());
});
