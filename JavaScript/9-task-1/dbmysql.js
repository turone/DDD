'use strict';

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  database: 'example',
  user: 'marcus',
  password: 'marcus123',
});

module.exports = (table) => ({
  
  async query(sql, args) {
    const start = Date.now()
    const res = pool.execute(sql, args);
    const duration = Date.now() - start;
    console.log('executed query', duration)
    // console.log(sql, args);
    return res;
  },

 async read(id, fields = ['*']) {
    const names = fields.join(', ');
    const sql = `SELECT ${names} FROM ${table}`;
    if (!id) return pool.execute(sql);
    //console.log(`${sql} WHERE id = $1`, [id]);
    const start = performance.now();
    const res = await pool.execute(`${sql} WHERE id = ?`, [id]);
    performance.now() - start;
    console.log('executed query', duration);
    return res;

  },

  async create({ ...record }) {
    const keys = Object.keys(record);
    const nums = new Array(keys.length);
    const data = new Array(keys.length);
    let i = 0;
    for (const key of keys) {
      data[i] = record[key];
      nums[i] = `$${++i}`;
    }
    const fields = '"' + keys.join('", "') + '"';
    const params = nums.join(', ');
    const sql = `INSERT INTO "${table}" (${fields}) VALUES (${params})`;
    return pool.query(sql, data);
  },

  async update(id, { ...record }) {
    const keys = Object.keys(record);
    const updates = new Array(keys.length);
    const data = new Array(keys.length);
    let i = 0;
    for (const key of keys) {
      data[i] = record[key];
      updates[i] = `${key} = $${++i}`;
    }
    const delta = updates.join(', ');
    const sql = `UPDATE ${table} SET ${delta} WHERE id = $${++i}`;
    data.push(id);
    return pool.query(sql, data);
  },

  delete(id) {
    const sql = `DELETE FROM ${table} WHERE id = $1`;
    return pool.query(sql, [id]);
  },
});
