<script setup>
const bg = '/imgs/O telefone preto fundo.png'
import api from '@/plugins/axios.js'
const TMDB_MOVIE_ID = 1197137;

async function handleClickTrailer() {
    // 1. Endpoint da API v3 para vídeos (configurado com o Bearer Token no axios.js)
    const endpoint = `/movie/${TMDB_MOVIE_ID}/videos`;

    try {
        // 2. Faz a requisição usando a instância 'api' do axios
        const response = await api.get(endpoint);
        const data = response.data; // Axios armazena o corpo da resposta em .data

        // 3. Filtrar para encontrar o trailer principal (YouTube)
        const trailer = data.results.find(video =>
            video.type === 'Trailer' && video.site === 'YouTube'
        );

        if (trailer) {
            // 4. Constrói a URL do YouTube usando a chave (key) do vídeo
            const trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;

            // 5. Abre o trailer em uma nova aba
            window.open(trailerUrl, '_blank');
        } else {
            alert('Trailer não encontrado para este filme.');
            console.warn('Vídeos encontrados, mas trailer principal não foi localizado:', data.results);
        }

    } catch (error) {
        // Axios joga o erro na propriedade response
        console.error('Falha ao buscar o trailer:', error.response ? error.response.data : error.message);
        alert('Ocorreu um erro ao tentar buscar o trailer.');
    }
}
</script>

<template>
    <div class="slide-wrapper" :style="{
        backgroundImage: `url('${bg}')`
    }">
        <section class="banner">
            <div class="left">

                <div class="content">
                    <h1>O Telefone Preto 2</h1>
                    <p>
                        Pesadelos assombram Gwen, de 15 anos, enquanto ela recebe chamadas do telefone preto e tem
                        visões
                        perturbadoras de três rapazes sendo perseguidos em um acampamento de inverno. Com a ajuda de seu
                        irmão, ela deve agora confrontar um assassino que se tornou ainda mais poderoso na morte.
                    </p>
                    <button class="trailer" @click="handleClickTrailer">TRAILER</button>
                </div>
            </div>
        </section>
    </div>
</template>

<style>
.slide-wrapper {
  width: 100%;
  height: 100vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  /* obrigatório p/ remover scroll horizontal/vertical */
  overflow: hidden;
  display: flex;
}

section.banner {
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: flex-end;
    justify-content: flex-start;
    padding-left: 5vw;
    padding-bottom: 5vh;
}

.left {
    display: flex;
    align-items: center;

}


.content {
    width: 600px;
    margin-bottom: 10px; /* escolha entre 2vh ou valor fixo */
    margin-left: 75px; /* Ajuste para afastar o texto da linha */
}

h1 {
    font-family: 'Metal Mania', cursive;
    font-size: 100px;
    line-height: 120px;
    font-weight: 200;
    width: 100%;
    padding-left: 0;
}

p {
    font-family: 'K2D', sans-serif;
    font-weight: 500;
    font-size: 20px;
    line-height: 30px;
    width: 100%;
    margin: 2vw 0 3vw 0;
}

.trailer {
    font-family: 'K2D', regular;
    font-size: 20px;
    color: black;
    text-align: center;
    background-color: white;
    border-radius: 20px;
    padding: 13px 50px 13px 50px;
}
</style>
