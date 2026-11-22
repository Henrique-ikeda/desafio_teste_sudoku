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
