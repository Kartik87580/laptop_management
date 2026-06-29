/**
 * db.js – Database layer for LRMS
 *
 * Uses the Neon HTTP SQL API to run queries directly from the browser.
 *
 * Neon HTTP API endpoint format:
 *   POST https://<host>/sql
 *   Authorization: Bearer <api-key>
 *   Body: { "query": "SELECT ...", "params": [...] }
 *
 * Docs: https://neon.tech/docs/serverless/serverless-driver#use-the-neon-serverless-driver-over-http
 *
 * ⚠️ SECURITY NOTE:
 * For personal use this is acceptable. In a public-facing app, proxy
 * calls through a Vercel serverless function to hide the connection string.
 */

import { NEON_CONNECTION_STRING } from './config.js';

/**
 * Execute a parameterised SQL query via the Neon HTTP API.
 *
 * Neon HTTP API accepts:
 *   POST https://<host>/sql
 *   Authorization: Bearer <connection-string>
 *   { "query": "<sql>", "params": [...] }
 *
 * @param {string} sql    – SQL with $1 … $n placeholders
 * @param {Array}  params – Parameter values
 * @returns {Promise<{rows: Array, rowCount: number}>}
 */
async function query(sql, params = []) {
  // Parse host from the connection string
  // Connection string format: postgresql://user:password@host/dbname?sslmode=require
  let host;
  try {
    const url = new URL(NEON_CONNECTION_STRING.replace('postgresql://', 'https://').replace('postgres://', 'https://'));
    host = url.hostname; // e.g. ep-xyz.us-east-2.aws.neon.tech
  } catch {
    throw new Error('Invalid NEON_CONNECTION_STRING in config.js');
  }

  // Neon HTTP SQL API endpoint: replace first subdomain with 'api'
  // This matches what @neondatabase/serverless does internally.
  const apiHost = host.replace(/^[^.]+/, 'api');
  const endpoint = `https://${apiHost}/sql`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Neon-Connection-String': NEON_CONNECTION_STRING,
    },
    body: JSON.stringify({ query: sql, params }),
  });

  if (!response.ok) {
    let msg = `HTTP ${response.status}`;
    try {
      const err = await response.json();
      msg = err.message || err.error || msg;
    } catch { /* ignore */ }
    throw new Error(msg);
  }

  return response.json();
}

/* ─────────────────────────────────────────────────────────
   Repair CRUD helpers
   ───────────────────────────────────────────────────────── */

/**
 * Fetch all repairs, optionally filtered.
 * @param {string} [status]  – Status string or '' for all
 * @param {string} [search]  – Search term across multiple columns
 * @returns {Promise<Array>}
 */
export async function getAllRepairs(status = '', search = '') {
  let sql = `
    SELECT id, job_id, customer_name, phone, brand, model,
           serial_number, status, estimated_amount, received_date, created_at
    FROM repairs WHERE 1=1
  `;
  const params = [];

  if (status) {
    params.push(status);
    sql += ` AND status = $${params.length}`;
  }

  if (search) {
    const term = `%${search}%`;
    params.push(term);
    const i = params.length;
    sql += `
      AND (
        job_id           ILIKE $${i}
        OR customer_name ILIKE $${i}
        OR phone         ILIKE $${i}
        OR brand         ILIKE $${i}
        OR model         ILIKE $${i}
        OR serial_number ILIKE $${i}
      )
    `;
  }

  sql += ' ORDER BY created_at DESC';
  const result = await query(sql, params);
  return result.rows;
}

/**
 * Fetch a single repair by id.
 * @param {number|string} id
 * @returns {Promise<Object|null>}
 */
export async function getRepairById(id) {
  const result = await query('SELECT * FROM repairs WHERE id = $1', [id]);
  return result.rows[0] || null;
}

/**
 * Fetch dashboard stat counts grouped by status.
 * @returns {Promise<Object>}
 */
