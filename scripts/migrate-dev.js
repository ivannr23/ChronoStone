const Database = require('better-sqlite3')
const fs = require('fs')
const path = require('path')

const dbPath = path.join(__dirname, '..', 'dev.db')
const db = new Database(dbPath)

console.log('🔄 Ejecutando migraciones en SQLite...\n')

// Leer el archivo de migración
const migrationPath = path.join(__dirname, '..', 'database', 'migrations', '001_projects_extended_sqlite.sql')
const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

try {
    // Ejecutar todo el archivo de una vez
    db.exec(migrationSQL)
    console.log('✅ Migración ejecutada exitosamente!\n')
} catch (error) {
    // Si hay error, intentar ejecutar statement por statement
    console.log('⚠️  Ejecutando en modo compatible...\n')

    // Dividir por líneas y reconstruir statements
    const lines = migrationSQL.split('\n')
    let currentStatement = ''
    let successCount = 0
    let skipCount = 0

    for (const line of lines) {
        const trimmedLine = line.trim()

        // Ignorar comentarios y líneas vacías
        if (trimmedLine.startsWith('--') || trimmedLine.length === 0) {
            continue
        }

        currentStatement += line + '\n'

        // Si la línea termina con ; y no estamos dentro de un trigger/bloque
        if (trimmedLine.endsWith(';') && !currentStatement.includes('BEGIN')) {
            try {
                db.exec(currentStatement)

                // Detectar qué se creó
                if (currentStatement.includes('ALTER TABLE') && currentStatement.includes('ADD COLUMN')) {
                    const match = currentStatement.match(/ADD COLUMN (\w+)/)
                    if (match) {
                        console.log(`✅ Columna agregada: ${match[1]}`)
                        successCount++
                    }
                } else if (currentStatement.includes('CREATE TABLE')) {
                    const match = currentStatement.match(/CREATE TABLE (?:IF NOT EXISTS )?(\w+)/)
                    if (match) {
                        console.log(`✅ Tabla creada: ${match[1]}`)
                        successCount++
                    }
                } else if (currentStatement.includes('CREATE INDEX')) {
                    successCount++
                } else if (currentStatement.includes('CREATE TRIGGER')) {
                    successCount++
                }

                currentStatement = ''
            } catch (err) {
                const errorMsg = err.message.toLowerCase()
                if (errorMsg.includes('duplicate column') || errorMsg.includes('already exists')) {
                    skipCount++
                } else {
                    console.error(`❌ Error: ${err.message}`)
                }
                currentStatement = ''
            }
        }

        // Si encontramos END; cerramos el bloque del trigger
        if (trimmedLine === 'END;') {
            try {
                db.exec(currentStatement)
                successCount++
                currentStatement = ''
            } catch (err) {
                const errorMsg = err.message.toLowerCase()
                if (!errorMsg.includes('already exists')) {
                    console.error(`❌ Error en trigger: ${err.message}`)
                } else {
                    skipCount++
                }
                currentStatement = ''
            }
        }
    }

    console.log(`\n📊 Resumen: ${successCount} exitosas, ${skipCount} omitidas\n`)
}

// Verificar que las nuevas columnas existen
console.log('🔍 Verificando estructura de la tabla projects...')
try {
    const projectsInfo = db.prepare("PRAGMA table_info(projects)").all()
    const newColumns = ['project_status', 'heritage_type', 'protection_level', 'budget', 'client_owner', 'estimated_end_date', 'progress_percentage']
    const existingNewColumns = projectsInfo.filter(col => newColumns.includes(col.name))

    console.log(`   Nuevas columnas: ${existingNewColumns.length}/${newColumns.length}`)
    existingNewColumns.forEach(col => {
        console.log(`   ✓ ${col.name}`)
    })
} catch (error) {
    console.log(`   ⚠️  Error: ${error.message}`)
}

// Verificar que las nuevas tablas existen
console.log('\n🔍 Verificando nuevas tablas...')
try {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'project_%' ORDER BY name").all()
    const expectedTables = ['project_phases', 'project_documents', 'project_images', 'project_budget_items', 'project_collaborators', 'project_notes']
    const existingTables = tables.filter(t => expectedTables.includes(t.name))

    console.log(`   Nuevas tablas: ${existingTables.length}/${expectedTables.length}`)
    existingTables.forEach(table => {
        console.log(`   ✓ ${table.name}`)
    })
} catch (error) {
    console.log(`   ⚠️  Error: ${error.message}`)
}

db.close()

console.log('\n✨ ¡Migración completada!\n')
