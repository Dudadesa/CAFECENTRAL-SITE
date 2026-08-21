/*
===============================================
1 PARTE - CONFIGURAR O SERVIDOR
===============================================
*/

// Carrega as variáveis do arquivo .env
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./db.js");
const { createServer } = require("http");

// =============================================
// VERIFICAÇÃO DAS VARIÁVEIS DE AMBIENTE
// =============================================

const JWT_SECRET = process.env.JWT_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

if (!JWT_SECRET) {
    console.error("ERRO: JWT_SECRET não foi definido no arquivo .env");
    process.exit(1);
}

if (!SESSION_SECRET) {
    console.error("ERRO: SESSION_SECRET não foi definido no arquivo .env");
    process.exit(1);
}

// =============================================
// CRIAÇÃO DO SERVIDOR
// =============================================

const app = express();
const httpServer = createServer(app);

// =============================================
// CORS
// =============================================

const listOrigins = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "https://dudadesa.github.io"
];

app.use(
    cors({
        origin: listOrigins,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

// =============================================
// LEITOR DE JSON
// =============================================

app.use(express.json());

// =============================================
// CONFIGURAÇÃO DA SESSÃO
// =============================================

const sessionConfig = {
    secret: SESSION_SECRET,

    resave: false,

    saveUninitialized: false,

    name: "cafecentral.sid",

    cookie: {
        httpOnly: true,

        // 1 hora
        maxAge: 1000 * 60 * 60,

        sameSite: "lax",

        secure: false
    }
};

// =============================================
// PRODUÇÃO / DESENVOLVIMENTO
// =============================================

if (process.env.NODE_ENV === "production") {

    app.set("trust proxy", 1);

    sessionConfig.cookie.sameSite = "none";

    sessionConfig.cookie.secure = true;

} else {

    sessionConfig.cookie.sameSite = "lax";

    sessionConfig.cookie.secure = false;
}

// Ativa as sessões
app.use(session(sessionConfig));


// =============================================
// 2 PARTE - MIDDLEWARE DE AUTENTICAÇÃO JWT
// =============================================

function autenticar(req, res, next) {

    const authHeader = req.headers["authorization"];

    const token =
        authHeader && authHeader.split(" ")[1];

    if (!token) {

        return res.status(401).json({
            erro: "Acesso negado. Token nao fornecido."
        });
    }

    try {

        const decoded = jwt.verify(
            token,
            JWT_SECRET
        );

        req.usuario = {
            id: decoded.id,
            nome: decoded.nome,
            email: decoded.email
        };

        next();

    } catch (error) {

        return res.status(401).json({
            erro: "Token invalido ou expirado."
        });
    }
}


// =============================================
// 3 PARTE - ROTA DE MENSAGEM
// =============================================

app.post("/mensagem", autenticar, async (req, res) => {

    try {

        const {
            nome,
            email,
            mensagem
        } = req.body;

        if (!nome || !email || !mensagem) {

            return res.status(400).json({
                erro: "Preencha todos os campos"
            });
        }

        await pool.execute(
            `
            INSERT INTO tb_mensagem
            (nome, email, mensagem)
            VALUES (?, ?, ?)
            `,
            [nome, email, mensagem]
        );

        return res.status(201).json({
            mensagem: "Mensagem enviada com sucesso!"
        });

    } catch (error) {

        console.error(
            "Erro ao enviar mensagem:",
            error
        );

        return res.status(500).json({
            erro: "Erro ao enviar mensagem"
        });
    }
});


// =============================================
// 4 PARTE - ROTA DE CADASTRO
// =============================================

app.post("/cadastro", async (req, res) => {

    try {

        const {
            nome,
            email,
            senha
        } = req.body;

        if (!nome || !email || !senha) {

            return res.status(400).json({
                erro: "Preencha todos os campos"
            });
        }

        console.log("Cadastro recebido:", {
            nome,
            email
        });

        // Verifica se o usuário já existe
        const [rows] = await pool.execute(
            "SELECT id FROM tb_usuario WHERE email = ?",
            [email]
        );

        if (rows.length > 0) {

            return res.status(409).json({
                erro: "E-mail ja cadastrado"
            });
        }

        // Criptografa a senha
        const senhaHash = await bcrypt.hash(
            senha,
            10
        );

        // Salva o usuário
        const [resultado] = await pool.execute(
            `
            INSERT INTO tb_usuario
            (nome, email, senha)
            VALUES (?, ?, ?)
            `,
            [nome, email, senhaHash]
        );

        const novoUsuario = {
            id: resultado.insertId,
            nome,
            email
        };

        // Gera JWT
        const token = jwt.sign(
            novoUsuario,
            JWT_SECRET,
            {
                expiresIn: JWT_EXPIRES_IN
            }
        );

        return res.status(201).json({

            mensagem: "Usuario cadastrado com sucesso!",

            token,

            usuario: novoUsuario
        });

    } catch (error) {

        console.error(
            "Erro ao cadastrar usuario:",
            error
        );

        return res.status(500).json({
            erro: "Erro ao cadastrar usuario"
        });
    }
});


// =============================================
// 5 PARTE - ROTA DE LOGIN
// =============================================

app.post("/login", async (req, res) => {

    try {

        const {
            email,
            senha
        } = req.body;

        if (!email || !senha) {

            return res.status(400).json({
                erro: "Preencha todos os campos"
            });
        }

        // Procura o usuário pelo e-mail
        const [rows] = await pool.execute(
            `
            SELECT id, nome, email, senha
            FROM tb_usuario
            WHERE email = ?
            `,
            [email]
        );

        if (rows.length === 0) {

            return res.status(404).json({
                erro: "Usuario nao encontrado"
            });
        }

        const usuario = rows[0];

        // Compara a senha digitada com o hash
        const senhaCorreta = await bcrypt.compare(
            senha,
            usuario.senha
        );

        if (!senhaCorreta) {

            return res.status(400).json({
                erro: "Senha invalida"
            });
        }

        // Dados públicos do usuário
        const dadosUsuario = {

            id: usuario.id,

            nome: usuario.nome,

            email: usuario.email
        };

        // Gera o token
        const token = jwt.sign(
            dadosUsuario,
            JWT_SECRET,
            {
                expiresIn: JWT_EXPIRES_IN
            }
        );

        console.log(
            "Login realizado:",
            dadosUsuario.email
        );

        return res.json({

            mensagem: "Login realizado com sucesso!",

            token,

            usuario: dadosUsuario
        });

    } catch (error) {

        console.error(
            "Erro ao fazer login:",
            error
        );

        return res.status(500).json({
            erro: "Erro ao fazer login"
        });
    }
});


// =============================================
// 6 PARTE - ROTA /ME
// =============================================

app.get("/me", autenticar, (req, res) => {

    return res.json({

        logado: true,

        usuario: req.usuario
    });
});


// =============================================
// 7 PARTE - INICIAR SERVIDOR
// =============================================

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {

    console.log(
        `Servidor rodando em http://localhost:${PORT}`
    );
});