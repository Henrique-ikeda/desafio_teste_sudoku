// Casos de teste adicionais do Felipe (tarefa F6): lacunas de cobertura achadas por mutação.
// Contrato: seções 1, 3 e 5 do PLANEJAMENTO.md. Cada TC daqui mata um defeito que os TCs 01–30 deixavam passar
// (a lista de mutantes está em docs/VALIDACAO-TESTES-FELIPE.md).
import { abrirJogo, celula, preencher, preencherLinha, preencherColuna, cliqueDireito, celulasEmConflito, screen, PUZZLE_PADRAO, PUZZLE_VAZIO, SOLUCAO_PADRAO, VAZIAS_PADRAO, TODAS_AS_POSICOES, solucao } from './helpers.js';

// Posições 'L-C' com data-conflito = "true", em ordem: para conferir o conjunto EXATO
// (pega implementação que marca demais, como a linha inteira, ou de menos).
const posicoesEmConflito = () => celulasEmConflito().map((c) => c.getAttribute('data-testid').replace('celula-', '')).sort();
const esperarConflitos = (lista) => expect(posicoesEmConflito()).toEqual([...lista].sort());
const btn = (id) => screen.getByTestId(id);
// A grade inteira lida da tela, linha por linha (vazia = '.'), para comparar com SOLUCAO_PADRAO.
const gradeNaTela = () => TODAS_AS_POSICOES.map((pos) => celula(pos).textContent || '.').join('');
// Preenche uma célula VAZIA pelo clique direito (valor 1 = 1 clique; valor 0 = 2 cliques).
async function preencherDireito(user, pos, valor) {
  for (let i = 0; i < (valor === '1' ? 1 : 2); i++) await cliqueDireito(user, celula(pos));
}
const posicoesDasLinhas = (...linhas) => linhas.flatMap((l) => [1, 2, 3, 4, 5, 6].map((c) => `${l}-${c}`));
const posicoesDasColunas = (...colunas) => colunas.flatMap((c) => [1, 2, 3, 4, 5, 6].map((l) => `${l}-${c}`));

test('TC-SB-31 desfazer remove o conflito', async () => {
  const user = await abrirJogo({ puzzle: PUZZLE_VAZIO });
  await preencherLinha(user, 1, '000');
  esperarConflitos(['1-1', '1-2', '1-3']);

  await user.click(btn('btn-desfazer')); // desfaz o último clique: 1-3 volta a vazia
  expect(celula('1-3')).toHaveTextContent(/^$/);
  expect(celula('1-1')).toHaveTextContent(/^0$/);
  expect(celula('1-2')).toHaveTextContent(/^0$/);
  expect(btn('vazias')).toHaveTextContent(/^34$/);
  esperarConflitos([]);
});

test('TC-SB-32 clique direito gera e desfaz conflito, e o Desfazer volta o clique direito', async () => {
  const user = await abrirJogo({ puzzle: PUZZLE_VAZIO });
  for (const pos of ['1-1', '1-2', '1-3']) await cliqueDireito(user, celula(pos)); // vazia -> 1
  for (const pos of ['1-1', '1-2', '1-3']) expect(celula(pos)).toHaveTextContent(/^1$/);
  esperarConflitos(['1-1', '1-2', '1-3']);

  await cliqueDireito(user, celula('1-3')); // 1 -> 0: a trinca deixa de existir
  expect(celula('1-3')).toHaveTextContent(/^0$/);
  esperarConflitos([]);

  await user.click(btn('btn-desfazer')); // desfaz o último clique direito
  expect(celula('1-3')).toHaveTextContent(/^1$/);
  esperarConflitos(['1-1', '1-2', '1-3']);
});

test('TC-SB-33 novo jogo limpa os conflitos', async () => {
  const user = await abrirJogo({ puzzle: PUZZLE_VAZIO });
  await preencherLinha(user, 1, '000');
  esperarConflitos(['1-1', '1-2', '1-3']);

  await user.click(btn('btn-novo-jogo'));
  for (const pos of ['1-1', '1-2', '1-3']) {
    expect(celula(pos)).toHaveTextContent(/^$/);
    expect(celula(pos)).toHaveAttribute('data-conflito', 'false');
  }
  expect(btn('vazias')).toHaveTextContent(/^36$/);
  esperarConflitos([]);
});

test('TC-SB-34 vitória preenchendo só com o clique direito', async () => {
  const user = await abrirJogo({ puzzle: PUZZLE_PADRAO });
  for (const pos of VAZIAS_PADRAO) await preencherDireito(user, pos, solucao(pos));

  expect(gradeNaTela()).toBe(SOLUCAO_PADRAO);
  expect(btn('mensagem')).toHaveTextContent(/^Resolvido!$/);
  expect(btn('vazias')).toHaveTextContent(/^0$/);
  esperarConflitos([]);
});

