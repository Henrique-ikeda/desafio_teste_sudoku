import { abrirJogo, celula, within, cliqueDireito, screen, PUZZLE_PADRAO, TODAS_AS_POSICOES } from './helpers.js';

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

test('TC-SB-02 puzzle sem parâmetro', async () => {
  // Sem o parâmetro `puzzle`, o jogo carrega um puzzle do banco interno.
  // Repete 5 vezes (um abrirJogo por volta), porque o banco pode ter vários puzzles.
  for (let volta = 1; volta <= 5; volta++) {
    await abrirJogo();

    // 36 células dentro da grade.
    const grade = screen.getByTestId('grade');
    const celulas = within(grade).getAllByTestId(/^celula-\d+-\d+$/);
    expect(celulas).toHaveLength(36);

    const g = varrerGrade();
    const posicoes = Object.keys(g);

    // Pelo menos 1 célula fixa.
    const fixas = posicoes.filter((pos) => g[pos].fixa === 'true');
    expect(fixas.length).toBeGreaterThanOrEqual(1);

    // Todas as células têm data-fixa exatamente 'true' ou 'false'.
    for (const pos of posicoes) {
      expect(['true', 'false']).toContain(g[pos].fixa);
    }

    // Fixas mostram 0 ou 1; não fixas estão vazias.
    for (const pos of fixas) {
      expect(g[pos].texto).toMatch(/^[01]$/);
    }
    for (const pos of posicoes.filter((pos) => g[pos].fixa === 'false')) {
      expect(g[pos].texto).toBe('');
    }

    // Nenhuma célula em conflito (atributo exato "false").
    for (const pos of posicoes) {
      expect(g[pos].conflito).toBe('false');
    }

    // Contador de vazias = 36 − fixas; mensagem vazia.
    expect(screen.getByTestId('vazias')).toHaveTextContent(new RegExp(`^${36 - fixas.length}$`));
    expect(screen.getByTestId('mensagem').textContent.trim()).toBe('');
  }
});

test('TC-SB-03 célula fixa não muda', async () => {
  // PUZZLE_PADRAO: 9 fixas (seção 3), 27 vazias. A célula 1-5 é fixa com valor 1.
  const user = await abrirJogo({ puzzle: PUZZLE_PADRAO });

  // Confere que 1-5 continua fixa com 1, que o contador segue em 27,
  // que o desfazer segue desabilitado e que as outras 8 fixas não mudaram.
  const conferir = () => {
    expect(celula('1-5')).toHaveTextContent(/^1$/);
    expect(celula('1-5')).toHaveAttribute('data-fixa', 'true');
    expect(screen.getByTestId('vazias')).toHaveTextContent(/^27$/);
    expect(screen.getByTestId('btn-desfazer')).toBeDisabled();

    const g = varrerGrade();
    for (const [pos, valor] of Object.entries(FIXAS_PADRAO)) {
      if (pos === '1-5') continue;
      expect(g[pos].texto).toBe(valor);
      expect(g[pos].fixa).toBe('true');
    }
  };

  await user.click(celula('1-5'));
  conferir();

  await cliqueDireito(user, celula('1-5'));
  conferir();
});
