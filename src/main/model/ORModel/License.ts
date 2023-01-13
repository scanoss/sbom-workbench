import { Table, Column, Model, DataType, BelongsToMany } from 'sequelize-typescript';
import { License as LicenseEntity } from '@api/types'
import { Version } from './Version';
import { LicenseVersion } from './LicenseVersion';

@Table({tableName:'License', modelName:'License'})
export class License  extends Model implements LicenseEntity {

  @Column({type: DataType.INTEGER, primaryKey: true, autoIncrement: true})
  id: number;

  @Column({type:DataType.STRING})
  spdxid: string;

  @Column({type:DataType.STRING})
  name: string;

  @Column({type:DataType.STRING})
  fulltext: string;

  @Column({type:DataType.STRING})
  url: string;

  @BelongsToMany(() => Version, () => LicenseVersion)
  versions: Version[];

}
