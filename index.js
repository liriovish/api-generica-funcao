const amqp = require('amqplib');
// import dotenv from 'dotenv';
const path = require('path')
const fs = require('fs')
require("dotenv").config();
const database = require('./src/config/database.js'); 
const mongoose = require('mongoose');
const sequelize = require('sequelize')
const { MongoExportacao, defineExportacaoSQL } = require('./src/infra/models/Model.js');
const { hash } = require('crypto');
const ExportacaoRepository = require('./src/infra/repositories/exportacao-repository.js')

async function run() {
    try {
        console.log('RabbitMQ: ', process.env.HOST_RABBITMQ)
        // console.log(process.env);
        /**
         * Define a senha do RabbitMQ
         * 
         * @var {string} sPassRabbitMq
         */
        const sPassRabbitMq = encodeURIComponent(process.env.PASS_RABBITMQ);

        /**
         * Define a conexÃ£o do RabbitMQ
         */
        const oConexaoRabbitMQ = await amqp.connect(
            `amqp://${process.env.USER_RABBITMQ}:${sPassRabbitMq}@${process.env.HOST_RABBITMQ}:${process.env.PORT_RABBITMQ}`
        )

        /**
         * Cria o canal de comunicaÃ§Ã£o
         */
        const oChannel = await oConexaoRabbitMQ.createChannel()

        /**
         * Define o nome da fila
         *
         * @var {string} sNomeFila
         */
        const sNomeFila = process.env.NOME_FILA_RABBITMQ ?? 'exportar.tif'
   
        /**
         * Valida a fila
         */
        await oChannel.assertQueue(
            sNomeFila,
            { durable: true, autoDelete: false }
        )

        /**
         * Define o nÃºmero de mensagens para processamento
         */
        oChannel.prefetch(1);
        
        /**
         * Consome as mensagens da fila
         */
        return oChannel.consume(
            sNomeFila,
            async (msg) => {
                /**
                 * Realiza a comunicaÃ§Ã£o da mensagem
                 */
                await main(JSON.parse(msg.content.toString()))

                /**
                 * ConfirmaÃ§Ã£o de que a mensagem foi processada
                 */
                oChannel.ack(msg);
            },
            { noAck: false }
        )
    } catch (error) {
        console.log('Erro ao conectar ao RabbitMQ: ', error)
    }
}
run();


async function main(message) {	
    try {
        console.log('Processando exportação:', message);

        const exportacaoHash = message.hash;
        const nomeTabela = message.nomeTabela;
        const filtros = message.filtros;


    
            // Pegando os parâmetros da query
            const {campo, tipoFiltro, valor} = filtros;
            await database.initDatabase();
            const db = database.getDatabase();
            let dados;
        
            try {
                if (process.env.SIGLA_DB === 'mongodb') {
                    // Conectar ao MongoDB e acessar a coleção com o nome fornecido
                    const collection = mongoose.connection.db.collection(nomeTabela);
        
                    if (!collection) {
                        return { error: 'Tabela não encontrada no banco de dados.' };
                    }
        
                    let query = {};
        
                    // Aplica filtros, se fornecidos
                    if (campo && tipoFiltro && valor) {
                        campo.forEach((field, index) => {
                            query[field] = { [`$${tipoFiltro[index]}`]: valor[index] };  // Cria o filtro dinâmico
                        });
                    }
        
                    // Realiza a consulta no MongoDB com paginação
                    dados = await collection.find(query).toArray();
        
        
                } else {
                    // Conexão com MySQL usando Sequelize
        
        
                    const sequelize = await db.authenticate();
                    const model = sequelize.models[nomeTabela];  // Acessa o modelo da tabela no Sequelize
        
                    if (!model) {
                        return { error: 'Tabela não encontrada no banco de dados.' };
                    }
        
                    // Busca os dados da tabela sem filtros
                    dados = await model.findAll();
                }
        
               
        
            } catch (error) {
                console.error('Erro ao listar dados:', error);
                res.status(500).json({ error: 'Erro ao listar dados' });
            }
        


        const dadosExportados = JSON.stringify(dados);
        
        const diretorio = process.env.DIRETORIO_ARQUIVOS || './exportacoes';
        const filePath = path.join(diretorio, `${exportacaoHash}.txt`);

        if (!fs.existsSync(diretorio)) {
            fs.mkdirSync(diretorio, { recursive: true });
        }
        fs.writeFileSync(filePath, dadosExportados);
        console.log(diretorio, filePath);
        console.log(`Exportação concluída e salva em ${filePath}`);
        
  
        if (process.env.SIGLA_DB === 'mongodb') {
                // Cria um novo registro no MongoDB
                await ExportacaoRepository.alterarExportacao(exportacaoHash, filePath);
        } else {
                // Se usa MySQL, cria o registro usando Sequelize
                const sequelize = getDatabase();
                const ExportacaoSQL = defineExportacaoSQL(sequelize);
                exportacao = await ExportacaoSQL.update(novaExportacao);
        }


    } catch (error) {
        console.error('Erro ao processar exportação:', error);
}}