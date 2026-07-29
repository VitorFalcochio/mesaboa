const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');
const serverDir = path.join(distDir, 'server');
const openaiDir = path.join(distDir, '.openai');

fs.mkdirSync(serverDir, { recursive: true });
fs.mkdirSync(openaiDir, { recursive: true });

fs.copyFileSync(path.join(root, '.openai', 'hosting.json'), path.join(openaiDir, 'hosting.json'));

fs.writeFileSync(path.join(serverDir, 'index.js'), `export default {
  async fetch(request, env) {
    if (!env.ASSETS) {
      return new Response('Missing ASSETS binding', { status: 500 });
    }

    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) return response;

    const url = new URL(request.url);
    if (request.method === 'GET' && !url.pathname.includes('.')) {
      return env.ASSETS.fetch(new Request(new URL('/index.html', url), request));
    }

    return response;
  }
};
`);

console.log('Prepared Sites build entrypoint.');
