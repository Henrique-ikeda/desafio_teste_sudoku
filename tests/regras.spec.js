// Casos de teste das regras (conflitos) — tarefas F2, F3 e F4 do Felipe. Contrato: seções 1, 3 e 5 do PLANEJAMENTO.md.
import { abrirJogo, celula, preencher, celulasEmConflito, PUZZLE_VAZIO } from './helpers.js';

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
