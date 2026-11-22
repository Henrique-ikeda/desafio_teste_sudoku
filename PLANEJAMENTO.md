# Planejamento — desafio_teste_sudoku

Sudoku binário (Takuzu) em grade **6 × 6**: **Casos de teste de interface em JavaScript**. O jogo em si não é implementado (a entrega são só os testes); os testes ficam falhando pelo motivo certo.

| Integrante | GitHub | Papel neste repositório |
|---|---|---|
| Henrique Kendi Ikeda (RA 24039456-2) | Henrique-ikeda | Setup do projeto e testes de: grade, preenchimento, vazias, limpar e desfazer (tarefas A1–A5) |
| Felipe Galeti Gôngora (RA 24036480-2) | FGaleti | CI, README e testes de: regras (conflitos), vitória e novo jogo (tarefas F1–F5) |

---

## 1. Regras do jogo (o que os testes verificam)

- Grade de **6 × 6 = 36 células**, identificadas por `linha-coluna`, de `1-1` (canto superior esquerdo) a `6-6`.
- Cada célula fica **vazia**, com **0** ou com **1**.
- O puzzle começa com algumas **células fixas** (já preenchidas), que o jogador não consegue mudar.
- **Clique esquerdo** numa célula não fixa alterna: vazia → 0 → 1 → vazia. **Clique direito** alterna ao contrário: vazia → 1 → 0 → vazia.
- **Regras** (valem para a grade inteira, inclusive as células fixas):
  1. **Nunca três iguais seguidos:** numa linha ou coluna não pode haver três 0 ou três 1 vizinhos.
  2. **Metade de cada:** cada linha e cada coluna tem exatamente três 0 e três 1. Ter **mais de três** de um número já é erro, mesmo com a linha incompleta.
  3. **Sem repetição:** duas linhas **completas** não podem ser iguais; duas colunas **completas** também não.
- **Conflito na hora:** toda célula que faz parte de uma regra quebrada fica marcada como conflito: as três (ou mais) iguais seguidas; os números a mais na linha ou coluna (todas as células com aquele número nela); as duas linhas ou colunas iguais (todas as células delas). Quando a regra deixa de ser quebrada, a marcação some.
- **Contador de vazias:** quantas células ainda estão vazias.
- **Limpar:** apaga tudo o que o jogador preencheu (as fixas ficam). Conta como uma jogada.
- **Desfazer:** volta a última jogada (um clique ou um Limpar). Pode ser usado várias vezes; fica desabilitado quando não há jogada para desfazer.
- **Vitória:** grade cheia e **sem nenhum conflito** → mensagem "Resolvido!" e a grade fica bloqueada (cliques, Limpar e Desfazer não mudam mais nada). Grade cheia com conflito não é vitória.
- **Novo jogo:** volta o puzzle ao começo (só as fixas, mensagem vazia, nada para desfazer). Sem o parâmetro `puzzle`, carrega um puzzle do banco interno do jogo.

## 2. Stack, comandos e estrutura

