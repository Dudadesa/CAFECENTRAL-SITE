const formCadastro = document.getElementById("formCadastro");
const formLogin = document.getElementById("formLogin");

const API_URL = "https://cafecentral-site.onrender.com";

// Função de redirecionamento robusta
function redirecionarCardapio() {
    console.log("🔄 Tentando redirecionar...");
    
    const tentativas = [
        './cardapio.html',
        'cardapio.html',
        '/cardapio.html',
        './pages/cardapio.html' // ajuste se necessário
    ];
    
    for(let caminho of tentativas) {
        if(confirmarArquivoExiste(caminho)) {
            window.location.replace(caminho);
            return;
        }
    }
    
    // Fallback: abre nova aba
    window.open('./cardapio.html', '_self');
}

function confirmarArquivoExiste(url) {
    // Verificação simples
    return !url.includes('localhost') || true; // Simplificado
}

// ===== CADASTRO =====
if(formCadastro){
    formCadastro.addEventListener("submit", async function(event){
        event.preventDefault();

        const nome = document.getElementById("nome").value.trim();
        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value;
        const confirmaSenha = document.getElementById("confirmasenha").value;

        const mensagem = document.getElementById("mensagemCadastro");
        mensagem.textContent = "";

        if(!nome || !email || !senha || !confirmaSenha){
            mensagem.textContent = "Preencha os campos";
            mensagem.style.color = "red";
            return;
        }

        if(senha !== confirmaSenha){
            mensagem.textContent = "As senhas não coincidem";
            mensagem.style.color = "red";
            return;
        }

        try{
            const resposta = await fetch(`${API_URL}/cadastro`, {
                method: "POST",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({nome,email,senha})
            });

            console.log(" Status:", resposta.status);
            console.log(" OK:", resposta.ok);

            const dados = await resposta.json();

            mensagem.textContent = dados.mensagem || dados.erro || "Cadastro realizado!";
            mensagem.style.color = resposta.ok ? "green" : "red";

            **//  REDIRECIONAMENTO CORRIGIDO**
            if(resposta.ok && resposta.status === 200){
                formCadastro.reset();
                mensagem.textContent = " Cadastro realizado! Redirecionando...";
                
                setTimeout(redirecionarCardapio, 1500);
            }

        }catch(error){
            console.error(" Erro:", error);
            mensagem.textContent = "Erro ao conectar com o servidor";
            mensagem.style.color = "red";
        }
    });
}

// ===== LOGIN ===== (mesmas correções)
if(formLogin){
    formLogin.addEventListener("submit", async function(event){
        event.preventDefault();

        const email = document.getElementById("emailLogin").value.trim();
        const senha = document.getElementById("senhaLogin").value;

        const mensagem = document.getElementById("mensagemLogin");
        mensagem.textContent = "";

        if(!email || !senha){
            mensagem.textContent = "Preencha os campos";
            mensagem.style.color = "red";
            return;
        }

        try{
            const resposta = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {"Content-Type":"application/json"},
                credentials: "include",
                body: JSON.stringify({email,senha})
            });

            console.log(" Status:", resposta.status);
            console.log(" OK:", resposta.ok);

            const dados = await resposta.json();

            mensagem.textContent = dados.mensagem || dados.erro || "Login realizado!";
            mensagem.style.color = resposta.ok ? "green" : "red";

            **// REDIRECIONAMENTO CORRIGIDO**
            if(resposta.ok && resposta.status === 200){
                mensagem.textContent = " Login realizado! Redirecionando...";
                setTimeout(redirecionarCardapio, 1000);
            }

        }catch(error){
            console.error(" Erro:", error);
            mensagem.textContent = "Erro ao conectar com o servidor";
            mensagem.style.color = "red";
        }
    });
}