export async function getDashboardStats() {
  const result = await query(`
    SELECT
      COUNT(*)                                               AS total,
      COUNT(*) FILTER (WHERE status = 'Received')           AS received,
      COUNT(*) FILTER (WHERE status = 'Diagnosing')         AS diagnosing,
      COUNT(*) FILTER (WHERE status = 'Waiting for Parts')  AS waiting_for_parts,
      COUNT(*) FILTER (WHERE status = 'Repairing')          AS repairing,
      COUNT(*) FILTER (WHERE status = 'Ready')              AS ready,
      COUNT(*) FILTER (WHERE status = 'Delivered')          AS delivered
    FROM repairs
  `);
  const r = result.rows[0];
  return {
    total:           parseInt(r.total, 10),
    received:        parseInt(r.received, 10),
    diagnosing:      parseInt(r.diagnosing, 10),
    waitingForParts: parseInt(r.waiting_for_parts, 10),
    repairing:       parseInt(r.repairing, 10),
    ready:           parseInt(r.ready, 10),
    delivered:       parseInt(r.delivered, 10),
  };
}

/**
 * Fetch the 10 most recent repairs for the dashboard.
 * @returns {Promise<Array>}
 */
export async function getRecentRepairs() {
  const result = await query(`
    SELECT id, job_id, customer_name, phone, brand, model, status, received_date
    FROM repairs
    ORDER BY created_at DESC
    LIMIT 10
  `);
  return result.rows;
}

/**
 * Generate the next sequential Job ID (e.g. JOB-0042).
 * @returns {Promise<string>}
 */
export async function generateJobId() {
  const result = await query(`SELECT job_id FROM repairs ORDER BY id DESC LIMIT 1`);
  if (!result.rows.length) return 'JOB-0001';
  const last = result.rows[0].job_id;          // "JOB-0041"
  const num  = parseInt(last.split('-')[1], 10);
  return `JOB-${String(num + 1).padStart(4, '0')}`;
}

/**
 * Create a new repair record.
 * @param {Object} data – Form field values
 * @returns {Promise<Object>} – Created record
 */
export async function createRepair(data) {
  const sql = `
    INSERT INTO repairs (
      job_id, customer_name, phone, alternate_phone,
      brand, model, serial_number, service_tag,
      problem, accessories, technician, estimated_amount,
      repair_notes, status, received_date, received_time,
      delivery_date, delivery_time
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18
    ) RETURNING *
  `;
  const params = [
    data.job_id,             data.customer_name,         data.phone,
    data.alternate_phone || null,
    data.brand,              data.model,                 data.serial_number || null,
    data.service_tag || null,
    data.problem,            data.accessories || null,   data.technician || null,
    parseFloat(data.estimated_amount) || 0,
    data.repair_notes || null, data.status,
    data.received_date,      data.received_time || null,
    data.delivery_date || null, data.delivery_time || null,
  ];
  const result = await query(sql, params);
  return result.rows[0];
}

/**
 * Update an existing repair record.
 * @param {number|string} id   – Record id
 * @param {Object}        data – Updated field values
 * @returns {Promise<Object>}
 */
export async function updateRepair(id, data) {
  const sql = `
    UPDATE repairs SET
      customer_name    = $1,  phone            = $2,  alternate_phone  = $3,
      brand            = $4,  model            = $5,  serial_number    = $6,
      service_tag      = $7,  problem          = $8,  accessories      = $9,
      technician       = $10, estimated_amount = $11, repair_notes     = $12,
      status           = $13, received_date    = $14, received_time    = $15,
      delivery_date    = $16, delivery_time    = $17
    WHERE id = $18
    RETURNING *
  `;
  const params = [
    data.customer_name,   data.phone,           data.alternate_phone || null,
    data.brand,           data.model,           data.serial_number || null,
    data.service_tag || null, data.problem,     data.accessories || null,
    data.technician || null,
    parseFloat(data.estimated_amount) || 0,
    data.repair_notes || null,
    data.status,          data.received_date,   data.received_time || null,
    data.delivery_date || null, data.delivery_time || null,
    id,
  ];
  const result = await query(sql, params);
  return result.rows[0];
}

/**
 * Delete a repair record.
 * @param {number|string} id
 */
export async function deleteRepair(id) {
  await query('DELETE FROM repairs WHERE id = $1', [id]);
}
