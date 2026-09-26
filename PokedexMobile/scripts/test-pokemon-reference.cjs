const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../src/data/pokemon-reference.ts'), 'utf8');
function loadReference(fetch) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, { exports, fetch });
  return exports;
}
// Small fixtures only: production keeps using the existing remote reference catalog.
const species = [
  { id: 25, name: 'Pikachu' }, { id: 143, name: 'Snorlax' },
  { id: 361, name: 'Snorunt' }, { id: 448, name: 'Lucario' },
  { id: 459, name: 'Snover' }, { id: 460, name: 'Abomasnow' },
  { id: 872, name: 'Snom' },
].map((item) => ({ ...item, image: 'fixture.png' }));

test('shared name, partial number and case-insensitive search', () => {
  const { filterPokemonReference } = loadReference();
  for (const [query, expected] of [
    ['sno', [143, 361, 459, 460, 872]], ['lu', [448]],
    [' PIKA ', [25]], ['143', [143]], ['43', [143]], ['missing', []],
  ]) {
    assert.deepEqual(Array.from(filterPokemonReference(species, query), (item) => item.id), expected);
  }
  assert.equal(filterPokemonReference(species, ''), species);
});

test('detail uses API record ID; absent species opens add with preselection', () => {
  const { referenceDestination } = loadReference();
  const lucario = species.find((item) => item.id === 448);
  const present = referenceDestination(lucario, [{ NumeroPokedex: 448, IdPokemon: 7 }]);
  assert.equal(present.pathname, '/pokemon/[id]');
  assert.equal(present.params.id, '7');
  const absent = referenceDestination(species[1], []);
  assert.equal(absent.pathname, '/pokemon/nuevo');
  assert.equal(absent.params.speciesId, '143');
  assert.equal(absent.params.speciesQuery, 'Snorlax');
  assert.equal(referenceDestination(lucario, []).pathname, '/pokemon/nuevo');
});

test('Home and Add share concurrent and completed catalog requests', async () => {
  let requests = 0;
  const { listPokemonReference } = loadReference(async () => {
    requests++;
    return { ok: true, json: async () => ({ results: [{ name: 'snorlax', url: 'https://pokeapi.co/api/v2/pokemon-species/143/' }] }) };
  });
  const first = listPokemonReference();
  assert.equal(first, listPokemonReference());
  const catalog = await first;
  assert.equal(await listPokemonReference(), catalog);
  assert.equal(requests, 1);
  assert.equal(catalog[0].name, 'Snorlax');
  assert.equal(catalog[0].id, 143);
});

test('failed catalog requests can retry', async () => {
  let requests = 0;
  const { listPokemonReference } = loadReference(async () => {
    if (++requests === 1) throw new Error('offline');
    return { ok: true, json: async () => ({ results: [] }) };
  });
  await assert.rejects(listPokemonReference());
  await listPokemonReference();
  assert.equal(requests, 2);
});
