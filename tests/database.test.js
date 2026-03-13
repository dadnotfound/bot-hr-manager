const Database = require('../lib/database');

describe('Database', () => {
  let db;

  beforeEach(() => {
    db = new Database(':memory:'); // 使用内存数据库进行测试
  });

  afterEach(async () => {
    await db.close();
  });

  describe('insert', () => {
    test('should insert data successfully', async () => {
      await db.initialize(`
        CREATE TABLE IF NOT EXISTS test (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          value INTEGER
        );
      `);

      const id = await db.insert('test', { name: 'test', value: 123 });
      expect(id).toBe(1);
    });
  });

  describe('query', () => {
    test('should query data successfully', async () => {
      await db.initialize(`
        CREATE TABLE IF NOT EXISTS test (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          value INTEGER
        );
      `);

      await db.insert('test', { name: 'test1', value: 123 });
      await db.insert('test', { name: 'test2', value: 456 });

      const rows = await db.query('SELECT * FROM test');
      expect(rows).toHaveLength(2);
      expect(rows[0].name).toBe('test1');
      expect(rows[1].name).toBe('test2');
    });
  });

  describe('update', () => {
    test('should update data successfully', async () => {
      await db.initialize(`
        CREATE TABLE IF NOT EXISTS test (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          value INTEGER
        );
      `);

      await db.insert('test', { name: 'test', value: 123 });
      const changes = await db.update('test', { value: 456 }, { name: 'test' });
      expect(changes).toBe(1);

      const row = await db.get('SELECT * FROM test WHERE name = ?', ['test']);
      expect(row.value).toBe(456);
    });
  });

  describe('delete', () => {
    test('should delete data successfully', async () => {
      await db.initialize(`
        CREATE TABLE IF NOT EXISTS test (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          value INTEGER
        );
      `);

      await db.insert('test', { name: 'test', value: 123 });
      const changes = await db.delete('test', { name: 'test' });
      expect(changes).toBe(1);

      const rows = await db.query('SELECT * FROM test');
      expect(rows).toHaveLength(0);
    });
  });
});
