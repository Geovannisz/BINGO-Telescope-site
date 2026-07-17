# 🔭 BINGO Telescope Website

Bem-vindo ao repositório oficial do site do **Projeto BINGO** (*Baryon Acoustic Oscillations from Integrated Neutral Gas Observations*). O BINGO é um radiotelescópio projetado para fazer medições pioneiras de oscilações acústicas de bárions, localizado no estado da Paraíba, Brasil.

Este portal foi construído para servir como interface pública, catálogo científico e painel de divulgação do projeto e de suas ramificações (Uirapuru e ABDUS), usando **Astro** e **Tailwind CSS**.

---

## 🚀 Tecnologias e Arquitetura

O site foi focado em alta performance (Geração de Site Estático - SSG), SEO e numa identidade visual moderna focada no conceito "Dark & Sci-Tech".

- **Framework:** [Astro](https://astro.build/) - Garante uma entrega rápida sem JavaScript desnecessário no cliente.
- **Estilização:** Tailwind CSS - Usado extensivamente para *Glassmorphism*, efeitos de brilho radial e modo noturno.
- **Tipografia:** `Outfit` para títulos expressivos e `Inter` para o corpo de texto.
- **Mapas:** [Leaflet.js](https://leafletjs.com/) - Usado para exibir a localização georreferenciada do site em Aguiar (com injeção segura e isolada).
- **Conteúdo e CMS:** O repositório utiliza **Decap CMS** (`public/admin/`) para gerenciar dados estruturados (Notícias, Equipes, Publicações) via arquivos Markdown em `src/content/`. O painel conta com um motor auxiliar customizado (`admin-engine.js`) para correção dinâmica de caminhos e pré-visualização de imagens, além de validação flexível de esquemas (`Zod schema`).

---

## 🌐 Sistema de Internacionalização (i18n)

A plataforma suporta múltiplos idiomas (Português, Inglês, Chinês) através de um **modelo híbrido de tradução** robusto:

1. **Tradução Nativa (Hardcoded):**
   Para páginas estáticas de alta relevância (Início, Sobre, Ciência, Localização, etc.), o sistema intercepta elementos com a tag `data-t` e injeta domínios semânticos traduzidos via scripts nativos (`src/utils/nativeTranslator.ts`). Isso garante tradução impecável sem o temido efeito de layout quebrado (*Flash of Unstyled Content*).

2. **Google Translate Customizado:**
   Para páginas originadas no CMS (como as coleções de Notícias ou Membros da Equipe), o site faz *fallback* para o Google Translate (`src/utils/translator.ts`), mas com proteções léxicas:
   - Termos acadêmicos cruciais (como *BINGO, Baryon Acoustic Oscillations, FRB*, entre outros) recebem espaçamentos seriais não quebráveis (`\u00A0`) e a classe `.notranslate` antes de o widget carregar. Isso **engana a rede neural do Google**, evitando desordenação semântica do texto.

---

## 📁 Estrutura do Projeto

```text
/
├── .github/workflows/      # Pipeline de CI/CD para deploy no GitHub Pages (deploy.yml)
├── public/                 # Assets estáticos, fontes, imagens de UI e painel CMS (/admin)
├── scripts/                # Automações pré-build (ex: sync-publications.js)
├── src/
│   ├── components/         # Blocos visuais modulares (Header, Footer, Cards 3D)
│   ├── content/            # Estrutura de dados gerenciados via CMS (news, team, publications)
│   ├── layouts/            # Templates mestre para as rotas e injetores de SEO
│   ├── pages/              # Rotas compiladas para as páginas principais e subprojetos
│   ├── styles/             # Estilos globais (.css) onde estão os tokens do design
│   └── utils/              # Bibliotecas locais de i18n e utilitários auxiliares
├── astro.config.mjs        # Configuração principal do Astro (Vite e integrações)
└── package.json            # Scripts de compilação, sincronização e dependências
```

---

## ⚙️ CI/CD e Pipeline de Deploy Automático

O site utiliza **GitHub Actions** (`.github/workflows/deploy.yml`) para compilação estática (`npm run build`) e publicação automática no **GitHub Pages**:

1. **Geração Estática e Sincronização:**
   A cada commit na branch `main` (ou publicação feita pela equipe através do Decap CMS), a pipeline executa o script `scripts/sync-publications.js` para atualizar e estruturar as publicações dos membros da equipe antes de gerar o *bundle* final no diretório `dist/`.

2. **Arquitetura de Cache Duplo de Alta Velocidade:**
   O workflow conta com cache inteligente dividido em duas camadas para compilações em tempo recorde:
   - **Cache de Dependências (`node_modules`):** Atrelado ao hash do `package-lock.json`. Se as dependências não sofreram alteração, o comando `npm ci` é pulado automaticamente, economizando de 20 a 35 segundos.
   - **Cache do Motor Astro (`.astro` + `node_modules/.cache`):** Armazena os artefatos compilação e metadados das coleções entre execuções usando chaves dinâmicas (`github.run_id`), evitando reprocessar imagens e Markdown intactos.

3. **Execução na Nuvem com Fallback para Runner Local (`Self-Hosted`):**
   - **Padrão:** O build roda automaticamente nos servidores virtuais da nuvem do GitHub (`ubuntu-latest`).
   - **Modo de Emergência (Fallback Local):** Em caso de esgotamento de cota ou instabilidade nos servidores do GitHub, o administrador pode acionar a pipeline manualmente via `workflow_dispatch` marcando a opção **`use_local: true`**, executando o build de forma transparente na máquina local através do script `Iniciar-Runner.bat`.

---

## 🛠️ Configuração e Desenvolvimento Local

Para clonar e executar este projeto localmente:

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   > O servidor local rodará por padrão na porta `4321`. Abra `http://localhost:4321/` para ver o site.

3. Para testar o painel de administração CMS localmente:
   O *Decap CMS* precisa de um proxy local para autenticação ao GitHub. Você pode executar o `npx netlify-cms-proxy-server` no terminal para interceptar as edições locais da pasta `public/admin/`.

---

## 🏗️ Build e Produção

Gere os arquivos estáticos de produção na pasta `dist/` usando:

```bash
npm run build
```

Nenhum servidor Node.js é exigido para rodar o site após a compilação. Basta expor a pasta `dist/` em qualquer servidor estático ou provedor cloud (GitHub Pages, Cloudflare Pages, Netlify, Vercel).