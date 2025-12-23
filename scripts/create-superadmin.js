const Database = require('better-sqlite3')
const bcrypt = require('bcryptjs')
const path = require('path')

const dbPath = path.join(__dirname, '..', 'dev.db')
const db = new Database(dbPath)

console.log('🔑 Creando usuario superadmin...\n')

// Generar UUID simple para SQLite
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}

const userId = generateUUID()
const email = 'admin@chronostone.dev'
const password = 'superadmin123'
const passwordHash = bcrypt.hashSync(password, 10)

try {
    // Verificar si el usuario ya existe
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)

    if (existing) {
        console.log('⚠️  El usuario superadmin ya existe')
        console.log(`   Email: ${email}`)
        console.log(`   ID: ${existing.id}`)

        // Actualizar suscripción a enterprise
        db.prepare(`
      UPDATE subscriptions 
      SET plan_id = 'enterprise', 
          status = 'active',
          trial_end = NULL
      WHERE user_id = ?
    `).run(existing.id)

        console.log('✅ Suscripción actualizada a Enterprise\n')
    } else {
        // Crear usuario
        db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, role, email_verified, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(userId, email, passwordHash, 'Super Admin', 'admin', 1)

        console.log('✅ Usuario creado:')
        console.log(`   Email: ${email}`)
        console.log(`   Password: ${password}`)
        console.log(`   ID: ${userId}`)

        // Crear suscripción enterprise (ilimitada)
        db.prepare(`
      INSERT INTO subscriptions (
        id, user_id, plan_id, status, 
        current_period_start, current_period_end,
        created_at, updated_at
      )
      VALUES (?, ?, 'enterprise', 'active', datetime('now'), datetime('now', '+1 year'), datetime('now'), datetime('now'))
    `).run(generateUUID(), userId)

        console.log('✅ Suscripción Enterprise creada')

        // Crear límites de uso
        db.prepare(`
      INSERT INTO usage_limits (user_id, projects_count, storage_used, models_3d_count, created_at, updated_at)
      VALUES (?, 0, 0, 0, datetime('now'), datetime('now'))
    `).run(userId)

        console.log('✅ Límites de uso inicializados\n')
    }

    console.log('🎉 ¡Superusuario listo para usar!')
    console.log('\n📝 Credenciales:')
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
    console.log('\n🚀 Ahora puedes usar el botón "Entrar como Superusuario" en el login\n')

} catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
} finally {
    db.close()
}
