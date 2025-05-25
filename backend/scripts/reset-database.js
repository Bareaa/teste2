//
const dotenv = require("dotenv")
const readline = require("readline")
const { Client } = require('pg')

// Configuração
dotenv.config()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const resetDatabase = async () => {
  try {
    console.log("⚠️  ATENÇÃO: Esta operação irá APAGAR TODOS os dados do banco!")
    console.log(`📍 Banco: ${process.env.DATABASE_URL}`)

    const answer = await new Promise((resolve) => {
      rl.question("Tem certeza que deseja continuar? (digite 'CONFIRMAR' para prosseguir): ", resolve)
    })

    if (answer !== "CONFIRMAR") {
      console.log("❌ Operação cancelada")
      process.exit(0)
    }

    console.log("🔍 Conectando ao PostgreSQL...")
    const client = new Client({
      connectionString: process.env.DATABASE_URL || "postgresql://localhost:5432/gestao-escolar"
    })
    await client.connect()

    console.log("🗑️  Removendo todas as tabelas...")

    // Listar e remover todas as tabelas
    const dropTablesQuery = `
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
      END $$;
    `

    await client.query(dropTablesQuery)
    console.log("✅ Todas as tabelas foram removidas")

    console.log("🎉 Banco de dados resetado com sucesso!")
    console.log("💡 Execute 'npm run seed' para criar dados iniciais")

    await client.end()
    process.exit(0)
  } catch (error) {
    console.error("❌ Erro ao resetar banco de dados:", error.message)
    process.exit(1)
  }
}

// Executar reset
resetDatabase()
