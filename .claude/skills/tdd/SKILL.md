---
name: tdd
description: Escreve os casos de teste de interface (Jest + Testing Library) do Sudoku binário para uma tarefa do PLANEJAMENTO.md (A1–A5, F1–F5), um TC por vez, a partir da especificação, confirmando que cada um falha pelo motivo certo. Modo somente testes — o jogo não é implementado. Use sempre que for criar ou alterar testes neste repositório, ou quando o usuário disser "próximo"/"go".
---

# TDD neste repositório — modo **somente testes**

> ⚠️ **Modo somente testes.** Ninguém implementa o jogo: nada de código em `js/` (fora o `js/main.js` vazio), nada de fazer teste passar. A entrega são os casos de teste, **todos falhando pelo motivo certo**.

Vale para **Claude Code** (`/tdd A2`) e **Codex** (`$tdd A2`). Esta skill existe em duas cópias idênticas, `.claude/skills/tdd/SKILL.md` e `.agents/skills/tdd/SKILL.md`: ao mudar uma, mude a outra. As técnicas e as fontes estão em [`docs/TDD-COM-IA.md`](../../../docs/TDD-COM-IA.md).

## Por que assim

Testes escritos olhando o código acabam conferindo o que o código *faz*, não o que foi *pedido*. Aqui não existe código: cada teste nasce só da especificação (`PLANEJAMENTO.md`), exatamente como no RED do TDD. Testes escritos todos de uma vez, sem rodar cada um, costumam ter erros no próprio teste, e um erro desses parece "falha" sem testar nada.

Por isso a regra é **um teste por vez, rodando cada um**, e conferindo que ele falha **pelo motivo certo**:

- ✅ **Motivo certo:** a asserção não bate ou o elemento não existe, porque o jogo ainda não faz aquilo. Por exemplo, `AssertionError`, `TestingLibraryElementError: Unable to find an element...` ou `expect(element).toHaveTextContent()`.
- ❌ **Motivo errado:** erro do próprio teste, como `TypeError`, `ReferenceError`, import quebrado ou arquivo que não carrega.
- ❌ **Passou:** com a tela vazia, um teste que passa não testa nada.

## 0. Antes de começar: qual tarefa e de quem

1. Pergunte (se não foi dito) **qual tarefa** do `PLANEJAMENTO.md` será feita: `A1`…`A5` (Henrique) ou `F1`…`F5` (Felipe).
2. Leia no `PLANEJAMENTO.md`: as regras (seção 1), o contrato de interface (seção 3) e os casos de teste da tarefa (seção 5).
3. Trabalhe **só nos arquivos de teste do dono da tarefa** (coluna "Arquivos" da seção 4). Se precisar mexer em `tests/helpers.js` ou no arquivo do outro integrante, pare e avise.
4. Confira a branch: `henrique/<tarefa>` ou `felipe/<tarefa>` (seção 4). Nunca commite na `main`. Os commits saem com o `git config` da pessoa que está usando o agente; não altere `user.name`/`user.email`.

## 1. Lista de testes e planejamento

**Lista de testes:** os `TC` da tarefa, na ordem em que serão feitos (caminho principal primeiro, bordas depois). Para saber o que já foi feito:

```bash
git log --oneline --grep "TC-"       # cada TC feito tem um commit test:
npm run verificar                    # mostra os TCs que ainda não têm teste
```

Quando o usuário disser **"próximo"** ou **"go"**: pegue o primeiro `TC` da lista que ainda não tem teste e faça **um** ciclo com ele.

Apresente também e espere a confirmação:

- **Interface:** quais `data-testid` e parâmetros de URL da seção 3 cada TC usa. Se faltar algum, proponha a inclusão na seção 3 (commit `docs:` no mesmo PR).
- **Cenários:** quais constantes de cenário (os puzzles fixos `PUZZLE_PADRAO` e `PUZZLE_VAZIO`) vão para o `tests/helpers.js` ou para o topo do `*.spec.js`, com um comentário explicando o cenário.

## 2. O ciclo (repita para cada TC)

1. **Escrever** um `test('TC-SB-NN <cenário>', ...)` no `tests/*.spec.js` da tarefa, seguindo a tabela da seção 5 (mesmos passos, mesmo resultado esperado). TC parametrizado (vários valores) → `test.each`, que conta como um TC só.
2. **Não** abra nem crie nada em `js/`: o teste nasce só da especificação.
3. **Rodar só ele:**
   ```bash
   npx jest tests/<arquivo>.spec.js -t "TC-SB-NN"
   ```
4. **Conferir a falha:** precisa ser pelo motivo certo (lista acima). Se for erro do próprio teste, corrija e rode de novo. Se **passou**, o teste está fraco: ele precisa conferir algo que só existe com o jogo funcionando. Mostre ao usuário a mensagem de falha.
5. **Conferir o conjunto:** `npm run verificar` sem problemas (o hook já faz isso depois de cada edição).
6. **Commit:** `test: TC-SB-NN <cenário>`.

