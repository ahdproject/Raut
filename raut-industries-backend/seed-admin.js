/**
 * Seed Script - Create Default Admin User
 * 
 * Usage: node seed-admin.js
 * 
 * Creates a default admin user with the following credentials:
 * Email: admin@rautindustries.com
 * Password: Admin@123
 * Role: SuperAdmin
 */

require('dotenv').config()
const bcrypt = require('bcryptjs')
const pool = require('./src/config/db')

const SALT_ROUNDS = 10

const seedAdmin = async () => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Check if admin user already exists
    const existingAdmin = await client.query(
      `SELECT id FROM users WHERE email = $1`,
      ['admin@rautindustries.com']
    )

    if (existingAdmin.rows.length > 0) {
      console.log('❌ Admin user already exists!')
      console.log('Email: admin@rautindustries.com')
      await client.query('ROLLBACK')
      return
    }

    // Hash password
    const plainPassword = 'Admin@123'
    const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS)

    // Insert admin user
    const result = await client.query(
      `INSERT INTO users (name, email, password, role, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, is_active, created_at`,
      ['Admin User', 'admin@rautindustries.com', hashedPassword, 'SuperAdmin', true]
    )

    await client.query('COMMIT')

    const adminUser = result.rows[0]

    console.log('\n✅ Admin user created successfully!\n')
    console.log('📧 Login Credentials:')
    console.log('─────────────────────────────────────')
    console.log(`Email:    admin@rautindustries.com`)
    console.log(`Password: Admin@123`)
    console.log(`Role:     ${adminUser.role}`)
    console.log('─────────────────────────────────────\n')
    console.log('📝 User Details:')
    console.log(`ID:       ${adminUser.id}`)
    console.log(`Name:     ${adminUser.name}`)
    console.log(`Status:   ${adminUser.is_active ? '✅ Active' : '❌ Inactive'}`)
    console.log(`Created:  ${adminUser.created_at}\n`)
    console.log('💡 Tip: Change the password after first login for security!\n')

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ Error creating admin user:')
    console.error(error.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

seedAdmin()
