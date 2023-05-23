'use strict';

const pg = require('pg');

const pool = new pg.Pool({
  host: '/var/run/postgresql',
  port: 5432,
  database: 'example',
  user: 'marcus',
  password: 'marcus',
});
pool.connect();
module.exports = (table) => ({
  
  async query(sql, args) {
    const start = Date.now()
    const res = await pool.query(sql, args);
    const duration = Date.now() - start;
    console.log('executed query', { sql, args, duration, rows: res.rowCount })
    // console.log(sql, args);
    return res;
  },

  async read(id, fields = ['*']) {
    const names = fields.join(', ');
    const sql = `SELECT ${names} FROM ${table}`;
    if (!id) return pool.query(sql);
    //console.log(`${sql} WHERE id = $1`, [id]);
    const start = performance.now();
    const res = await pool.query(`${sql} WHERE id = $1`, [id]);
    const duration = performance.now() - start;
    console.log('executed query', { sql, duration, rows: res.rowCount })
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
