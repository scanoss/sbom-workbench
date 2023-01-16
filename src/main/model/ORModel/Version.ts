import { Table, Column, Model, HasMany, DataType, ForeignKey, BelongsToMany, BelongsTo } from 'sequelize-typescript';
import { Component } from './Component';
import { License } from './License';
import { LicenseVersion } from './LicenseVersion';
import { Version as VersionEntity } from '../../../api/types';

@Table({tableName:'Version', modelName:'Version'})
export class Version  extends Model implements VersionEntity {

  @Column({type: DataType.INTEGER, primaryKey: true, autoIncrement: true})
  id: number;

  @Column({type:DataType.STRING})
  version: string;

  @Column({type:DataType.STRING})
  url: string;

  @ForeignKey(() => Component)
  @Column({type:DataType.INTEGER, onDelete:'CASCADE'})
  componentId: number;

  @BelongsTo(() => Component)
  component: Component;


  @BelongsToMany(() => License, () => LicenseVersion)
  licenses: License[];

}
