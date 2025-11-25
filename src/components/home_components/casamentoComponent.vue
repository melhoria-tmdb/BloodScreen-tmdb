<script setup>
const bg = '/imgs/Casamento sangrento fundo.png'
</script>

<template>
    <div class="slide-wrapper" :style="{
        backgroundImage: `url('${bg}')`
    }">
        <section class="banner">
            <div class="left">
                <div class="linha-e-bolas">
                    <div class="segmento-linha linha-inferior"></div>
                    <div class="segmento-linha linha-superior"></div>

                    <div class="bola bola-1"></div>
                    <div class="bola bola-2"></div>
                    <div class="bola bola-3"></div>
                    <div class="bola bola-4"></div>
                </div>
                <div class="content">
                    <h1>Casamento Sangrento</h1>
                    <p>
                        Horas após o casamento dos seus sonhos, Grace retorna à casa de campo do novo marido para passar
                        a noite com seus novos sogros. Grace logo se vê em uma luta sangrenta pela sobrevivência no que
                        deveria ser a sua lua de mel.
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
    height: auto;
    width: auto;
}

.linha-e-bolas {
    position: relative;
    height: 80vh;
    width: 20px;
    margin-right: 56px;
}

.segmento-linha {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    background: white;
    z-index: 1;
}

.linha-inferior {
    height: 80px;
    bottom: 3px;
    background: linear-gradient(to top, white 0%, rgba(255, 255, 255, 0) 100%);
}

.linha-superior {
    height: 389px;
    bottom: 260px;

    background: linear-gradient(to bottom, white 0%, rgba(255, 255, 255, 0) 100%);
}

.bola {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 20px;
    background-color: white;
    border-radius: 50%;
    z-index: 2;
}

.bola-1 {
    bottom: 15%;
    background-color: #ADADAD;
}

.bola-2 {
    bottom: 20%;
    background-color: #ADADAD;
}

.bola-3 {
    bottom: 25%;
    background-color: #ADADAD;
}

.bola-4 {
    bottom: 30%;
}


.content {
    width: 600px;
    margin-bottom: 10vw;
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
