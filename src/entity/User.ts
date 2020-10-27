import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";
import {UserEncode} from './UserEncode';

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

    @OneToMany(() => UserEncode, encoding => encoding.user)
    encodings: UserEncode[];
}
