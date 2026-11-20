# Matriz regra → casos de teste — Sudoku binário

Cada regra da seção 1 do PLANEJAMENTO.md tem pelo menos um caso de teste que obriga o jogo a cumpri-la.

| # | Regra (seção 1) | TCs |
|---|---|---|
| 1 | Grade 6 × 6 = 36 células, com o puzzle (ou um do banco interno) | 01, 02 |
| 2 | Células fixas não mudam | 03, 07, 23 |
| 3 | Clique esquerdo: vazia → 0 → 1 → vazia; clique direito ao contrário | 04, 05 |
| 4 | Contador de vazias | 06, 07, 10, 20, 21 |
| 5 | Limpar apaga só o que o jogador preencheu | 07, 10 |
| 6 | Desfazer (vários passos, inclusive o Limpar; desabilitado sem jogadas) | 08, 09, 10 |
| 7 | Nunca três iguais seguidos (linha e coluna) | 13, 14, 19, 24 |
| 8 | Dois iguais seguidos é permitido | 11 |
| 9 | Três 0 e três 1 por linha e coluna (mais de três já é erro) | 15, 16, 21 |
| 10 | Linhas e colunas completas não podem ser iguais; incompletas não contam | 17, 18, 12 |
| 11 | Conflito some quando a regra deixa de ser quebrada | 19 |
| 12 | Conflito vale também para as células fixas | 24 |
| 13 | Vitória só com a grade cheia e sem conflito; grade bloqueada depois | 20, 21, 22 |
| 14 | Novo jogo volta o puzzle ao começo | 23 |

**Para que serve:** se alguém fosse implementar o jogo só a partir destes testes, toda regra do jogo teria um teste exigindo que ela exista.