const EXCESSOS_NA_ULTIMA = [
  { caso: 'a', descricao: 'quatro 0 na última linha', posicoes: ['6-1', '6-3', '6-5', '6-6'] },
  { caso: 'b', descricao: 'quatro 0 na última coluna', posicoes: ['1-6', '3-6', '5-6', '6-6'] },
];
test.each(EXCESSOS_NA_ULTIMA)('TC-SB-35 mais de três 0 na última linha e na última coluna ($caso) $descricao', async ({ posicoes }) => {
  const user = await abrirJogo({ puzzle: PUZZLE_VAZIO });
  for (const pos of posicoes) await preencher(user, pos, '0');

  for (const pos of posicoes) expect(celula(pos)).toHaveTextContent(/^0$/);
  esperarConflitos(posicoes);
});

test('TC-SB-36 mais de três com cinco 0 na linha', async () => {
  const user = await abrirJogo({ puzzle: PUZZLE_VAZIO });
  const zeros = ['1-1', '1-2', '1-4', '1-5', '1-6'];
  for (const pos of zeros) await preencher(user, pos, '0');

  for (const pos of zeros) expect(celula(pos)).toHaveTextContent(/^0$/);
  expect(celula('1-3')).toHaveTextContent(/^$/);
  expect(celula('1-3')).toHaveAttribute('data-conflito', 'false');
  esperarConflitos(zeros);
});

const IGUAIS_NAO_VIZINHAS = [
  { caso: 'a', descricao: 'linhas 1 e 5', montar: async (user) => { await preencherLinha(user, 1, '001011'); await preencherLinha(user, 5, '001011'); }, posicoes: posicoesDasLinhas(1, 5) },
  { caso: 'b', descricao: 'colunas 1 e 5', montar: async (user) => { await preencherColuna(user, 1, '001011'); await preencherColuna(user, 5, '001011'); }, posicoes: posicoesDasColunas(1, 5) },
];
test.each(IGUAIS_NAO_VIZINHAS)('TC-SB-37 linhas e colunas completas iguais, mesmo longe uma da outra ($caso) $descricao', async ({ montar, posicoes }) => {
  const user = await abrirJogo({ puzzle: PUZZLE_VAZIO });
  await montar(user);

  expect(posicoes).toHaveLength(12);
  esperarConflitos(posicoes);
  expect(btn('vazias')).toHaveTextContent(/^24$/);
});

const PUZZLE_LINHAS_COM_FIXAS = '001011' + '00101.' + '.'.repeat(24);
test('TC-SB-38 linhas iguais marcam também as células fixas', async () => {
  const user = await abrirJogo({ puzzle: PUZZLE_LINHAS_COM_FIXAS });

  await preencher(user, '2-6', '1'); // só agora a linha 2 fica completa e igual à linha 1
  expect(celula('2-6')).toHaveTextContent(/^1$/);
  expect(btn('vazias')).toHaveTextContent(/^24$/);
  const fixas = posicoesDasLinhas(1, 2).filter((pos) => pos !== '2-6');
  expect(fixas).toHaveLength(11);
  for (const pos of fixas) expect(celula(pos)).toHaveAttribute('data-fixa', 'true');
  esperarConflitos(posicoesDasLinhas(1, 2));
});

test('TC-SB-39 célula fixa de valor 0 não muda', async () => {
  const user = await abrirJogo({ puzzle: PUZZLE_PADRAO });
  for (const pos of ['4-1', '6-6']) {
    await user.click(celula(pos));
    await cliqueDireito(user, celula(pos));
    expect(celula(pos)).toHaveTextContent(/^0$/);
    expect(celula(pos)).toHaveAttribute('data-fixa', 'true');
  }
  expect(btn('vazias')).toHaveTextContent(/^27$/);
  expect(btn('btn-desfazer')).toBeDisabled();
});

const TRINCAS_NO_MEIO = [
  { caso: 'a', descricao: 'três 1 no meio da linha (1-2 a 1-4)', posicoes: ['1-2', '1-3', '1-4'], valor: '1' },
  { caso: 'b', descricao: 'três 0 no meio da linha (1-3 a 1-5)', posicoes: ['1-3', '1-4', '1-5'], valor: '0' },
  { caso: 'c', descricao: 'três 1 no meio da coluna (2-3 a 4-3)', posicoes: ['2-3', '3-3', '4-3'], valor: '1' },
];
test.each(TRINCAS_NO_MEIO)('TC-SB-40 três iguais no meio da linha e da coluna ($caso) $descricao', async ({ posicoes, valor }) => {
  const user = await abrirJogo({ puzzle: PUZZLE_VAZIO });
  for (const pos of posicoes) await preencher(user, pos, valor);

  for (const pos of posicoes) expect(celula(pos)).toHaveTextContent(new RegExp(`^${valor}$`));
  esperarConflitos(posicoes);
});

test('TC-SB-41 a trinca marca só as três iguais, não o vizinho diferente', async () => {
  const user = await abrirJogo({ puzzle: PUZZLE_VAZIO });
  await preencherLinha(user, 1, '0001');

  expect(celula('1-4')).toHaveTextContent(/^1$/);
  expect(celula('1-4')).toHaveAttribute('data-conflito', 'false');
  esperarConflitos(['1-1', '1-2', '1-3']);
});
