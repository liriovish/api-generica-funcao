/**
 * Arquivo para criação da conexão com o banco de dados
 *
 * NodeJS version 16.x
 *
 * @category  JavaScript
 * @package   Api Genérica
 * @author    Equipe Webcartórios <contato@webcartorios.com.br>
 * @copyright 2022 (c) DYNAMIC SYSTEM e Vish! Internet e Sistemas Ltda. - ME
 * @license   https://github.com/dynamic-system-vish/api-whatsapp/licence.txt BSD Licence
 * @link      https://github.com/dynamic-system-vish/api-whatsapp
 * @CriadoEm  14/11/2024
 */

/**
 * Configurações globais
 */
const mongoose = require('mongoose');
const  { Sequelize } = require('sequelize');


/**
* Instancia banco de dados
* @var  object dbInstance
*/
let dbInstance;

/**
 * Função para a conexão no banco de dados
 * @returns object 
*/
const initDatabase = async () => {
  
    if (process.env.DATABASE === 'mongodb') {
        try {
            /**
             * Dados de conexão mongodb
             * @var string sMongoURI
             */
            const sMongoURI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOSTNAME}/${process.env.DB_NAME}?retryWrites=true&w=majority`;

            await mongoose.connect(sMongoURI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });

            console.log('Conexão com MongoDB Atlas realizada com sucesso!');
            dbInstance = mongoose;
        } catch (error) {
            console.error('Erro ao conectar ao MongoDB:', error);
            throw error;  
        } 
    } else {
        try {
             /**
             * Conexão Sql
             * 
             */
            dbInstance = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
                host: process.env.DB_HOSTNAME,
                port: process.env.DB_PORT,
                dialect: process.env.DATABASE,
                logging: false,  
            });
            await dbInstance.authenticate();
            console.log('Conexão com MySQL realizada com sucesso!');
        } catch (error) {
            console.error('Erro ao conectar ao MySQL:', error);
            throw error;  
        }
    }

    return dbInstance;
};


const getDatabase = () => dbInstance;
module.exports = {initDatabase, getDatabase};

