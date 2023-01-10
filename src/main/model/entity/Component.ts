import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Version } from './Version';

@Table({tableName:'Component', modelName:'Component'})
export class Component extends Model {
  @Column({type: DataType.INTEGER, primaryKey: true, autoIncrement: true})
  id: number;

  @Column({type:DataType.STRING})
  name: string;


  @Column({type:DataType.STRING})
  purl: string;

  @HasMany(() => Version)
  versions: Version[];


}
