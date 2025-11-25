/**
 * Vercel Serverless Function para atuar como um proxy para a API do TMDb.
 */
export default async function handler(request, response) {
  const { endpoint, ...queryParams } = request.query;
  // A chave é lida da variável de ambiente configurada na Vercel
  const apiKey = process.env.API_KEY; 

  if (!apiKey) {
    return response.status(500).json({ error: 'A chave da API não está configurada no servidor.' });
  }

  const apiUrl = new URL(`https://api.themoviedb.org/3/${endpoint}`);
  apiUrl.searchParams.set('api_key', apiKey);

  // Adiciona quaisquer outros parâmetros da query (como language=pt-BR)
  for (const key in queryParams) {
    apiUrl.searchParams.set(key, queryParams[key]);
  }

  try {
    const tmdbResponse = await fetch(apiUrl);
    const data = await tmdbResponse.json();
    response.status(tmdbResponse.status).json(data);
  } catch (error) {
    response.status(500).json({ error: 'Falha ao conectar com a API do TMDb.' });
  }
}
