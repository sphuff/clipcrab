import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn, ManyToOne} from "typeorm";
import { User } from "./User";

@Entity()
export class UserEncode {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.encodings, {nullable: true})
    user: User;

    @Column()
    videoName: string;

    @Column({ nullable: true })
    finalEncodingLocation?: string;

    @CreateDateColumn()
    created: string;
}
