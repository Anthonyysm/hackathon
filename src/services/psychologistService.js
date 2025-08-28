import { db, auth } from '../firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';

// Coleções do Firebase para psicólogos
const PSYCHOLOGISTS_COLLECTION = 'psychologists';
const PSYCHOLOGIST_ACCOUNT_COLLECTION = 'PsychologistAccount';
const PATIENTS_COLLECTION = 'patients';
const SESSIONS_COLLECTION = 'sessions';
const PROGRESS_COLLECTION = 'progress';
const EVALUATIONS_COLLECTION = 'evaluations';

class PsychologistService {
  constructor() {
    this.currentUser = auth.currentUser;
  }

  // Buscar psicólogos recomendados para a tela inicial
  async getRecommendedPsychologists(limitCount = 4) {
    try {
      const psychologistsRef = collection(db, PSYCHOLOGIST_ACCOUNT_COLLECTION);
      const q = query(
        psychologistsRef, 
        where('isAvailable', '==', true),
        orderBy('rating', 'desc'),
        orderBy('yearsExperience', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const psychologistsList = [];
      
      querySnapshot.forEach((doc) => {
        const psychologistData = doc.data();
        psychologistsList.push({
          id: doc.id,
          name: psychologistData.displayName || 'Psicólogo',
          specialty: psychologistData.specialty || 'Psicologia Clínica',
          experience: psychologistData.yearsExperience ? `${psychologistData.yearsExperience} anos` : '5 anos',
          rating: psychologistData.rating || 5.0,
          bio: psychologistData.bio || 'Psicólogo especializado em atendimento clínico',
          crp: psychologistData.crp || 'CRP não informado',
          acceptsOnline: psychologistData.acceptsOnline || false,
          avatar: psychologistData.avatar || '👨‍⚕️',
          // Gerar iniciais do nome
          initials: this.generateInitials(psychologistData.displayName || 'Psicólogo')
        });
      });
      
      // Ordenar por rating e experiência
      psychologistsList.sort((a, b) => {
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        const aYears = parseInt(a.experience) || 0;
        const bYears = parseInt(b.experience) || 0;
        return bYears - aYears;
      });
      
      return psychologistsList;
    } catch (error) {
      console.error('Erro ao buscar psicólogos recomendados:', error);
      // Em caso de erro de índice, tentar busca simples
      try {
        const psychologistsRef = collection(db, PSYCHOLOGIST_ACCOUNT_COLLECTION);
        const q = query(psychologistsRef, where('isAvailable', '==', true));
        const querySnapshot = await getDocs(q);
        const psychologistsList = [];
        
        querySnapshot.forEach((doc) => {
          const psychologistData = doc.data();
          psychologistsList.push({
            id: doc.id,
            name: psychologistData.displayName || 'Psicólogo',
            specialty: psychologistData.specialty || 'Psicologia Clínica',
            experience: psychologistData.yearsExperience ? `${psychologistData.yearsExperience} anos` : '5 anos',
            rating: psychologistData.rating || 5.0,
            bio: psychologistData.bio || 'Psicólogo especializado em atendimento clínico',
            crp: psychologistData.crp || 'CRP não informado',
            acceptsOnline: psychologistData.acceptsOnline || false,
            avatar: psychologistData.avatar || '👨‍⚕️',
            initials: this.generateInitials(psychologistData.displayName || 'Psicólogo')
          });
        });
        
        // Ordenar client-side
        psychologistsList.sort((a, b) => {
          if (b.rating !== a.rating) {
            return b.rating - a.rating;
          }
          const aYears = parseInt(a.experience) || 0;
          const bYears = parseInt(b.experience) || 0;
          return bYears - aYears;
        });
        
        return psychologistsList.slice(0, limitCount);
      } catch (fallbackError) {
        console.error('Erro na busca fallback:', fallbackError);
        return [];
      }
    }
  }

  // Gerar iniciais do nome
  generateInitials(name) {
    if (!name) return 'PS';
    
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    
    const first = words[0].charAt(0);
    const last = words[words.length - 1].charAt(0);
    return `${first}${last}`.toUpperCase();
  }

  // Obter dados do psicólogo logado
  async getPsychologistData(psychologistId) {
    try {
      const docRef = doc(db, PSYCHOLOGISTS_COLLECTION, psychologistId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error('Psicólogo não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar dados do psicólogo:', error);
      throw error;
    }
  }

  // Atualizar dados do psicólogo
  async updatePsychologistData(psychologistId, data) {
    try {
      const docRef = doc(db, PSYCHOLOGISTS_COLLECTION, psychologistId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Erro ao atualizar dados do psicólogo:', error);
      throw error;
    }
  }

  // Obter pacientes do psicólogo
  async getPatients(psychologistId) {
    try {
      const q = query(
        collection(db, PATIENTS_COLLECTION),
        where('psychologistId', '==', psychologistId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const patients = [];
      
      querySnapshot.forEach((doc) => {
        patients.push({ id: doc.id, ...doc.data() });
      });
      
      return patients;
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      throw error;
    }
  }

  // Adicionar novo paciente
  async addPatient(psychologistId, patientData) {
    try {
      const docRef = await addDoc(collection(db, PATIENTS_COLLECTION), {
        ...patientData,
        psychologistId,
        createdAt: serverTimestamp(),
        status: 'active',
        progress: 0
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar paciente:', error);
      throw error;
    }
  }

  // Atualizar dados do paciente
  async updatePatient(patientId, data) {
    try {
      const docRef = doc(db, PATIENTS_COLLECTION, patientId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Erro ao atualizar paciente:', error);
      throw error;
    }
  }

  // Obter sessões do psicólogo
  async getSessions(psychologistId, filters = {}) {
    try {
      let q = query(
        collection(db, SESSIONS_COLLECTION),
        where('psychologistId', '==', psychologistId)
      );

      // Aplicar filtros
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters.date) {
        q = query(q, where('date', '>=', filters.date));
      }

      q = query(q, orderBy('date', 'asc'), orderBy('time', 'asc'));
      
      const querySnapshot = await getDocs(q);
      const sessions = [];
      
      querySnapshot.forEach((doc) => {
        sessions.push({ id: doc.id, ...doc.data() });
      });
      
      return sessions;
    } catch (error) {
      console.error('Erro ao buscar sessões:', error);
      throw error;
    }
  }

  // Criar nova sessão
  async createSession(psychologistId, sessionData) {
    try {
      const docRef = await addDoc(collection(db, SESSIONS_COLLECTION), {
        ...sessionData,
        psychologistId,
        createdAt: serverTimestamp(),
        status: 'pending'
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      throw error;
    }
  }

  // Atualizar status da sessão
  async updateSessionStatus(sessionId, status) {
    try {
      const docRef = doc(db, SESSIONS_COLLECTION, sessionId);
      await updateDoc(docRef, {
        status,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Erro ao atualizar status da sessão:', error);
      throw error;
    }
  }

  // Obter estatísticas do dashboard
  async getDashboardStats(psychologistId) {
    try {
      // Buscar pacientes ativos
      const patientsQuery = query(
        collection(db, PATIENTS_COLLECTION),
        where('psychologistId', '==', psychologistId),
        where('status', '==', 'active')
      );
      const patientsSnapshot = await getDocs(patientsQuery);
      const activePatients = patientsSnapshot.size;

      // Buscar sessões do mês atual
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      
      const sessionsQuery = query(
        collection(db, SESSIONS_COLLECTION),
        where('psychologistId', '==', psychologistId),
        where('date', '>=', firstDayOfMonth),
        where('status', '==', 'completed')
      );
      const sessionsSnapshot = await getDocs(sessionsQuery);
      const totalSessions = sessionsSnapshot.size;

      // Calcular taxa de sucesso (baseado em avaliações)
      const evaluationsQuery = query(
        collection(db, EVALUATIONS_COLLECTION),
        where('psychologistId', '==', psychologistId)
      );
      const evaluationsSnapshot = await getDocs(evaluationsQuery);
      let totalRating = 0;
      let ratingCount = 0;
      
      evaluationsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.rating) {
          totalRating += data.rating;
          ratingCount++;
        }
      });

      const avgRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 0;

      // Buscar novos pacientes da semana
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const newPatientsQuery = query(
        collection(db, PATIENTS_COLLECTION),
        where('psychologistId', '==', psychologistId),
        where('createdAt', '>=', oneWeekAgo)
      );
      const newPatientsSnapshot = await getDocs(newPatientsQuery);
      const newPatients = newPatientsSnapshot.size;

      return {
        activePatients,
        totalSessions,
        successRate: 87, // Valor padrão - pode ser calculado baseado em critérios específicos
        avgSessionTime: 45, // Valor padrão - pode ser calculado baseado em sessões reais
        rating: avgRating,
        newPatients
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  // Obter progresso de um paciente
  async getPatientProgress(patientId) {
    try {
      const q = query(
        collection(db, PROGRESS_COLLECTION),
        where('patientId', '==', patientId),
        orderBy('date', 'desc'),
        limit(10)
      );
      
      const querySnapshot = await getDocs(q);
      const progress = [];
      
      querySnapshot.forEach((doc) => {
        progress.push({ id: doc.id, ...doc.data() });
      });
      
      return progress;
    } catch (error) {
      console.error('Erro ao buscar progresso do paciente:', error);
      throw error;
    }
  }

  // Adicionar avaliação de sessão
  async addSessionEvaluation(psychologistId, sessionId, evaluationData) {
    try {
      const docRef = await addDoc(collection(db, EVALUATIONS_COLLECTION), {
        ...evaluationData,
        psychologistId,
        sessionId,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar avaliação:', error);
      throw error;
    }
  }

  // Listener em tempo real para pacientes
  subscribeToPatients(psychologistId, callback) {
    const q = query(
      collection(db, PATIENTS_COLLECTION),
      where('psychologistId', '==', psychologistId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const patients = [];
      querySnapshot.forEach((doc) => {
        patients.push({ id: doc.id, ...doc.data() });
      });
      callback(patients);
    });
  }

  // Listener em tempo real para sessões
  subscribeToSessions(psychologistId, callback) {
    const q = query(
      collection(db, SESSIONS_COLLECTION),
      where('psychologistId', '==', psychologistId),
      orderBy('date', 'asc'),
      orderBy('time', 'asc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const sessions = [];
      querySnapshot.forEach((doc) => {
        sessions.push({ id: doc.id, ...doc.data() });
      });
      callback(sessions);
    });
  }

  // Marcar tour como visto
  async markTourAsSeen(psychologistId) {
    try {
      const docRef = doc(db, PSYCHOLOGISTS_COLLECTION, psychologistId);
      await updateDoc(docRef, {
        hasSeenTour: true,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Erro ao marcar tour como visto:', error);
      throw error;
    }
  }
}

export default new PsychologistService();

// Funções nomeadas para compatibilidade com imports existentes
export const getPsychologistPatients = async (psychologistId) => {
  try {
    const service = new PsychologistService();
    const patients = await service.getPatients(psychologistId);
    return { success: true, data: patients };
  } catch (error) {
    console.error('Erro ao buscar pacientes:', error);
    return { success: false, error: error.message };
  }
};

export const createPatient = async (psychologistId, patientData) => {
  try {
    const service = new PsychologistService();
    const patientId = await service.addPatient(psychologistId, patientData);
    return { success: true, data: { id: patientId } };
  } catch (error) {
    console.error('Erro ao criar paciente:', error);
    return { success: false, error: error.message };
  }
};

// Funções para sessões
export const getPsychologistSessions = async (psychologistId, filters = {}) => {
  try {
    const service = new PsychologistService();
    const sessions = await service.getSessions(psychologistId, filters);
    return { success: true, data: sessions };
  } catch (error) {
    console.error('Erro ao buscar sessões:', error);
    return { success: false, error: error.message };
  }
};

export const createSession = async (sessionData) => {
  try {
    const service = new PsychologistService();
    const sessionId = await service.createSession(sessionData.psychologistId, sessionData);
    return { success: true, data: { id: sessionId } };
  } catch (error) {
    console.error('Erro ao criar sessão:', error);
    return { success: false, error: error.message };
  }
};

export const updateSession = async (sessionId, data) => {
  try {
    const service = new PsychologistService();
    await service.updateSessionStatus(sessionId, data.status);
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar sessão:', error);
    return { success: false, error: error.message };
  }
};

// Função para estatísticas do dashboard
export const getDashboardStats = async (psychologistId) => {
  try {
    const service = new PsychologistService();
    const stats = await service.getDashboardStats(psychologistId);
    return { success: true, data: stats };
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return { success: false, error: error.message };
  }
};

// Funções para mensagens (implementação básica)
export const getPsychologistMessages = async (psychologistId) => {
  try {
    // Implementação básica - retorna array vazio por enquanto
    return { success: true, data: [] };
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    return { success: false, error: error.message };
  }
};

export const createMessage = async (messageData) => {
  try {
    // Implementação básica - retorna sucesso por enquanto
    return { success: true, data: { id: Date.now().toString() } };
  } catch (error) {
    console.error('Erro ao criar mensagem:', error);
    return { success: false, error: error.message };
  }
};

export const markMessageAsRead = async (messageId) => {
  try {
    // Implementação básica - retorna sucesso por enquanto
    return { success: true };
  } catch (error) {
    console.error('Erro ao marcar mensagem como lida:', error);
    return { success: false, error: error.message };
  }
};

// Função para marcar tour como visto
export const markTourAsSeen = async (psychologistId) => {
  try {
    const service = new PsychologistService();
    await service.markTourAsSeen(psychologistId);
    return { success: true };
  } catch (error) {
    console.error('Erro ao marcar tour como visto:', error);
    return { success: false, error: error.message };
  }
};

// Funções para relatórios (implementação básica)
export const getPsychologistReports = async (psychologistId) => {
  try {
    // Implementação básica - retorna array vazio por enquanto
    return { success: true, data: [] };
  } catch (error) {
    console.error('Erro ao buscar relatórios:', error);
    return { success: false, error: error.message };
  }
};

export const createReport = async (reportData) => {
  try {
    // Implementação básica - retorna sucesso por enquanto
    return { success: true, data: { id: Date.now().toString() } };
  } catch (error) {
    console.error('Erro ao criar relatório:', error);
    return { success: false, error: error.message };
  }
};