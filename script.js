document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DO DOM ---
    const moviesContainer = document.getElementById('movies-container');
    const themeToggle = document.getElementById('checkbox'); // Assumindo que o checkbox é o seu toggle
    const searchInput = document.getElementById('search-input');
    const body = document.body;
    const homeLink = document.getElementById('home-link');
    const modal = document.getElementById('movie-modal');
    const modalBody = document.getElementById('modal-body');
    const closeButton = document.querySelector('.close-button');
    const categoryTabs = document.querySelector('.category-tabs');
    const categoryTitle = document.getElementById('category-title');

    // --- LÓGICA PARA TROCA DE TEMA ---
    function applyTheme(theme) {
        if (theme === 'dark-mode') {
            body.classList.add('dark-mode');
            themeToggle.checked = true; // No tema escuro, o toggle está "ligado"
        } else { // Tema claro
            body.classList.remove('dark-mode');
            themeToggle.checked = false; // No tema claro, o toggle está "desligado"
        }
    }

    // Verifica e aplica o tema salvo no localStorage ao carregar a página
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        applyTheme(currentTheme);
    }

    // Listener para a troca de tema
    themeToggle.addEventListener('change', () => {
        const newTheme = themeToggle.checked ? 'dark-mode' : 'light';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });

    // --- LÓGICA PARA BUSCA E EXIBIÇÃO DE FILMES ---
    let allMovies = []; // Array para armazenar todos os filmes buscados da API
    let favorites = JSON.parse(localStorage.getItem('favorites')) || []; // Carrega os favoritos
    let currentCategory = 'popular'; // Categoria inicial

    // Chave da API do TMDb
    let apiKey = localStorage.getItem('tmdbApiKey');
    const baseApiUrl = 'https://api.themoviedb.org/3/movie/';

    // Função para verificar e solicitar a chave da API se não existir
    function initializeApiKey() {
        if (!apiKey) {
            apiKey = prompt("Bem-vindo ao CineApp! Por favor, insira sua chave da API do TMDb para carregar os filmes.");
            if (apiKey && apiKey.trim() !== '') {
                localStorage.setItem('tmdbApiKey', apiKey);
            } else {
                moviesContainer.innerHTML = '<p>Uma chave de API do TMDb é necessária. Por favor, recarregue a página e insira sua chave.</p>';
                // Impede a execução do resto do código se a chave não for fornecida
                return false;
            }
        }
        return true;
    }

    // Função para buscar os filmes da API com base na categoria
    async function fetchMovies(category = 'popular') {
        // Se a categoria for 'favorites', não busca na API
        if (category === 'favorites') {
            const favoriteMovies = allMovies.filter(movie => favorites.includes(movie.id));
            displayMovies(favoriteMovies);
            updateCategoryTitle('Meus Favoritos');
            return;
        }

        const apiUrl = `${baseApiUrl}${category}?api_key=${apiKey}&language=pt-BR`;
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            // Atualiza a lista `allMovies` apenas se for a busca principal (popular)
            // para garantir que a lista de favoritos funcione corretamente.
            if (category === 'popular') {
                allMovies = data.results;
            }

            displayMovies(data.results);
            updateCategoryTitle(category === 'popular' ? 'Filmes Populares' : 'Filmes Mais Votados');

        } catch (error) {
            console.error('Erro ao buscar filmes:', error);
            moviesContainer.innerHTML = '<p>Não foi possível carregar os filmes. Tente novamente mais tarde.</p>';
        }
    }

    // Função para criar os cards dos filmes e exibi-los na tela
    function displayMovies(movies) {
        moviesContainer.innerHTML = ''; // Limpa o container antes de adicionar novos filmes

        if (movies.length === 0 && currentCategory === 'favorites') {
            moviesContainer.innerHTML = '<p class="no-results">Você ainda não adicionou nenhum filme aos favoritos.</p>';
            return;
        } else if (movies.length === 0) {
            moviesContainer.innerHTML = '<p class="no-results">Nenhum filme encontrado. Tente buscar por outro termo.</p>';
            return; // Encerra a função aqui se não houver filmes
        }

        movies.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');

            const isFavorite = favorites.includes(movie.id);

            movieCard.innerHTML = `
                <span class="favorite-icon ${isFavorite ? 'active' : ''}" data-movie-id="${movie.id}">&#x2665;</span>
                <div class="image-container">
                    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="Pôster do filme ${movie.title}">
                </div>
                 <div class="movie-info">
                     <h3>${movie.title}</h3>
                     <p>Nota: ${movie.vote_average.toFixed(1)}</p>
                 </div>
            `;

            // Adiciona o evento de clique para abrir o modal com os detalhes do filme
            movieCard.querySelector('.image-container').addEventListener('click', () => showMovieDetails(movie));
            movieCard.querySelector('.movie-info').addEventListener('click', () => showMovieDetails(movie));

            // Adiciona o evento de clique para o ícone de favorito
            const favoriteIcon = movieCard.querySelector('.favorite-icon');
            favoriteIcon.addEventListener('click', (event) => {
                event.stopPropagation(); // Impede que o modal abra ao clicar no ícone
                toggleFavorite(movie.id, favoriteIcon);
            });

            moviesContainer.appendChild(movieCard);
        });
    }

    // Listener para o campo de busca
    searchInput.addEventListener('keyup', (event) => {
        const searchTerm = event.target.value.toLowerCase();

        // Filtra a lista de filmes já carregada (allMovies)
        const filteredMovies = allMovies.filter(movie => {
            return movie.title.toLowerCase().includes(searchTerm);
        });

        displayMovies(filteredMovies);
    });

    // Função para atualizar o título da categoria
    function updateCategoryTitle(title) {
        categoryTitle.textContent = title;
    }

    // --- LÓGICA DO MENU PRINCIPAL E MODAL ---

    // Função para salvar favoritos no localStorage
    function saveFavorites() {
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }

    // Função para adicionar/remover um filme dos favoritos
    function toggleFavorite(movieId, iconElement) {
        const movieIndex = favorites.indexOf(movieId);

        if (movieIndex > -1) {
            // Remove dos favoritos
            favorites.splice(movieIndex, 1);
            iconElement.classList.remove('active');
        } else {
            // Adiciona aos favoritos
            favorites.push(movieId);
            iconElement.classList.add('active');
        }

        saveFavorites();

        // Se estiver na aba de favoritos, atualiza a visualização em tempo real
        if (currentCategory === 'favorites') {
            const favoriteMovies = allMovies.filter(movie => favorites.includes(movie.id));
            displayMovies(favoriteMovies);
        }
    }

    // Função para buscar os vídeos de um filme
    async function fetchMovieVideos(movieId) {
        try {
            const videoApiUrl = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}&language=pt-BR`;
            const response = await fetch(videoApiUrl);
            const data = await response.json();
            // Procura por um trailer oficial do YouTube
            const trailer = data.results.find(video => video.site === 'YouTube' && video.type === 'Trailer');
            return trailer ? trailer.key : null;
        } catch (error) {
            console.error('Erro ao buscar vídeos do filme:', error);
            return null;
        }
    }

    // Função para exibir os detalhes do filme no modal
    async function showMovieDetails(movie) {
        modal.style.display = 'flex'; // Mostra o modal imediatamente
        modalBody.innerHTML = '<p>Carregando detalhes e trailer...</p>'; // Feedback de carregamento

        const trailerKey = await fetchMovieVideos(movie.id);
        let trailerHtml = '';

        if (trailerKey) {
            trailerHtml = `
                <div class="trailer-container">
                    <iframe src="https://www.youtube.com/embed/${trailerKey}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
            `;
        } else {
            trailerHtml = '<p>Trailer não disponível.</p>';
        }

        modalBody.innerHTML = `
            <div class="modal-details">
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="Pôster do filme ${movie.title}">
                <div>
                    <h2>${movie.title}</h2>
                    <p><strong>Resumo:</strong> ${movie.overview || 'Resumo não disponível.'}</p>
                    <p><strong>Nota:</strong> ${movie.vote_average.toFixed(1)}</p>
                    <p><strong>Data de Lançamento:</strong> ${new Date(movie.release_date).toLocaleDateString('pt-BR')}</p>
                </div>
            </div>
            ${trailerHtml}
        `;
    }

    // Função para fechar o modal
    function closeModal() {
        modal.style.display = 'none';
        modalBody.innerHTML = ''; // Limpa o conteúdo do modal para parar o vídeo
    }

    // Evento para o botão de fechar do modal
    closeButton.addEventListener('click', closeModal);

    // Evento para fechar o modal clicando fora dele
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Evento para o link "Home" que recarrega os filmes populares
    homeLink.addEventListener('click', (event) => {
        event.preventDefault(); // Impede que a página recarregue
        searchInput.value = ''; // Limpa o campo de busca
        currentCategory = 'popular';
        fetchMovies(currentCategory); // Busca e exibe os filmes populares novamente
        // Atualiza a aba ativa visualmente
        document.querySelector('.tab-button.active').classList.remove('active');
        document.querySelector('.tab-button[data-category="popular"]').classList.add('active');
    });

    // Evento para a navegação por abas
    categoryTabs.addEventListener('click', (event) => {
        if (event.target.classList.contains('tab-button')) {
            document.querySelector('.tab-button.active').classList.remove('active');
            event.target.classList.add('active');
            currentCategory = event.target.dataset.category;
            fetchMovies(currentCategory);
        }
    });

    // --- INICIALIZAÇÃO ---
    // Verifica a chave da API e, se for válida, carrega os filmes
    if (initializeApiKey()) {
        fetchMovies(currentCategory);
    }
});
