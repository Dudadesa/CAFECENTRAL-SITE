/*============================================================
    1) PEGAR OS ELEMENTOS DO HTML
  ============================================================
*/
//ONDE OS CARDS VAO APARECER
const ListaCardapio = document.querySelector("#ListaCardapio");
//CAMPO DE BUSCA
const buscaCardapio = document.querySelector("#BuscarCardapio")
/*============================================================
    2)CRIAR UMA LISTA PARA GUARDAR OS Cardapio
  ============================================================
*/
let Cardapio = [];
/*============================================================
    3) FUNÇÃO PARA CARREGAR O JSON
  ============================================================
*/

async function carregarCardapio(){
    //BUSCA O ARQUIVO Cardapio.json
    const resposta = await fetch("../data/Cardapio.json"); 
    console.log(resposta);

    //transforma o JSON em dados que o js entende
    Cardapio = await resposta.json();

    //depois de caregar, já renderiza na tela
    renderizarCardapio(Cardapio);
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
        card.classList.add("card");

        //coloca o conteúdo dentro do card
        card.innerHTML = `
            <h3> ${cardapio.titulo} </h3>
            <img src="${cardapio.img}" width="150" height="150">
            <p> ${curso.descricao} </p>
            <p> <strong>CH: </strong> ${cardapio.ch}</p>
            <a href="${cardapio.url}"><button>Ver detalhes</button></a>
        `;
        ListaCardapio.appendChild(card);
    });
}


/*============================================================
    5) FUNÇÃO PARA BUSCA DE CURSO
  ============================================================
*/
// Chamar uma função que captura a ação do usuário e dispara um evento
buscaCardapio.addEventListener("input", function(){
  // Pega o valor digitado
  const texto = buscaCardapio.value.toLowerCase(); // pega o valor digitado no input e deixa tudo minúsculo

  const filtrados = Cardapio.filter((cardapio) => 
    // Para cada CURSO:
  // curso.titulo -> acesso título (chave JSON)
  // toLowerCase() -> padroniza comparação
  // includes(texto) -> verifica se o texto digitado está dentro do título
  // retorna true (entra no filtro) ou false (e ignorado)
    curso.titulo.toLowerCase().includes(texto)
  
  )

// Reenderizar a tla com novalista filtrada
renderizarCardapio(filtrados);
});




/*============================================================
    6) INICIA TUDO
  ============================================================
*/
carregarCardapio();