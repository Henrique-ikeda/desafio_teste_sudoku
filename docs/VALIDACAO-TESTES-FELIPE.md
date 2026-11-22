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

1. **Verificador não roda no Windows.** `scripts/verificar-testes.mjs` chama `node_modules/.bin/jest.cmd` com `spawnSync` sem shell, e o Node (≥ 18.20.2 / 20.12.2) responde `EINVAL`; o verificador sai com "O Jest não gerou resultado". **Resolvido na `main` pelo Henrique** (`chore: verificador chama o jest pelo node`): o verificador roda `node_modules/jest/bin/jest.js` com `process.execPath`. Com isso, a CI roda o Windows sem `continue-on-error`.
2. **`npm ci` com npm 11 (Node 24):** falhava com "Missing: fsevents@2.3.3 from lock file". **Resolvido na `main` pelo Henrique** (`chore: sincroniza package-lock.json`).
3. **Novo jogo sem o parâmetro `puzzle`:** a seção 1 diz que ele carrega um puzzle do banco, mas não diz se é o mesmo ou outro. Nenhum teste assume nada sobre isso.
4. **Desfazer depois do Novo jogo:** o TC-SB-23 exige `btn-desfazer` desabilitado, o que implica perder o histórico anterior. A seção 1 não diz isso com todas as letras ("nada para desfazer").
5. **Sugestões de casos novos dos revisores, fora da área do Felipe:** "Desfazer restaura o conflito" (regras de Desfazer + conflito) e "conflito em célula fixa por linhas completas iguais".

## Lacunas fechadas (F6): TC-SB-31 a TC-SB-48

Depois dos TCs 13 a 30, a suíte foi atacada com mais defeitos (**37 mutantes**: os 15 da validação acima, 9 achados numa auditoria posterior e 13 vindos da leitura do código dos testes). Os que **sobreviviam** viraram casos novos, escritos no estilo dos anteriores, com o esperado derivado da seção 1 e o conjunto exato de células em conflito. Os casos ficam em `tests/lacunas-felipe.spec.js`.

### Método

1. A referência (fora do repositório, nunca commitada) foi estendida com os mutantes e com **variantes das decisões que a spec deixa em aberto**: render síncrono × `queueMicrotask` × `setTimeout`, Limpar vazio contando ou não como jogada, Desfazer desabilitado ou não na vitória, e banco de puzzles aleatório no Novo jogo.
2. A suíte de antes (TCs 01 a 30) rodou contra cada mutante: **18 de 37 mortos; 19 sobreviviam**.
3. Para cada sobrevivente, um TC novo: primeiro o `docs:` (seção 5, README e matriz), depois o `test:`. Cada TC falha pelo motivo certo sem o jogo e passa na referência.
4. A suíte inteira (antiga + nova) rodou de novo contra todos os mutantes: **37 de 37 mortos**. O executor ignora falhas por *timeout* (não contam como morte).

### Resultado: 18/37 antes, 37/37 depois

Mutantes que **sobreviviam** à suíte anterior e o TC novo que os mata:

| Mutante | Defeito | Antes (TCs 01–30) | Mortos por (TCs novos) |
|---|---|---|---|
| excesso-offbyone | excesso não marcado na última linha/coluna | **sobrevivia** | 35, 43 |
| excesso-igual4 | excesso só com exatamente 4 iguais (5 não) | **sobrevivia** | 36 |
| iguais-so-vizinhas | repetição só entre linhas/colunas vizinhas | **sobrevivia** | 37, 43 |
| iguais-sem-fixas | repetição não marca as células fixas | **sobrevivia** | 38 |
| desfazer-sem-recalc | Desfazer não recalcula os conflitos | **sobrevivia** | 31, 32 |
| direito-sem-recalc | clique direito não recalcula os conflitos | **sobrevivia** | 32, 34 |
| direito-sem-hist | clique direito não entra no histórico do Desfazer | **sobrevivia** | 32 |
| novo-sem-recalc | Novo jogo não limpa os conflitos | **sobrevivia** | 33 |
| vitoria-so-esq | vitória só dispara por clique esquerdo | **sobrevivia** | 34 |
| fixa-zero-muda | fixa de valor 0 muda com o clique | **sobrevivia** | 39 |
| trinca-so-bordas | trinca só detectada nas pontas da linha/coluna | **sobrevivia** | 40, 43, 46 |
| trinca-marca-linha | trinca marca também as outras células preenchidas da linha | **sobrevivia** | 41, 42, 43 |
| conflito-parcial-trava | some a trinca e o excesso que continua é desmarcado junto | **sobrevivia** | 42, 43 |
| vence-sem-trinca-repeticao | vitória só olha o excesso (ignora trinca e repetição) | **sobrevivia** | 43 |
| vitoria-so-ultimo-0 | vitória só quando a última jogada é um 0 | **sobrevivia** | 44 |
| bloqueio-so-algumas | depois da vitória só a linha 1 fica bloqueada | **sobrevivia** | 45 |
| fixa-coluna-sem-conflito | fixa em conflito por coluna não é marcada | **sobrevivia** | 46 |
| conflitos-unidos | corrigir um conflito desmarca o outro independente | **sobrevivia** | 41, 42, 43, 47 |
| repeticao-so-prefixo | linhas que só diferem na última célula tratadas como iguais | **sobrevivia** | 48 |

