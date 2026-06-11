# Estrutura do doc de design

Este é o contrato do `<slug>.md`. A meta é um doc que se lê de cima pra baixo: o
leitor entende **o que é e por quê** nos primeiros segundos, vê o desenho, e só
então desce para o detalhe. Não enterre o essencial.

Escreva no idioma do usuário (os exemplos abaixo são pt-BR). Tom **neutro e
técnico** — sem marketing, sem perguntas retóricas, sem hype. Instruções em
infinitivo ("clicar", "abrir"), não em segunda pessoa dramatizada.

## Cabeçalho

```markdown
# <Nome do sistema>

> Uma frase dizendo o que o sistema faz e o problema que resolve.

| | |
|---|---|
| **Contexto** | onde vive / a que pertence |
| **Tipo** | (ex.: serviço, biblioteca, runtime + editor, CLI) |
| **Depende de** | dependências principais |
| **Estado** | (ex.: proposto, em uso, descontinuado) |
```

A tabela de duas colunas sem cabeçalho é proposital — o CSS esconde a linha de
header vazia e a deixa compacta no topo. Use 3–6 linhas de metadados que façam
sentido pro sistema.

## As nove seções

Use exatamente estes títulos numerados (`## 1. …`). Cada um existe por um motivo;
mantenha o motivo em mente em vez de preencher por preencher.

### 1. Contexto e objetivo
O problema concreto, em prosa. Por que esse sistema existe, o que dói sem ele.
2–4 parágrafos curtos. Se houver suposições load-bearing (escala, plataforma,
restrições não confirmadas pelo usuário), declare-as aqui explicitamente em vez
de travar — um bom doc assume e diz o que assumiu.

### 2. Escopo
Duas listas claras: **Faz** e **Não faz**. O "não faz" vale tanto quanto o "faz"
— delimita o sistema e evita escopo inflado. 3–6 itens cada.

### 3. Arquitetura
A visão geral. Comece por 1–2 parágrafos de prosa explicando as camadas/peças e
como conversam. **Embuta aqui exatamente um diagrama de classes** como bloco
` ```mermaid ` (ver `mermaid-style.md`). Depois do diagrama, uma tabela
`Componente | Papel` resumindo cada classe/peça em uma linha.

### 4. Referência de classes
O detalhe por classe. Para cada classe relevante: uma linha do que ela é, os
campos (tabela `Campo | Descrição` quando ajudar) e os métodos numa tabela
`Membro | Descrição`. **É aqui que mora a descrição de cada função** — não dentro
das caixas do diagrama. Mantenha cada descrição curta (uma linha, o que faz).

### 5. Fluxos principais
Os 2–4 caminhos que importam (ex.: "requisição autenticada", "inicialização",
"erro e retry"), cada um como sequência numerada curta em texto. Mostra o sistema
em movimento sem precisar de diagrama de sequência.

### 6. Decisões e trade-offs
As escolhas de design que não são óbvias, cada uma com o **porquê** e o **custo**.
Formato: `**Decisão X** em vez de Y: motivo. Custo: o que se perde.` Honestidade
sobre trade-offs é o que diferencia um doc de design de um folheto.

### 7. Integração / dependências
Como o sistema se conecta ao resto: pacotes/módulos, contratos de API, formato de
config, como é instalado/registrado/descoberto. Concreto — nomes reais de
arquivo, namespace, comando.

### 8. Como usar — exemplo num projeto real
Um cenário concreto de uso end-to-end. Defina um projeto de exemplo coerente
(nomes reais de entidades) e mostre as operações do dia a dia como instruções
neutras. Inclua **código real** de uso quando houver superfície de runtime/API.
Feche com "Limites no uso" (as pegadinhas práticas). Sem cenários inventados de
terceiros nem frases catchy — só o passo a passo de quem opera o sistema.

### 9. O que revisitar conforme cresce
3–5 itens do que reavaliar quando o sistema escalar: o que foi simplificado de
propósito, o que vira gargalo, a extensão natural seguinte. Mostra que o design
conhece os próprios limites.

## Princípios de escrita (do skill de documentation)

1. **Escreva para o leitor** — quem lê e o que precisa.
2. **Comece pelo mais útil** — não enterre a notícia.
3. **Mostre, não conte** — tabela, comando, código, em vez de adjetivo.
4. **Link, não duplique** — referencie outra seção em vez de repetir.

O diagrama é embutido uma vez (seção 3); o script de render extrai o `.mmd` e
gera o `.pdf` a partir deste `.md`. Uma fonte, dois derivados.
