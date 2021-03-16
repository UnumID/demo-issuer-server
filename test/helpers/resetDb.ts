import { MikroORM } from '@mikro-orm/core';

export async function resetDb (orm: MikroORM): Promise<void> {
  const { em } = orm;
  const connection = em.getConnection();
  await connection.execute('DELETE FROM "Device";');
  await connection.execute('DELETE FROM "User";');
  await connection.execute('DELETE FROM "Issuer";');
  await connection.execute('DELETE FROM "Credential";');
}
