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

## Como ativar o Painel de Administração (Decap CMS)
Este site está integrado com o Decap CMS para fácil gerenciamento de conteúdo na rota `/admin/`. Como o site será hospedado no **GitHub Pages** (um ambiente puramente estático), existem duas alternativas para habilitar o login e a postagem segura:

### Alternativa A (Recomendada e Sem Código)
Use a camada gratuita do Netlify para gerenciar apenas a identidade, mantendo a hospedagem no GitHub Pages.
1. Crie uma conta no [Netlify](https://www.netlify.com/) e crie um "New Site from Git", conectando este repositório.
2. Não precisa se preocupar com as configurações de build do Netlify, o foco aqui é o recurso Identity.
3. No painel do Netlify, vá em **Site configuration > Identity** e clique em "Enable Identity".
4. Abaixo de "Registration preferences", marque "Invite only" para que ninguém de fora possa se registrar.
5. Role para baixo até "Services" e clique em "Enable Git Gateway". Isso permite que o Netlify Identity comite no GitHub em nome dos redatores aprovados.
6. Retorne para a aba **Identity** (painel superior) e convide os usuários por e-mail.
7. O CMS já está configurado no arquivo `public/admin/config.yml` para usar o `backend: git-gateway`.

### Alternativa B (100% GitHub com OAuth)
Você pode usar a autenticação direta do GitHub. Qualquer pessoa com uma conta GitHub poderá tentar logar, mas apenas os colaboradores com permissão no seu repositório poderão de fato salvar conteúdo.
1. Vá nas [Configurações de Desenvolvedor do seu GitHub (OAuth Apps)](https://github.com/settings/developers) e crie um "New OAuth App".
2. Preencha "Homepage URL" com `https://geovannisz.github.io/BINGO-Telescope-site/`.
3. Preencha "Authorization callback URL" com um servidor proxy OAuth. O Decap CMS recomenda criar um micro-servidor de autenticação usando provedores gratuitos, ou utilizar soluções prontas da comunidade (consulte a [documentação do Decap CMS sobre autenticação externa](https://decapcms.org/docs/github-backend/)).
4. Altere o arquivo `public/admin/config.yml` neste repositório:
   De: `name: git-gateway`
   Para: `name: github`
