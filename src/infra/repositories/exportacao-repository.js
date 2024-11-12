/**
 * Arquivo do composer para montar a comunicação entre a rota, db e outros
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
const Exportacoes = require('../models/exportacoes');

/**
 * Classe WhatsappRepository
 * 
 * @package  src\infra\repositories
 */
module.exports = class WhatsappRepository {

    /**
     * Função para inserir o arquivo no banco de dados
     * 
     * @async
     * @function editarArquivo
     * 
     * @param object oDados
     * 
     * @return object Retorna os dados do arquivo ou null
     */
    static async alterarExportacao(sHash, sCaminho) {
        try { 
            /**
             * Instacia a tabela
             * 
             * @var {mongoose} dbExportacoes
             */ 
            const dbExportacoes = await Exportacoes()

            /**
             * Atualiza no banco de dados
             * 
             * @var object oDados
             */
            const oDados = await dbExportacoes.updateOne(
                {
                    hash: sHash
                },
                {
                    $set: {
                       caminhoArquivo: sCaminho
                    }
                }
            )

            return oDados
        } catch (error) {
            console.log(error)
        }
    }
}
