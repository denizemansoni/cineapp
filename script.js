const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  // Caminho para o arquivo script.js original na raiz do projeto
  const filePath = path.resolve(process.cwd(), 'script.js');

  // Lê o conteúdo do arquivo
  let content = fs.readFileSync(filePath, 'utf-8');

  // Substitui o placeholder pela variável de ambiente da Vercel
  content = content.replace(/%VITE_API_KEY%/g, process.env.API_KEY);

  res.setHeader('Content-Type', 'application/javascript');
  res.status(200).send(content);
};