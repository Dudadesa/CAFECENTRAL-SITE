/* 
===============================================
1 PARTE - CONFIGURAR O SERVIDOR
===============================================
*/

//importar as credenciais do banco
require("dotenv").config();

// 1. Importar o Express - ele cria e gerencia o servidor
const express = require("express");

// 2. Importar o CORS - permite que o navegador "converse" com o servidor
const cors = require("cors");

// 3. importa o session que permite gerenciar sessoes de usuario
const session = require("express-session"); 

// 4. importa o bcryptjs -  para criptografia e compara senhas 
const bcrypt = require("bcryptjs");

// 5. importa a conexao com o banco de dados
   const pool = require("./db.js");

// 6. Cria o servidor (como ligar um pc por ex)
const app = express();

// 7. cria  uma lista de instancia de conexoes
const listOrigins = [
    "http://localhost:5500", // ambiente local (live server)
    "http://127.0.0.1:5500", // variacao de localhost
    "http://Dudadesa.github.io" // dominio do fronend em producao
]

// 8. Ativa o CORS - libera a comunicação entre front-end e back-end
app.use(cors({
    origin: listOrigins, //so aceita requisicoes dessas origens
    credentials:true, //permite o envio de cookies entre dominios
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    //metodos permitidos
    allowedHeaders: ["Content-Type", "Authorization"] //cabecalhos aceitos
}));

// 9. Ativa o leitor de JSON - permite entender os dados recebidos
// Sem isso, o servidor não consegue ler o que o formulário envia
app.use(express.json());

// 10. Configuracao de Sessao  (do navegador)
const sessionConfig = {
    secret: process.env.SESSION_SECRET, // chave secreta para assinar o cookie
    resave: false, //nao salva a sessao se nao houver mudanca
    saveUninitialized: false,
    // nao cria sessao para usuarios nao logados
    name: "cafecentral.sid",
    // nome personalizado do cookir da sessao
    cookie:{
        httpOnly : true, //bloqueia o acesso via JavaScript
        maxAge: 100 * 60 * 60 // sessao expira em 1 hora (em mil)
    }
}

// 11. Separa o ambiente de teste(localhost) do de producao(render)
if(process.env.NODE_ENV == "production") { // ambiente de producao
    app.set("trust proxy",1), // confia no prox do render
    sessionConfig.cookie.sameSite = "none" // necessario para os cookies
    sessionConfig.cookie.secure = true // cookie so trafega em http
} else{ //ambiente de desenvolvimento(teste)
    sessionConfig.cookie.sameSite="lax", //funciona em localhost sem HTTPS
    sessionConfig.cookie.secure =false // permite cookie sem HTTPS local

}

app.use(session(sessionConfig)) // configura a sessao no servidor

/* 
===============================================
2 PARTE - CRIAR ROTA E INICIAR
===============================================
*/
// 1. Define a rota POST "/mensagem"
// Quando o formulário enviar os dados para /mensagem, essa função roda
app.post("/mensagem", (req,res) => {
    try{
     //7. req.body contém os dados enviados pelo formulário
        //(nome,email, mensagem)
    const nome = req.body.nome;
    const email = req.body.email;
    const mensagem = req.body.mensagem;

    //8. valida se as variaveis estao preenchidas
    if(!nome || !email || !mensagem){
        return res.status(400).json({mensagem:"Preencha todos os  campos"});
    }
    //9. faz comando sql de insercao
    pool.execute("INSERT INTO tb_mensagem(nome,email,mensagem) VALUES(?,?,?)",[nome,email,mensagem]);

    //10. o servidor envia uma mensagem de volta no formato JSON
    res.status(201).json({mensagem: "Mensagem enviada com sucesso!"});


    //11. Envia uma mensagem de volta para o navegador
    res.send("Mensagem recebida com sucesso!");

    } catch (error){
        console.error(error);
    }
});


// 2. Define a rota POST "/cadastro"
// aponta para cadastro.html
app.post("/cadastro",  async(req,res) => {
    try{
        //const nome = req.body.nome
        //const email = req.body.email // forma manual
        //const senha = req.body.senha

        const{nome,email,senha} = req.body // forma estruturada

        if("!nome || !email || !senha"){

            return res.status(400).json({erro:"Preencha todos os campos"});
        }
            //Crio um arraw[rows] e guardo dentro o resultado do select
            const [rows] = await pool.execute( //consulta no banco
            "SELECT id FROM tb_usuario WHERE email=?",[email] // Busca se o e-mail existe no banco e retorna o id

            );
        
        if(rows.length > 0){
        return res.status(409).json({erro: "E-mail ja cadastrado"})

        }
        //criptgrafa a senha e uarda dentro da variavel
        const senhaHash = await bcrypt.hash(senha,10) //gera o hash da senha com o custo 10(mais seguro)

        //inserir os dados no banco de dados
         await pool.execute(//executa o INSERT no banco
        "INSERT INTO tb_usarios(nome,email,senha) VALUES(?,?,?)",
            [nome,email,senhaHash]  //substitui os ? pelos valores reais
            );
            
    }catch(error){
        	//retorna 500 se o servidor
        console.error(error); // o erro aperce completo permitindo ver exaatamente oq falhou
        res.status(500).json({erro: "Erro ao cadastrar usuario"})
    }
})





// 2. Define a rota POST "/login"
// aponta para login.html
app.post("/login",  async(req,res) => {
    try{
        //const email = req.body.email // forma manual
        //const senha = req.body.senha

        const{nemail,senha} = req.body // forma estruturada

        if("!nome || !email || !senha"){

            return res.status(400).json({erro:"Preencha todos os campos"});
        }
            //Crio um arraw[rows] e guardo dentro o resultado do select
            const [rows] = await pool.execute( //consulta no banco
            "SELECT id, nome, email, senha FROM tb_usuario WHERE email=?",[email] // Busca se o e-mail existe no banco e retorna o id

            );
        
        if(rows.length == 0){
        return res.status(401).json({erro: "Usuario nao encontrado"})

        }

        const usuario = rows[0]//pega o primeiro (e unico) resultado de consulta


        //descriptgrafa a senha e guarda dentro da variavel
        const senhaCorreta = await bcrypt.compare(senha,usuario.senha)
        //compara a senha digitada com a senha hash salvo no banco (true/false)

        if(!senhaCorreta){
            //senha hash for diferente da senha digitada
            return res.status(401).json({ erro: "Senha invalida"}); // 401 - acesso nao autorizado
        };

        req.session.usuario = {
            //cria a sessao no servidor com os dados do usuario
            id: usuario.id, //ID interno do usuario
            nome: usuario.nome,// nome para exibir  na interface
            email: usuario.email// email para referencia futura
        }

        res.json({mensagem: "Login relizado com sucesso!"});
        //status=200

       
    }catch(error){
        	//retorna 500 se o servidor
        console.error(error); // o erro aperce completo permitindo ver exaatamente oq falhou
        res.status(500).json({erro: "Erro ao fazer login"});
    }
})


// 4. Define a rota get "/me" - verificar sessão
app.get("/me", (req, res) => {
    if(!req.session.usuario){
        return res.status(401).json({logado:false});
    }

    res.json({
        logado:true, // confirma que esta logado
        usuario: req.session.usuario // devolve os dados do usuário (nome,email,id)
    })
});


// 5. Define a rota post "/logout" - encerrar sessao
app.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("cafecentral.sid");
        res.json({mensagem: "Logout realizado"});
    });

});



// 9. Inicia o Servidor na PORTA 3000
// Depois, o servidor fica "ouvindo" por novas mensagens
app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});