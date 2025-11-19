<script setup>

</script>

<template>

    <body>
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
                    <h1>O Telefone Preto 2</h1>
                    <p>Pesadelos assombram Gwen, de 15 anos, enquanto ela recebe chamadas do telefone preto e tem visões
                        perturbadoras de três rapazes sendo perseguidos em um acampamento de inverno. Com a ajuda de seu
                        irmão, ela deve agora confrontar um assassino que se tornou ainda mais poderoso na morte.
                    </p>
                    <button class="trailer">TRAILER</button>
                </div>
            </div>
        </section>
    </body>
</template>

<style>
body {
    overflow: hidden;
    margin: 0;
    padding: 0;
    background-image: url('/imgs/O telefone preto fundo.png');
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
    background-attachment: fixed;
    margin: 0;
    padding: 0;
    min-height: 100vh;
}
section.banner {
    width: 100%;
    /* Altura total do viewport */
    height: 100vh;
    display: flex;
    /* Alinha o conteúdo (.left) na parte inferior do banner */
    align-items: flex-end;
    justify-content: flex-start;
    padding-left: 5vw;
    /* Adiciona padding inferior para compensar o alinhamento 'flex-end' */
    padding-bottom: 5vh;
}
.left {
    /* Faz com que a linha (.linha-e-bolas) e o conteúdo (.content) fiquem lado a lado */
    display: flex;
    /* Alinha os itens verticalmente (centraliza-os no eixo transversal) */
    align-items: center;
    height: auto; /* Deixa a altura ser definida pelo conteúdo */
    width: auto;
}

/* 2. Estilo para .linha-e-bolas: Define o contêiner da linha e das bolas */
.linha-e-bolas {
    /* Define o contêiner como relativo para que as bolas absolutas funcionem */
    position: relative;
    /* Altura total para que a linha preencha o espaço vertical do banner */
    height: 80vh;
    width: 20px;
    /* Garante que a linha fique na esquerda e o conteúdo na direita */
    margin-right: 56px; /* Espaço entre a linha e o texto do .content */
}
.segmento-linha {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    background: white;
    z-index: 1;
}

/* 1. Segmento Inferior (Do chão até o início da bola-1) */
.linha-inferior {
    height: 80px; /* Altura da linha antes da primeira bola */
    bottom: 1px;
    /* GRADIENTE: Para dar o efeito de desfoque no final (topo deste segmento) */
    background: linear-gradient(to top, white 0%, rgba(255, 255, 255, 0) 100%);
}

/* 2. Segmento Superior (Do fim da bola-4 até o topo do contêiner) */
/* Cálculo: Altura do contêiner (350px) - Posição da bola-4 (240px) = 110px de sobra */
.linha-superior {
    /* 110px de sobra - altura da bola-4 (20px) - margem */
    height: 380px; /* Ajuste a altura para que o topo fique no ponto desejado */
    bottom: 255px; /* bottom da bola-4 (240px) + altura da bola-4 (20px) = 260px */

    /* GRADIENTE: Para dar o efeito de desfoque no final (topo deste segmento) */
    background: linear-gradient(to bottom, white 0%, rgba(255, 255, 255, 0) 100%);
}



/* 4. Estilo base para todas as bolas: */
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

/* 5. Posicionamento individual de cada bola */
.bola-1 { bottom: 15%; background-color: #ADADAD; } /* Ajustado para começar um pouco abaixo */
.bola-2 { bottom: 20%; background-color: #ADADAD; }
.bola-3 { bottom: 25%; background-color: #ADADAD;}
.bola-4 { bottom: 30%; } /* Ajustado para não sair do contêiner */


.content {
    width: 600px; /* Largura fixa ou máxima para o bloco de texto */
    margin-bottom: 10vw;
}

h1 {
    font-family: 'Metal Mania', cursive; /* Correção: use aspas e um fallback */
    font-size: 100px;
    line-height: 120px;
    font-weight: 200;
    width: 100%; /* Ajuste a largura para ocupar o .content */
    padding-left: 0;
}

p {
    font-family: 'K2D', sans-serif; /* Correção: use aspas e um fallback */
    font-weight: 500;
    font-size: 20px;
    line-height: 30px;
    width: 100%; /* Ajuste a largura para ocupar o .content */
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
