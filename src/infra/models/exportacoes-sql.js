const { Model, DataTypes } = require('sequelize');

module.exports = async (sequelize) => {
  class ExportacaoSql extends Model {}

  ExportacaoSql.init(
    {
      hash: DataTypes.STRING,
      filtros: {
        type: DataTypes.JSON
      },      situacao: DataTypes.INTEGER,
      tentativasProcessamento: DataTypes.INTEGER,
      caminhoArquivo: DataTypes.STRING,
      dataGeracao: DataTypes.DATE,
      dataExclusao: DataTypes.DATE,
      dataCadastro: DataTypes.DATE,
      dataAtualizacao: DataTypes.DATE
    },
    {
      sequelize,
      modelName: 'ExportacaoSql',
      tableName: 'ExportacaoSql',
      timestamps: true, 
    }
  );
  
  await ExportacaoSql.sync();

  return ExportacaoSql;
};
