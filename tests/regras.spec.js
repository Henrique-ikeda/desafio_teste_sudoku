// Casos de teste das regras (conflitos) — tarefas F2, F3 e F4 do Felipe. Contrato: seções 1, 3 e 5 do PLANEJAMENTO.md.
import { abrirJogo, celula, preencher, celulasEmConflito, PUZZLE_PADRAO, PUZZLE_VAZIO } from './helpers.js';

// Posições 'L-C' das células com data-conflito = "true", em ordem: para conferir o conjunto EXATO
// (pega implementação que marca demais, como a linha inteira, ou de menos).
const posicoesEmConflito = () => celulasEmConflito().map((c) => c.getAttribute('data-testid').replace('celula-', '')).sort();

test('TC-SB-13 três iguais na linha', async () => {
  const user = await abrirJogo({ puzzle: PUZZLE_VAZIO });
  await preencher(user, '1-1', '0');
  await preencher(user, '1-2', '0');
  await preencher(user, '1-3', '0');

  for (const pos of ['1-1', '1-2', '1-3']) {
    expect(celula(pos)).toHaveTextContent(/^0$/);
    expect(celula(pos)).toHaveAttribute('data-conflito', 'true');
  }
  expect(celula('1-4')).toHaveTextContent(/^$/);
  expect(celula('1-4')).toHaveAttribute('data-conflito', 'false');
  expect(posicoesEmConflito()).toEqual(['1-1', '1-2', '1-3']);
});

test('TC-SB-14 três iguais na coluna', async () => {
  const user = await abrirJogo({ puzzle: PUZZLE_VAZIO });
  await preencher(user, '1-1', '1');
  await preencher(user, '2-1', '1');
  await preencher(user, '3-1', '1');

  for (const pos of ['1-1', '2-1', '3-1']) {
    expect(celula(pos)).toHaveTextContent(/^1$/);
    expect(celula(pos)).toHaveAttribute('data-conflito', 'true');
  }
  expect(posicoesEmConflito()).toEqual(['1-1', '2-1', '3-1']);
});

test('TC-SB-24 conflito também marca células fixas', async () => {
  const user = await abrirJogo({ puzzle: PUZZLE_PADRAO });
  await preencher(user, '4-2', '0'); // a linha 4 fica 0000..

  // As fixas 4-1, 4-3 e 4-4 valem 0 no PUZZLE_PADRAO (seção 3).
  for (const pos of ['4-1', '4-3', '4-4']) {
    expect(celula(pos)).toHaveAttribute('data-fixa', 'true');
    expect(celula(pos)).toHaveTextContent(/^0$/);
  }
  expect(celula('4-2')).toHaveAttribute('data-fixa', 'false');
  expect(celula('4-2')).toHaveTextContent(/^0$/);

  for (const pos of ['4-1', '4-2', '4-3', '4-4']) {
    expect(celula(pos)).toHaveAttribute('data-conflito', 'true');
  }
  expect(posicoesEmConflito()).toEqual(['4-1', '4-2', '4-3', '4-4']);
});

// TC-SB-25: a trinca nas combinações que os TCs 13/14 não cobrem (1 na linha, 0 na coluna) e nas bordas.
const TRINCAS = [
  { caso: 'a', descricao: 'três 1 na linha', posicoes: ['1-1', '1-2', '1-3'], valor: '1' },
  { caso: 'b', descricao: 'três 0 na coluna', posicoes: ['1-1', '2-1', '3-1'], valor: '0' },
  { caso: 'c', descricao: 'três 0 na borda direita', posicoes: ['1-4', '1-5', '1-6'], valor: '0' },
  { caso: 'd', descricao: 'três 1 na borda inferior', posicoes: ['4-6', '5-6', '6-6'], valor: '1' },
];
test.each(TRINCAS)('TC-SB-25 três iguais em todas as combinações e nas bordas ($caso) $descricao', async ({ posicoes, valor }) => {
  const user = await abrirJogo({ puzzle: PUZZLE_VAZIO });
  for (const pos of posicoes) await preencher(user, pos, valor);

  for (const pos of posicoes) {
    expect(celula(pos)).toHaveTextContent(new RegExp(`^${valor}$`));
    expect(celula(pos)).toHaveAttribute('data-conflito', 'true');
  }
  expect(posicoesEmConflito()).toEqual(posicoes);
});

test('TC-SB-15 mais de três 0 na linha', async () => {
  const user = await abrirJogo({ puzzle: PUZZLE_VAZIO });
  await preencher(user, '1-1', '0');
  await preencher(user, '1-3', '0');
  await preencher(user, '1-5', '0');
  await preencher(user, '1-6', '0');

  for (const pos of ['1-1', '1-3', '1-5', '1-6']) {
    expect(celula(pos)).toHaveTextContent(/^0$/);
    expect(celula(pos)).toHaveAttribute('data-conflito', 'true');
  }
  // Todas as células com aquele número na linha, não só a quarta.
  expect(posicoesEmConflito()).toEqual(['1-1', '1-3', '1-5', '1-6']);
});
