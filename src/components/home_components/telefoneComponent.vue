<script setup>
const bg = '/imgs/O telefone preto fundo.png'
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
