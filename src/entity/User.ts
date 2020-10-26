import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    auth0Id: string;

    @Column({
        nullable: true,
    })
    numAllowedClipsTotal?: number;
    
    @Column({
        nullable: true,
    })
    numAllowedClipsMonthly?: number;

}
