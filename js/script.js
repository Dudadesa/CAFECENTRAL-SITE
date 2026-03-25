const form = document.getElementById("formCadastro");

form.addEventListener("submit", function(event) {
    event.preventDefault(); // evita recarregar a página

    let nome = document.getElementById("nome");
    let email = document.getElementById("email");
    let senha = document.getElementById("senha");

    let valido = true;

    // LIMPAR ERROS
    document.querySelectorAll(".erro").forEach(e => e.textContent = "");
    document.querySelectorAll("input").forEach(i => {
        i.classList.remove("erroInput", "sucesso");
    });

    // VALIDAÇÃO NOME
    if (nome.value.trim() === "") {
        document.getElementById("erroNome").textContent = "Digite seu nome";
        nome.classList.add("erroInput");
        valido = false;
    } else {
        nome.classList.add("sucesso");
    }

    // VALIDAÇÃO EMAIL
    if (!email.value.includes("@")) {
        document.getElementById("erroEmail").textContent = "Email inválido";
        email.classList.add("erroInput");
        valido = false;
    } else {
        email.classList.add("sucesso");
    }

    // VALIDAÇÃO SENHA
    if (senha.value.length < 6) {
        document.getElementById("erroSenha").textContent = "Mínimo 6 caracteres";
        senha.classList.add("erroInput");
        valido = false;
    } else {
        senha.classList.add("sucesso");
    }

    // FEEDBACK FINAL
    const mensagem = document.getElementById("mensagem");

    if (valido) {
        mensagem.textContent = "Cadastro realizado com sucesso ☕";
        mensagem.style.color = "green";
        form.reset();
    } else {
        mensagem.textContent = "Corrija os erros acima!";
        mensagem.style.color = "red";
    }
});