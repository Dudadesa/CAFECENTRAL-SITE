require("dotenv")
const mysql = require("mysql2/promise");

const pool = mysql.createPool({ //cria um  grupo de conexoes
    host: process.env.DB_HOST, // process => le as credencias do .env
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl:{rejectUnauthorized:false}, // habilita conexao segura com Aiven via SSL
    waitForConnections: true,
    //se todas as conexoes tiverem ocupadas aguarda na fila
    connectionLimit: 10 // maximo de 10 conexoes abertas ao mesmo tempo
})

module.exports = pool //exporta o poll para ser usado no server.js