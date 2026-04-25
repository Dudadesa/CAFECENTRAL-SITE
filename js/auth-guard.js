const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : "https://cafecentral-site.onrender.com";

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
