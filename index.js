const amqp = require('amqplib');
const path = require('path')
const fs = require('fs')
require("dotenv").config();
const database = require('./src/config/database.js'); 
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
         * Define a conexão do RabbitMQ
         */
        const oConexaoRabbitMQ = await amqp.connect(
            `amqp://${process.env.USER_RABBITMQ}:${sPassRabbitMq}@${process.env.HOST_RABBITMQ}:${process.env.PORT_RABBITMQ}`
        )

        /**
         * Cria o canal de comunicação
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
         * Define o número de mensagens para processamento
         */
        oChannel.prefetch(1);
        
        /**
         * Consome as mensagens da fila
         */
        return oChannel.consume(
            sNomeFila,
            async (msg) => {
                /**
                 * Realiza a comunicação da mensagem
                 */
                await main(JSON.parse(msg.content.toString()))

                /**
                 * Confirmação de que a mensagem foi processada
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

            const sExportacaoHash = message.hash;
            const sNomeTabela = message.nomeTabela;
            const aFiltros = message.filtros;
        

            /**
             * Instancia banco de dados
             */
            await database.initDatabase();            
            let oDados;

            
            try {
                /**
                 * Busca dados
                 * @var {object} oDados
                 */
                oDados = await ExportacaoRepository.buscarDados(sNomeTabela, aFiltros);
            } catch (error) {
                console.error('Erro ao listar dados:', error);
                return;
            }
        

            /**
             * Salva dados da exportação no diretório
             * @var {object} oDadosExportados
             * @var {string} sDiretorio
             * @var {string} sCaminhoArquivo
             */
            const oDadosExportados = JSON.stringify(oDados);
            
            const sDiretorio = process.env.DIRETORIO_ARQUIVOS || './exportacoes';
            const sCaminhoArquivo = path.join(sDiretorio, `${sExportacaoHash}.txt`);

            if (!fs.existsSync(sDiretorio)) {
                fs.mkdirSync(sDiretorio, { recursive: true });
            }
            fs.writeFileSync(sCaminhoArquivo, oDadosExportados);
            console.log(sDiretorio, sCaminhoArquivo);
            console.log(`Exportação concluída e salva em ${sCaminhoArquivo}`);
            
    
          
            await ExportacaoRepository.alterarExportacao(sExportacaoHash, sCaminhoArquivo);
          


    } catch (error) {
        console.error('Erro ao processar exportação:', error);
}}