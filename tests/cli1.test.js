const execa = require('execa');
const fs = require('fs');

test('returns expected output based on Sample Input 1', async () => {
    const { stdout } = await execa('./cli1.js', ['--input=samples/challenge1/input1.txt']);
    expect(stdout).toBe(fs.readFileSync('samples/challenge1/output1.txt', 'utf8'));
});

test('return error when input file is not specified', async () => {
    const { stdout } = await execa('./cli1.js').catch(err => err);
    expect(stdout).toContain('--input, -i  Input file to process  [required]');
});

test(`return error when input file doesn't exist`, async () => {
    const { stdout } = await execa('./cli1.js', ['--input=foo.txt']).catch(err => err);
    expect(stdout).toContain('ENOENT: no such file or directory');
})

test('return error when input file is empty', async () => {
    const { stdout } = await execa('./cli1.js', ['--input=samples/challenge1/input2.txt']).catch(err => err);
    expect(stdout).toContain('Input file is empty');
});

test('return error when input file has invalid format', async () => {
    const { stdout } = await execa('./cli1.js', ['--input=samples/challenge1/input3.txt']).catch(err => err);
    expect(stdout).toContain('Invalid input file format');
});
