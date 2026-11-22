# desafio_teste_sudoku

[![Testes](https://github.com/Henrique-ikeda/desafio_teste_sudoku/actions/workflows/testes.yml/badge.svg)](https://github.com/Henrique-ikeda/desafio_teste_sudoku/actions/workflows/testes.yml)

Desafio de testes: casos de teste para testar o **Sudoku binário** de tamanho **6 × 6**, com **casos de teste em JavaScript para testar JavaScript** (Jest + Testing Library).

## Especificação do desafio

- Grade de 6 × 6 células; cada célula fica vazia, com 0 ou com 1.
- Nunca três números iguais seguidos numa linha ou coluna.
- Cada linha e cada coluna tem exatamente três 0 e três 1.
- Não pode haver duas linhas iguais nem duas colunas iguais.
- Células fixas do puzzle não mudam; clique esquerdo alterna vazia → 0 → 1 → vazia, clique direito alterna ao contrário.
- Conflitos aparecem na hora; grade cheia e sem conflito = "Resolvido!". Há os botões Limpar, Desfazer e Novo jogo.

Regras completas, contrato da tela e divisão das tarefas: [PLANEJAMENTO.md](PLANEJAMENTO.md).

## Colaboradores

| Nome | RA | GitHub | Parte no trabalho |
|---|---|---|---|
| Henrique Kendi Ikeda | 24039456-2 | [Henrique-ikeda](https://github.com/Henrique-ikeda) | Tarefas A1–A5: estrutura do projeto e 12 casos de teste (grade, preenchimento, vazias, limpar e desfazer) |
| Felipe Galeti Gôngora | 24036480-2 | [FGaleti](https://github.com/FGaleti) | Tarefas F1–F5: CI, README e 25 casos de teste (regras (conflitos), vitória e novo jogo) |

As contribuições de cada um aparecem em **Insights → Contributors** e nos commits.

## Como rodar

Requisitos: Node.js 18 ou superior.

```bash
npm ci                      # instala as dependências travadas no package-lock.json
npm test                    # roda todos os casos de teste (Jest); falham de propósito
npm run verificar           # confere o motivo de cada falha e o ID de cada teste
npm run verificar:completo  # idem + confere que todo caso do plano tem teste
npx jest tests/<arquivo>.spec.js -t "TC-SB-NN"   # um caso só
```

## Funcionamento dos casos de teste

> **Aviso para o corretor:** `npm test` termina com falhas **de propósito** (o jogo não é implementado; a entrega são os casos de teste). O comando que valida a entrega é `npm run verificar`, que sai com código 0 quando todos os testes falham pelo motivo certo.

**Situação:** somente os casos de teste. O jogo não está implementado, então **todos os testes falham de propósito**, pelo motivo certo (o comportamento ainda não existe). O `npm run verificar` confere isso.

- **Ferramentas:** [Jest](https://jestjs.io) roda os testes; [Testing Library](https://testing-library.com) (`@testing-library/dom`, `user-event` e `jest-dom`) simula o jogador; o [jsdom](https://github.com/jsdom/jsdom) faz o papel do navegador, sem precisar abrir um.
- **Testes de interface:** cada teste abre o `index.html` do jogo pela função `abrirJogo(params)` de `tests/helpers.js`, clica como um jogador e confere o que aparece na tela. Os testes não chamam funções internas do jogo.
- **Elementos da tela:** encontrados pelo atributo `data-testid` (`celula-<linha>-<coluna>`, `vazias`, `mensagem`, `btn-limpar`, `btn-desfazer`, `btn-novo-jogo`). O valor da célula é o texto (`0`, `1` ou vazio); `data-fixa` e `data-conflito` dizem se ela é do puzzle e se está quebrando uma regra.
- **Sem depender de sorte:** o puzzle é passado pelo parâmetro de URL `puzzle` (36 caracteres: `0`, `1` ou `.`). `PUZZLE_PADRAO` tem 9 células fixas e solução única (`SOLUCAO_PADRAO`, conferida por script); `PUZZLE_VAZIO` deixa a grade toda livre para montar cada situação de regra em poucos cliques.
- **Rastreabilidade:** cada teste tem no título o ID do caso (`TC-SB-NN`), o mesmo da tabela abaixo e da seção 5 do PLANEJAMENTO.md. A [matriz de cobertura](docs/MATRIZ-COBERTURA.md) liga cada regra do jogo aos seus casos. Os testes do Felipe foram conferidos contra uma implementação de referência (fora do repositório) e por mutação: [docs/VALIDACAO-TESTES-FELIPE.md](docs/VALIDACAO-TESTES-FELIPE.md).
- **Metodologia:** TDD, um caso de teste por vez: escrever, rodar, ver falhar pelo motivo certo e fazer o commit `test:`. Uso de IA documentado em [docs/TDD-COM-IA.md](docs/TDD-COM-IA.md).
- **Integração contínua:** o GitHub Actions ([`.github/workflows/testes.yml`](.github/workflows/testes.yml)) roda `npm ci` e `npm run verificar` em todo push e Pull Request, com Node 18, 20 e 22 no Ubuntu e no Windows. O relatório JSON do Jest e a saída do verificador ficam como artefatos de cada execução. O job `verificar:completo`, que também exige um teste para cada TC do plano, roda sob demanda (*Run workflow*) ou em PR com o rótulo `entrega`.

## Casos de teste (37)

| ID | Cenário | Arquivo | Resultado esperado | Autor |
|---|---|---|---|---|
| TC-SB-01 | Grade 6 × 6 com o puzzle | `tests/grade.spec.js` | 36 células (`celula-1-1` a `celula-6-6`; não existe `celula-7-1` nem `celula-1-7`); as 9 fixas mostram o valor e têm `data-fixa` = `true`; as 27 outras estão vazias com `data-fixa` = `false`; `vazias` = 27 | Henrique |
| TC-SB-02 | Puzzle sem parâmetro | `tests/grade.spec.js` | 36 células; pelo menos 1 fixa; `vazias` = 36 − fixas; nenhuma célula com `data-conflito` = `true`; `mensagem` vazia | Henrique |
| TC-SB-03 | Célula fixa não muda | `tests/grade.spec.js` | `1-5` continua "1" e `data-fixa` = `true`; `vazias` continua 27; `btn-desfazer` continua desabilitado | Henrique |
| TC-SB-04 | Ciclo do clique esquerdo | `tests/grade.spec.js` | "0", depois "1", depois vazia | Henrique |
| TC-SB-05 | Ciclo do clique direito | `tests/grade.spec.js` | "1", depois "0", depois vazia | Henrique |
| TC-SB-06 | Contador de vazias | `tests/grade.spec.js` | `vazias` = 26, depois 25, depois 26 | Henrique |
| TC-SB-07 | Limpar | `tests/acoes.spec.js` | `1-1` e `1-2` vazias; as 9 fixas com o mesmo valor; `vazias` = 27 | Henrique |
| TC-SB-08 | Desfazer | `tests/acoes.spec.js` | Depois do 1º desfazer `1-1` = "0"; depois do 2º, vazia; `vazias` = 27 | Henrique |
| TC-SB-09 | Desfazer desabilitado sem jogadas | `tests/acoes.spec.js` | Ao abrir: `btn-desfazer` desabilitado. Depois do clique: habilitado. Depois de desfazer: desabilitado de novo | Henrique |
| TC-SB-10 | Desfazer o Limpar | `tests/acoes.spec.js` | `1-1` = "0" e `1-2` = "1" de volta; `vazias` = 25 | Henrique |
| TC-SB-11 | Dois iguais seguidos não é conflito | `tests/acoes.spec.js` | As duas mostram "0" e as duas têm `data-conflito` = `false` | Henrique |
| TC-SB-12 | Linhas iguais incompletas não são conflito | `tests/acoes.spec.js` | As 10 células preenchidas mostram o valor e têm `data-conflito` = `false` | Henrique |
| TC-SB-13 | Três iguais na linha | `tests/regras.spec.js` | As três com `data-conflito` = `true`; `1-4` (vazia) com `false` | Felipe |
| TC-SB-14 | Três iguais na coluna | `tests/regras.spec.js` | As três com `data-conflito` = `true` | Felipe |
| TC-SB-15 | Mais de três 0 na linha | `tests/regras.spec.js` | As quatro com `data-conflito` = `true` | Felipe |
| TC-SB-16 | Mais de três 1 na coluna | `tests/regras.spec.js` | As quatro com `data-conflito` = `true` | Felipe |
| TC-SB-17 | Duas linhas completas iguais | `tests/regras.spec.js` | As 12 células das linhas 1 e 2 com `data-conflito` = `true` | Felipe |
| TC-SB-18 | Duas colunas completas iguais | `tests/regras.spec.js` | As 12 células das colunas 1 e 2 com `data-conflito` = `true` | Felipe |
| TC-SB-19 | Conflito some ao corrigir | `tests/regras.spec.js` | Antes: as três em conflito. Depois: `1-1`, `1-2` e `1-3` com `data-conflito` = `false`; `1-3` = "1" | Felipe |
| TC-SB-20 | Vitória | `tests/fim-de-jogo.spec.js` | `mensagem` = "Resolvido!"; `vazias` = 0; nenhuma célula em conflito | Felipe |
| TC-SB-21 | Grade cheia com erro não vence | `tests/fim-de-jogo.spec.js` | `vazias` = 0; `mensagem` vazia; `1-1` com `data-conflito` = `true` (a linha 1 fica com quatro 1) | Felipe |
| TC-SB-22 | Grade bloqueada após a vitória | `tests/fim-de-jogo.spec.js` | `1-1` continua "0"; `vazias` continua 0; `mensagem` continua "Resolvido!" | Felipe |
| TC-SB-23 | Novo jogo | `tests/fim-de-jogo.spec.js` | `1-1` vazia; as 9 fixas iguais ao puzzle; `vazias` = 27; `btn-desfazer` desabilitado; `mensagem` vazia | Felipe |
| TC-SB-24 | Conflito também marca células fixas | `tests/regras.spec.js` | `4-1`, `4-2`, `4-3` e `4-4` com `data-conflito` = `true`, inclusive as fixas `4-1`, `4-3` e `4-4` | Felipe |
| TC-SB-25 | Três iguais em todas as combinações e nas bordas | `tests/regras.spec.js` | Em cada caso, as três células mostram o valor e têm `data-conflito` = `true`; nenhuma outra célula em conflito | Felipe |
| TC-SB-26 | Mais de três nas combinações que faltam | `tests/regras.spec.js` | Em cada caso, as quatro células mostram o valor e têm `data-conflito` = `true`; nenhuma outra célula em conflito | Felipe |
| TC-SB-27 | Exatamente três iguais sem trinca não é conflito | `tests/regras.spec.js` | Com três 0: as três mostram "0" e nenhuma célula está em conflito. Com o quarto 0: `1-1`, `1-3`, `1-5` e `1-6` com `data-conflito` = `true` e nenhuma outra | Felipe |
| TC-SB-28 | Conflito de linhas iguais some ao corrigir | `tests/regras.spec.js` | Antes: as 12 células das linhas 1 e 2 em conflito. Depois: `2-6` vazia e nenhuma célula em conflito | Felipe |
| TC-SB-29 | Novo jogo depois da vitória desbloqueia o jogo | `tests/fim-de-jogo.spec.js` | `mensagem` vazia; `1-1` = "0"; `vazias` = 26; `btn-desfazer` habilitado | Felipe |
| TC-SB-30 | Conflito some depois do Limpar | `tests/regras.spec.js` | Antes: as três em conflito. Depois: `1-1`, `1-2` e `1-3` vazias; nenhuma célula em conflito; `vazias` = 36 | Felipe |
| TC-SB-31 | Desfazer remove o conflito | `tests/lacunas-felipe.spec.js` | Antes: as três em conflito. Depois: `1-3` vazia, `1-1` e `1-2` com "0", `vazias` = 34 e nenhuma célula em conflito | Felipe |
| TC-SB-32 | Clique direito gera e desfaz conflito, e o Desfazer volta o clique direito | `tests/lacunas-felipe.spec.js` | Após os 3 cliques: as três em conflito. Após o 4º clique: `1-3` = "0" e nenhuma em conflito. Depois de desfazer: `1-3` volta a "1" e as três ficam em conflito | Felipe |
| TC-SB-33 | Novo jogo limpa os conflitos | `tests/lacunas-felipe.spec.js` | Antes: as três em conflito. Depois: as três vazias com `data-conflito` = `false`, `vazias` = 36 e nenhuma célula em conflito | Felipe |
| TC-SB-34 | Vitória preenchendo só com o clique direito | `tests/lacunas-felipe.spec.js` | As 36 células iguais à `SOLUCAO_PADRAO`; `mensagem` = "Resolvido!"; `vazias` = 0; nenhuma célula em conflito | Felipe |
| TC-SB-35 | Mais de três 0 na última linha e na última coluna | `tests/lacunas-felipe.spec.js` | Em cada caso, as quatro células mostram "0" e têm `data-conflito` = `true`; nenhuma outra célula em conflito | Felipe |
| TC-SB-36 | Mais de três com cinco 0 na linha | `tests/lacunas-felipe.spec.js` | As cinco com `data-conflito` = `true`, `1-3` vazia com `false`; nenhuma outra célula em conflito | Felipe |
| TC-SB-37 | Linhas e colunas completas iguais, mesmo longe uma da outra | `tests/lacunas-felipe.spec.js` | Em cada caso, as 12 células das duas linhas (ou colunas) mostram o valor e têm `data-conflito` = `true`; nenhuma outra célula em conflito | Felipe |

## Estrutura

```
index.html                    esqueleto da tela (elementos da seção 3)
js/main.js                    ponto de entrada do jogo (vazio)
tests/helpers.js              abrirJogo(), PUZZLE_PADRAO e atalhos
tests/*.spec.js               casos de teste
scripts/verificar-testes.mjs  verificador (npm run verificar e CI)
PLANEJAMENTO.md               regras, contrato, tarefas e casos de teste
docs/                         matriz de cobertura, TDD com IA e validação dos testes
```
