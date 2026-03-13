const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

/**
 * Database 类 - SQLite 数据库操作封装
 */
class Database {
  constructor(dbName) {
    const dbDir = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw/data/bot-hr');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    const dbPath = path.join(dbDir, `${dbName}.db`);
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error(`Error opening ${dbName}.db:`, err);
      } else {
        console.log(`Connected to ${dbName}.db`);
      }
    });
  }

  /**
   * 初始化数据库 Schema
   */
  async initialize(schemaPath) {
    return new Promise((resolve, reject) => {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      this.db.exec(schema, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /**
   * 插入数据
   */
  async insert(table, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const sql = `
      INSERT INTO ${table} (${keys.join(', ')})
      VALUES (${keys.map(() => '?').join(', ')})
    `;
    
    return new Promise((resolve, reject) => {
      this.db.run(sql, values, function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }

  /**
   * 查询数据
   */
  async query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  /**
   * 查询单条数据
   */
  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  /**
   * 更新数据
   */
  async update(table, data, where) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const whereKeys = Object.keys(where);
    const whereValues = Object.values(where);
    
    const sql = `
      UPDATE ${table}
      SET ${keys.map(k => `${k} = ?`).join(', ')}
      WHERE ${whereKeys.map(k => `${k} = ?`).join(' AND ')}
    `;
    
    return new Promise((resolve, reject) => {
      this.db.run(sql, [...values, ...whereValues], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }

  /**
   * 删除数据
   */
  async delete(table, where) {
    const whereKeys = Object.keys(where);
    const whereValues = Object.values(where);
    
    const sql = `
      DELETE FROM ${table}
      WHERE ${whereKeys.map(k => `${k} = ?`).join(' AND ')}
    `;
    
    return new Promise((resolve, reject) => {
      this.db.run(sql, whereValues, function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }

  /**
   * 关闭数据库连接
   */
  async close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

module.exports = Database;