### Separação de papéis (sub-agentes)

- **Claude Code:** delegue cada ciclo ao sub-agente `escritor-de-testes` (passe só o ID do TC) e, no fim da tarefa, chame o `revisor-tdd` (os dois em `.claude/agents/`).
- **Codex** (ou sem sub-agentes): faça os ciclos aqui mesmo. Para a revisão final, abra **uma sessão nova** e peça a revisão do diff da branch com a seção 6 desta skill.

### Feedback automático (hook)

Depois de cada edição em `tests/`, o hook `scripts/hooks/rodar-testes.mjs` roda o verificador e devolve o resultado ao agente. Qualquer **PROBLEMA** listado deve ser resolvido antes do commit. (Claude Code: `.claude/settings.json`. Codex: `.codex/hooks.json`, que precisa ser aprovado uma vez com `/hooks`.)

## 3. Como escrever um bom teste aqui

Um bom teste lê como a especificação da seção 5 e vai continuar valendo quando o jogo for implementado, seja qual for a implementação.

✅ Faça:
- Abrir o jogo só com `abrirJogo(params)` do `tests/helpers.js`.
- Encontrar elementos com `screen.getByTestId(...)` / `getAllByTestId(...)` / `getByRole(...)`.
- Agir como o jogador: `user.click`, `user.dblClick` (abrir vizinhos), `cliqueDireito(user, el)` do `helpers.js` (bandeira).
- Conferir o que aparece: `toHaveTextContent`, `toHaveAttribute('data-estado', ...)`, `toBeVisible`, `toBeDisabled`, `toHaveLength`.
- Conferir **o resultado positivo** da seção 5. Um teste que só confere ausência ("nada muda", "não aparece") passa com a tela vazia. Combine com uma conferência que exige o jogo, por exemplo `vazias` = 26 ou a célula clicada mostrando "0".
- Montar o cenário pelos parâmetros de URL da seção 3, com constantes nomeadas e comentário.

❌ Não faça:
- Criar, importar ou chamar código de `js/`.
- Usar `jest.mock`. O único "falso" permitido é o relógio (`jest.useFakeTimers()`).
- Ler variáveis globais, `localStorage` ou estado interno.
- Depender de sorte (sem parâmetro de URL, o teste só pode conferir regras que valem para qualquer sorteio).
- Usar `test.skip`, `test.todo` ou `.only`.

## 4. Regras que não podem ser quebradas

- **Nenhum código do jogo.** Se um teste parece "precisar" de código para fazer sentido, ele está certo em falhar: deixe falhando.
- Nunca altere o **resultado esperado** de um TC. Se a tabela da seção 5 parecer errada, pare e pergunte; se o usuário concordar, corrija o `PLANEJAMENTO.md` num commit `docs:` separado.
- Nunca deixe um teste que **passa** ou que falha pelo **motivo errado**.
- Um TC por ciclo, um ciclo por vez.

## 5. Checklist por ciclo

- [ ] O título do teste tem o ID `TC-SB-NN` da seção 5
- [ ] Escrevi o teste só com a especificação (sem `js/`)
- [ ] Rodei e vi o teste falhar pelo motivo certo
- [ ] `npm run verificar` sem problemas
- [ ] Commit `test:` feito

## 6. Fim da tarefa: revisão

1. **Revisão** (sub-agente `revisor-tdd` ou sessão nova). Confere:
   - cada TC da tarefa tem teste e commit `test:`;
   - cada teste segue a seção 5, com os mesmos passos e o mesmo resultado esperado;
   - os testes conferem o resultado positivo, não só ausência;
   - nada em `js/` foi criado;
   - `npm run verificar` está sem problemas.
2. Atualize a tabela "ID → arquivo → o que verifica" do README.
3. PR para o outro integrante revisar. Na entrega final: `npm run verificar:completo`.

## Exemplo de ciclo neste repositório

Tarefa **F2**, caso **TC-SB-13** (três iguais na linha).

Teste — `tests/regras.spec.js`:

```js
import { abrirJogo, celula, preencher, PUZZLE_VAZIO } from './helpers.js';

test('TC-SB-13 três iguais na linha', async () => {
  const user = await abrirJogo({ puzzle: PUZZLE_VAZIO });
  for (const pos of ['1-1', '1-2', '1-3']) await preencher(user, pos, '0');

  for (const pos of ['1-1', '1-2', '1-3']) {
    expect(celula(pos)).toHaveAttribute('data-conflito', 'true');
  }
  expect(celula('1-4')).toHaveAttribute('data-conflito', 'false'); // vazia, fora da regra
});
```

`npx jest tests/regras.spec.js -t "TC-SB-13"` → falha com `TestingLibraryElementError: Unable to find an element by: [data-testid="celula-1-1"]` — a grade não é desenhada porque o jogo não existe. É o motivo certo. `npm run verificar` → sem problemas → commit `test: TC-SB-13 três iguais na linha`.

Próximo ciclo: TC-SB-14.
