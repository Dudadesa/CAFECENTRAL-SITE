// URL da API (Ajustada sem o erro do &quot)
const API_URL = "https://cafecentral-site.onrender.com";

const formCadastro = document.getElementById("formCadastro");
const formLogin = document.getElementById("formLogin");

// --- LÓGICA DE CADASTRO ---
if (formCadastro) {
    formCadastro.addEventListener("submit", async function(event) {
        event.preventDefault();
        
        const nome = document.getElementById("nome").value.trim();
        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value;
        const confirmaSenha = document.getElementById("confirmasenha").value;
        const mensagem = document.getElementById("mensagemCadastro");

        mensagem.textContent = "";

        if (!nome || !email || !senha || !confirmaSenha) {
            mensagem.style.color = "red";
            mensagem.textContent = "Preencha todos os campos do Café Central!";
            return;
        }

        if (senha !== confirmaSenha) {
            mensagem.style.color = "red";
            mensagem.textContent = "As senhas não coincidem.";
            return;
        }

        try {
            const resposta = await fetch(`${API_URL}/cadastro`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, email, senha })
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                mensagem.style.color = "red";
                mensagem.textContent = dados.mensagem || dados.erro;
                return;
            }

            mensagem.style.color = "green";
            mensagem.textContent = "Cadastro realizado! Bem-vindo ao Café Central.";
            formCadastro.reset();

        } catch (error) {
            console.error(error);
            mensagem.textContent = "Erro ao conectar com o servidor do Café.";
        }
    });
}

// --- LÓGICA DE LOGIN ---
if (formLogin) {
    formLogin.addEventListener("submit", async function(event) {
        event.preventDefault();

        const email = document.getElementById("emailLogin").value.trim();
        const senha = document.getElementById("senhaLogin").value;
        const mensagem = document.getElementById("mensagemLogin");

        mensagem.textContent = "";

        if (!email || !senha) {
            mensagem.style.color = "red";
            mensagem.textContent = "Por favor, informe seu e-mail e senha.";
            return;
        }

        try {
            const resposta = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, senha })
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                mensagem.style.color = "red";
                mensagem.textContent = dados.mensagem || "Erro ao fazer login.";
                window.location.href = "../pages/cardapio.html"; 
                return;
            }

            // SALVAR DADOS NO NAVEGADOR
            // Salva o token para o usuário continuar logado
            localStorage.setItem("token", dados.token);
            localStorage.setItem("usuario", JSON.stringify(dados.usuario));

            mensagem.style.color = "green";
            mensagem.textContent = "Login efetuado! Redirecionando...";

            // Redireciona para o cardápio após 1.5 segundos
            if(resposta.ok) {
                window.location.href = "../pages/cardapio.html"; 
            };

        } catch (error) {
            console.error(error);
            mensagem.style.color = "red";
            mensagem.textContent = "Servidor indisponível no momento.";
        }
    });
}