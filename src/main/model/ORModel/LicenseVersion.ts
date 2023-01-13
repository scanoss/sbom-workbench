import { Table, Column, Model, ForeignKey, DataType } from 'sequelize-typescript';
import { Version } from './Version';
import { License } from './License';

@Table({tableName:'LicenseVersion', modelName:'LicenseVersion'})
export class LicenseVersion extends Model{

  @ForeignKey(() => License)
  @Column({type:DataType.INTEGER})
  licenseId: number;

  @ForeignKey(() => Version)
  @Column({type:DataType.INTEGER})
  versionId: number;

}
