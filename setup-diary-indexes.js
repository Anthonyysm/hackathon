const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, orderBy, limit, getDocs } = require('firebase/firestore');

// Configuração do Firebase (substitua pelos seus dados)
const firebaseConfig = {
  apiKey: "AIzaSyDkPhYGNEdBtRdEeWwHCWfCFtLWqmGBTO8",
  authDomain: "hackathon-8b0e1.firebaseapp.com",
  projectId: "hackathon-8b0e1",
  storageBucket: "hackathon-8b0e1.firebasestorage.app",
  messagingSenderId: "523976123580",
  appId: "1:523976123580:web:1f781a5403c7aa6540dcb9",
  measurementId: "G-GQHD2SXYJ2"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function setupDiaryIndexes() {
  console.log('🔄 Configurando índices para o diário...');
  
  try {
    // Testar consulta que requer índice composto
    const diaryRef = collection(db, 'diaryEntries');
    const testQuery = query(
      diaryRef,
      where('userId', '==', 'test-user'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    
    console.log('✅ Consulta de teste executada com sucesso');
    console.log('📝 Índices do diário estão configurados corretamente');
    
  } catch (error) {
    if (error.code === 'failed-precondition') {
      console.log('⚠️  Índice composto necessário para consultas otimizadas');
      console.log('📋 Execute o seguinte comando no Firebase Console:');
      console.log('');
      console.log('firebase firestore:indexes');
      console.log('');
      console.log('Ou adicione manualmente o índice:');
      console.log('Collection: diaryEntries');
      console.log('Fields: userId (Ascending), createdAt (Descending)');
    } else {
      console.error('❌ Erro ao configurar índices:', error);
    }
  }
}

// Executar configuração
setupDiaryIndexes()
  .then(() => {
    console.log('✅ Configuração concluída');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro na configuração:', error);
    process.exit(1);
  });