Mutantes que a suíte anterior **já matava** (nenhum TC novo foi escrito só para eles):

| Mutante | Defeito | Antes (TCs 01–30) | Também mortos por (TCs novos) |
|---|---|---|---|
| trinca-so-linhas | trinca só verificada nas linhas | morto (14, 25) | 40, 46, 47 |
| trinca-so-zero | trinca só para 0 | morto (14, 25) | 32, 40, 43, 47 |
| trinca-ignora-borda | trinca ignora a borda (posições 5 e 6) | morto (25) | 40, 47 |
| excesso-so-completa | excesso só com a linha completa | morto (15, 16, 26, 27) | 35, 36 |
| excesso-so-quarta | excesso marca só a quarta célula | morto (15, 16, 26, 27, 21) | 35, 36, 42, 48 |
| excesso-maior-igual-3 | excesso com "≥ 3" | morto (27, 28, 20, 21, 22, 23, 29, 12, 01, 02) | 34, 43, 44, 45, 46, 48 |
| colunas-iguais-nao | colunas iguais não verificadas | morto (18) | 37, 43 |
| conflito-grudado | conflito não some depois de corrigir | morto (19, 30, 28, 20, 21, 22, 29, 12) | 31, 32, 34, 41, 42, 43, 44, 45, 47, 48 |
| limpar-nao-recalcula | Limpar não recalcula os conflitos | morto (30) | — |
| fixas-nunca-conflito | fixas nunca marcadas em conflito | morto (24, 21) | 38, 46 |
| vitoria-ignora-conflito | vitória só exige a grade cheia | morto (21) | 34, 43, 44 |
| vitoria-nao-bloqueia-direito-desfazer | vitória não bloqueia clique direito nem Desfazer | morto (22) | 45 |
| novo-jogo-nao-limpa-mensagem | Novo jogo não limpa a mensagem | morto (29) | — |
| novo-jogo-nao-desbloqueia | Novo jogo não desbloqueia a grade | morto (29) | — |
| novo-jogo-nao-zera-historico | Novo jogo não zera o histórico do Desfazer | morto (23) | — |
| excesso-ignora-outro-valor | excesso ignorado se houver o outro valor na linha | morto (21) | 34, 42, 43, 48 |
| excesso-nao-some | conflito de excesso não some ao corrigir | morto (20, 21, 22, 29, 28, 12) | 34, 41, 42, 43, 44, 45, 48 |
| desfazer-sempre-ultima | Desfazer perde o histórico ao trocar de célula | morto (10) | — |

### Referência e variantes

- A suíte inteira (58 testes) passou na referência em 3 rodadas seguidas (58/58, 58/58, 58/58). O teste mais lento leva cerca de 2580 ms (TC-SB-43 grade cheia com trinca ou com l); por isso o arquivo novo usa `jest.setTimeout(30000)`.
- **Todas as variantes** passam 58/58, **exceto** `async-timeout` (render adiado com `setTimeout`), que derruba **três testes do Henrique** (TC-SB-01, 02 e 09), porque leem a tela logo depois de `abrirJogo`, sem nenhuma interação para esperar. Os testes novos não dependem disso. Isso é só um achado: a spec não diz que o render precisa ser síncrono.

### Achado durante a validação

- **TC-SB-45** nasceu cego: clicava esquerdo e depois direito na mesma célula e só conferia a grade no fim, e os dois cliques se cancelam (`1` → vazia → `1`). O mutante `bloqueio-so-algumas` sobreviveu justamente a ele. Agora a grade é conferida depois de **cada** clique, e o mutante morre.
- O revisor independente (Haiku 5.5) apontou que TC-SB-37, 42 e 48 prometiam "mostram o valor" na seção 5 sem conferir os valores. Corrigido, com um commit por TC.

### Casos que não foram escritos

Três candidatos já eram mortos pela suíte anterior e não ganharam TC: excesso ignorado quando há o outro valor na linha (morto pelo TC-SB-21), conflito de excesso que não some (morto por vários) e Desfazer entre células diferentes (morto pelo TC-SB-10).

### Sugestões (não alteradas)

- **TC-SB-07:** a conferência "Desfazer habilitado" depois do Limpar passa mesmo se o Limpar não contar como jogada (as duas jogadas anteriores já habilitam o botão; `tests/acoes.spec.js:33-34` e `:63`). Quem pega isso é o TC-SB-10.
- **TC-SB-27:** o estado final (quatro 0 em `1-1`, `1-3`, `1-5` e `1-6`) repete o do TC-SB-15; o que o TC-27 acrescenta é a fronteira de três.
- **TC-SB-02:** repete 5 vezes um banco que pode ter um puzzle só (`tests/grade.spec.js:80-82`).
- **TC-SB-24:** mistura trinca e excesso (a linha 4 fica `0000..`); se falhar, não diz qual das duas regras quebrou.
- **`SOLUCAO_PADRAO` é simétrica** (a linha *i* é igual à coluna *i*, conferido por script), então o TC-SB-20 não distingue linhas de colunas trocadas.
- **Ambiguidades da spec em aberto:** Novo jogo sem `puzzle` (o mesmo ou outro do banco?); Desfazer depois do Novo jogo; Limpar sem nada preenchido conta como jogada?; clique em fixa conta como jogada?; botões desabilitados ou só inertes na vitória?; trinca e excesso ao mesmo tempo (união?); excesso ou trinca com mais de quatro iguais marca todas?
