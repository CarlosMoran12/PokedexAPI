const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const exportsObject = {};
const source = fs.readFileSync(path.join(__dirname, '../src/data/pokemon-images.ts'), 'utf8');
vm.runInNewContext(ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, { exports: exportsObject });
const { pokemonImageSources } = exportsObject;

test('artwork first, existing clean image second and sprite last for any species', () => {
  for (const number of [25, 143, 448, 872]) {
    const sources = pokemonImageSources(number, 'https://example.com/custom.png');
    assert.ok(sources[0].endsWith(`/other/official-artwork/${number}.png`));
    assert.equal(sources[1], 'https://example.com/custom.png');
    assert.ok(sources[2].endsWith(`/other/home/${number}.png`));
    assert.ok(sources.at(-1).endsWith(`/pokemon/${number}.png`));
  }
});
test('pixel sprites are deferred and duplicate sources removed', () => {
  const sprite = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png';
  const sources = pokemonImageSources(25, sprite);
  assert.equal(sources.at(-1), sprite);
  assert.equal(sources.length, 3);
  assert.equal(pokemonImageSources(25, sources[0]).length, 3);
});
test('invalid national numbers never manufacture invalid image URLs', () => {
  for (const number of [0, -1, NaN, 1.5]) {
    assert.equal(pokemonImageSources(number).length, 0);
    assert.equal(pokemonImageSources(number, 'file:///custom.png')[0], 'file:///custom.png');
  }
});
