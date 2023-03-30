const execa = require('execa');

test('adds 1 + 2 to equal 3', async () => {
    const { stdout } = await execa('./cli1.js', ['ponies']);
    expect(stdout).toBeTruthy();
});
