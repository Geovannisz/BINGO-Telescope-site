---
name: Observatório Cósmico
version: 2.0
theme: Premium Glassmorphism
---

# 🌌 Sistema de Design do Telescópio BINGO

> [!NOTE]
> **Visão:** Um tributo de alta fidelidade ao mistério e à precisão da radioastronomia. O design evoca a sensação de uma sala de controle de um observatório de última geração, misturando a vasta e silenciosa imensidão do universo com a telemetria nítida e brilhante dos modernos instrumentos científicos.

A estética central baseia-se fortemente no **Glassmorphism Premium** em camadas sobre uma base **Cósmica Minimalista**. Superfícies de alta transparência com desfoques de fundo intensos (`blur(18px)`) criam uma sensação de dados atmosféricos profundos. 

---

## 🎨 1. Cores & Paleta

A paleta está ancorada em um modo **Apenas Escuro** (Dark-Only) para refletir a missão de espaço profundo do telescópio.

| Função | Cor | Código Hex | Uso |
| :--- | :--- | :--- | :--- |
| **Primária** | ![#22d3ee](https://placehold.co/15x15/22d3ee/22d3ee.png) Electric Cyan | `#22d3ee` | Elementos interativos, estados ativos e valores estatísticos focais. O "sinal". |
| **Secundária** | ![#3b82f6](https://placehold.co/15x15/3b82f6/3b82f6.png) Cosmic Blue | `#3b82f6` | Profundidade, transições e combinações de gradientes com Ciano. |
| **Neutra** | ![#050a18](https://placehold.co/15x15/050a18/050a18.png) Cosmic Void | `#050a18` | O fundo escuro do espaço base. |
| **Superfície** | ![#0f172a](https://placehold.co/15x15/0f172a/0f172a.png) Slate Glow | `#0f172a` | Usado como base para gradientes glassmórficos. |
| **Texto** | ![#ffffff](https://placehold.co/15x15/ffffff/ffffff.png) Starlight | `#ffffff` | Títulos primários e textos de alto contraste. |
| **Texto Suave** | ![#94a3b8](https://placehold.co/15x15/94a3b8/94a3b8.png) Cosmic Dust | `#94a3b8` | Parágrafos, legendas e informações secundárias. |

> [!TIP]
> **Superfícies** utilizam gradientes lineares complexos e em camadas com translucidez, em vez de cores sólidas.  
> *Exemplo:* `linear-gradient(180deg, rgba(15, 23, 42, 0.72) 0%, rgba(7, 13, 31, 0.86) 100%)`

### 🌈 1.1 Gradientes de Texto (Destaques)

Para ressaltar termos críticos e estatísticas sem ofuscar a interface escura, utilizamos gradientes textuais específicos:

*   **`.gradient-text` (Ex: Texto "Universo Escuro" / "Dark Universe" no Hero):**
    *   `linear-gradient(135deg, #22d3ee 0%, #818cf8 50%, #fbbf24 100%)`
    *   Cria um forte contraste e transmite a ideia de mistério e energia, com uma transição suave que começa no Ciano Elétrico (![#22d3ee](https://placehold.co/15x15/22d3ee/22d3ee.png) `#22d3ee`), passa pelo Azul Índigo (![#818cf8](https://placehold.co/15x15/818cf8/818cf8.png) `#818cf8`) e finaliza com toques de Amarelo/Dourado (![#fbbf24](https://placehold.co/15x15/fbbf24/fbbf24.png) `#fbbf24`).
*   **`.gradient-text-cyan` (Ex: Números de estatísticas rápidos):**
    *   `linear-gradient(135deg, #22d3ee 0%, #06b6d4 50%, #6366f1 100%)`
    *   Uma variação mais tecnológica para transmitir precisão científica ("telemetria"). Transição entre tons de Ciano (![#22d3ee](https://placehold.co/15x15/22d3ee/22d3ee.png) `#22d3ee`, ![#06b6d4](https://placehold.co/15x15/06b6d4/06b6d4.png) `#06b6d4`) e Azul Violeta (![#6366f1](https://placehold.co/15x15/6366f1/6366f1.png) `#6366f1`).

---

## 🔤 2. Tipografia

A tipografia é uma mistura de fontes sem serifa geométricas de alto impacto e fontes de trabalho (workhorses) altamente legíveis.

| Família de Fontes | Uso | Pesos | Características |
| :--- | :--- | :--- | :--- |
| **[Outfit](https://fonts.google.com/specimen/Outfit)** | Títulos e Estatísticas | `700`, `800`, `900` | Autoritária, geométrica, espaçamento (tracking) apertado. |
| **[Inter](https://fonts.google.com/specimen/Inter)** | Corpo e Prosa | `400`, `500`, `600` | Altamente legível, limpa, fonte moderna de trabalho. |

### Regras Tipográficas Avançadas
- **Telemetria/Números:** Os números estatísticos usam a fonte **Outfit**, mas dependem crucialmente de `font-variant-numeric: tabular-nums` para manter o alinhamento vertical preciso nos painéis.
- **Rótulos de Destaque (Eyebrow Labels):** Pequenos rótulos em maiúsculas usam a fonte **Outfit** com um espaçamento de letras muito amplo (`letter-spacing: 0.16em` ou mais) para distinguir os metadados do conteúdo padrão.

---

## 🏔️ 3. Elevação e Profundidade

A hierarquia é estabelecida através de **camadas translúcidas** e **bordas brilhantes**, em vez de tradicionais sombras opacas (drop-shadows).

* **Nível 0 (Fundo/Canvas):** Fundos do espaço profundo (`#050a18`), frequentemente usando efeitos imersivos como a classe `.starfield` (simulação em CSS de partículas/estrelas brilhantes) ou gradientes radiais em imagens de fundo para dar foco sem poluir.
* **Nível 1 (Superfícies):** Cartões (Cards) glassmórficos com `backdrop-filter: blur(18px)` e uma borda sutil ultrafina de `1px` com a cor `rgba(148, 163, 184, 0.12)`.
* **Nível 2 (Interação):** Ao passar o mouse (hover), os elementos aumentam levemente (`transform: translateY(-8px)`), as cores das bordas mudam para ciano `rgba(34, 211, 238, 0.28)` e ganham um suave brilho externo colorido (`box-shadow: 0 0 42px -12px rgba(34, 211, 238, 0.35)`).

---

## 🧩 4. Componentes Principais Personalizados

Nosso arquivo `src/styles/global.css` define diversas classes utilitárias altamente polidas que formam a espinha dorsal da interface do usuário (UI).

### 🔘 Botões Cósmicos (Buttons)
`.btn-cosmic` | `.btn-cosmic-outline`
Botões projetados para parecerem interfaces de comando futuristas. O `.btn-cosmic` traz um gradiente chamativo no fundo para ações primárias, enquanto o `.btn-cosmic-outline` usa fundo semitransparente com borda reforçada. No estado *hover*, ativam um brilho extra (`::after` sweep).

### 🎛️ Painel de Instrumentos (Instrument Panel)
`.instrument-panel` | `.stat-cell` | `.stat-value`
Um grande contêiner unificado de dashboard glassmórfico. Ele agrupa métricas em células distintas com sobreposição de bordas muito finas (hairline). Os valores usam um preenchimento de texto gradiente vibrante de Ciano para Azul.

### 🛰️ Cartões de Missão (Mission Cards)
`.mission-card` | `.mission-media`
Usados para seções de projetos (BAO, FRBs) e itens de Notícias. Estes cartões possuem um gradiente cônico oculto que gira lentamente (`@keyframes spin-slow`), destacando sutilmente as bordas no hover. As imagens aumentam suavemente de escala enquanto o próprio cartão se eleva.

### 📡 Faixa de Métricas do Hero (Hero Metrics Strip)
`.metric` | `.hairline-sweep`
Uma exibição de telemetria condensada usada na seção principal (Hero). Possui uma linha de varredura animada (`.hairline-sweep::after`) que simula os processos de aquisição de dados, movendo-se para frente e para trás abaixo dos pontos de dados.

### 🏷️ Emblemas de Destaque (Eyebrow Badges)
`.eyebrow`
Um rótulo em forma de pílula, delicado e brilhante, para categorizar seções (ex: "O Projeto em Números"). Ele usa um fundo intensamente desfocado, sombras internas e tipografia espaçada em letras maiúsculas.

