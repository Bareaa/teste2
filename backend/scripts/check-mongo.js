//
const dotenv = require("dotenv")
const { Client } = require('pg')

// Configuração
dotenv.config()

const checkPostgres = async () => {
  try {
    console.log("🔍 Verificando conexão com PostgreSQL...")
    console.log(`📍 URL de conexão: ${process.env.DATABASE_URL}`)

    // Tentar conectar
    const client = new Client({
      connectionString: process.env.DATABASE_URL || "postgresql://localhost:5432/gestao-escolar"
    })

    await client.connect()
    console.log("✅ Conectado ao PostgreSQL com sucesso!")

    // Verificar bancos de dados
    const dbQuery = await client.query(`
      SELECT datname, pg_size_pretty(pg_database_size(datname)) as size 
      FROM pg_database
    `)

    console.log("📊 Bancos de dados disponíveis:")
    dbQuery.rows.forEach((db) => {
      console.log(`   - ${db.datname} (${db.size})`)
    })

    // Verificar tabelas no banco atual
    const tablesQuery = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `)

    if (tablesQuery.rows.length > 0) {
      console.log("📋 Tabelas no banco 'gestao-escolar':")
      tablesQuery.rows.forEach((table) => {
        console.log(`   - ${table.table_name}`)
      })
    } else {
      console.log("📋 Nenhuma tabela encontrada no banco 'gestao-escolar'")
      console.log("💡 Execute as migrações para criar as tabelas iniciais")
    }

    // Verificar versão do PostgreSQL
    const versionQuery = await client.query('SELECT version()')
    console.log(`🔧 Versão do PostgreSQL: ${versionQuery.rows[0].version.split(' ')[1]}`)

    await client.end()
    console.log("🔌 Conexão fechada")
  } catch (error) {
    console.error("❌ Erro ao conectar com PostgreSQL:")
    console.error(`   ${error.message}`)

    if (error.message.includes("ECONNREFUSED")) {
      console.log("\n💡 Possíveis soluções:")
      console.log("   1. Verifique se o PostgreSQL está rodando:")
      console.log("      - Windows: Verifique o serviço 'PostgreSQL' no Gerenciador de Tarefas")
      console.log("      - macOS: brew services start postgresql")
      console.log("      - Linux: sudo systemctl start postgresql")
      console.log("   2. Verifique se a URL de conexão está correta no arquivo .env")
      console.log("   3. Verifique se o pgAdmin está configurado corretamente")
    }

    process.exit(1)
  }
}

// Executar verificação
checkPostgres()
