const API_URL = "http://localhost:3000";

(async function verificarAcesso() {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/me`, {
            headers: { "Authorization": "Bearer " + token }
        });

        if (!resposta.ok) {
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
            window.location.href = "login.html";
        }
    } catch {
        window.location.href = "login.html";
    }
})();
