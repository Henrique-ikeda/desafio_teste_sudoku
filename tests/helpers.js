// Helpers dos testes de interface (tarefa A1). Contrato: seção 3 do PLANEJAMENTO.md.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { screen, within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Caminho a partir da raiz (no ambiente jsdom, `new URL(..., import.meta.url)` não funciona com o fs).
const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
const corpo = html.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];

/**
 * Abre o jogo como um jogador abriria a página.
 * @param {Record<string,string>} params parâmetros de URL da seção 3 (ex.: { puzzle: PUZZLE_PADRAO })
 * @param {object} opcoesUser repassado a userEvent.setup
 * @returns user do user-event, para clicar como o jogador
 */
export async function abrirJogo(params = {}, opcoesUser = {}) {
  window.history.replaceState({}, '', '/?' + new URLSearchParams(params));
  document.body.innerHTML = corpo;
  jest.resetModules();
  await import('../js/main.js');
  return userEvent.setup(opcoesUser);
}

/** Clique direito como o jogador faria. */
export async function cliqueDireito(user, elemento) {
  await user.pointer({ keys: '[MouseRight]', target: elemento });
}

export { screen, within };

/** Todas as 36 posições `linha-coluna`, linha por linha (1-1, 1-2, …, 6-6). */
export const TODAS_AS_POSICOES = Array.from({ length: 6 }, (_, l) =>
  Array.from({ length: 6 }, (_, c) => `${l + 1}-${c + 1}`)).flat();

/** PUZZLE_PADRAO (seção 3): 9 fixas, 27 vazias, solução única. Linha por linha; `.` = vazia. */
export const PUZZLE_PADRAO = '....1....1.1.1..1.0.00.............0';
/** A única solução do PUZZLE_PADRAO (conferida por script). */
export const SOLUCAO_PADRAO = '001011001101110010010011101100110100';
/** Nenhuma célula fixa: para montar cada situação de regra com poucos cliques. */
export const PUZZLE_VAZIO = '.'.repeat(36);

/** As posições vazias do PUZZLE_PADRAO, em ordem. */
export const VAZIAS_PADRAO = TODAS_AS_POSICOES.filter((_, i) => PUZZLE_PADRAO[i] === '.');
/** Valor da SOLUCAO_PADRAO numa posição `L-C`. */
export const solucao = (pos) => SOLUCAO_PADRAO[TODAS_AS_POSICOES.indexOf(pos)];

/** A célula `linha-coluna`, ex.: celula('1-5'). */
export const celula = (pos) => screen.getByTestId(`celula-${pos}`);
/** Todas as células da grade. */
export const todasAsCelulas = () => screen.getAllByTestId(/^celula-\d+-\d+$/);
/** Células com `data-conflito` = "true". */
export const celulasEmConflito = () => todasAsCelulas().filter((c) => c.getAttribute('data-conflito') === 'true');

/**
 * Preenche uma célula VAZIA com '0' (1 clique esquerdo) ou '1' (2 cliques esquerdos).
 * Não lê o estado da tela: com o jogo ainda inexistente, o teste falha no `celula(...)`.
 */
export async function preencher(user, pos, valor) {
  const cliques = valor === '0' ? 1 : 2;
  for (let i = 0; i < cliques; i++) await user.click(celula(pos));
}

/** Preenche uma linha (ou coluna) inteira, a partir de células vazias. Ex.: preencherLinha(user, 1, '001011'). */
export async function preencherLinha(user, linha, valores) {
  for (let c = 0; c < valores.length; c++) await preencher(user, `${linha}-${c + 1}`, valores[c]);
}
export async function preencherColuna(user, coluna, valores) {
  for (let l = 0; l < valores.length; l++) await preencher(user, `${l + 1}-${coluna}`, valores[l]);
}
