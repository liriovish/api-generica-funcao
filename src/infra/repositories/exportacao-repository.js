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
const Exportacoes = require('../models/exportacoes-mongo');
const {getDatabase} = require('../../config/database')
const ExportacaoSql = require('../models/exportacoes-sql')
const db = require('../models')
const mongoose = require('mongoose');

/**
 * Classe ExportRepository
 * 
 * @package  src\infra\repositories
 */
module.exports = class ExportRepository {

    /**
     * Função para inserir caminho do arquivo no banco
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
            let oDados ;
            if (process.env.DATABASE === 'mongodb') {
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
                 oDados = await dbExportacoes.updateOne(
                    {
                        hash: sHash
                    },
                    {
                        $set: {
                        caminhoArquivo: sCaminho
                        }
                    }
                )
           } else {
                 /**
                 * Instancia banco de dados sql
                 */ 
                 const sequelize = getDatabase();
                 /**
                  * Cria um novo registro no SQL
                  * 
                  * @var {object} oExportacao
                  */
                 const dbExportacao = await db.ExportacaoSql(sequelize);
                 /**
                 * Atualiza no banco de dados
                 * 
                 * @var object oDados
                 */
                 oDados = await dbExportacao.update({  caminhoArquivo: sCaminho}, {where:{hash: sHash}})
           }
            return oDados
        } catch (error) {
            console.log(error)
        }
    }

    /**
     * Função para buscar dados
     * 
     * @async
     * @function buscarDados
     * 
     * @param array aFiltros
     * @param string sNomeTabela
     * 
     * @return object Retorna os dados do arquivo ou null
     */
    static async buscarDados(sNomeTabela, aFiltros) {
        try {
          let oDados;

          if (process.env.DATABASE === 'mongodb') {
            /**
             * Busca tabela pelo nome no banco
             * @var {object} oTabela
             */
            const oTabela = mongoose.connection.db.collection(sNomeTabela);
            
            if (!oTabela) {
              throw new Error('Tabela não encontrada no banco de dados.');
            }
    
            let oBusca = {};
    
            // Aplica filtros, se fornecidos
            if (aFiltros.aCampo && aFiltros.aTipoFiltro && aFiltros.aValor) {
              aFiltros.aCampo.forEach((field, index) => {
                oBusca[field] = { [`$${aFiltros.aTipoFiltro[index]}`]: aFiltros.aValor[index] }; 
              });
            }
    
            // Retorna dados da tabela
            oDados = await oTabela.find(oBusca).toArray();
          } else {
            // Conexão com MySQL usando Sequelize
            const sequelize = getDatabase();
            
            // Busca os dados da tabela sem filtros
            const [results] = await sequelize.query(`SELECT * FROM ${sNomeTabela}`);
            oDados = results;
          }
    
          return oDados;
        } catch (error) {
          console.error('Erro ao buscar dados:', error);
          throw error;
        }
      }
    
}
