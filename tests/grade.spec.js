import { abrirJogo, celula, within, screen, PUZZLE_PADRAO, TODAS_AS_POSICOES } from './helpers.js';

// Fixas do PUZZLE_PADRAO, conforme a seção 3 do PLANEJAMENTO.md (posição -> valor).
const FIXAS_ESPERADAS = {
  '1-5': '1',
  '2-4': '1',
  '2-6': '1',
  '3-2': '1',
  '3-5': '1',
  '4-1': '0',
  '4-3': '0',
  '4-4': '0',
  '6-6': '0',
};

// Derivado de PUZZLE_PADRAO: cada caractere que não é '.' é uma célula fixa.
// Posição i (0 a 35) -> `${linha}-${coluna}`, linha e coluna de 1 a 6.
const FIXAS_PADRAO = Object.fromEntries(
  [...PUZZLE_PADRAO].flatMap((ch, i) =>
    ch === '.' ? [] : [[`${Math.floor(i / 6) + 1}-${(i % 6) + 1}`, ch]]
  )
);

/** Lê as 36 células pela interface: texto, data-fixa e data-conflito. */
function varrerGrade() {
  const resultado = {};
  for (let l = 1; l <= 6; l++) {
    for (let c = 1; c <= 6; c++) {
      const el = celula(`${l}-${c}`);
      resultado[`${l}-${c}`] = {
        texto: el.textContent.trim(),
        fixa: el.getAttribute('data-fixa'),
        conflito: el.getAttribute('data-conflito'),
      };
    }
  }
  return resultado;
}

test('TC-SB-01 grade 6 × 6 com o puzzle', async () => {
  // Conferência da própria tabela de fixas com a seção 3 (igualdade verdadeira).
  expect(FIXAS_PADRAO).toEqual(FIXAS_ESPERADAS);

  await abrirJogo({ puzzle: PUZZLE_PADRAO });

  // 36 células dentro da grade.
  const grade = screen.getByTestId('grade');
  const celulas = within(grade).getAllByTestId(/^celula-\d+-\d+$/);
  expect(celulas).toHaveLength(36);

  // Fixas com valor e data-fixa = true; demais vazias com data-fixa = false.
  const esperado = {};
  for (const pos of TODAS_AS_POSICOES) {
    esperado[pos] =
      pos in FIXAS_PADRAO
        ? { texto: FIXAS_PADRAO[pos], fixa: 'true', conflito: 'false' }
        : { texto: '', fixa: 'false', conflito: 'false' };
  }
  const grade36 = varrerGrade();
  expect(grade36).toEqual(esperado);

  // Nenhuma célula em conflito (atributo exato "false" em todas).
  const conflitos = Object.entries(grade36)
    .filter(([, v]) => v.conflito !== 'false')
    .map(([pos]) => pos);
  expect(conflitos).toEqual([]);

  // Contador de vazias e mensagem.
  expect(screen.getByTestId('vazias')).toHaveTextContent(/^27$/);
  expect(screen.getByTestId('mensagem').textContent.trim()).toBe('');

  // Não existem células fora da grade 6 × 6.
  expect(screen.queryByTestId('celula-7-1')).toBeNull();
  expect(screen.queryByTestId('celula-1-7')).toBeNull();
  expect(screen.queryByTestId('celula-0-1')).toBeNull();
});
