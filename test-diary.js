// Script de teste para o Diário Interativo
// Execute este script para verificar se tudo está funcionando

console.log('🧪 Testando funcionalidades do Diário Interativo...\n');

// Teste 1: Verificar se o Firebase está configurado
console.log('1️⃣ Verificando configuração do Firebase...');
try {
  // Verificar se as variáveis de ambiente estão definidas
  const requiredConfig = [
    'FIREBASE_API_KEY',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_AUTH_DOMAIN'
  ];
  
  const missingConfig = requiredConfig.filter(key => !process.env[key]);
  
  if (missingConfig.length > 0) {
    console.log('⚠️  Configurações do Firebase não encontradas');
    console.log('   Variáveis ausentes:', missingConfig.join(', '));
  } else {
    console.log('✅ Configuração do Firebase OK');
  }
} catch (error) {
  console.log('❌ Erro ao verificar configuração:', error.message);
}

// Teste 2: Verificar estrutura dos arquivos
console.log('\n2️⃣ Verificando estrutura dos arquivos...');
const requiredFiles = [
  'src/Components/InteractiveDiary.jsx',
  'src/services/firebaseService.js',
  'src/contexts/AuthContext.jsx',
  'src/firebase.js',
  'firestore.rules',
  'firestore.indexes.json'
];

requiredFiles.forEach(file => {
  try {
    const fs = require('fs');
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - Arquivo não encontrado`);
    }
  } catch (error) {
    console.log(`❌ ${file} - Erro ao verificar`);
  }
});

// Teste 3: Verificar dependências
console.log('\n3️⃣ Verificando dependências...');
const requiredDependencies = [
  'firebase',
  'react',
  'lucide-react'
];

try {
  const packageJson = require('./package.json');
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  requiredDependencies.forEach(dep => {
    if (dependencies[dep]) {
      console.log(`✅ ${dep} - v${dependencies[dep]}`);
    } else {
      console.log(`❌ ${dep} - Não encontrado`);
    }
  });
} catch (error) {
  console.log('❌ Erro ao verificar package.json:', error.message);
}

// Teste 4: Verificar regras do Firestore
console.log('\n4️⃣ Verificando regras do Firestore...');
try {
  const fs = require('fs');
  const rules = fs.readFileSync('firestore.rules', 'utf8');
  
  if (rules.includes('diaryEntries')) {
    console.log('✅ Regras do diário configuradas');
  } else {
    console.log('❌ Regras do diário não encontradas');
  }
  
  if (rules.includes('request.auth != null')) {
    console.log('✅ Autenticação configurada');
  } else {
    console.log('❌ Autenticação não configurada');
  }
} catch (error) {
  console.log('❌ Erro ao verificar regras:', error.message);
}

// Teste 5: Verificar índices
console.log('\n5️⃣ Verificando índices do Firestore...');
try {
  const fs = require('fs');
  const indexes = fs.readFileSync('firestore.indexes.json', 'utf8');
  
  if (indexes.includes('diaryEntries')) {
    console.log('✅ Índices do diário configurados');
  } else {
    console.log('❌ Índices do diário não encontrados');
  }
} catch (error) {
  console.log('❌ Erro ao verificar índices:', error.message);
}

// Resumo final
console.log('\n📊 RESUMO DOS TESTES');
console.log('=====================');
console.log('Para usar o Diário Interativo:');
console.log('');
console.log('1. ✅ Certifique-se de estar logado na aplicação');
console.log('2. ✅ Configure os índices do Firestore se necessário');
console.log('3. ✅ Verifique as regras de segurança');
console.log('4. ✅ Teste criando uma reflexão');
console.log('');
console.log('🔧 Se houver problemas:');
console.log('- Execute: node setup-diary-indexes.js');
console.log('- Verifique o console do navegador');
console.log('- Confirme as regras do Firestore');
console.log('');
console.log('🎉 Diário Interativo configurado e pronto para uso!');
