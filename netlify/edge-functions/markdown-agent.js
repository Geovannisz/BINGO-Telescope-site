function htmlToMarkdown(html) {
  // Extract body content to ignore head metadata
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let content = bodyMatch ? bodyMatch[1] : html;

  // Remove scripts, styles, nav, footer, header to focus on main content
  content = content.replace(/<(script|style|nav|footer)[^>]*>[\s\S]*?<\/\1>/gi, '');
  
  // Replace headings
  content = content.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n');
  content = content.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n');
  content = content.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n');
  content = content.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n#### $1\n');
  
  // Replace lists
  content = content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
  
  // Replace paragraphs and divs
  content = content.replace(/<(p|div)[^>]*>/gi, '\n');
  
  // Replace links
  content = content.replace(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');
  
  // Replace images
  content = content.replace(/<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)');
  
  // Replace bold/strong
  content = content.replace(/<(b|strong)[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**');
  
  // Remove all other HTML tags
  content = content.replace(/<[^>]+>/g, '');
  
  // Decode basic HTML entities
  content = content
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Cleanup whitespace
  content = content.replace(/\n\s*\n/g, '\n\n').trim();
  
  return content;
}

export default async (request, context) => {
  const accept = request.headers.get("Accept") || "";
  
  if (accept.includes("text/markdown")) {
    const response = await context.next();
    
    // Only parse successful HTML responses
    const contentType = response.headers.get("Content-Type") || "";
    if (response.status === 200 && contentType.includes("text/html")) {
      const html = await response.text();
      const markdown = htmlToMarkdown(html);

      // Estimate tokens (roughly 1 token per 4 chars for general text)
      const estimatedTokens = Math.ceil(markdown.length / 4);

      return new Response(markdown, {
        status: 200,
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "x-markdown-tokens": estimatedTokens.toString(),
          "Cache-Control": "public, max-age=0, must-revalidate",
        }
      });
    }
  }

  return context.next();
};

export const config = {
  path: "/*",
  excludedPath: [
    "/**/*.css",
    "/**/*.js",
    "/**/*.mjs",
    "/**/*.png",
    "/**/*.jpg",
    "/**/*.jpeg",
    "/**/*.webp",
    "/**/*.svg",
    "/**/*.gif",
    "/**/*.ico",
    "/**/*.woff",
    "/**/*.woff2",
    "/images/*",
    "/fonts/*"
  ]
};
