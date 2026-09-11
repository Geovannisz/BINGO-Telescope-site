import fs from 'fs';
import path from 'path';

const CONTENT_DIRS = [
  'src/content/news',
  'src/content/team',
  'src/content/publications'
];

let hasErrors = false;
let totalChecked = 0;
let totalWarnings = 0;

console.log('🔍 Iniciando verificação de integridade de assets e imagens...');

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Check for unresolved editorial placeholders like "(citar o dia)"
  const placeholderRegex = /\(citar[^)]*\)/gi;
  let placeholderMatch;
  while ((placeholderMatch = placeholderRegex.exec(content)) !== null) {
    console.warn(`⚠️ [AVISO] Placeholder não preenchido "${placeholderMatch[0]}" em: ${filePath}`);
    totalWarnings++;
  }

  // 1. Check Frontmatter images (image:, photo:)
  const fmRegex = /(?:image|photo):\s*([^\r\n]+)/g;
  let match;
  while ((match = fmRegex.exec(content)) !== null) {
    const rawPath = match[1].trim().replace(/^["']|["']$/g, '');
    if (rawPath && rawPath.startsWith('/')) {
      validateAsset(rawPath, filePath, 'Frontmatter');
    }
  }

  // 2. Check Markdown body images (![alt](url))
  const mdImgRegex = /!\[.*?\]\((.*?)\)/g;
  while ((match = mdImgRegex.exec(content)) !== null) {
    const rawPath = match[1].trim().split(/\s+/)[0].replace(/^["']|["']$/g, '');
    if (rawPath && rawPath.startsWith('/')) {
      validateAsset(rawPath, filePath, 'Corpo Markdown');
    }
  }
}

function validateAsset(assetPath, sourceFile, context) {
  totalChecked++;
  const cleanPath = assetPath.split('?')[0].split('#')[0];
  const diskPath = path.join('public', cleanPath.replace(/^\//, ''));

  // Check existence
  if (!fs.existsSync(diskPath)) {
    console.error(`❌ [ERRO] Imagem não encontrada (${context}): "${assetPath}" referenciada em: ${sourceFile}`);
    hasErrors = true;
    return;
  }

  // Check for non-ASCII characters
  const baseName = path.basename(diskPath);
  if (/[^\x00-\x7F]/.test(baseName)) {
    console.warn(`⚠️ [AVISO] Imagem contém caracteres não-ASCII/acentos no nome: "${baseName}" em: ${sourceFile}.`);
    totalWarnings++;
  }

  // Check file size (warn if > 1.5MB)
  try {
    const stats = fs.statSync(diskPath);
    const sizeMb = stats.size / (1024 * 1024);
    if (sizeMb > 1.5) {
      console.warn(`⚠️ [AVISO] Imagem pesada (${sizeMb.toFixed(2)} MB): "${assetPath}" em: ${sourceFile}.`);
      totalWarnings++;
    }
  } catch (e) {}
}

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      checkFile(fullPath);
    }
  }
}

for (const dir of CONTENT_DIRS) {
  scanDir(dir);
}

console.log(`\n📊 Verificação concluída: ${totalChecked} referência(s) de imagem verificada(s).`);
if (totalWarnings > 0) {
  console.log(`⚠️ ${totalWarnings} aviso(s) encontrado(s).`);
}

if (hasErrors) {
  console.error('❌ Falha na verificação de integridade de assets! Corrija os erros acima antes de prosseguir.');
  process.exit(1);
} else {
  console.log('✅ Todas as imagens referenciadas existem e estão íntegras!\n');
}
