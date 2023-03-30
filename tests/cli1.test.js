const execa = require('execa');
const fs = require('fs');

test('returns expected output based on Sample Input 1', async () => {
    const { stdout } = await execa('./cli1.js', ['--input=samples/challenge1/input1.txt']);
    expect(stdout.trim()).toBe(fs.readFileSync('samples/challenge1/output1.txt', 'utf8').trim());
});

test('returns expected output based on Sample Input 2', async () => {
    const { stdout } = await execa('./cli1.js', ['--input=samples/challenge1/input2.txt']);
    expect(stdout.trim()).toBe(fs.readFileSync('samples/challenge1/output2.txt', 'utf8').trim());
});

test('returns expected output based on Large Sample Input', async () => {
    const { stdout, stderr } = await execa('./cli1.js', ['--input=samples/challenge1/input3.txt']);
    expect(stdout.trim()).toBe(fs.readFileSync('samples/challenge1/output3.txt', 'utf8').trim());
});

test('return error when input file is not specified', async () => {
    const { stdout, stderr } = await execa('./cli1.js').catch(err => err);
    expect(stdout || stderr).toContain('--input, -i  Input file to process  [required]');
});

test(`return error when input file doesn't exist`, async () => {
    const { stdout, stderr } = await execa('./cli1.js', ['--input=foo.txt']).catch(err => err);
    expect(stdout || stderr).toContain('ENOENT: no such file or directory');
})

test('return error when input file is empty', async () => {
    const { stdout, stderr } = await execa('./cli1.js', ['--input=samples/challenge1/empty-input.txt']).catch(err => err);
    expect(stdout || stderr).toContain('Input file is empty');
});

test('return error when input file has invalid format 1', async () => {
    const { stdout, stderr } = await execa('./cli1.js', ['--input=samples/challenge1/invalid-input-1.txt']).catch(err => err);
    expect(stdout || stderr).toContain('Invalid input');
});

test('return error when input file has invalid format 2', async () => {
    const { stdout, stderr } = await execa('./cli1.js', ['--input=samples/challenge1/invalid-input-2.txt']).catch(err => err);
    expect(stdout || stderr).toContain('Invalid input');
});

test('return error when input file has invalid format 3', async () => {
    const { stdout, stderr } = await execa('./cli1.js', ['--input=samples/challenge1/invalid-input-3.txt']).catch(err => err);
    expect(stdout || stderr).toContain('Invalid input');
});

test('return error when input file has invalid format 4', async () => {
    const { stdout, stderr } = await execa('./cli1.js', ['--input=samples/challenge1/invalid-input-4.txt']).catch(err => err);
    expect(stdout || stderr).toContain('Invalid input');
});

test('return error when input file has invalid offer codes', async () => {
    const { stdout, stderr } = await execa('./cli1.js', ['--input=samples/challenge1/invalid-offer-input.txt']).catch(err => err);
    expect(stdout || stderr).toContain('Invalid offer codes');
});
