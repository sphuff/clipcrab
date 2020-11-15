import { User } from "../entity/User";
import {getConnection, UpdateResult} from "typeorm";
import { UserEncode } from "../entity/UserEncode";

export default class DBService {
    static getUserByAuth0Id(auth0Id: string): Promise<User> {
        return getConnection()
            .createQueryBuilder(User, "user")
            .where("user.auth0Id = :auth0Id", { auth0Id })
            .getOne();
    }

    static getUserById(id: number): Promise<User> {
        return getConnection()
            .createQueryBuilder(User, "user")
            .where("user.id = :id", { id })
            .getOne();
    }

    static async createNewUser(auth0Id: string): Promise<User> {
        await getConnection()
            .createQueryBuilder()
            .insert()
            .into(User)
            .values({
                auth0Id: auth0Id,
            })
            .execute();
        return await this.getUserByAuth0Id(auth0Id);
    }

    static getUserEncodeById(id: number): Promise<UserEncode> {
        return getConnection()
            .createQueryBuilder(UserEncode, "user_encode")
            .where("user_encode.id = :id", { id })
            .getOne();
    }

    static updateUserEncodeLocation(id: number, finalEncodingLocation: string): Promise<UpdateResult> {
        console.log('Updating encoding with final location');
        return getConnection()
            .createQueryBuilder(UserEncode, "user_encode")
            .update(UserEncode)
            .set({ finalEncodingLocation: finalEncodingLocation })
            .where("user_encode.id = :id", { id })
            .execute();
    }

    static updateUserEncodeUser(id: number, user: User): Promise<UpdateResult> {
        console.log('Updating encoding with final location');
        return getConnection()
            .createQueryBuilder(UserEncode, "user_encode")
            .update(UserEncode)
            .set({ user })
            .where("user_encode.id = :id", { id })
            .execute();
    }

    static async createUserEncode(user: User|null, videoName: string): Promise<UserEncode> {
        const insert = await getConnection()
            .createQueryBuilder()
            .insert()
            .into(UserEncode)
            .values({
                user,
                videoName,
            })
            .execute();
        console.log('Created user encoding');
        return await this.getUserEncodeById(insert.raw[0].id);
    }

    static getEncodingsForUser(user: User): Promise<UserEncode[]> {
        return getConnection()
            .createQueryBuilder(UserEncode, "user_encode")
            .where("user_encode.user_id = :id", { id: user.id })
            .getMany();
    }
}