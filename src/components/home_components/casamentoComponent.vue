<script setup>
const bg = '/imgs/Casamento fundo.png'
import api from '@/plugins/axios.js'
const TMDB_MOVIE_ID = 567609;

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
                    <h1>Casamento Sangrento</h1>
                    <p>
                        Horas após o casamento dos seus sonhos, Grace retorna à casa de campo do novo marido para passar
                        a noite com seus novos sogros. Grace logo se vê em uma luta sangrenta pela sobrevivência no que
                        deveria ser a sua lua de mel.
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
    height: auto;
    width: auto;
}

.content {
    width: 600px;
    margin-bottom: 10vw;
}

h1 {
    font-family: 'Metal Mania', cursive;
    color: white;
    font-size: 100px;
    line-height: 120px;
    font-weight: 200;
    width: 100%;
    padding-left: 0;
}

p {
    font-family: 'K2D', sans-serif;
    color: white;
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
