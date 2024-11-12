/**
 * Arquivo para criação da conexão com o banco de dados
 *
 * NodeJS version 16.x
 *
 * @category  JavaScript
 * @package   WhatsApp
 * @author    Equipe Webcartórios <contato@webcartorios.com.br>
 * @copyright 2022 (c) DYNAMIC SYSTEM e Vish! Internet e Sistemas Ltda. - ME
 * @license   https://github.com/dynamic-system-vish/api-whatsapp/licence.txt BSD Licence
 * @link      https://github.com/dynamic-system-vish/api-whatsapp
 * @CriadoEm  20/10/2022
 */

/**
 * Configurações globais
 */
const mongoose = require('mongoose')

/**
 * Realiza o export da conexão que é utilizada na inícialização da API
 */
module.exports = class MongoDB {
    /**
     * Função para a conexão com o banco de dados
     * 
     * @param string sDatabaseURI 
     */
    static async connect(sDatabaseURI) {
        mongoose.set('strictQuery', true);
        mongoose.connect(sDatabaseURI)

        mongoose.Promise = global.Promise

        module.exports = mongoose
    }    
}
