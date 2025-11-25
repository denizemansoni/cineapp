/**
 * Vercel Serverless Function para atuar como um proxy para a API do TMDb.
 *
 * Como funciona:
 * 1. O front-end fará uma chamada para `/api/tmdb?endpoint=movie/popular&language=pt-BR`.
 * 2. Esta função recebe a chamada.
 * 3. Ela pega o parâmetro `endpoint` (ex: "movie/popular").
 * 4. Adiciona a chave da API, que está guardada de forma segura nas "Environment Variables" da Vercel.
 * 5. Faz a chamada real para `https://api.themoviedb.org/3/movie/popular?api_key=...&language=pt-BR`.
 * 6. Retorna a resposta do TMDb para o front-end.
 *
 * Assim, a chave da API nunca é exposta no navegador do usuário.
 */
export default async function handler(request, response) {
  const { endpoint, ...queryParams } = request.query;
  const apiKey = process.env.API_KEY; // A chave é lida da variável de ambiente

  if (!apiKey) {
    return response.status(500).json({ error: 'A chave da API não está configurada no servidor.' });
  }

  const apiUrl = new URL(`https://api.themoviedb.org/3/${endpoint}`);
  apiUrl.searchParams.set('api_key', apiKey);

  // Adiciona quaisquer outros parâmetros da query (como language=pt-BR)
  for (const key in queryParams) {
    apiUrl.searchParams.set(key, queryParams[key]);
  }

  const tmdbResponse = await fetch(apiUrl);
  const data = await tmdbResponse.json();

  response.status(200).json(data);
}