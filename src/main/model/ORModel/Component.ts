import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Version } from './Version';
import { GlobalComponent } from '@api/types';

@Table({tableName:'Component', modelName:'Component'})
export class Component extends Model  implements  GlobalComponent {
  @Column({type: DataType.INTEGER, primaryKey: true, autoIncrement: true})
  id: number;

  @Column({type:DataType.STRING})
  name: string;


  @Column({type:DataType.STRING})
  purl: string;

  @HasMany(() => Version)
  versions: Version[];


}
