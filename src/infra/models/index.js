/**
 * Classe para realizar o export das classes da modelagem do banco de dados
 *
 * NodeJS version 16.x
 *
 * @category  JavaScript
 * @package   Api Gen�rica
 * @author    Equipe Webcartórios <contato@webcartorios.com.br>
 * @copyright 2022 (c) DYNAMIC SYSTEM e Vish! Internet e Sistemas Ltda. - ME
 * @license   https://github.com/dynamic-system-vish/api-whatsapp/licence.txt BSD Licence
 * @link      https://github.com/dynamic-system-vish/api-whatsapp
 * @CriadoEm  14/11/2024
 */

/**
 * Configurações globais
 */
const ExportacaoMongo = require('./exportacoes-mongo')
const ExportacaoSql = require('./exportacoes-sql')

/**
 * Realiza o export das classes de geração dos erros
 */
module.exports = {
   ExportacaoMongo,
   ExportacaoSql
}