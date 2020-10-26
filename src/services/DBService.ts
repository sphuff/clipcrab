import { User } from "../entity/User";
import {getConnection} from "typeorm";

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
}