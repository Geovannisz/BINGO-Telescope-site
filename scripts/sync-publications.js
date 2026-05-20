import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

// Target directories
const TEAM_DIR = path.resolve('src/content/team');
const PUBS_DIR = path.resolve('src/content/publications');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, '') // remove diacritical marks
    .replace(/\s+/g, '-') // replace spaces with -
    .replace(/[^\w\-]+/g, '') // remove all non-word chars
    .replace(/\-\-+/g, '-') // replace multiple - with single -
    .replace(/^-+/, '') // trim - from start of text
    .replace(/-+$/, ''); // trim - from end of text
}

function normalizeTitle(title) {
  return title.toLowerCase().trim().replace(/\s+/g, ' ');
}

function runSync() {
  console.log('🔄 Iniciando sincronização de publicações dos membros da equipe...');

  if (!fs.existsSync(TEAM_DIR)) {
    console.error(`❌ Diretório de equipe não encontrado: ${TEAM_DIR}`);
    return;
  }
  if (!fs.existsSync(PUBS_DIR)) {
    console.log(`Creating publications directory: ${PUBS_DIR}`);
    fs.mkdirSync(PUBS_DIR, { recursive: true });
  }

  // 1. Load all existing publications in src/content/publications
  const existingPubFiles = fs.readdirSync(PUBS_DIR).filter(file => file.endsWith('.md'));
  const existingTitles = new Set();

  existingPubFiles.forEach(file => {
    const filePath = path.join(PUBS_DIR, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const parts = content.split('---');
      if (parts.length >= 3) {
        const frontmatter = yaml.load(parts[1]);
        if (frontmatter && frontmatter.title) {
          existingTitles.add(normalizeTitle(frontmatter.title));
        }
      }
    } catch (err) {
      console.warn(`⚠️ Erro ao ler publicação existente ${file}:`, err.message);
    }
  });

  console.log(`📚 Encontradas ${existingTitles.size} publicações únicas na coleção oficial.`);

  // 2. Read all team files and extract publications
  const teamFiles = fs.readdirSync(TEAM_DIR).filter(file => file.endsWith('.md'));
  let newPubsCount = 0;

  teamFiles.forEach(file => {
    const filePath = path.join(TEAM_DIR, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const parts = content.split('---');
      if (parts.length >= 3) {
        const frontmatter = yaml.load(parts[1]);
        if (frontmatter && frontmatter.publications && Array.isArray(frontmatter.publications)) {
          const memberName = frontmatter.name || 'Membro da Equipe';
          frontmatter.publications.forEach(pub => {
            if (!pub.title) return;

            const normTitle = normalizeTitle(pub.title);
            if (!existingTitles.has(normTitle)) {
              // We need to create a new standalone publication file!
              let year = new Date().getFullYear();
              if (pub.date) {
                const d = new Date(pub.date);
                if (!isNaN(d.getTime())) {
                  year = d.getFullYear();
                }
              }

              const slug = slugify(pub.title);
              const newFileName = `${year}-${slug}.md`;
              const newFilePath = path.join(PUBS_DIR, newFileName);

              // Build frontmatter data
              let dateObj = new Date();
              if (pub.date) {
                const d = new Date(pub.date);
                if (!isNaN(d.getTime())) {
                  dateObj = d;
                }
              }

              const pubData = {
                title: pub.title,
                authors: pub.authors || memberName,
                date: dateObj,
                link: pub.link || '',
                doi: pub.doi || '',
                summary: pub.summary || '',
                journal: pub.journal || '',
                volume: String(pub.volume || ''),
                issue: String(pub.issue || ''),
                pages: String(pub.pages || ''),
                category: pub.category || 'Outro'
              };

              // Serialize back to YAML frontmatter
              const yamlString = yaml.dump(pubData, {
                quotingType: '"',
                forceQuotes: false
              });

              const fileContent = `---\n${yamlString}---\n`;
              fs.writeFileSync(newFilePath, fileContent, 'utf8');
              console.log(`✅ Nova publicação criada: "${pub.title}" -> ${newFileName} (Adicionado por: ${memberName})`);

              // Add to existing titles so we don't duplicate within the same run
              existingTitles.add(normTitle);
              newPubsCount++;
            }
          });
        }
      }
    } catch (err) {
      console.error(`❌ Erro ao processar membro da equipe ${file}:`, err);
    }
  });

  console.log(`🎉 Sincronização concluída! ${newPubsCount} novas publicações adicionadas à coleção oficial.`);
}

// Run the synchronization
runSync();
