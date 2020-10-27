import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn, ManyToOne} from "typeorm";
import { User } from "./User";

@Entity()
export class UserEncode {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.encodings)
    user: User;

    @Column()
    videoName: string;

    @CreateDateColumn()
    created: string;
}
