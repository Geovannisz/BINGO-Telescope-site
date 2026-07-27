# 🔭 BINGO Telescope Website

![Astro](https://img.shields.io/badge/Astro-FF5D01?style=for-the-badge&logo=astro&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)

Bem-vindo ao repositório oficial do site do **Projeto BINGO** (*Baryon Acoustic Oscillations from Integrated Neutral Gas Observations*). O BINGO é um radiotelescópio projetado para fazer medições pioneiras de oscilações acústicas de bárions, localizado no estado da Paraíba, Brasil.

Este portal foi construído para servir como interface pública, catálogo científico e painel de divulgação do projeto e de suas ramificações (Uirapuru e ABDUS), usando **Astro** e **Tailwind CSS**.

---

## ✨ Principais Funcionalidades

- ⚡ **SSG (Static Site Generation) Ultra-Rápido:** Páginas pré-renderizadas no servidor via Astro para performance máxima e SEO impecável.
- 🎨 **Design System "Dark & Sci-Tech":** Interface imersiva utilizando *Glassmorphism*, efeitos radiais, paletas contrastantes e modo noturno fixo para melhor visualização científica.
- 🗺️ **Mapeamento Interativo:** Integração georreferenciada segura e isolada via Leaflet.js para explorar a localização do radiotelescópio em Aguiar-PB.
- 👥 **Gestão Inteligente de Equipe:** Sistema de *Content Collections* embutido com tradução dinâmica que se ajusta automaticamente ao **gênero** do membro (ex: converte de forma fluida "Pesquisador" para "Pesquisadora" na interface em português, mantendo o controle de idioma limpo no background).
- 📰 **Painel Administrativo Embutido (CMS):** Integração com **Decap CMS** para atualização facilitada e sem código de Notícias, Membros da Equipe e Publicações.

---

## 🚀 Tecnologias e Arquitetura

- **Framework Core:** [Astro](https://astro.build/)
- **Estilização e UI:** Tailwind CSS
- **Tipografia:** `Outfit` para títulos expressivos e `Inter` para o corpo de texto.
- **Validação de Dados:** Zod Schema - Todas as informações vindas do CMS (`src/content.config.ts`) são fortemente tipadas, impedindo builds falhas causadas por erros humanos de cadastro.
- **Motor Auxiliar do CMS:** Um script customizado (`admin-engine.js`) assegura que caminhos de imagens em rascunhos e pré-visualizações funcionem de forma idêntica à produção.

---

## 🌐 Sistema de Internacionalização (i18n)

A plataforma suporta múltiplos idiomas (Português, Inglês, Chinês) através de um **modelo híbrido de tradução** robusto, planejado especialmente para a ciência:

1. **Tradução Nativa e Direta (Hardcoded):**
   Para as páginas de base (Início, Sobre, Ciência, Instrumentação, etc.), o sistema intercepta elementos através da tag `data-t` e processa de imediato os domínios traduzidos via scripts nativos (`src/utils/nativeTranslator.ts`). Isso garante uma tradução perfeita sem o temido e incômodo *Flash of Unstyled Content* (piscar da página).

2. **Google Translate Orientado a Inteligência:**
   Para as páginas com conteúdo massivo criado via CMS (coleção de Notícias, Publicações ou textos dinâmicos de Membros), o site utiliza o motor do Google Translate de forma mascarada, porém com **Filtros e Proteções Léxicas**.
   - Termos acadêmicos cruciais e acrônimos (como *BINGO, Baryon Acoustic Oscillations, FRB, Stage I-V*, nomes próprios, entre outros) recebem a classe protetora `.notranslate` combinada com o uso de `\u00A0` (non-breaking spaces) **antes** de o widget ser carregado. 
   - Isso impede totalmente que a rede neural do Google "bagunce" ou "picote" frases inteiras em pedaços desconexos caso tente ler um jargão científico solto no meio da sentença.

---

## 📁 Estrutura do Projeto

```text
/
├── .github/workflows/      # Pipeline de CI/CD para deploy no GitHub Pages (deploy.yml)
├── public/                 # Assets estáticos, fontes, favicon e painel headless CMS (/admin)
├── scripts/                # Automações pré-build (ex: sync-publications.js)
├── src/
│   ├── components/         # Blocos visuais reutilizáveis (Header, Cards 3D, Interações)
│   ├── content/            # Dados geridos via CMS em Markdown puro (news, team, publications)
│   ├── layouts/            # Templates mestre para estrutura da página e Metadata de SEO
│   ├── pages/              # Rotas e páginas finais da aplicação
│   ├── styles/             # Arquivos base de estilização CSS global e utilities do Tailwind
│   └── utils/              # Lógica de negócio isolada, dictionaries i18n e utilitários
├── astro.config.mjs        # Configuração nativa de plugins do Astro (Vite)
├── src/content.config.ts   # Configuração e esquemas do Zod para Integridade das coleções de dados
└── package.json            # Scripts de CLI e listagem das dependências npm
```

---

## ⚙️ CI/CD e Pipeline de Deploy Automático

O repositório está integrado de forma transparente ao **GitHub Actions** (`deploy.yml`). Ao efetuar qualquer `push` na branch `main` (ou ao aprovar atualizações via interface administrativa do CMS), a esteira de build realiza os seguintes passos:

1. **Estruturação de Dados Automática:**
   Executa o `scripts/sync-publications.js` para organizar vínculos de publicações com autores.
2. **Geração Estática e Compilação:**
   Transpila todos os arquivos Astro e React/Preact em puro e leve HTML/CSS/JS no diretório de saída (`dist/`).
3. **Cache Duplo (High-Speed Build):**
   - **Camada Node:** Utiliza hash do `package-lock.json`. Se nenhuma biblioteca for atualizada, ignora a re-instalação de dependências pesadas, poupando ~30s da esteira.
   - **Camada Astro:** Aproveita hashes locais para evitar o reprocessamento intensivo (geração de imagens webp otimizadas, conversões de Markdown, etc.) de conteúdos que não mudaram desde a última build de sucesso.
4. **Resiliência (Fallback Local de Runner):**
   Em um eventual esgotamento dos recursos da nuvem do GitHub, os mantenedores podem acionar a esteira remotamente em modo **`use_local: true`**, roteando perfeitamente o build inteiro para as máquinas *self-hosted* através de scripts locais (`Iniciar-Runner.bat`).

---

## 🛠️ Configuração e Desenvolvimento Local

Para clonar e testar melhorias no projeto localmente na sua máquina:

1. Clone e entre no projeto, logo após instale os pacotes:
   ```bash
   npm install
   ```

2. Inicie o servidor turbo de desenvolvimento:
   ```bash
   npm run dev
   ```
   > Por padrão, sua aplicação local subirá em `http://localhost:4321/`.

3. **Para desenvolvedores:** 
   Se deseja abrir o **Decap CMS** em localhost para editar coleções, inicie também, em outra aba do terminal, o proxy de autenticação `npx netlify-cms-proxy-server`. Dessa forma, as alterações no painel irão editar diretamente os arquivos da sua pasta `src/content/` no PC.

---

## 🏗️ Gerando Versão de Produção

Gere manualmente os artefatos estáticos na pasta `dist/` para deploy manual ou verificação usando:

```bash
npm run build
```

Após compilado, o site não exige instâncias Node.js rodando. Ele se torna completamente estático, pronto para ser servido via GitHub Pages, Vercel, Cloudflare Pages ou qualquer provedor HTML cru.