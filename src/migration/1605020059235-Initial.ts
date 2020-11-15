import {MigrationInterface, QueryRunner} from "typeorm";

export class Initial1605020059235 implements MigrationInterface {
    name = 'Initial1605020059235'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_encode" ("id" SERIAL NOT NULL, "videoName" character varying NOT NULL, "finalEncodingLocation" character varying, "created" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_c7326852ce887cecaab724901ac" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "auth0Id" character varying NOT NULL, "numAllowedClipsTotal" integer, "numAllowedClipsMonthly" integer, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_encode" ADD CONSTRAINT "FK_90e237a0ff7883e818575cd6030" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_encode" DROP CONSTRAINT "FK_90e237a0ff7883e818575cd6030"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "user_encode"`);
    }

}
