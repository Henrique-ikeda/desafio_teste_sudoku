# Validação dos testes do Felipe (TC-SB-13 a TC-SB-30)

Num repositório "somente testes", um teste que falha pelo motivo certo ainda pode estar **errado**: um resultado esperado incorreto também falha. Por isso os testes de `tests/regras.spec.js` e `tests/fim-de-jogo.spec.js` foram conferidos pelos dois lados, **sem colocar código do jogo no repositório**.

## Método

1. **Conjuntos de conflito calculados por script.** As três regras da seção 1 do PLANEJAMENTO.md viraram uma função pura (grade de 36 caracteres → células em conflito). Ela simulou os mesmos cliques de cada teste e calculou o conjunto exato de células em conflito no fim e nos pontos intermediários. Todos os conjuntos dos testes batem com o cálculo.
2. **Implementação de referência fora do repositório.** Numa cópia temporária do projeto (`%TEMP%\sb-validacao`, fora do clone, nunca commitada e apagada no fim), foi escrito um `js/main.js` mínimo que segue **só** as seções 1 e 3 do PLANEJAMENTO.md: parâmetro `puzzle`, `data-testid`, `data-fixa`, `data-conflito`, clique esquerdo e direito, vazias, Limpar, Desfazer, vitória com bloqueio e Novo jogo.
3. **Os specs do Felipe rodaram contra a referência:** os 22 testes (18 TCs; os `test.each` contam como um TC cada) **passaram**, em **3 rodadas seguidas** (22/22 nas três, sem teste intermitente).
4. **Mutação manual.** A referência ganhou 15 defeitos, ligados **um por vez**. Para cada mutante, os specs rodaram de novo; o mutante está "morto" se pelo menos um teste falha.
5. No próprio repositório, sem o jogo, cada teste continua **falhando pelo motivo certo** (`npm run verificar` sem problemas).

## Resultado: 15 de 15 mutantes mortos

| # | Mutante (defeito injetado na referência) | Testes que o mataram |
|---|---|---|
| 1 | Trinca só verificada nas linhas (não nas colunas) | 14, 25(b), 25(d) |
| 2 | Trinca só para 0 (não para 1) | 14, 25(a), 25(d) |
| 3 | Trinca ignora a borda (só olha as posições 1–4) | 25(c), 25(d) |
| 4 | Excesso só verificado com a linha/coluna completa | 15, 16, 26(a), 26(b), 27 |
| 5 | Excesso marca só a quarta célula, e não todas com aquele número | 15, 16, 21, 26(a), 26(b), 27 |
| 6 | Excesso com "≥ 3" em vez de "> 3" | 20, 21, 22, 23, 27, 28, 29 |
| 7 | Colunas iguais não verificadas | 18 |
| 8 | Conflito não é recalculado depois de corrigir ("conflito grudado") | 19, 20, 21, 22, 28, 29, 30 |
| 9 | Limpar não recalcula os conflitos | 30 |
| 10 | Células fixas nunca marcadas em conflito | 21, 24 |
| 11 | Vitória ignora conflitos (só exige a grade cheia) | 21 |
| 12 | Vitória não bloqueia o clique direito nem o Desfazer | 22 |
| 13 | Novo jogo não limpa a mensagem | 29 |
| 14 | Novo jogo não desbloqueia a grade | 29 |
| 15 | Novo jogo não zera o histórico do Desfazer | 23 |

**Por que os casos adicionais (TC-SB-25 a TC-SB-30) existem:** os mutantes 3, 9, 13 e 14 **só** são mortos por eles. Com apenas os TCs 13–24, o placar seria 11/15: uma implementação que ignora a trinca na borda, que não recalcula conflitos depois do Limpar ou cujo Novo jogo não desfaz a vitória passaria em todos os testes originais.

## Reforços que não mudam o resultado esperado

Os testes conferem mais do que a linha da seção 5, sempre com algo que decorre da seção 1:

- **Conjunto exato:** além das células listadas, cada teste compara a lista completa de células em conflito. Isso pega uma implementação que marca demais (por exemplo, a linha inteira) ou de menos.
- **TC-SB-21:** com `1-1` = 1, a linha 1 **e** a coluna 1 ficam com quatro 1 (`101011`). O conjunto exato tem 7 células: `1-1 1-3 1-5 1-6 3-1 5-1 6-1`.
- **TC-SB-22:** além do clique esquerdo, Limpar e Desfazer, confere o **clique direito**, e as 36 células continuam iguais à `SOLUCAO_PADRAO` depois de cada ação.
- **TC-SB-20:** preencher "1" passa por "0", e isso gera 13 estados intermediários com conflito no caminho. Por isso o teste só confere no fim.

## Achados e decisões pendentes da dupla

1. **Verificador não roda no Windows.** `scripts/verificar-testes.mjs` chama `node_modules/.bin/jest.cmd` com `spawnSync` sem shell, e o Node (≥ 18.20.2 / 20.12.2) responde `EINVAL`; o verificador sai com "O Jest não gerou resultado". **Corrigido no PR #1**, num commit `chore:` separado (2 linhas): o verificador roda `node_modules/jest/bin/jest.js` com `process.execPath`. Com isso, a CI roda o Windows sem `continue-on-error`.
2. **`npm ci` com npm 11 (Node 24):** falha com "Missing: fsevents@2.3.3 from lock file". Com npm 10 (Node 18, 20 e 22, os da CI) funciona. Regerar o `package-lock.json` resolve (arquivo da A1).
3. **Novo jogo sem o parâmetro `puzzle`:** a seção 1 diz que ele carrega um puzzle do banco, mas não diz se é o mesmo ou outro. Nenhum teste assume nada sobre isso.
4. **Desfazer depois do Novo jogo:** o TC-SB-23 exige `btn-desfazer` desabilitado, o que implica perder o histórico anterior. A seção 1 não diz isso com todas as letras ("nada para desfazer").
5. **Sugestões de casos novos dos revisores, fora da área do Felipe:** "Desfazer restaura o conflito" (regras de Desfazer + conflito) e "conflito em célula fixa por linhas completas iguais".
