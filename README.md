# BINGO Telescope Website

Este é o repositório do site oficial do Projeto BINGO (Baryon Acoustic Oscillations from Integrated Neutral Gas Observations), construído com [Astro](https://astro.build/) e [Tailwind CSS](https://tailwindcss.com/).

## Estrutura do Projeto
- `src/pages/`: Contém as páginas principais (Home, Sobre, Ciência, etc).
- `src/content/`: Onde residem os dados gerenciados (Notícias, Equipe, Publicações).
- `src/components/` e `src/layouts/`: Componentes visuais modulares e a estrutura base do layout.

## Como executar localmente
1. Instale as dependências: `npm install`
2. Rode o servidor de desenvolvimento: `npm run dev`
3. Construa a versão estática: `npm run build`

## Decap CMS
Este site está integrado com o Decap CMS para fácil gerenciamento de conteúdo.
- Acesse o painel pelo caminho: `/admin`
- O acesso é restrito e gerenciado via [Netlify Identity](https://www.netlify.com/products/identity/). Apenas convidados autorizados pela equipe técnica no painel do Netlify poderão fazer postagens.
