// Testes de Limpar e desfazer (tarefas A4 e A5). Contrato: seções 1, 3 e 5 do PLANEJAMENTO.md.
import { abrirJogo, celula, screen, preencher, PUZZLE_PADRAO } from './helpers.js';

// Fixas do PUZZLE_PADRAO (seção 3): 1-5=1, 2-4=1, 2-6=1, 3-2=1, 3-5=1, 4-1=0, 4-3=0, 4-4=0, 6-6=0.
// Derivadas do próprio PUZZLE_PADRAO: cada caractere diferente de '.' é uma fixa.
const FIXAS_PADRAO = Object.fromEntries(
  [...PUZZLE_PADRAO].flatMap((ch, i) =>
    ch === '.' ? [] : [[`${Math.floor(i / 6) + 1}-${(i % 6) + 1}`, ch]]),
);

/** Lê as 36 células da grade: texto, data-fixa e data-conflito. */
function varrerGrade() {
  const grade = {};
  for (let l = 1; l <= 6; l++) {
    for (let c = 1; c <= 6; c++) {
      const pos = `${l}-${c}`;
      const el = celula(pos);
      grade[pos] = {
        texto: el.textContent.trim(),
        fixa: el.getAttribute('data-fixa'),
        conflito: el.getAttribute('data-conflito'),
      };
    }
  }
  return grade;
}

const vazias = () => screen.getByTestId('vazias');
const desfazer = () => screen.getByTestId('btn-desfazer');

test('TC-SB-07 limpar', async () => {
  const user = await abrirJogo({ puzzle: PUZZLE_PADRAO });
  await preencher(user, '1-1', '0');
  await preencher(user, '1-2', '1');

  // Conferência positiva antes do Limpar.
  expect(celula('1-1')).toHaveTextContent(/^0$/);
  expect(celula('1-2')).toHaveTextContent(/^1$/);
  expect(vazias()).toHaveTextContent(/^25$/);

  await user.click(screen.getByTestId('btn-limpar'));

  // As jogadas do jogador somem.
  expect(celula('1-1').textContent.trim()).toBe('');
  expect(celula('1-2').textContent.trim()).toBe('');

  // As 9 fixas continuam com o mesmo valor; as 27 não fixas ficam vazias e não fixas.
  const grade = varrerGrade();
  for (const [pos, valor] of Object.entries(FIXAS_PADRAO)) {
    expect(grade[pos].texto).toBe(valor);
    expect(grade[pos].fixa).toBe('true');
  }
  const naoFixas = Object.keys(grade).filter((pos) => !(pos in FIXAS_PADRAO));
  expect(naoFixas).toHaveLength(27);
  for (const pos of naoFixas) {
    expect(grade[pos].texto).toBe('');
    expect(grade[pos].fixa).toBe('false');
  }

  expect(vazias()).toHaveTextContent(/^27$/);

  // Limpar conta como jogada (seção 1): Desfazer fica habilitado.
  expect(desfazer()).toBeEnabled();
});

test('TC-SB-08 desfazer', async () => {
  const user = await abrirJogo({ puzzle: PUZZLE_PADRAO });
  // Duas jogadas (dois cliques esquerdos em 1-1): vazia -> 0 -> 1.
  await user.click(celula('1-1'));
  await user.click(celula('1-1'));

  expect(celula('1-1')).toHaveTextContent(/^1$/);
  expect(vazias()).toHaveTextContent(/^26$/);

  // 1º desfazer: volta a última jogada (1 -> 0).
  await user.click(desfazer());
  expect(celula('1-1')).toHaveTextContent(/^0$/);
  expect(vazias()).toHaveTextContent(/^26$/);
  expect(desfazer()).toBeEnabled();

  // 2º desfazer: volta a jogada anterior (0 -> vazia).
  await user.click(desfazer());
  expect(celula('1-1').textContent.trim()).toBe('');
  expect(vazias()).toHaveTextContent(/^27$/);
  expect(desfazer()).toBeDisabled();

  // As 9 fixas continuam com o mesmo valor e fixas.
  const grade = varrerGrade();
  for (const [pos, valor] of Object.entries(FIXAS_PADRAO)) {
    expect(grade[pos].texto).toBe(valor);
    expect(grade[pos].fixa).toBe('true');
  }
});

test('TC-SB-09 desfazer desabilitado sem jogadas', async () => {
  const user = await abrirJogo({ puzzle: PUZZLE_PADRAO });

  // Ao abrir, não há jogada para desfazer; o jogo existe (27 vazias).
  expect(desfazer()).toBeDisabled();
  expect(vazias()).toHaveTextContent(/^27$/);

  // Uma jogada habilita o Desfazer.
  await user.click(celula('1-1'));
  expect(celula('1-1')).toHaveTextContent(/^0$/);
  expect(desfazer()).toBeEnabled();

  // Desfazer a única jogada desabilita o Desfazer de novo.
  await user.click(desfazer());
  expect(desfazer()).toBeDisabled();
  expect(celula('1-1').textContent.trim()).toBe('');
  expect(vazias()).toHaveTextContent(/^27$/);
});