| Item | Escolha |
|---|---|
| Entrega | **Somente os casos de teste** (`tests/`). O código do jogo não é implementado |
| Executor dos testes | [Jest](https://jestjs.io) 29, com `babel-jest` (converte os ES Modules para CommonJS só nos testes) |
| Testes de interface | [Testing Library](https://testing-library.com) (`@testing-library/dom` + `@testing-library/user-event` + `@testing-library/jest-dom`), em JavaScript |
| "Navegador" dos testes | [jsdom](https://github.com/jsdom/jsdom) (`testEnvironment: 'jsdom'`). Não precisa baixar navegador |
| Esqueleto da tela | `index.html` com os elementos fixos da seção 3 **vazios** + `js/main.js` vazio. É só o "molde" que os testes abrem |
| Node | 18 ou superior |
| CI | GitHub Actions rodando `npm ci` e `npm run verificar` em todo push e Pull Request |

```bash
npm install                 # instala dependências (não baixa navegador)
npm test                    # roda os testes (jest) — TODOS falham, de propósito
npm run verificar           # confere se cada teste falha pelo motivo certo e tem um ID do plano
npm run verificar:completo  # idem + acusa TCs do plano que ainda não têm teste (usar na entrega)
```

### Por que os testes ficam falhando

O jogo não existe. Cada teste é escrito a partir da especificação (seções 1, 3 e 5) e precisa **falhar pelo motivo certo**:

- ✅ **Motivo certo:** a asserção não bate ou o elemento não existe, porque o jogo ainda não faz aquilo. Por exemplo, `Unable to find an element by: [data-testid="..."]` ou `expect(element).toHaveTextContent()`.
- ❌ **Motivo errado:** erro no próprio teste, como `TypeError`, `ReferenceError`, import quebrado ou arquivo que não carrega.
- ❌ **Teste passando:** se passa com a tela vazia, ele não testa nada. Reescreva-o para conferir o comportamento da seção 5.

O `scripts/verificar-testes.mjs` faz essa conferência sozinho; o CI e o hook dos agentes usam ele.

### Esqueleto da tela (`index.html`)

- Tem os elementos **fixos** da seção 3, cada um com seu `data-testid`, **sem texto, sem valor e sem atributos de estado** (`data-*` de estado, `disabled`, `hidden`). Senão algum teste passaria sem o jogo existir.
- As células (`celula-L-C`) são criados pelo jogo e **não** entram no esqueleto.
- Carrega `<script type="module" src="js/main.js"></script>`; `js/main.js` fica só com um comentário.

### Como um teste abre o jogo — `tests/helpers.js`

`abrirJogo(params)` põe os parâmetros na URL, carrega o `index.html`, importa o `js/main.js` de novo (cada teste começa um jogo novo) e devolve o `user` do user-event para clicar como um jogador.

```js
import { abrirJogo, celula, screen, PUZZLE_PADRAO } from './helpers.js';

test('TC-SB-04 ciclo do clique esquerdo', async () => {
  const user = await abrirJogo({ puzzle: PUZZLE_PADRAO });
  await user.click(celula('1-1'));
  expect(celula('1-1')).toHaveTextContent(/^0$/);
});
```

### Regras para os testes

- Os testes **só** acessam o jogo pelo que o usuário vê e clica: `screen.getByTestId(...)`, os atalhos do `helpers.js` e `user.click`/`user.dblClick`/`cliqueDireito(user, el)`. Nada de importar `js/*.js` ou chamar funções internas.
- Todo elemento que um teste usa tem `data-testid` (lista na seção 3). Se precisar de um novo, adicione na seção 3 no mesmo PR.
- O puzzle é controlado pelo **parâmetro de URL `puzzle`** (seção 3). Um teste nunca depende de sorte; sem o parâmetro, o teste só pode conferir regras que valem para qualquer puzzle.
- Cada caso de teste da seção 5 vira um `test('TC-SB-NN ...')` com o **mesmo ID no título** (o verificador exige). Caso parametrizado → `test.each`, que conta como um caso só.
- Proibido `test.skip`, `test.todo` e `.only` (o verificador acusa).

### Arquivos para agentes de IA (ver [docs/TDD-COM-IA.md](docs/TDD-COM-IA.md))

```
AGENTS.md                        instruções para qualquer agente (Codex lê sozinho)
CLAUDE.md                        Claude Code: carrega o AGENTS.md + sub-agentes
.claude/skills/tdd/SKILL.md      skill tdd para o Claude Code  (/tdd A2)
.agents/skills/tdd/SKILL.md      skill tdd para o Codex        ($tdd A2) — cópia idêntica
.claude/agents/                  sub-agentes: escritor-de-testes, revisor-tdd
.claude/settings.json            hook do Claude Code
.codex/hooks.json                hook do Codex (aprovar uma vez com /hooks)
scripts/verificar-testes.mjs     verificador (npm run verificar, CI e hook)
scripts/hooks/rodar-testes.mjs   o hook: roda o verificador após editar tests/
docs/TDD-COM-IA.md               técnicas de TDD com IA usadas aqui e fontes
docs/MATRIZ-COBERTURA.md         cada regra da seção 1 → casos de teste que a cobrem
```

### Estrutura e dono de cada arquivo

```
desafio_teste_sudoku/
├── index.html                    A1  esqueleto: elementos fixos da seção 3, vazios
├── js/main.js                    A1  vazio (o jogo não é implementado)
├── tests/helpers.js              A1  abrirJogo(), PUZZLE_PADRAO e atalhos
├── tests/grade.spec.js           Henrique  (A2, A3)
├── tests/acoes.spec.js           Henrique  (A4, A5)
├── tests/regras.spec.js          Felipe    (F2, F3, F4)
├── tests/fim-de-jogo.spec.js     Felipe    (F5)
├── .github/workflows/testes.yml  Felipe    (F1)
├── README.md                     Felipe    (F1; cada um atualiza a sua parte da tabela)
├── babel.config.cjs              A1  só para os testes (Jest): ESM → CommonJS
└── package.json                  A1
```

## 3. Contrato de interface (o que os testes usam)

### Elementos (`data-testid`)

| data-testid | O que é |
|---|---|
| `grade` | A grade (contém as 36 células) |
| `celula-1-1` … `celula-6-6` | Células, `celula-<linha>-<coluna>`. Texto = `0`, `1` ou vazio. `data-fixa` = `true` \| `false`. `data-conflito` = `true` \| `false` |
| `vazias` | Quantidade de células vazias (número) |
| `mensagem` | Vazia durante o jogo; "Resolvido!" na vitória |
| `btn-limpar` | Apaga o que o jogador preencheu |
| `btn-desfazer` | Desfaz a última jogada (`disabled` quando não há o que desfazer) |
| `btn-novo-jogo` | Volta o puzzle ao começo |

### Parâmetros de URL

| Parâmetro | Exemplo | Efeito |
|---|---|---|
| `puzzle` | `?puzzle=....1....1.1.1..1.0.00.............0` | As 36 células, linha por linha: `0` e `1` = células fixas, `.` = vazia. Continua o mesmo depois de "Novo jogo" |

### Puzzles fixos usados nos testes

**`PUZZLE_PADRAO`** = `....1....1.1.1..1.0.00.............0` — 9 fixas, 27 vazias, **solução única** (conferida por script):

```
puzzle        solução (SOLUCAO_PADRAO)
. . . . 1 .   0 0 1 0 1 1
. . . 1 . 1   0 0 1 1 0 1
. 1 . . 1 .   1 1 0 0 1 0
0 . 0 0 . .   0 1 0 0 1 1
. . . . . .   1 0 1 1 0 0
. . . . . 0   1 1 0 1 0 0
```

Fixas: `1-5`=1, `2-4`=1, `2-6`=1, `3-2`=1, `3-5`=1, `4-1`=0, `4-3`=0, `4-4`=0, `6-6`=0.

**`PUZZLE_VAZIO`** = 36 pontos: nenhuma fixa. Usado para montar cada situação de regra com poucos cliques.

**Preencher pelos cliques** (a partir de uma célula vazia): 0 = 1 clique esquerdo; 1 = 2 cliques esquerdos. O atalho `preencher(user, '1-1', '0')` do `helpers.js` faz isso.

## 4. Divisão de tarefas

Cada tarefa segue o mesmo ciclo, **um caso de teste por vez**:

1. Escrever o teste do TC só a partir da especificação (seções 1, 3 e 5), sem código do jogo.
2. Rodar só ele (`npx jest tests/<arquivo>.spec.js -t "TC-SB-NN"`) e conferir que **falha pelo motivo certo**: asserção ou elemento não encontrado, e não erro do próprio teste.
3. `npm run verificar` sem problemas → commit `test: TC-SB-NN <cenário>`.
4. No fim da tarefa: revisão, atualizar a tabela de testes do README e abrir o Pull Request; o outro integrante revisa.

Cada integrante é **dono de arquivos de teste diferentes** (coluna "Arquivos"). Assim, depois da A1, os dois trabalham em paralelo sem conflito. `tests/helpers.js` é da A1: se precisar mudar, combinem antes e façam um commit pequeno e separado. Tarefas que usam o mesmo arquivo: faça o merge de uma antes de começar a outra.

**Usando agentes de IA (Claude Code ou Codex):** os dois seguem a skill `tdd` (lida pelo [`AGENTS.md`](AGENTS.md)). Para começar uma tarefa: `/tdd A2` no Claude Code ou `$tdd A2` no Codex; depois, "go" escreve o próximo TC. Cada integrante roda o agente na própria máquina, com o próprio `git config`, para os commits saírem no nome de quem fez.

### Henrique (tarefas A)

| Tarefa | Branch | Arquivos | Casos de teste |
|---|---|---|---|
| **A1** Setup: `package.json`, `babel.config.cjs`, `js/main.js` vazio, `.gitignore`, `index.html` esqueleto, `tests/helpers.js`, verificador, skill, sub-agentes e hooks, PLANEJAMENTO e docs | `main` (repositório vazio, commit direto) | tudo | — |
| **A2** Grade e células fixas | `henrique/a2-grade` | tests/grade.spec.js | 01, 02, 03 |
| **A3** Preencher (cliques) e contador de vazias | `henrique/a3-preencher` | tests/grade.spec.js | 04, 05, 06 |
| **A4** Limpar e desfazer | `henrique/a4-limpar-desfazer` | tests/acoes.spec.js | 07, 08, 09, 10 |
| **A5** Situações que não são conflito | `henrique/a5-sem-conflito` | tests/acoes.spec.js | 11, 12 |

### Felipe (tarefas F)

| Tarefa | Branch | Arquivos | Casos de teste |
|---|---|---|---|
| **F1** CI no GitHub Actions + README (conferir e completar) | `felipe/f1-ci-readme` | .github/workflows, README.md | — |
| **F2** Três iguais seguidos | `felipe/f2-tres-iguais` | tests/regras.spec.js | 13, 14, 24 |
| **F3** Quantidade de 0 e 1 | `felipe/f3-quantidade` | tests/regras.spec.js | 15, 16, 19 |
| **F4** Linhas e colunas iguais | `felipe/f4-iguais` | tests/regras.spec.js | 17, 18 |
| **F5** Vitória e novo jogo | `felipe/f5-vitoria` | tests/fim-de-jogo.spec.js | 20, 21, 22, 23 |
| **F6** Lacunas de cobertura (casos adicionais) | `felipe/f6-lacunas` | tests/lacunas-felipe.spec.js | 31 a 55 (os que forem escritos) |

**IDs reservados:** `TC-SB-25` a `TC-SB-30` ficam com o Felipe, para casos adicionais que fecham lacunas da matriz de cobertura (trinca em todas as combinações e nas bordas, excesso nas combinações que faltam, fronteira 3 × 4, conflito que some depois de corrigir ou de Limpar, novo jogo depois da vitória). Cada um entrou na seção 5 no PR da tarefa que o usa (F2–F5). **`TC-SB-31` a `TC-SB-55` também ficam com o Felipe** (tarefa F6: casos adicionais que matam defeitos que a suíte anterior deixava passar, conferidos por mutação), e casos novos do Henrique passam a usar `TC-SB-56` em diante.

## 5. Casos de teste (interface)

Salvo quando dito outro, os passos partem de células vazias.

### Henrique — grade, preenchimento, limpar e desfazer

| ID | Cenário | Parâmetros / passos | Resultado esperado |
|---|---|---|---|
| TC-SB-01 | Grade 6 × 6 com o puzzle | `?puzzle=PUZZLE_PADRAO`. Abrir a página | 36 células (`celula-1-1` a `celula-6-6`; não existe `celula-7-1` nem `celula-1-7`); as 9 fixas mostram o valor e têm `data-fixa` = `true`; as 27 outras estão vazias com `data-fixa` = `false`; `vazias` = 27 |
| TC-SB-02 | Puzzle sem parâmetro | Abrir sem parâmetros | 36 células; pelo menos 1 fixa; `vazias` = 36 − fixas; nenhuma célula com `data-conflito` = `true`; `mensagem` vazia |
| TC-SB-03 | Célula fixa não muda | `PUZZLE_PADRAO`. Clique esquerdo e depois clique direito em `1-5` | `1-5` continua "1" e `data-fixa` = `true`; `vazias` continua 27; `btn-desfazer` continua desabilitado |
| TC-SB-04 | Ciclo do clique esquerdo | `PUZZLE_PADRAO`. Clicar `1-1` três vezes, conferindo a cada clique | "0", depois "1", depois vazia |
| TC-SB-05 | Ciclo do clique direito | `PUZZLE_PADRAO`. Clique direito em `1-1` três vezes | "1", depois "0", depois vazia |
| TC-SB-06 | Contador de vazias | `PUZZLE_PADRAO`. Preencher `1-1` com 0; depois preencher `1-2` com 1; depois clicar `1-1` duas vezes (volta a vazia) | `vazias` = 26, depois 25, depois 26 |
| TC-SB-07 | Limpar | `PUZZLE_PADRAO`. Preencher `1-1`=0 e `1-2`=1; clicar `btn-limpar` | `1-1` e `1-2` vazias; as 9 fixas com o mesmo valor; `vazias` = 27 |
| TC-SB-08 | Desfazer | `PUZZLE_PADRAO`. Clicar `1-1` duas vezes ("1"); `btn-desfazer`; `btn-desfazer` | Depois do 1º desfazer `1-1` = "0"; depois do 2º, vazia; `vazias` = 27 |
| TC-SB-09 | Desfazer desabilitado sem jogadas | `PUZZLE_PADRAO`. Abrir; clicar `1-1`; `btn-desfazer` | Ao abrir: `btn-desfazer` desabilitado. Depois do clique: habilitado. Depois de desfazer: desabilitado de novo |
| TC-SB-10 | Desfazer o Limpar | `PUZZLE_PADRAO`. Preencher `1-1`=0 e `1-2`=1; `btn-limpar`; `btn-desfazer` | `1-1` = "0" e `1-2` = "1" de volta; `vazias` = 25 |
| TC-SB-11 | Dois iguais seguidos não é conflito | `PUZZLE_VAZIO`. Preencher `1-1`=0 e `1-2`=0 | As duas mostram "0" e as duas têm `data-conflito` = `false` |
| TC-SB-12 | Linhas iguais incompletas não são conflito | `PUZZLE_VAZIO`. Preencher as linhas 1 e 2 com `00101` nas colunas 1 a 5 (coluna 6 vazia) | As 10 células preenchidas mostram o valor e têm `data-conflito` = `false` |

### Felipe — regras, vitória e novo jogo

| ID | Cenário | Parâmetros / passos | Resultado esperado |
|---|---|---|---|
| TC-SB-13 | Três iguais na linha | `PUZZLE_VAZIO`. Preencher `1-1`, `1-2` e `1-3` com 0 | As três com `data-conflito` = `true`; `1-4` (vazia) com `false` |
| TC-SB-14 | Três iguais na coluna | `PUZZLE_VAZIO`. Preencher `1-1`, `2-1` e `3-1` com 1 | As três com `data-conflito` = `true` |
| TC-SB-15 | Mais de três 0 na linha | `PUZZLE_VAZIO`. Preencher `1-1`, `1-3`, `1-5` e `1-6` com 0 (sem três seguidos) | As quatro com `data-conflito` = `true` |
| TC-SB-16 | Mais de três 1 na coluna | `PUZZLE_VAZIO`. Preencher `1-1`, `3-1`, `5-1` e `6-1` com 1 | As quatro com `data-conflito` = `true` |
| TC-SB-17 | Duas linhas completas iguais | `PUZZLE_VAZIO`. Preencher as linhas 1 e 2 com `001011` | As 12 células das linhas 1 e 2 com `data-conflito` = `true` |
| TC-SB-18 | Duas colunas completas iguais | `PUZZLE_VAZIO`. Preencher as colunas 1 e 2 (de cima para baixo) com `001011` | As 12 células das colunas 1 e 2 com `data-conflito` = `true` |
| TC-SB-19 | Conflito some ao corrigir | `PUZZLE_VAZIO`. Preencher `1-1`, `1-2`, `1-3` com 0; clicar `1-3` mais uma vez ("1") | Antes: as três em conflito. Depois: `1-1`, `1-2` e `1-3` com `data-conflito` = `false`; `1-3` = "1" |
| TC-SB-20 | Vitória | `PUZZLE_PADRAO`. Preencher as 27 vazias com a `SOLUCAO_PADRAO` | `mensagem` = "Resolvido!"; `vazias` = 0; nenhuma célula em conflito |
| TC-SB-21 | Grade cheia com erro não vence | `PUZZLE_PADRAO`. Preencher as 27 vazias com a `SOLUCAO_PADRAO`, menos `1-1`, que recebe 1 | `vazias` = 0; `mensagem` vazia; `1-1` com `data-conflito` = `true` (a linha 1 fica com quatro 1) |
| TC-SB-22 | Grade bloqueada após a vitória | Depois do TC-SB-20: clicar `1-1`; clicar `btn-limpar`; clicar `btn-desfazer` | `1-1` continua "0"; `vazias` continua 0; `mensagem` continua "Resolvido!" |
| TC-SB-23 | Novo jogo | `PUZZLE_PADRAO`. Preencher `1-1`=0; clicar `btn-novo-jogo` | `1-1` vazia; as 9 fixas iguais ao puzzle; `vazias` = 27; `btn-desfazer` desabilitado; `mensagem` vazia |
| TC-SB-24 | Conflito também marca células fixas | `PUZZLE_PADRAO`. Preencher `4-2` com 0 (a linha 4 fica `0000..`) | `4-1`, `4-2`, `4-3` e `4-4` com `data-conflito` = `true`, inclusive as fixas `4-1`, `4-3` e `4-4` |
| TC-SB-25 | Três iguais em todas as combinações e nas bordas | `PUZZLE_VAZIO`. Um caso por vez (`test.each`): (a) `1-1`, `1-2` e `1-3` com 1; (b) `1-1`, `2-1` e `3-1` com 0; (c) `1-4`, `1-5` e `1-6` com 0 (borda direita); (d) `4-6`, `5-6` e `6-6` com 1 (borda inferior) | Em cada caso, as três células mostram o valor e têm `data-conflito` = `true`; nenhuma outra célula em conflito |
| TC-SB-26 | Mais de três nas combinações que faltam | `PUZZLE_VAZIO`. Um caso por vez (`test.each`): (a) linha 1 com 1 em `1-1`, `1-3`, `1-5` e `1-6`; (b) coluna 1 com 0 em `1-1`, `3-1`, `5-1` e `6-1` (sem três seguidos) | Em cada caso, as quatro células mostram o valor e têm `data-conflito` = `true`; nenhuma outra célula em conflito |
| TC-SB-27 | Exatamente três iguais sem trinca não é conflito | `PUZZLE_VAZIO`. Preencher `1-1`, `1-3` e `1-5` com 0; depois preencher `1-6` com 0 | Com três 0: as três mostram "0" e nenhuma célula está em conflito. Com o quarto 0: `1-1`, `1-3`, `1-5` e `1-6` com `data-conflito` = `true` e nenhuma outra |
| TC-SB-28 | Conflito de linhas iguais some ao corrigir | `PUZZLE_VAZIO`. Preencher as linhas 1 e 2 com `001011`; clicar `2-6` uma vez (1 → vazia: a linha 2 fica incompleta) | Antes: as 12 células das linhas 1 e 2 em conflito. Depois: `2-6` vazia e nenhuma célula em conflito |
| TC-SB-29 | Novo jogo depois da vitória desbloqueia o jogo | `PUZZLE_PADRAO`. Preencher as 27 vazias com a `SOLUCAO_PADRAO` (vitória); clicar `btn-novo-jogo`; clicar `1-1` | `mensagem` vazia; `1-1` = "0"; `vazias` = 26; `btn-desfazer` habilitado |
| TC-SB-30 | Conflito some depois do Limpar | `PUZZLE_VAZIO`. Preencher `1-1`, `1-2` e `1-3` com 0; clicar `btn-limpar` | Antes: as três em conflito. Depois: `1-1`, `1-2` e `1-3` vazias; nenhuma célula em conflito; `vazias` = 36 |
| TC-SB-31 | Desfazer remove o conflito | `PUZZLE_VAZIO`. Preencher `1-1`, `1-2` e `1-3` com 0; clicar `btn-desfazer` | Antes: as três em conflito. Depois: `1-3` vazia, `1-1` e `1-2` com "0", `vazias` = 34 e nenhuma célula em conflito |
| TC-SB-32 | Clique direito gera e desfaz conflito, e o Desfazer volta o clique direito | `PUZZLE_VAZIO`. Clique direito em `1-1`, `1-2` e `1-3` (cada uma vira "1"); clique direito de novo em `1-3` (vira "0"); `btn-desfazer` | Após os 3 cliques: as três em conflito. Após o 4º clique: `1-3` = "0" e nenhuma em conflito. Depois de desfazer: `1-3` volta a "1" e as três ficam em conflito |
| TC-SB-33 | Novo jogo limpa os conflitos | `PUZZLE_VAZIO`. Preencher `1-1`, `1-2` e `1-3` com 0; clicar `btn-novo-jogo` | Antes: as três em conflito. Depois: as três vazias com `data-conflito` = `false`, `vazias` = 36 e nenhuma célula em conflito |
| TC-SB-34 | Vitória preenchendo só com o clique direito | `PUZZLE_PADRAO`. Preencher as 27 vazias com a `SOLUCAO_PADRAO` só pelo clique direito (valor 1 = 1 clique; valor 0 = 2 cliques) | As 36 células iguais à `SOLUCAO_PADRAO`; `mensagem` = "Resolvido!"; `vazias` = 0; nenhuma célula em conflito |
| TC-SB-35 | Mais de três 0 na última linha e na última coluna | `PUZZLE_VAZIO`. Um caso por vez (`test.each`): (a) `6-1`, `6-3`, `6-5` e `6-6` com 0 (última linha); (b) `1-6`, `3-6`, `5-6` e `6-6` com 0 (última coluna) | Em cada caso, as quatro células mostram "0" e têm `data-conflito` = `true`; nenhuma outra célula em conflito |
| TC-SB-36 | Mais de três com cinco 0 na linha | `PUZZLE_VAZIO`. Preencher `1-1`, `1-2`, `1-4`, `1-5` e `1-6` com 0 (`1-3` fica vazia) | As cinco com `data-conflito` = `true`, `1-3` vazia com `false`; nenhuma outra célula em conflito |
| TC-SB-37 | Linhas e colunas completas iguais, mesmo longe uma da outra | `PUZZLE_VAZIO`. Um caso por vez (`test.each`): (a) linhas 1 e 5 com `001011`; (b) colunas 1 e 5 (de cima para baixo) com `001011` | Em cada caso, as 12 células das duas linhas (ou colunas) mostram o valor e têm `data-conflito` = `true`; nenhuma outra célula em conflito |
| TC-SB-38 | Linhas iguais marcam também as células fixas | `puzzle` = `001011` + `00101.` + 24 pontos (linha 1 fixa em `001011`; linha 2 com as cinco primeiras fixas iguais e `2-6` vazia). Preencher `2-6` com 1 | `2-6` = "1" e `vazias` = 24; as 12 células das linhas 1 e 2 com `data-conflito` = `true`, inclusive as 11 fixas (`data-fixa` = `true`); nenhuma outra |
| TC-SB-39 | Célula fixa de valor 0 não muda | `PUZZLE_PADRAO`. Clique esquerdo e clique direito em `4-1`; o mesmo em `6-6` (as duas são fixas com valor 0) | `4-1` e `6-6` continuam "0" com `data-fixa` = `true`; `vazias` continua 27; `btn-desfazer` continua desabilitado |
| TC-SB-40 | Três iguais no meio da linha e da coluna | `PUZZLE_VAZIO`. Um caso por vez (`test.each`): (a) `1-2`, `1-3` e `1-4` com 1; (b) `1-3`, `1-4` e `1-5` com 0; (c) `2-3`, `3-3` e `4-3` com 1 | Em cada caso, as três células mostram o valor e têm `data-conflito` = `true`; nenhuma outra célula em conflito |
| TC-SB-41 | A trinca marca só as três iguais, não o vizinho diferente | `PUZZLE_VAZIO`. Preencher `1-1`, `1-2` e `1-3` com 0 e `1-4` com 1 | `1-1`, `1-2` e `1-3` com `data-conflito` = `true`; `1-4` mostra "1" com `false`; nenhuma outra célula em conflito |

## 6. Fluxo de trabalho no Git

Para o professor enxergar a contribuição dos dois, **cada um commita da própria conta**:

1. **Henrique** cria o repositório e adiciona `FGaleti` como colaborador (Settings → Collaborators). **Felipe** aceita o convite.
2. Cada um configura o Git com o e-mail **cadastrado na própria conta do GitHub** (senão o commit não conta como contribuição):
   ```bash
   git config user.name "Seu Nome"
   git config user.email "email-da-sua-conta@exemplo.com"
   ```
3. Ninguém commita direto na `main` (fora o setup inicial, com o repositório vazio). Uma branch por tarefa: `henrique/a2-...`, `felipe/f2-...`, etc.
4. Mensagens no padrão Conventional Commits, em português: `test:`, `docs:`, `chore:`, `ci:`. Commits pequenos: um caso de teste por commit.
5. Pull Request para `main` → o **outro** integrante revisa e aprova → merge com **"Create a merge commit"** (não usar *squash*, para manter todos os commits de cada autor no histórico).
6. Antes de abrir o PR: `git pull origin main` e `npm run verificar` sem problemas. O CI precisa estar verde no PR.
7. Ordem: **A1 entra primeiro** (estrutura do projeto). Depois disso as tarefas A e F andam em paralelo.

Conferir no fim: aba **Insights → Contributors** do repositório deve mostrar os dois.

## 7. Definição de pronto

- [ ] Todos os casos de teste da seção 5 escritos em `tests/`, com o ID no título
- [ ] `npm run verificar:completo` sem problemas: todos os TCs têm teste, e todos **falham pelo motivo certo**
- [ ] Nenhum código do jogo em `js/` (só o `js/main.js` vazio)
- [ ] README com: especificação, colaboradores, como rodar, **funcionamento dos casos de teste** (tabela ID → arquivo → resultado esperado)
- [ ] CI (GitHub Actions rodando `npm run verificar`) verde na `main`
- [ ] Commits dos dois integrantes aparecendo em Insights → Contributors
- [ ] Nome do repositório exatamente `desafio_teste_sudoku`
