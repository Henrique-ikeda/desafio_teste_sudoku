# TDD com agentes de IA — o que usamos e por quê

Este repositório pode ser desenvolvido com **Claude Code** ou **Codex**. Os dois seguem a mesma skill `tdd`. Este documento resume as técnicas usadas, o que cada uma resolve e onde ela está aplicada.

> ⚠️ **Modo somente testes.** A entrega são os casos de teste; o jogo não é implementado. Por isso só usamos as técnicas da fase RED do TDD (escrever o teste e vê-lo falhar).

## O problema

Agentes de IA sabem fazer TDD quando alguém pede, mas não fazem sozinhos. Sem regras, o agente tende a:

- escrever todos os testes de uma vez, testando um comportamento imaginado e sem rodar cada um;
- escrever testes com erro no próprio código, que "falham" sem testar nada;
- escrever testes que só conferem ausência ("nada mudou") e passariam com a tela vazia;
- usar *mock* ou ler estado interno em vez de testar o que o jogador vê.

## Técnicas aplicadas

| # | Técnica | Ideia | Onde está neste repositório |
|---|---|---|---|
| 1 | **Planejar antes do teste** | Combinar regras, interface (`data-testid`), cenários fixos e lista de casos antes de escrever qualquer teste | `PLANEJAMENTO.md` (seções 1, 3 e 5) |
| 2 | **Testar só pela interface** | Testes usam o que o jogador vê e clica; sem mock, sem estado interno. Valem para qualquer implementação | Skill, seção 3; contrato de `data-testid` no PLANEJAMENTO.md |
| 3 | **Cenário sem sorte** | O parâmetro de URL `puzzle` fixa a grade: `PUZZLE_PADRAO` (9 células fixas, solução única `SOLUCAO_PADRAO`, conferida por script) e `PUZZLE_VAZIO` (tudo vazio, para montar cada situação de regra com poucos cliques) | PLANEJAMENTO.md, seção 3; `tests/helpers.js` |
| 4 | **Lista de testes + "go"** (Kent Beck, *augmented coding*) | O agente mantém uma lista; "go" = pegar o próximo teste da lista e fazer só ele | Skill, seção 1 (a lista vem do `git log` e do verificador) |
| 5 | **Vermelho pelo motivo certo** | O teste precisa falhar porque o comportamento não existe, não por erro de digitação | Skill, passo 4; verificador |
| 6 | **Commit por caso de teste** | Cada TC tem seu commit `test:`, que prova no histórico que foi feito um por vez e por quem | Fluxo do Git (PLANEJAMENTO.md, seção 6) |
| 7 | **Separar quem escreve de quem revisa** (sub-agentes) | Com contextos separados, a revisão não "herda" as suposições de quem escreveu | `.claude/agents/escritor-de-testes.md` e `revisor-tdd.md` |
| 8 | **Hooks em vez de só instruções** | Instrução em Markdown é só conselho; um hook roda sempre | `scripts/hooks/rodar-testes.mjs`, ligado em `.claude/settings.json` e `.codex/hooks.json` |
| 9 | **Verificador do RED** | Sem o jogo, "falhar" não basta: o verificador classifica cada falha (asserção/elemento ausente = certo; `TypeError`, import quebrado = erro do teste), acusa teste que passa e título sem ID do plano | `scripts/verificar-testes.mjs` (CI, hook e `npm run verificar`) |
| 10 | **Matriz de cobertura** | Cada regra do jogo tem pelo menos um caso de teste que a obriga a existir | `docs/MATRIZ-COBERTURA.md` |
| 11 | **CI como portão final** | O merge só acontece com o verificador verde no GitHub Actions | `.github/workflows/testes.yml` |

## Como usar no dia a dia

1. `git checkout -b henrique/a2-tabuleiro` (ou a branch da sua tarefa).
2. Abrir o agente na pasta do repositório:
   - **Claude Code:** `/tdd A2`. O `CLAUDE.md` já carrega o `AGENTS.md`.
   - **Codex:** `$tdd A2`. O Codex lê o `AGENTS.md` sozinho. Na primeira vez, aprove o hook com `/hooks`.
3. Revisar o plano que o agente mostrar (lista de TCs e interface) e confirmar.
4. Dizer **"go"** a cada TC. Conferir a mensagem de cada falha.
5. No fim: revisão (`revisor-tdd` ou sessão nova), `npm run verificar`, e PR para o outro integrante revisar.

## Fontes

- AI Hero — [Test-Driven Development skill for Claude Code](https://www.aihero.dev/skill-test-driven-development-claude-code)
- Kent Beck — [Augmented Coding: Beyond the Vibes](https://tidyfirst.substack.com/p/augmented-coding-beyond-the-vibes)
- Alex Op — [Custom TDD workflow with Claude Code (sub-agentes)](https://alexop.dev/posts/custom-tdd-workflow-claude-code-vue/)
- nizos — [TDD Guard](https://github.com/nizos/tdd-guard)
- Anthropic — [Claude Code hooks](https://docs.claude.com/en/docs/claude-code/hooks)
- Testing Library — [Guiding principles](https://testing-library.com/docs/guiding-principles)
