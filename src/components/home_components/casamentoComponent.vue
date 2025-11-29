<script setup>
const bg = '/imgs/Casamento fundo.png'
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
