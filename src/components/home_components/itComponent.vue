<script setup>
const bg = '/imgs/It a coisa fundo.png'
</script>

<template>
    <div class="slide-wrapper" :style="{
        backgroundImage: `url('${bg}')`
    }">
        <section class="banner">
            <div class="left">

                <div class="content">
                    <h1>It a Coisa</h1>
                    <p>
                        Um grupo de crianças começa a investigar o estranho desaparecimento de jovens em sua cidade. Aos poucos, descobrem que o responsável é Pennywise, um palhaço cruel que se alimenta dos medos mais profundos das vítimas. Com uma origem sombria que remonta a séculos atrás, a criatura volta periodicamente para espalhar terror. Agora, os amigos precisam enfrentar seus próprios temores antes que o mal faça novas vítimas.
                    </p>
                    <button class="trailer">TRAILER</button>
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
