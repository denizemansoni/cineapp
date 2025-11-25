// console.log("✅ script.js foi carregado e está sendo executado!");

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DO DOM ---
    const moviesContainer = document.getElementById('movies-container');
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const categoryTitle = document.getElementById('category-title');
    const categoryTabs = document.querySelectorAll('.tab-button');
    const modal = document.getElementById('movie-modal');
    const modalBody = document.getElementById('modal-body');
    const closeModalButton = document.querySelector('.close-button');
    const themeToggle = document.getElementById('checkbox');
    const homeLink = document.getElementById('home-link');

    // --- ESTADO DA APLICAÇÃO ---
    let favorites = JSON.parse(localStorage.getItem('favorites')) || []; // Carrega os favoritos
    let currentCategory = 'popular'; // Categoria inicial

    // Usaremos o endpoint de proxy da Vercel para a API do TMDb
    const proxyApiUrl = '/api/tmdb';

    // Função para buscar os filmes da API com base na categoria
    async function fetchMovies(category = 'popular') {
        try {
            moviesContainer.innerHTML = '<p>Carregando filmes...</p>';
            // Construir a URL da API
            let url; // URL para o nosso proxy

            if (category === 'favorites') {
                displayMovies(favorites);
                return;
            }

            if (category === 'search') {
                const query = searchInput.value.trim();
                if (!query) {
                    fetchMovies(currentCategory); // Volta para a categoria atual se a busca estiver vazia
                    return;
                }
                url = `${proxyApiUrl}?endpoint=search/movie&query=${query}&language=pt-BR`;
                categoryTitle.textContent = `Resultados para: "${query}"`;
            } else {
                url = `${proxyApiUrl}?endpoint=movie/${category}&language=pt-BR`;
                updateCategoryTitle(category);
            }

            const response = await fetch(url);
            if (!response.ok) {
                // Tenta ler a mensagem de erro do corpo da resposta da API
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData?.error || `HTTP error! status: ${response.status}`;
                // Lança um erro com a mensagem detalhada
                throw new Error(errorMessage);
            }
            const data = await response.json();
            displayMovies(data.results);

        } catch (error) {
            console.error('Erro ao buscar filmes:', error);
            moviesContainer.innerHTML = '<p class="error-message">Não foi possível carregar os filmes. Tente novamente mais tarde.</p>';
        }
    }

    // Função para exibir os filmes na tela
    function displayMovies(movies) {
        moviesContainer.innerHTML = ''; // Limpa o container
        if (!movies || movies.length === 0) {
            moviesContainer.innerHTML = `<p>Nenhum filme encontrado.</p>`;
            return;
        }

        movies.forEach(movie => {
            const isFavorited = favorites.some(fav => fav.id === movie.id);
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            movieCard.innerHTML = `
                <div class="image-container">
                    <img src="${movie.poster_path ? 'https://image.tmdb.org/t/p/w500' + movie.poster_path : 'placeholder.jpg'}" alt="${movie.title}">
                </div>
                <div class="movie-info">
                    <h3>${movie.title}</h3>
                    <div class="rating">⭐ ${movie.vote_average.toFixed(1)}</div>
                </div>
                <button class="favorite-button ${isFavorited ? 'favorited' : ''}" data-movie-id="${movie.id}">
                    ${isFavorited ? '❤️' : '🤍'}
                </button>
            `;
            // Adiciona evento de clique para abrir o modal
            movieCard.querySelector('img').addEventListener('click', () => openModal(movie.id));
            // Adiciona evento de clique para favoritar
            movieCard.querySelector('.favorite-button').addEventListener('click', (e) => {
                e.stopPropagation(); // Impede que o clique no botão abra o modal
                toggleFavorite(movie);
            });
            moviesContainer.appendChild(movieCard);
        });
    }

    // --- MODAL ---
    // Função para abrir o modal com detalhes do filme
    async function openModal(movieId) {
        try {
            const response = await fetch(`${proxyApiUrl}?endpoint=movie/${movieId}&language=pt-BR&append_to_response=videos`);
            if (!response.ok) throw new Error('Falha ao buscar detalhes do filme.');
            const movie = await response.json();

            const trailer = movie.videos.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');

            modalBody.innerHTML = `
                <img src="${movie.poster_path ? 'https://image.tmdb.org/t/p/w500' + movie.poster_path : 'placeholder.jpg'}" alt="${movie.title}" class="modal-poster">
                <div class="modal-details">
                    <h2>${movie.title} (${new Date(movie.release_date).getFullYear()})</h2>
                    <p class="tagline">${movie.tagline || ''}</p>
                    <p class="overview">${movie.overview}</p>
                    <div class="genres">
                        ${movie.genres.map(genre => `<span>${genre.name}</span>`).join('')}
                    </div>
                    ${trailer ? `
                        <div class="trailer-container">
                            <iframe src="https://www.youtube.com/embed/${trailer.key}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        </div>
                    ` : '<p>Trailer não disponível.</p>'}
                </div>
            `;
            modal.style.display = 'flex';
        } catch (error) {
            console.error('Erro ao abrir o modal:', error);
            modalBody.innerHTML = '<p>Não foi possível carregar os detalhes do filme.</p>';
        }
    }

    // Função para fechar o modal
    function closeModal() {
        modal.style.display = 'none';
        modalBody.innerHTML = ''; // Limpa o conteúdo
    }

    // --- FAVORITOS ---
    // Função para alternar o estado de favorito de um filme
    function toggleFavorite(movie) {
        const movieIndex = favorites.findIndex(fav => fav.id === movie.id);
        if (movieIndex > -1) {
            favorites.splice(movieIndex, 1); // Remove dos favoritos
        } else {
            favorites.push(movie); // Adiciona aos favoritos
        }
        localStorage.setItem('favorites', JSON.stringify(favorites)); // Salva no localStorage
        
        // Atualiza a exibição se estiver na aba de favoritos
        if (currentCategory === 'favorites') {
            displayMovies(favorites);
        }
        // Atualiza o estado visual de todos os botões de favorito visíveis
        updateFavoriteButtons();
    }

    // Função para atualizar a aparência dos botões de favorito
    function updateFavoriteButtons() {
        const buttons = document.querySelectorAll('.favorite-button');
        buttons.forEach(button => {
            const movieId = parseInt(button.dataset.movieId, 10);
            if (favorites.some(fav => fav.id === movieId)) {
                button.classList.add('favorited');
                button.innerHTML = '❤️';
            } else {
                button.classList.remove('favorited');
                button.innerHTML = '🤍';
            }
        });
    }

    // --- NAVEGAÇÃO E TÍTULOS ---
    // Função para atualizar o título da categoria
    function updateCategoryTitle(category) {
        const titles = {
            popular: 'Filmes Populares',
            top_rated: 'Filmes Mais Votados',
            favorites: 'Meus Favoritos'
        };
        categoryTitle.textContent = titles[category] || 'Filmes';
    }

    // --- TEMA (CLARO/ESCURO) ---
    // Função para aplicar o tema salvo
    function applyTheme(isDark) {
        document.body.classList.toggle('dark-theme', isDark);
        themeToggle.checked = isDark;
    }

    // --- EVENT LISTENERS ---
    // Busca de filmes
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        fetchMovies('search');
    });

    // Limpa a busca se o campo ficar vazio
    searchInput.addEventListener('input', () => {
        if (searchInput.value.trim() === '') {
            fetchMovies(currentCategory);
        }
    });

    // Navegação por abas
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.dataset.category;
            searchInput.value = ''; // Limpa a busca ao trocar de aba
            fetchMovies(currentCategory);
        });
    });

    // Voltar para a home
    homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        searchInput.value = '';
        // Reseta para a aba 'popular'
        document.querySelector('.tab-button[data-category="popular"]').click();
    });

    // Modal
    closeModalButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) { // Fecha se clicar fora do conteúdo
            closeModal();
        }
    });

    // Tema
    themeToggle.addEventListener('change', () => {
        localStorage.setItem('darkTheme', themeToggle.checked);
        applyTheme(themeToggle.checked);
    });

    // --- INICIALIZAÇÃO ---
    // Carrega o tema salvo
    const savedTheme = localStorage.getItem('darkTheme') === 'true';
    applyTheme(savedTheme);
    // Carrega os filmes da categoria inicial
    fetchMovies(currentCategory);
});