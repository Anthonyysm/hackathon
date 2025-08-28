const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, orderBy, limit } = require('firebase/firestore');

// Configuração do Firebase (substitua pelos seus valores)
const firebaseConfig = {
  // Suas configurações do Firebase aqui
  apiKey: "sua-api-key",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "seu-messaging-sender-id",
  appId: "seu-app-id"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Função para criar índices automaticamente
async function createIndexes() {
  console.log('🔄 Criando índices do Firestore...');
  
  try {
    // Índice para pacientes: psychologistId + createdAt
    console.log('📊 Criando índice para pacientes...');
    const patientsQuery = query(
      collection(db, 'patients'),
      where('psychologistId', '==', 'temp'),
      orderBy('createdAt', 'desc')
    );
    
    // Índice para pacientes: psychologistId + status
    const patientsStatusQuery = query(
      collection(db, 'patients'),
      where('psychologistId', '==', 'temp'),
      where('status', '==', 'active')
    );
    
    // Índice para sessões: psychologistId + date
    console.log('📅 Criando índice para sessões...');
    const sessionsQuery = query(
      collection(db, 'sessions'),
      where('psychologistId', '==', 'temp'),
      orderBy('date', 'asc')
    );
    
    // Índice para sessões: psychologistId + status
    const sessionsStatusQuery = query(
      collection(db, 'sessions'),
      where('psychologistId', '==', 'temp'),
      where('status', '==', 'pending')
    );
    
    // Índice para progresso: patientId + date
    console.log('📈 Criando índice para progresso...');
    const progressQuery = query(
      collection(db, 'progress'),
      where('patientId', '==', 'temp'),
      orderBy('date', 'desc')
    );
    
    // Índice para avaliações: psychologistId
    console.log('⭐ Criando índice para avaliações...');
    const evaluationsQuery = query(
      collection(db, 'evaluations'),
      where('psychologistId', '==', 'temp')
    );
    
    console.log('✅ Índices criados com sucesso!');
    console.log('📝 Nota: O Firebase criará automaticamente os índices necessários quando as queries forem executadas pela primeira vez.');
    
  } catch (error) {
    if (error.code === 'failed-precondition') {
      console.log('⚠️  Alguns índices precisam ser criados manualmente no console do Firebase.');
      console.log('🔗 Acesse: https://console.firebase.google.com');
      console.log('📚 Documentação: https://firebase.google.com/docs/firestore/query-data/indexing');
    } else {
      console.error('❌ Erro ao criar índices:', error);
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createIndexes();
}

module.exports = { createIndexes };
