/*============================================================
    1) PEGAR OS ELEMENTOS DO HTML
  ============================================================
*/
//ONDE OS CARDS VAO APARECER
const ListaCardapio = document.querySelector("#ListaCardapio");
/*============================================================
    2)CRIAR UMA LISTA PARA GUARDAR OS Cardapio
  ============================================================
*/
let cardapio = [];
/*============================================================
    3) FUNÇÃO PARA CARREGAR O JSON
  ============================================================
*/

async function carregarCardapio(){
    //BUSCA O ARQUIVO Cardapio.json
    const resposta = await fetch("../data/cardapio.json");
    console.log(resposta);

    //transforma o JSON em dados que o js entende
    cardapio = await resposta.json();

    //depois de caregar, já renderiza na tela
    renderizarCardapio(cardapio);
};

/*============================================================
    4) FUNÇÃO PARA CRIAR OS CARD DOS Cardapio NA TELA
  ============================================================
*/
function renderizarCardapio(lista){
    // limpa o conteúdo antes de desenhar de novo
    ListaCardapio.innerHTML = "";

    // para cada curso da lista -> cria um card
    lista.forEach(cardapio => {
        // cria a tag div
        const card = document.createElement("div");

        // coloca uma class dentro da tag criada
        card.classList.add("produto");

        //coloca o conteúdo dentro do card
        card.innerHTML = `
            <h3> ${cardapio.titulo} </h3>
            <img src="${cardapio.img}" width="150" height="150">
            <p> ${cardapio.descricao} </p>
            <p> <strong>R$: </strong> ${cardapio.R$}</p>
            <a href="${cardapio.url}"><button>Ver detalhes</button></a>
        `;
        ListaCardapio.appendChild(card);
    });
}

/*============================================================
    6) INICIA TUDO
  ============================================================
*/
carregarCardapio();