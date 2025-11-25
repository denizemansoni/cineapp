# 🎬 Meu CineApp

Bem-vindo ao Meu CineApp, uma aplicação web moderna e interativa para explorar filmes populares, mais votados e salvar seus favoritos! Este projeto foi construído com HTML, CSS e JavaScript puros, utilizando a API do The Movie Database (TMDb) para obter dados de filmes em tempo real.

## ✨ Features

- **Navegação por Abas**: Explore filmes nas categorias "Populares", "Mais Votados" e "Meus Favoritos".
- **Busca Dinâmica**: Encontre filmes rapidamente com uma barra de busca que filtra os resultados em tempo real.
- **Sistema de Favoritos**: Salve seus filmes preferidos com um clique! Seus favoritos ficam armazenados localmente no seu navegador.
- **Detalhes do Filme**: Clique em um filme para ver mais detalhes, incluindo pôster, resumo, nota e data de lançamento.
- **Trailer do YouTube**: Assista ao trailer oficial do filme diretamente na aplicação.
- **Tema Claro e Escuro**: Alterne entre os modos de visualização para uma experiência mais confortável. A sua preferência é salva para futuras visitas.
- **Design Responsivo**: Interface elegante que se adapta a diferentes tamanhos de tela.
- **Animações Suaves**: Efeitos de transição e fade-in que tornam a navegação mais agradável.

- **HTML5**: Para a estrutura semântica da aplicação.
- **CSS3**: Para estilização, design responsivo, animações e temas.
- **JavaScript (ES6+)**: Para toda a lógica da aplicação, incluindo chamadas de API, manipulação do DOM e interatividade.
- **The Movie Database (TMDb) API**: Para buscar informações detalhadas sobre os filmes.

##  Como Usar

A aplicação foi implantada na Vercel e pode ser acessada através do seguinte link:

- **[Acessar CineApp](https://cineapp-kappa.vercel.app/)**

### Rodando Localmente

Para rodar este projeto localmente, siga os passos abaixo:

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/denizemansoni/cineapp.git
    ```

2.  **Obtenha uma chave da API do TMDb:**
    - Crie uma conta gratuita no site [The Movie Database (TMDb)](https://www.themoviedb.org/).
    - Vá para as configurações da sua conta, na seção "API", e solicite uma chave de desenvolvedor.
    - Copie a sua chave da API (v3 auth).

3.  **Adicione a chave da API ao projeto:**
    - Na raiz do projeto, crie um arquivo chamado `.env`.
    - Dentro do arquivo `.env`, adicione a seguinte linha, substituindo `SUA_CHAVE_DA_API_AQUI` pela chave que você obteve:
      ```
      API_KEY=SUA_CHAVE_DA_API_AQUI
      ```
    - **Importante**: Certifique-se de que o arquivo `.env` esteja no seu `.gitignore` para que sua chave de API não seja enviada para o GitHub. Se o arquivo `.gitignore` não existir, crie-o e adicione `.env` a ele.

4.  **Abra no navegador:**
    - Navegue até a pasta do projeto e abra o arquivo `index.html` no seu navegador de preferência.
    - Para que o projeto funcione localmente com o arquivo `.env`, você precisará de um servidor de desenvolvimento que carregue essas variáveis. Uma forma simples é usar a extensão **Live Server** no VS Code.

Pronto! Agora você pode explorar o CineApp.

## 📸 Screenshots

**Tema Claro**
![Screenshot do tema claro](./screenshots/Screenshot_light.png)

**Tema Escuro**
![Screenshot do tema escuro](./screenshots/Screenshot_dark.png)

**Modal de Detalhes**
![Screenshot do modal de detalhes do filme](./screenshots/Screenshot_modal.png)

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

Feito com ❤️ por Denize Mansoni Cordova.