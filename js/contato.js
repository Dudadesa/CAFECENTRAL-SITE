/* 
===============================================
1 PARTE - CAPTURAR OS DADOS DO FORM NO HTML
===============================================
*/
// 1. Pega o formulário pelo ID que colocamos no HTML
const form = document.getElementById("formContato");

// 2. Chama função para ficar "ouvindo" o momento que o 
//usuário clicar no botão Enviar
form.addEventListener("submit", async function(event){
    // 3. Impedir que a página recarregue
        //(comportamento padrão da tag form)
    event.preventDefault(); 

    // 4. Lê e salva o que o usuário digitou em cada campo
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const mensagem = document.getElementById("mensagem").value;

    // 5. Agrupa os dados em um "objeto js"(como uma caixa organizadora)
    const novaMensagem = {nome, email, mensagem};

    /* 
    ===============================================
    2 PARTE - TRATAR E ENVIAR OS DADOS PARA O SERVIDOR
    ===============================================
    */
    try{
        const token = localStorage.getItem("token");

        // 6. Envia os dados para o servidor usando fetch()
        const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
            ? "http://localhost:3000"
            : "https://cafecentral-site.onrender.com";
        const resposta = await fetch(`${API_URL}/mensagem`, {
            method:"POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify(novaMensagem)
        });
        
        // 7. Lê a resposta que o servidor enviou de volta
        const dados = await resposta.json();

        if (!resposta.ok) {
            alert(dados.erro || "Erro ao enviar mensagem.");
            return;
        }
    
        // 8. Mostra a resposta para o usuário
        alert(dados.mensagem);
        
        // 9. Limpa os campos do formulário após o envio
        form.reset();
        
        }catch(erro){
            // 10. Se algo der errado, avisa o usuário
            alert(`Erro: ${erro}`);
        };
        
});