import { User } from "../entity/User";
import {getConnection} from "typeorm";
import { UserEncode } from "../entity/UserEncode";

export default class DBService {
    static getUserByAuth0Id(auth0Id: string): Promise<User> {
        return getConnection()
            .createQueryBuilder(User, "user")
            .where("user.auth0Id = :auth0Id", { auth0Id })
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

    static async createUserEncode(user: User, videoName: string): Promise<UserEncode> {
        const insert = await getConnection()
            .createQueryBuilder()
            .insert()
            .into(UserEncode)
            .values({
                user,
                videoName,
            })
            .execute();
        console.log(insert);
        return await this.getUserEncodeById(insert.raw[0].id);
    }

    static getEncodingsForUser(user: User): Promise<UserEncode[]> {
        return getConnection()
            .createQueryBuilder(UserEncode, "user_encode")
            .where("user_encode.user_id = :id", { id: user.id })
            .getMany();
    }
}