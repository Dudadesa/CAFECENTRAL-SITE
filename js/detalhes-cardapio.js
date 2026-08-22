//Captura os elementos da pagina detalhes do cardapio
const conteudoCardapio = document.querySelector("#conteudoCardapio")
const mensagemCarregamento = document.querySelector("#mensagemCarregamento")

// Ler o identificador enviado na URL
const parametros = new URLSearchParams(window.location.search);
const idCardapio = parametros.get("id");

// Função que carrega o cardapio
async function carregarDetalhesCardapio(){
    try{
        const resposta = await fetch("../data/cardapio.json");

        if (!resposta.ok){
            console.error("Nao foi possivel carregar o cardapio");
            mensagemCarregamento.textContent =
                "Nao foi possivel carregar o cardapio";
            return;
        };

        const cardapio = await resposta.json();

        const cardapioEncontrado = cardapio.find(
            cardapio => cardapio.id === idCardapio
        );

        if(!cardapioEncontrado){
            mostrarCardapioNaoEncontrado();
            return;
        };

        mostrarCardapio(cardapioEncontrado);

    } catch(erro){
        console.error("Erro ao carregar o cardapio", erro);
        mensagemCarregamento.textContent =
            "Nao foi possivel carregar as informaçoes do cardapio";
    }
}

function mostrarCardapio(cardapio){
    mensagemCarregamento.textContent = "";

    conteudoCardapio.innerHTML = `
    <span class="detalhe-badge">Cardapio CafeCentral</span>
    <h1>${cardapio.titulo}</h1>
    <img src="../img/${cardapio.img}" alt="${cardapio.titulo}">
    <p class="detalhe-descricao">${cardapio.descricao}</p>

    <div class="preco-detalhe">
        <p class="infoLabel">R$</p>
        <p class="infoValor">${cardapio["R$"]}</p>
    </div>

    <div class="secaoDetalhe">
        <p class="infoLabel">Objetivo do cardapio</p>
        <p class="infoValor">${cardapio.objetivo}</p>
    </div>

    <div class="secaoDetalhe">
        <p class="infoLabel">Pra quem é esse cardapio</p>
        <p class="infoValor">${cardapio.publico}</p>
    </div>

    <a href="cardapio.html" class="btn-cardapio">Voltar para Cardapio</a>
    `;
}

function mostrarCardapioNaoEncontrado(){
    mensagemCarregamento.textContent = "";

    conteudoCardapio.innerHTML = `
        <div class="detalhe-cardapio">
          <h1> Cardapio não encontrado!</h1>
          <p> O cardapio não existe ou não esta disponivel </p>
        </div>
    `
}

// Iniciar carregamento
carregarDetalhesCardapio();