// Casos de teste de vitória e novo jogo — tarefa F5 do Felipe. Contrato: seções 1, 3 e 5 do PLANEJAMENTO.md.
import { abrirJogo, celula, preencher, celulasEmConflito, screen, PUZZLE_PADRAO, SOLUCAO_PADRAO, VAZIAS_PADRAO, TODAS_AS_POSICOES, solucao } from './helpers.js';

// Posições 'L-C' com data-conflito = "true", em ordem (conjunto EXATO).
const posicoesEmConflito = () => celulasEmConflito().map((c) => c.getAttribute('data-testid').replace('celula-', '')).sort();

// Preenche as 27 vazias do PUZZLE_PADRAO com a SOLUCAO_PADRAO, na ordem de VAZIAS_PADRAO.
// `trocas` sobrescreve o valor de alguma posição (ex.: { '1-1': '1' }).
// Preencher "1" passa por "0", então há conflitos passageiros no caminho: só confira no fim.
async function preencherSolucao(user, trocas = {}) { for (const pos of VAZIAS_PADRAO) await preencher(user, pos, trocas[pos] ?? solucao(pos)); }

// A grade inteira lida da tela, linha por linha (vazia = '.'), para comparar com SOLUCAO_PADRAO.
const gradeNaTela = () => TODAS_AS_POSICOES.map((pos) => celula(pos).textContent || '.').join('');

test('TC-SB-20 vitória', async () => {
  const user = await abrirJogo({ puzzle: PUZZLE_PADRAO });
  await preencherSolucao(user);

  expect(gradeNaTela()).toBe(SOLUCAO_PADRAO);
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Resolvido!$/);
  expect(screen.getByTestId('vazias')).toHaveTextContent(/^0$/);
  expect(posicoesEmConflito()).toEqual([]);
});

test('TC-SB-21 grade cheia com erro não vence', async () => {
  const user = await abrirJogo({ puzzle: PUZZLE_PADRAO });
  await preencherSolucao(user, { '1-1': '1' }); // 1-1 recebe 1 em vez de 0

  expect(celula('1-1')).toHaveTextContent(/^1$/);
  expect(screen.getByTestId('vazias')).toHaveTextContent(/^0$/);
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/^$/);
  expect(celula('1-1')).toHaveAttribute('data-conflito', 'true');
  // A linha 1 fica 101011 (quatro 1) e a coluna 1 também fica 101011 (quatro 1): todas as células com 1 nas duas.
  expect(posicoesEmConflito()).toEqual(['1-1', '1-3', '1-5', '1-6', '3-1', '5-1', '6-1']);
});
