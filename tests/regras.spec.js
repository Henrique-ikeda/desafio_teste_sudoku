// Casos de teste das regras (conflitos) — tarefas F2, F3 e F4 do Felipe. Contrato: seções 1, 3 e 5 do PLANEJAMENTO.md.
import { abrirJogo, celula, preencher, preencherLinha, preencherColuna, celulasEmConflito, screen, PUZZLE_PADRAO, PUZZLE_VAZIO } from './helpers.js';

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

test('TC-SB-16 mais de três 1 na coluna', async () => {
  const user = await abrirJogo({ puzzle: PUZZLE_VAZIO });
  await preencher(user, '1-1', '1');
  await preencher(user, '3-1', '1');
  await preencher(user, '5-1', '1');
  await preencher(user, '6-1', '1');

  for (const pos of ['1-1', '3-1', '5-1', '6-1']) {
    expect(celula(pos)).toHaveTextContent(/^1$/);
    expect(celula(pos)).toHaveAttribute('data-conflito', 'true');
  }
  expect(posicoesEmConflito()).toEqual(['1-1', '3-1', '5-1', '6-1']);
});

test('TC-SB-19 conflito some ao corrigir', async () => {
  const user = await abrirJogo({ puzzle: PUZZLE_VAZIO });
  await preencher(user, '1-1', '0');
  await preencher(user, '1-2', '0');
  await preencher(user, '1-3', '0');

  // Antes: as três em conflito.
  expect(posicoesEmConflito()).toEqual(['1-1', '1-2', '1-3']);

  // Mais um clique em 1-3: 0 -> 1, a trinca deixa de existir.
  await user.click(celula('1-3'));

  // Depois: nada em conflito.
  expect(celula('1-1')).toHaveTextContent(/^0$/);
  expect(celula('1-2')).toHaveTextContent(/^0$/);
  expect(celula('1-3')).toHaveTextContent(/^1$/);
  for (const pos of ['1-1', '1-2', '1-3']) {
    expect(celula(pos)).toHaveAttribute('data-conflito', 'false');
  }
  expect(posicoesEmConflito()).toEqual([]);
});

// TC-SB-26: o excesso nas combinações que os TCs 15/16 não cobrem (1 na linha, 0 na coluna), sem três seguidos.
const EXCESSOS = [
  { caso: 'a', descricao: 'quatro 1 na linha', posicoes: ['1-1', '1-3', '1-5', '1-6'], valor: '1' },
  { caso: 'b', descricao: 'quatro 0 na coluna', posicoes: ['1-1', '3-1', '5-1', '6-1'], valor: '0' },
];
test.each(EXCESSOS)('TC-SB-26 mais de três nas combinações que faltam ($caso) $descricao', async ({ posicoes, valor }) => {
  const user = await abrirJogo({ puzzle: PUZZLE_VAZIO });
  for (const pos of posicoes) await preencher(user, pos, valor);

  for (const pos of posicoes) {
    expect(celula(pos)).toHaveTextContent(new RegExp(`^${valor}$`));
    expect(celula(pos)).toHaveAttribute('data-conflito', 'true');
  }
  expect(posicoesEmConflito()).toEqual([...posicoes].sort());
});

// TC-SB-27: fronteira da regra 2 — exatamente três iguais (sem trinca) ainda não é erro; o quarto é.
test('TC-SB-27 exatamente três iguais sem trinca não é conflito', async () => {
  const user = await abrirJogo({ puzzle: PUZZLE_VAZIO });
  await preencher(user, '1-1', '0');
  await preencher(user, '1-3', '0');
  await preencher(user, '1-5', '0');

  // Com três: as três mostram 0 e nenhuma célula está em conflito.
  for (const pos of ['1-1', '1-3', '1-5']) {
    expect(celula(pos)).toHaveTextContent(/^0$/);
  }
  expect(posicoesEmConflito()).toEqual([]);

  await preencher(user, '1-6', '0');

  // Com o quarto 0: todas as quatro em conflito e nenhuma outra.
  expect(celula('1-6')).toHaveTextContent(/^0$/);
  for (const pos of ['1-1', '1-3', '1-5', '1-6']) {
    expect(celula(pos)).toHaveAttribute('data-conflito', 'true');
  }
  expect(posicoesEmConflito()).toEqual(['1-1', '1-3', '1-5', '1-6']);
});

test('TC-SB-30 conflito some depois do Limpar', async () => {
  const user = await abrirJogo({ puzzle: PUZZLE_VAZIO });
  await preencher(user, '1-1', '0');
  await preencher(user, '1-2', '0');
  await preencher(user, '1-3', '0');

  // Antes: as três em conflito.
  expect(posicoesEmConflito()).toEqual(['1-1', '1-2', '1-3']);

  await user.click(screen.getByTestId('btn-limpar'));

  // Depois: as três vazias, nada em conflito, 36 vazias.
  for (const pos of ['1-1', '1-2', '1-3']) {
    expect(celula(pos)).toHaveTextContent(/^$/);
    expect(celula(pos)).toHaveAttribute('data-conflito', 'false');
  }
  expect(posicoesEmConflito()).toEqual([]);
  expect(screen.getByTestId('vazias')).toHaveTextContent(/^36$/);
});

// Linhas 1 e 2 (ou colunas 1 e 2) iguais e completas: 001011 não tem trinca nem excesso,
// então o único conflito possível é a repetição (regra 3).
const LINHA_REPETIDA = '001011';
const posicoesDasLinhas = (...linhas) => linhas.flatMap((l) => [1, 2, 3, 4, 5, 6].map((c) => `${l}-${c}`));

test('TC-SB-17 duas linhas completas iguais', async () => {
  const user = await abrirJogo({ puzzle: PUZZLE_VAZIO });
  await preencherLinha(user, 1, LINHA_REPETIDA);
  await preencherLinha(user, 2, LINHA_REPETIDA);

  for (const l of [1, 2]) {
    for (let c = 1; c <= 6; c++) {
      expect(celula(`${l}-${c}`)).toHaveTextContent(new RegExp(`^${LINHA_REPETIDA[c - 1]}$`));
      expect(celula(`${l}-${c}`)).toHaveAttribute('data-conflito', 'true');
    }
  }
  expect(posicoesEmConflito()).toEqual(posicoesDasLinhas(1, 2).sort());
});

const posicoesDasColunas = (...colunas) => colunas.flatMap((c) => [1, 2, 3, 4, 5, 6].map((l) => `${l}-${c}`));

test('TC-SB-18 duas colunas completas iguais', async () => {
  const user = await abrirJogo({ puzzle: PUZZLE_VAZIO });
  await preencherColuna(user, 1, LINHA_REPETIDA); // de cima para baixo
  await preencherColuna(user, 2, LINHA_REPETIDA);

  for (const c of [1, 2]) {
    for (let l = 1; l <= 6; l++) {
      expect(celula(`${l}-${c}`)).toHaveTextContent(new RegExp(`^${LINHA_REPETIDA[l - 1]}$`));
      expect(celula(`${l}-${c}`)).toHaveAttribute('data-conflito', 'true');
    }
  }
  expect(posicoesEmConflito()).toEqual(posicoesDasColunas(1, 2).sort());
});
