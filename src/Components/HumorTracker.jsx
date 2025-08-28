import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy, onSnapshot, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { 
  Calendar, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Edit3, 
  Trash2, 
  Filter,
  Search,
  Clock,
  Activity,
  Target,
  Award,
  MessageCircle,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';



const HumorTracker = () => {
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedCause, setSelectedCause] = useState('');
  const [activeTab, setActiveTab] = useState('track');
  const [userData, setUserData] = useState(null);
  const [moodEntries, setMoodEntries] = useState([]);
  const [showMoodForm, setShowMoodForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('week');
  
  // Estados para agendamento
  const [showScheduling, setShowScheduling] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [sessionType, setSessionType] = useState('individual');
  const [sessionNotes, setSessionNotes] = useState('');
  const [selectedPsychologist, setSelectedPsychologist] = useState(null);
  const [psychologists, setPsychologists] = useState([]);
  const [loadingPsychologists, setLoadingPsychologists] = useState(false);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0); // Para navegar entre semanas

  // Estados para o calendário funcional
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDateCalendar, setSelectedDateCalendar] = useState(null);
  const [moodData, setMoodData] = useState({}); // Para armazenar dados de humor por data
  const [loading, setLoading] = useState(false);

  const moods = [
    { emoji: '😊', label: 'Feliz', value: 'happy', color: 'bg-green-500' },
    { emoji: '😔', label: 'Triste', value: 'sad', color: 'bg-blue-500' },
    { emoji: '😡', label: 'Raiva', value: 'angry', color: 'bg-red-500' },
    { emoji: '😰', label: 'Medo', value: 'fear', color: 'bg-yellow-500' },
    { emoji: '😌', label: 'Paz', value: 'peace', color: 'bg-purple-500' },
    { emoji: '❤️', label: 'Amor', value: 'love', color: 'bg-pink-500' }
  ];

  const causes = [
    'Sono', 'Eu Mesmo(a)', 'Família',
    'Saúde', 'Amizades', 'Estudos',
    'Lazer', 'Trabalho', 'Relação',
    'Luto', 'Finanças', 'Outras'
  ];

  // Dados para agendamento
  const availableTimes = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const sessionTypes = [
    { id: 'individual', label: 'Sessão Individual', description: 'Acompanhamento personalizado' },
    { id: 'couple', label: 'Terapia de Casal', description: 'Para relacionamentos' },
    { id: 'family', label: 'Terapia Familiar', description: 'Para toda a família' },
    { id: 'group', label: 'Grupo Terapêutico', description: 'Compartilhando experiências' }
  ];

  // Arrays vazios para dados reais
  const mockMoodEntries = [];
  const monthlyStats = [];

  // Função para converter dados do Firebase em entradas de humor para histórico
  const processMoodEntriesForHistory = (moodDataObj) => {
    return Object.entries(moodDataObj).map(([date, data]) => ({
      id: date,
      date: new Date(date),
      mood: data.mood,
      cause: data.cause,
      intensity: data.intensity || 5,
      notes: `Humor registrado em ${new Date(date).toLocaleDateString('pt-BR')}`,
      timestamp: data.timestamp
    })).sort((a, b) => b.date - a.date); // Ordenar por data mais recente
  };

  // Função para filtrar entradas por período
  const filterEntriesByPeriod = (entries, period) => {
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return entries;
    }
    
    return entries.filter(entry => entry.date >= startDate);
  };

  // Função para filtrar entradas por termo de busca
  const filterEntriesBySearch = (entries, searchTerm) => {
    if (!searchTerm.trim()) return entries;
    
    const term = searchTerm.toLowerCase();
    return entries.filter(entry => 
      entry.cause.toLowerCase().includes(term) ||
      entry.notes.toLowerCase().includes(term) ||
      moods.find(m => m.value === entry.mood)?.label.toLowerCase().includes(term)
    );
  };

  // Função para calcular estatísticas reais dos dados
  const calculateRealMoodStats = () => {
    const entries = processMoodEntriesForHistory(moodData);
    
    if (entries.length === 0) return [];
    
    // Agrupar por humor
    const moodCounts = {};
    entries.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });
    
    // Calcular porcentagens e criar estatísticas
    const totalEntries = entries.length;
    const stats = Object.entries(moodCounts).map(([mood, count]) => {
      const percentage = Math.round((count / totalEntries) * 100);
      const moodInfo = moods.find(m => m.value === mood);
      
      return {
        mood: moodInfo?.label || mood,
        color: moodInfo?.color || 'bg-gray-500',
        percentage,
        count,
        trend: 'up' // Por enquanto sempre 'up', pode ser implementado com dados históricos
      };
    });
    
    // Ordenar por porcentagem decrescente
    return stats.sort((a, b) => b.percentage - a.percentage);
  };

  // Função para calcular metas e insights
  const calculateGoalsAndInsights = () => {
    const entries = processMoodEntriesForHistory(moodData);
    
    if (entries.length === 0) return { goals: [], insights: [] };
    
    // Meta: dias consecutivos
    const consecutiveDays = calculateConsecutiveDays(entries);
    
    // Melhor humor da semana
    const weeklyMood = calculateWeeklyMood(entries);
    
    // Insights baseados nos dados
    const insights = generateInsights(entries);
    
    return {
      goals: [
        {
          id: 'consecutive',
          title: 'Meta: 7 dias consecutivos',
          progress: consecutiveDays,
          target: 7,
          icon: Target,
          color: 'text-blue-400'
        }
      ],
      insights: [
        {
          id: 'weekly',
          title: 'Melhor humor da semana',
          value: weeklyMood,
          icon: Award,
          color: 'text-yellow-400'
        },
        ...insights
      ]
    };
  };

  // Função para calcular dias consecutivos
  const calculateConsecutiveDays = (entries) => {
    if (entries.length === 0) return 0;
    
    const sortedEntries = entries.sort((a, b) => a.date - b.date);
    let consecutive = 0;
    let currentDate = new Date();
    
    // Verificar se há entrada para hoje
    const today = new Date().toISOString().split('T')[0];
    if (!moodData[today]) {
      return 0;
    }
    
    // Contar dias consecutivos para trás
    for (let i = 0; i < 30; i++) { // Limitar a 30 dias para performance
      const checkDate = new Date(currentDate);
      checkDate.setDate(currentDate.getDate() - i);
      const dateString = checkDate.toISOString().split('T')[0];
      
      if (moodData[dateString]) {
        consecutive++;
      } else {
        break;
      }
    }
    
    return consecutive;
  };

  // Função para calcular melhor humor da semana
  const calculateWeeklyMood = (entries) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyEntries = entries.filter(entry => entry.date >= weekAgo);
    
    if (weeklyEntries.length === 0) return 'Nenhuma entrada ainda';
    
    // Encontrar humor com maior intensidade da semana
    const bestEntry = weeklyEntries.reduce((best, current) => 
      (current.intensity || 5) > (best.intensity || 5) ? current : best
    );
    
    const moodInfo = moods.find(m => m.value === bestEntry.mood);
    return moodInfo ? moodInfo.label : 'Indefinido';
  };

  // Função para gerar insights
  const generateInsights = (entries) => {
    const insights = [];
    
    if (entries.length === 0) return insights;
    
    // Insight: humor mais frequente
    const moodCounts = {};
    entries.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });
    
    const mostFrequentMood = Object.entries(moodCounts).reduce((a, b) => 
      moodCounts[a[0]] > moodCounts[b[0]] ? a : b
    );
    
    if (mostFrequentMood) {
      const moodInfo = moods.find(m => m.value === mostFrequentMood[0]);
      insights.push({
        id: 'frequent',
        title: 'Humor mais frequente',
        value: moodInfo ? moodInfo.label : 'Indefinido',
        icon: Activity,
        color: 'text-green-400'
      });
    }
    
    // Insight: causa mais comum
    const causeCounts = {};
    entries.forEach(entry => {
      causeCounts[entry.cause] = (causeCounts[entry.cause] || 0) + 1;
    });
    
    const mostCommonCause = Object.entries(causeCounts).reduce((a, b) => 
      causeCounts[a[0]] > causeCounts[b[0]] ? a : b
    );
    
    if (mostCommonCause) {
      insights.push({
        id: 'cause',
        title: 'Causa mais comum',
        value: mostCommonCause[0],
        icon: Users,
        color: 'text-purple-400'
      });
    }
    
    return insights;
  };

  // Função para editar entrada de humor
  const handleEditMood = (entry) => {
    setSelectedMood(entry.mood);
    setSelectedCause(entry.cause);
    setSelectedDateCalendar({ date: entry.date.toISOString().split('T')[0] });
    setShowMoodForm(true);
  };

  // Função para excluir entrada de humor
  const handleDeleteMood = async (entry) => {
    if (!confirm('Tem certeza que deseja excluir esta entrada de humor?')) {
      return;
    }
    
    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert('Usuário não autenticado');
        return;
      }
      
      // Remover do Firestore
      const moodRef = doc(db, 'users', currentUser.uid, 'moods', entry.id);
      await deleteDoc(moodRef);
      
      // Atualizar dados locais
      setMoodData(prev => {
        const newData = { ...prev };
        delete newData[entry.id];
        return newData;
      });
      
      alert('Entrada de humor excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir entrada de humor:', error);
      alert('Erro ao excluir entrada de humor. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Função para obter entradas filtradas para histórico
  const getFilteredMoodEntries = () => {
    const allEntries = processMoodEntriesForHistory(moodData);
    const periodFiltered = filterEntriesByPeriod(allEntries, filterPeriod);
    const searchFiltered = filterEntriesBySearch(periodFiltered, searchTerm);
    return searchFiltered;
  };

  // Função para obter estatísticas reais
  const getRealMonthlyStats = () => {
    return calculateRealMoodStats();
  };

  // Função para obter metas e insights reais
  const getRealGoalsAndInsights = () => {
    return calculateGoalsAndInsights();
  };

  // Funções para o calendário funcional
  const getMonthName = (monthIndex) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[monthIndex];
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = (year, month) => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    const days = [];
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
    
    // Adicionar dias vazios do início (para alinhar com os dias da semana)
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: null, mood: null, intensity: null, date: null, isToday: false });
    }
    
    // Adicionar todos os dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      const isToday = isCurrentMonth && today.getDate() === day;
      
      days.push({
        day,
        mood: moodData[dateString]?.mood || null, // Buscar humor real dos dados
        intensity: moodData[dateString]?.intensity || null, // Buscar intensidade real dos dados
        date: dateString,
        isToday
      });
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const navigateYear = (direction) => {
    setCurrentYear(currentYear + direction);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDateCalendar({
      day: today.getDate(),
      date: today.toISOString().split('T')[0]
    });
  };

  const handleDateClick = (day, date) => {
    if (day && date) {
      setSelectedDateCalendar({ day, date });
      console.log('Data selecionada:', { day, date });
    }
  };

  // Funções para Firebase
  const saveMoodToFirebase = async (date, moodData) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('Usuário não autenticado');
        return false;
      }

      const moodRef = doc(db, 'users', currentUser.uid, 'moods', date);
      await setDoc(moodRef, {
        ...moodData,
        date,
        timestamp: new Date(),
        userId: currentUser.uid
      });

      console.log('Humor salvo no Firebase:', date, moodData);
      return true;
    } catch (error) {
      console.error('Erro ao salvar humor no Firebase:', error);
      return false;
    }
  };

  const loadMoodDataFromFirebase = async () => {
    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('Usuário não autenticado');
        return;
      }

      // Buscar todos os humores do usuário
      const moodsRef = collection(db, 'users', currentUser.uid, 'moods');
      const q = query(moodsRef, orderBy('timestamp', 'desc'));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const moodDataMap = {};
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          moodDataMap[data.date] = {
            mood: data.mood,
            cause: data.cause,
            intensity: data.intensity || 5,
            timestamp: data.timestamp
          };
        });
        
        setMoodData(moodDataMap);
        console.log('Dados de humor carregados:', moodDataMap);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Erro ao carregar dados de humor:', error);
    } finally {
      setLoading(false);
    }
  };

  const calendarDays = generateCalendarDays(currentYear, currentMonth);
  
  const handleMoodSubmit = async () => {
    if (!selectedMood || !selectedCause) return;
    
    try {
      setLoading(true);
      
      // Determinar a data para salvar
      const dateToSave = selectedDateCalendar?.date || new Date().toISOString().split('T')[0];
      
      // Verificar se é uma edição ou novo registro
      const isEditing = moodData[dateToSave];
      
      // Dados do humor para salvar
      const moodDataToSave = {
        mood: selectedMood,
        cause: selectedCause,
        intensity: 5, // Valor padrão, pode ser ajustado
        timestamp: isEditing ? moodData[dateToSave].timestamp : new Date(), // Manter timestamp original se editando
        updatedAt: new Date() // Sempre atualizar timestamp de modificação
      };

      // Salvar no Firebase
      const success = await saveMoodToFirebase(dateToSave, moodDataToSave);
      
      if (success) {
        // Atualizar dados de humor localmente
        setMoodData(prev => ({
          ...prev,
          [dateToSave]: moodDataToSave
        }));

        // Limpar formulário
        setShowMoodForm(false);
        setSelectedMood('');
        setSelectedCause('');
        setSelectedDateCalendar(null);
        
        console.log(`${isEditing ? 'Humor editado' : 'Humor registrado'} com sucesso para:`, dateToSave);
      } else {
        alert(`Erro ao ${isEditing ? 'editar' : 'salvar'} humor. Tente novamente.`);
      }
    } catch (error) {
      console.error(`Erro ao ${selectedDateCalendar?.date && moodData[selectedDateCalendar.date] ? 'editar' : 'registrar'} humor:`, error);
      alert(`Erro ao ${selectedDateCalendar?.date && moodData[selectedDateCalendar.date] ? 'editar' : 'registrar'} humor. Tente novamente.`);
    } finally {
      setLoading(false);
    }
  };

    // Função para buscar psicólogos disponíveis baseado na data e horário selecionados
  const fetchAvailablePsychologists = async (selectedDate, selectedTime) => {
    if (!selectedDate || !selectedTime) {
      setPsychologists([]);
      return;
    }

    try {
      setLoadingPsychologists(true);
      
      // Buscar psicólogos na coleção 'PsychologistAccount'
      const psychologistsRef = collection(db, 'PsychologistAccount');
      const q = query(psychologistsRef, where('isAvailable', '==', true));
      const querySnapshot = await getDocs(q);
      
      const psychologistsList = [];
      querySnapshot.forEach((doc) => {
        const psychologistData = doc.data();
        
        // Verificar se o psicólogo está disponível no horário selecionado
        const availableSlots = psychologistData.availableSlots || ['09:00', '14:00', '16:00'];
        const isAvailableAtTime = availableSlots.includes(selectedTime);
        
        if (isAvailableAtTime) {
          psychologistsList.push({
            id: doc.id,
            name: psychologistData.displayName || psychologistData.name || 'Psicólogo',
            specialty: psychologistData.specialty || psychologistData.approach || 'Psicologia Clínica',
            experience: psychologistData.yearsExperience ? `${psychologistData.yearsExperience} anos` : '5 anos',
            rating: psychologistData.rating || 5.0,
            availableSlots: availableSlots,
            avatar: psychologistData.avatar || '👨‍⚕️',
            description: psychologistData.bio || psychologistData.description || 'Psicólogo especializado em atendimento clínico',
            email: psychologistData.email,
            phone: psychologistData.phone || '',
            crp: psychologistData.crp || 'CRP não informado',
            education: psychologistData.education || 'Psicologia',
            languages: psychologistData.languages || ['Português'],
            isAvailable: psychologistData.isAvailable !== false,
            selectedTime: selectedTime, // Horário específico selecionado
            // Campos específicos da coleção PsychologistAccount
            approach: psychologistData.approach || psychologistData.specialty || '',
            certifications: psychologistData.certifications || [],
            insurance: psychologistData.insurance || false,
            virtualSessions: psychologistData.virtualSessions !== false,
            inPersonSessions: psychologistData.inPersonSessions !== false,
            totalSessions: psychologistData.totalSessions || 0,
            acceptsOnline: psychologistData.acceptsOnline || false
          });
        }
      });
      
      // Ordenar psicólogos por rating (mais altos primeiro) e depois por experiência
      psychologistsList.sort((a, b) => {
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        // Se rating for igual, ordenar por experiência (mais anos primeiro)
        const aYears = parseInt(a.experience) || 0;
        const bYears = parseInt(b.experience) || 0;
        return bYears - aYears;
      });
      
      setPsychologists(psychologistsList);
      
      if (psychologistsList.length === 0) {
        console.log(`Nenhum psicólogo disponível para ${selectedDate} às ${selectedTime}`);
      } else {
        console.log(`Psicólogos disponíveis para ${selectedDate} às ${selectedTime}:`, psychologistsList);
      }
      
    } catch (error) {
      console.error('Erro ao buscar psicólogos:', error);
      setPsychologists([]); // Em caso de erro, não mostrar psicólogos
    } finally {
      setLoadingPsychologists(false);
    }
  };

  const handleScheduleSession = () => {
    if (!selectedDate || !selectedTime || !sessionType || !selectedPsychologist) {
      alert('Por favor, preencha todos os campos obrigatórios, incluindo a seleção do psicólogo.');
      return;
    }
    
    // TODO: Implementar agendamento no Firebase
    console.log('Agendando sessão:', {
      date: selectedDate,
      time: selectedTime,
      type: sessionType,
      psychologist: {
        id: selectedPsychologist.id,
        name: selectedPsychologist.name,
        email: selectedPsychologist.email,
        phone: selectedPsychologist.phone,
        crp: selectedPsychologist.crp
      },
      notes: sessionNotes
    });
    
    // Limpar formulário e fechar
    setSelectedDate('');
    setSelectedTime('');
    setSessionType('individual');
    setSessionNotes('');
    setSelectedPsychologist(null);
    setCurrentWeekOffset(0); // Voltar para a semana atual
    setShowScheduling(false);
    
    alert(`Sessão agendada com sucesso com ${selectedPsychologist.name} para ${new Date(selectedDate).toLocaleDateString('pt-BR')} às ${selectedTime}! Em breve entraremos em contato para confirmar.`);
  };

  const getNextWeekDates = (weekOffset = 0) => {
    const dates = [];
    const today = new Date();
    
    // Para a semana atual (offset = 0), começar do dia de hoje
    // Para semanas futuras, começar da segunda-feira daquela semana
    let startDate;
    if (weekOffset === 0) {
      // Semana atual: começar do dia de hoje
      startDate = new Date(today);
    } else {
      // Semanas futuras: encontrar a segunda-feira da semana desejada
      const daysUntilMonday = (8 - today.getDay()) % 7;
      const nextMonday = new Date(today);
      nextMonday.setDate(today.getDate() + daysUntilMonday);
      
      // Adicionar offset de semanas
      startDate = new Date(nextMonday);
      startDate.setDate(nextMonday.getDate() + (weekOffset * 7));
    }
    
    // Gerar 7 dias a partir da data de início
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
        dayNumber: date.getDate(),
        fullDay: date.toLocaleDateString('pt-BR', { weekday: 'long' }),
        month: date.toLocaleDateString('pt-BR', { month: 'short' }),
        isToday: date.toDateString() === today.toDateString() // Marcar se é hoje
      });
    }
    
    return dates;
  };

  // Função para buscar psicólogos quando data e horário forem selecionados
  const handleDateAndTimeSelection = (date, time) => {
    if (date && time) {
      fetchAvailablePsychologists(date, time);
      setSelectedPsychologist(null); // Limpar psicólogo selecionado anteriormente
      
      // Feedback visual para o usuário
      console.log(`Buscando psicólogos disponíveis para ${date} às ${time}...`);
    }
  };

  // Função para verificar se há psicólogos cadastrados no sistema
  const checkSystemPsychologists = async () => {
    try {
      // Verificar na coleção PsychologistAccount
      const psychologistsRef = collection(db, 'PsychologistAccount');
      const q = query(psychologistsRef, where('isAvailable', '==', true));
      const querySnapshot = await getDocs(q);
      
      const totalPsychologists = querySnapshot.size;
      console.log(`Total de psicólogos disponíveis no sistema: ${totalPsychologists}`);
      
      if (totalPsychologists === 0) {
        console.warn('⚠️ Nenhum psicólogo disponível no sistema ainda');
        console.log('💡 Verifique se há psicólogos cadastrados na coleção PsychologistAccount');
      } else {
        console.log('✅ Psicólogos disponíveis encontrados no sistema:', totalPsychologists);
      }
      
      return totalPsychologists;
    } catch (error) {
      console.error('Erro ao verificar psicólogos no sistema:', error);
      return 0;
    }
  };

  // Função para navegar para a próxima semana
  const goToNextWeek = () => {
    setCurrentWeekOffset(prev => prev + 1);
    setSelectedDate(''); // Limpar data selecionada ao mudar de semana
    setSelectedPsychologist(null); // Limpar psicólogo selecionado
    setPsychologists([]); // Limpar lista de psicólogos
  };

  // Função para navegar para a semana anterior
  const goToPreviousWeek = () => {
    if (currentWeekOffset > 0) {
      setCurrentWeekOffset(prev => prev - 1);
      setSelectedDate(''); // Limpar data selecionada ao mudar de semana
      setSelectedPsychologist(null); // Limpar psicólogo selecionado
      setPsychologists([]); // Limpar lista de psicólogos
    }
  };

  // Função para voltar para a semana atual
  const goToCurrentWeek = () => {
    setCurrentWeekOffset(0);
    setSelectedDate(''); // Limpar data selecionada ao mudar de semana
    setSelectedPsychologist(null); // Limpar psicólogo selecionado
    setPsychologists([]); // Limpar lista de psicólogos
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            setUserData(userSnap.data());
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      }
    };
    
    const initializeSystem = async () => {
      await fetchUserData();
      await loadMoodDataFromFirebase(); // Carregar dados do Firebase ao montar o componente
      await checkSystemPsychologists(); // Verificar psicólogos no sistema
    };
    
    initializeSystem();
  }, []);

  // Recarregar dados quando mês/ano mudar
  useEffect(() => {
    if (auth.currentUser) {
      loadMoodDataFromFirebase();
    }
  }, [currentYear, currentMonth]);

  // Limpar psicólogos quando mudar de aba
  useEffect(() => {
    if (activeTab !== 'scheduling') {
      setPsychologists([]);
      setSelectedPsychologist(null);
      setCurrentWeekOffset(0); // Voltar para a semana atual
      setSelectedDate(''); // Limpar data selecionada
      setSelectedTime(''); // Limpar horário selecionado
    }
  }, [activeTab]);

  const getMoodColor = (mood) => {
    const moodObj = moods.find(m => m.value === mood);
    return moodObj ? moodObj.color : 'bg-gray-500';
  };

  const getMoodEmoji = (mood) => {
    switch (mood) {
      case 'happy': return '😊';
      case 'sad': return '😔';
      case 'angry': return '😡';
      case 'fear': return '😰';
      case 'peace': return '😌';
      case 'love': return '❤️';
      default: return '😐';
    }
  };

  // Calcular estatísticas reais dos dados
  const calculateMoodStats = () => {
    const currentMonthData = Object.values(moodData).filter(entry => {
      const entryDate = new Date(entry.timestamp?.toDate() || entry.timestamp);
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    });

    const totalEntries = currentMonthData.length;
    const averageMood = totalEntries > 0 
      ? currentMonthData.reduce((sum, entry) => {
          const moodValues = { happy: 8, sad: 3, angry: 2, fear: 4, peace: 7, love: 9 };
          return sum + (moodValues[entry.mood] || 5);
        }, 0) / totalEntries
      : 0;

    return {
      totalEntries,
      averageMood: Math.round(averageMood * 10) / 10
    };
  };

  // Função para obter estatísticas do mês atual para o resumo
  const getCurrentMonthStats = () => {
    const currentMonthData = Object.values(moodData).filter(entry => {
      const entryDate = new Date(entry.timestamp?.toDate() || entry.timestamp);
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    });

    const totalEntries = currentMonthData.length;
    const averageMood = totalEntries > 0 
      ? currentMonthData.reduce((sum, entry) => {
          const moodValues = { happy: 8, sad: 3, angry: 2, fear: 4, peace: 7, love: 9 };
          return sum + (moodValues[entry.mood] || 5);
        }, 0) / totalEntries
      : 0;

    return {
      totalEntries,
      averageMood: Math.round(averageMood * 10) / 10
    };
  };

  const moodStats = getCurrentMonthStats();

  return (
    <div className="min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header with Tabs - Enhanced */}
        <div className="group bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl hover:bg-white/15 hover:border-white/30 hover:shadow-3xl transition-all duration-500 hover:-translate-y-1 relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse"></div>
          
          {/* Floating particles */}
          <div className="absolute top-4 right-8 w-1 h-1 bg-white/30 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-opacity duration-300" style={{ animationDelay: '0.3s' }}></div>
          <div className="absolute top-8 right-16 w-0.5 h-0.5 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-opacity duration-300" style={{ animationDelay: '0.6s' }}></div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 relative z-10">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Activity className="w-7 h-7 text-gray-400 group-hover:text-white transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
                <div className="absolute -inset-2 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-500"></div>
              </div>
              <h2 className="text-2xl font-bold text-white group-hover:tracking-wide transition-all duration-300">Rastreador de Humor</h2>
            </div>
            <button
              onClick={() => setShowMoodForm(!showMoodForm)}
              className="group/add bg-white/10 border border-white/30 text-white px-5 py-2.5 rounded-lg hover:bg-white/20 transition-all duration-300 text-sm hover:scale-110 hover:shadow-lg relative overflow-hidden flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover/add:opacity-100 transition-opacity duration-300 group-hover/add:animate-pulse"></div>
              <Plus className="w-4 h-4 inline mr-2 group-hover/add:rotate-90 group-hover/add:scale-125 transition-all duration-300 relative z-10" />
              <span className="relative z-10 group-hover/add:font-medium transition-all duration-300">Registrar Humor</span>
            </button>
          </div>
          
          {/* Tabs - Enhanced */}
          <div className="flex flex-wrap gap-2 bg-white/5 rounded-xl p-1.5 relative z-10">
            {[
              { id: 'track', label: 'Rastreamento' },
              { id: 'history', label: 'Histórico' },
              { id: 'analytics', label: 'Análises' },
              { id: 'scheduling', label: 'Agendar Sessão' }
            ].map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group/tab flex-1 min-w-[120px] px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 relative overflow-hidden ${
                  activeTab === tab.id
                    ? 'bg-white text-black shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/tab:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 group-hover/tab:tracking-wide transition-all duration-300">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mood Registration Form - Enhanced */}
        {showMoodForm && (
          <div className="group bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl hover:bg-white/15 hover:border-white/30 transition-all duration-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="text-xl font-semibold text-white group-hover:tracking-wide transition-all duration-300">
                {selectedDateCalendar && moodData[selectedDateCalendar.date] ? 'Editar Humor' : 'Registrar Humor'}
              </h3>
              <button
                onClick={() => setShowMoodForm(false)}
                className="group/close text-white/50 hover:text-white hover:scale-125 hover:rotate-90 transition-all duration-300 p-2"
              >
                <div className="absolute -inset-2 bg-white/10 rounded-full opacity-0 group-hover/close:opacity-100 transition-opacity duration-300"></div>
                ✕
              </button>
            </div>
            
            <div className="space-y-8 relative z-10">
              {/* Mood Selection - Enhanced */}
              <div>
                <p className="text-sm text-gray-300 mb-4 group-hover:text-white/90 transition-colors duration-300">Escolha uma Opção:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {moods.map((mood, index) => (
                    <button
                      key={mood.value}
                      onClick={() => setSelectedMood(mood.value)}
                      className={`group/mood flex flex-col items-center space-y-3 p-4 rounded-2xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-lg relative overflow-hidden ${
                        selectedMood === mood.value
                          ? 'bg-white/10 border border-white/20 scale-105 shadow-lg'
                          : 'bg-gray-800/30 hover:bg-gray-700/50'
                      }`}
                      style={{ 
                        animationDelay: `${index * 100}ms`,
                        transform: 'translateZ(0)'
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover/mood:opacity-100 transition-opacity duration-300"></div>
                      <span className="text-3xl group-hover/mood:scale-125 group-hover/mood:rotate-12 transition-all duration-300 relative z-10">{mood.emoji}</span>
                      <span className="text-sm text-gray-300 group-hover/mood:text-white group-hover/mood:font-medium transition-all duration-300 relative z-10">{mood.label}</span>
                      <div className="absolute top-1 right-1 w-1 h-1 bg-white/40 rounded-full opacity-0 group-hover/mood:opacity-100 group-hover/mood:animate-ping transition-opacity duration-300"></div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Cause Selection - Enhanced */}
              <div>
                <p className="text-sm text-gray-300 mb-4 group-hover:text-white/90 transition-colors duration-300">Principal Causa:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {causes.map((cause, index) => (
                    <button
                      key={cause}
                      onClick={() => setSelectedCause(cause)}
                      className={`group/cause p-3 rounded-xl text-xs transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 relative overflow-hidden ${
                        selectedCause === cause
                          ? 'bg-white/10 border border-white/20 text-white'
                          : 'bg-gray-800/30 hover:bg-gray-700/50 text-gray-300 hover:text-white'
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover/cause:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative z-10 group-hover/cause:font-medium transition-all duration-300">{cause}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={handleMoodSubmit}
                disabled={!selectedMood || !selectedCause || loading}
                className="group/submit w-full bg-gradient-to-r from-white to-gray-200 text-black py-4 px-4 rounded-xl font-bold hover:from-gray-200 hover:to-gray-300 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover/submit:opacity-100 transition-opacity duration-300 group-hover/submit:animate-pulse"></div>
                <span className="relative z-10 group-hover/submit:tracking-wider group-hover/submit:font-bold transition-all duration-300">
                  {loading ? 'Salvando...' : (selectedDateCalendar && moodData[selectedDateCalendar.date] ? 'ATUALIZAR' : 'REGISTRAR')}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'track' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calendar View - Enhanced */}
            <div className="group bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl hover:bg-white/15 hover:border-white/30 hover:shadow-3xl transition-all duration-500 hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0"></div>
              
              <div className="flex flex-col items-center mb-6 relative z-20">
                {/* Título centralizado */}
                <h3 className="text-2xl font-semibold text-white group-hover:tracking-wide transition-all duration-300 mb-4 text-center">
                  {getMonthName(currentMonth)} de {currentYear}
                </h3>
                
                {/* Botões de navegação centralizados */}
                <div className="flex flex-col items-center space-y-3">
                  {/* Navegação de ano */}
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => navigateYear(-1)}
                      className="group/year p-2 text-gray-400 hover:text-white hover:scale-125 hover:rotate-12 transition-all duration-300 bg-white/5 rounded-lg hover:bg-white/10 relative z-30"
                      title="Ano anterior"
                    >
                      <div className="absolute -inset-2 bg-white/10 rounded-full opacity-0 group-hover/year:opacity-100 transition-opacity duration-300 z-0"></div>
                      <ChevronsLeft className="w-4 h-4 relative z-10" />
                    </button>
                    <span className="text-sm text-gray-300 px-3 py-1 font-medium bg-white/5 rounded-lg">{currentYear}</span>
                    <button 
                      onClick={() => navigateYear(1)}
                      className="group/year p-2 text-gray-400 hover:text-white hover:scale-125 hover:-rotate-12 transition-all duration-300 bg-white/5 rounded-lg hover:bg-white/10 relative z-30"
                      title="Próximo ano"
                    >
                      <div className="absolute -inset-2 bg-white/10 rounded-full opacity-0 group-hover/year:opacity-100 transition-opacity duration-300 z-0"></div>
                      <ChevronsRight className="w-4 h-4 relative z-10" />
                    </button>
                  </div>
                  
                  {/* Navegação de mês e botão hoje */}
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => navigateMonth('prev')}
                      className="group/nav p-2 text-gray-400 hover:text-white hover:scale-125 hover:rotate-12 transition-all duration-300 bg-white/5 rounded-lg hover:bg-white/10 relative z-30"
                      title="Mês anterior"
                    >
                      <div className="absolute -inset-2 bg-white/10 rounded-full opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300 z-0"></div>
                      <ChevronLeft className="w-4 h-4 relative z-10" />
                    </button>
                    
                    <button 
                      onClick={goToToday}
                      className="group/today px-4 py-2 text-blue-400 hover:text-blue-300 hover:scale-105 transition-all duration-300 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 text-sm font-medium relative z-30"
                      title="Voltar para hoje"
                    >
                      <div className="absolute -inset-2 bg-blue-500/10 rounded-full opacity-0 group-hover/today:opacity-100 transition-opacity duration-300 z-0"></div>
                      <span className="relative z-10">Hoje</span>
                    </button>
                    
                    <button 
                      onClick={() => navigateMonth('next')}
                      className="group/nav p-2 text-gray-400 hover:text-white hover:scale-125 hover:-rotate-12 transition-all duration-300 bg-white/5 rounded-lg hover:bg-white/10 relative z-30"
                      title="Próximo mês"
                    >
                      <div className="absolute -inset-2 bg-white/10 rounded-full opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300 z-0"></div>
                      <ChevronRight className="w-4 h-4 relative z-10" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-3 relative z-20">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => (
                  <div key={`${day}-${index}`} className="text-center text-xs text-gray-400 p-2 group-hover:text-white/70 transition-colors duration-300 font-medium">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1 relative z-20">
                {calendarDays.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => handleDateClick(day.day, day.date)}
                    disabled={!day.day}
                    className={`group/day aspect-square flex flex-col items-center justify-center text-sm rounded-xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-lg relative z-30 ${
                      !day.day 
                        ? 'invisible' // Dias vazios ficam invisíveis
                        : day.mood
                          ? `${getMoodColor(day.mood)} text-white`
                          : selectedDateCalendar?.date === day.date
                            ? 'bg-white/20 border border-white/30 text-white'
                            : day.isToday
                              ? 'bg-blue-500/20 border border-blue-400/30 text-blue-300'
                              : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                    }`}
                    style={{ animationDelay: `${index * 20}ms` }}
                  >
                    {day.day && (
                      <>
                        <span className="text-xs group-hover/day:font-bold transition-all duration-300">{day.day}</span>
                        {day.mood && (
                          <span className="text-xs opacity-75 group-hover/day:opacity-100 group-hover/day:scale-110 transition-all duration-300">
                            {getMoodEmoji(day.mood)}
                          </span>
                        )}
                        {day.isToday && !day.mood && (
                          <span className="text-xs text-blue-400 group-hover/day:scale-110 transition-all duration-300">•</span>
                        )}
                        {!day.mood && !day.isToday && (
                          <span className="text-xs text-gray-500 group-hover/day:text-gray-400 transition-colors duration-300">+</span>
                        )}
                      </>
                    )}
                  </button>
                ))}
              </div>
              
              {/* Legenda de humores */}
              <div className="mt-6 pt-4 border-t border-white/10 relative z-20">
                <h4 className="text-sm text-white/70 mb-3">Legenda:</h4>
                <div className="flex flex-wrap gap-2">
                  {moods.map((mood) => (
                    <div key={mood.value} className="flex items-center space-x-1.5">
                      <div className={`w-3 h-3 rounded-full ${mood.color}`}></div>
                      <span className="text-xs text-white/60">{mood.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Data selecionada */}
              {selectedDateCalendar && (
                <div className="mt-4 p-4 bg-white/10 rounded-lg border border-white/20 relative z-20">
                  <div className="text-center">
                    <span className="text-sm text-white/70">Data selecionada:</span>
                    <div className="text-white font-medium mt-1">
                      {new Date(selectedDateCalendar.date).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    
                    {/* Mostrar humor registrado ou botão para registrar */}
                    {moodData[selectedDateCalendar.date] ? (
                      <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          <span className="text-2xl">{getMoodEmoji(moodData[selectedDateCalendar.date].mood)}</span>
                          <span className="text-white font-medium">
                            {moods.find(m => m.value === moodData[selectedDateCalendar.date].mood)?.label}
                          </span>
                        </div>
                        <div className="text-white/70 text-sm mb-3">
                          Causa: <span className="text-white font-medium">{moodData[selectedDateCalendar.date].cause}</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2 text-xs text-white/50">
                          <Clock className="w-3 h-3" />
                          <span>
                            Registrado em: {new Date(moodData[selectedDateCalendar.date].timestamp?.toDate() || moodData[selectedDateCalendar.date].timestamp).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            // Preencher o formulário com os dados existentes para edição
                            setSelectedMood(moodData[selectedDateCalendar.date].mood);
                            setSelectedCause(moodData[selectedDateCalendar.date].cause);
                            setShowMoodForm(true);
                          }}
                          className="mt-3 text-xs text-yellow-400 hover:text-yellow-300 underline transition-colors duration-300 relative z-30"
                        >
                          Editar humor
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowMoodForm(true)}
                        className="mt-3 text-sm text-blue-400 hover:text-blue-300 underline transition-colors duration-300 relative z-30"
                      >
                        Registrar humor nesta data
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Quick Stats - Enhanced */}
            <div className="group bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl hover:bg-white/15 hover:border-white/30 hover:shadow-3xl transition-all duration-500 hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              <h3 className="text-xl font-semibold text-white mb-6 group-hover:tracking-wide transition-all duration-300 relative z-10">Resumo da Semana</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                {[
                  { emoji: '😊', title: 'Humor Médio', value: `${moodStats.averageMood}/10` },
                  { emoji: '📊', title: 'Entradas', value: `${moodStats.totalEntries} este mês` }
                ].map((stat, index) => (
                  <div 
                    key={stat.title}
                    className="group/stat text-center p-6 bg-white/5 rounded-xl hover:bg-white/10 hover:scale-105 hover:-translate-y-1 transition-all duration-300 hover:shadow-lg relative overflow-hidden"
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300"></div>
                    <div className="text-3xl mb-3 group-hover/stat:scale-125 group-hover/stat:rotate-12 transition-all duration-300 relative z-10">{stat.emoji}</div>
                    <div className="text-white font-medium group-hover/stat:tracking-wide transition-all duration-300 relative z-10">{stat.title}</div>
                    <div className="text-white/70 text-sm group-hover/stat:text-white group-hover/stat:font-medium transition-all duration-300 relative z-10">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="group bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl hover:bg-white/15 hover:border-white/30 hover:shadow-3xl transition-all duration-500 hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 relative z-10">
              <h3 className="text-xl font-semibold text-white group-hover:tracking-wide transition-all duration-300">Histórico de Humor</h3>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative group/search flex-grow sm:flex-grow-0">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4 group-hover/search:text-white/80 group-hover/search:scale-125 group-hover/search:rotate-90 transition-all duration-300" />
                  <input
                    type="text"
                    placeholder="Pesquisar entradas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm hover:bg-white/15 hover:border-white/30 focus:scale-105 transition-all duration-300 w-full"
                  />
                  <div className="absolute inset-0 rounded-lg ring-1 ring-white/0 group-hover/search:ring-white/20 transition-all duration-300 pointer-events-none"></div>
                </div>
                <select
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-white/30 text-sm hover:bg-white/15 hover:border-white/30 hover:scale-105 transition-all duration-300"
                >
                  <option value="week">Esta semana</option>
                  <option value="month">Este mês</option>
                  <option value="year">Este ano</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-5 relative z-10">
              {getFilteredMoodEntries().length === 0 ? (
                <div className="text-center py-16 group/empty">
                  <div className="relative">
                    <Activity className="w-20 h-20 text-white/30 mx-auto mb-6 group-hover:text-white/50 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-24 h-24 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-500"></div>
                    </div>
                  </div>
                  <h3 className="text-xl font-medium text-white/70 mb-3 group-hover:text-white/90 transition-colors duration-300">Nenhuma entrada de humor</h3>
                  <p className="text-white/50 group-hover:text-white/70 transition-colors duration-300">Comece registrando seu humor usando o botão acima</p>
                </div>
              ) : (
                getFilteredMoodEntries().map((entry, index) => (
                  <div
                    key={entry.id}
                    className="group/entry bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 hover:shadow-lg relative overflow-hidden"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover/entry:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center space-x-4">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${getMoodColor(entry.mood)} group-hover/entry:scale-110 group-hover/entry:rotate-6 transition-all duration-300`}>
                          <span className="text-2xl group-hover/entry:scale-125 transition-all duration-300">{getMoodEmoji(entry.mood)}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-white group-hover/entry:tracking-wide transition-all duration-300">{entry.cause}</h4>
                          <p className="text-sm text-white/70 group-hover/entry:text-white/90 transition-colors duration-300">{entry.notes}</p>
                          <div className="flex items-center space-x-2 text-xs text-white/50 mt-2 group-hover/entry:text-white/70 transition-colors duration-300">
                            <Clock className="w-3 h-3 group-hover/entry:rotate-12 transition-all duration-300" />
                            <span>{entry.date.toLocaleDateString('pt-BR')}</span>
                            <span>•</span>
                            <span>Intensidade: {entry.intensity}/10</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => handleDeleteMood(entry)}
                          className="group/delete text-white/50 hover:text-white p-2 hover:scale-125 hover:rotate-12 transition-all duration-300"
                        >
                          <div className="absolute -inset-2 bg-red-500/10 rounded-full opacity-0 group-hover/delete:opacity-100 transition-opacity duration-300"></div>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Statistics - Enhanced */}
            <div className="group bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl hover:bg-white/15 hover:border-white/30 hover:shadow-3xl transition-all duration-500 hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              <div className="flex items-center space-x-3 mb-6 relative z-10">
                <div className="relative">
                  <BarChart3 className="w-6 h-6 text-gray-400 group-hover:text-white transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
                  <div className="absolute -inset-2 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-500"></div>
                </div>
                <h3 className="text-xl font-semibold text-white group-hover:tracking-wide transition-all duration-300">Estatísticas Mensais</h3>
              </div>
              
              <div className="space-y-4 relative z-10">
                {getRealMonthlyStats().length === 0 ? (
                  <div className="text-center py-12 group/empty">
                    <div className="relative">
                      <BarChart3 className="w-16 h-16 text-white/30 mx-auto mb-4 group-hover:text-white/50 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-500"></div>
                      </div>
                    </div>
                    <p className="text-white/50 group-hover:text-white/70 transition-colors duration-300">Nenhuma estatística disponível</p>
                    <p className="text-white/30 text-sm group-hover:text-white/50 transition-colors duration-300">Registre seu humor para ver análises</p>
                  </div>
                ) : (
                  getRealMonthlyStats().map((stat, index) => (
                    <div key={index} className="group/stat flex items-center justify-between hover:bg-white/5 p-4 rounded-xl hover:scale-105 transition-all duration-300 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300"></div>
                      <div className="flex items-center space-x-4 relative z-10">
                        <div className={`w-5 h-5 rounded ${stat.color} group-hover/stat:scale-125 group-hover/stat:rotate-12 transition-all duration-300`}></div>
                        <span className="text-sm text-gray-300 group-hover/stat:text-white group-hover/stat:font-medium transition-all duration-300">{stat.mood}</span>
                      </div>
                      <div className="flex items-center space-x-2 relative z-10">
                        <span className="text-sm text-gray-400 group-hover/stat:text-white/90 transition-colors duration-300">{stat.percentage}%</span>
                        {stat.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-green-400 group-hover/stat:scale-125 group-hover/stat:rotate-12 transition-all duration-300" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400 group-hover/stat:scale-125 group-hover/stat:-rotate-12 transition-all duration-300" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Goals and Insights - Enhanced */}
            <div className="group bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl hover:bg-white/15 hover:border-white/30 hover:shadow-3xl transition-all duration-500 hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              <h3 className="text-xl font-semibold text-white mb-6 group-hover:tracking-wide transition-all duration-300 relative z-10">Metas e Insights</h3>
              
              <div className="space-y-6 relative z-10">
                {getRealGoalsAndInsights().goals.length === 0 ? (
                  <div className="text-center py-12 group/empty">
                    <div className="relative">
                      <Target className="w-16 h-16 text-white/30 mx-auto mb-4 group-hover:text-white/50 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-500"></div>
                      </div>
                    </div>
                    <p className="text-white/50 group-hover:text-white/70 transition-colors duration-300">Nenhuma meta definida</p>
                    <p className="text-white/30 text-sm group-hover:text-white/50 transition-colors duration-300">Comece registrando seu humor para definir metas</p>
                  </div>
                ) : (
                  getRealGoalsAndInsights().goals.map((goal, index) => (
                    <div key={goal.id} className="group/goal flex items-center space-x-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 hover:scale-105 hover:-translate-y-1 transition-all duration-300 hover:shadow-lg relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover/goal:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative">
                        <Target className="w-6 h-6 text-blue-400 group-hover/goal:scale-125 group-hover/goal:rotate-12 transition-all duration-300" />
                        <div className="absolute -inset-2 bg-blue-400/10 rounded-full opacity-0 group-hover/goal:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div className="relative z-10">
                        <div className="text-white font-medium group-hover/goal:tracking-wide transition-all duration-300">{goal.title}</div>
                        <div className="text-white/70 text-sm group-hover/goal:text-white/90 transition-colors duration-300">Progresso: {goal.progress}/{goal.target} dias</div>
                      </div>
                    </div>
                  ))
                )}
                
                {getRealGoalsAndInsights().insights.length === 0 ? (
                  <div className="text-center py-12 group/empty">
                    <div className="relative">
                      <Award className="w-16 h-16 text-white/30 mx-auto mb-4 group-hover:text-white/50 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-500"></div>
                      </div>
                    </div>
                    <p className="text-white/50 group-hover:text-white/70 transition-colors duration-300">Nenhuma meta definida</p>
                    <p className="text-white/30 text-sm group-hover:text-white/50 transition-colors duration-300">Comece registrando seu humor para definir metas</p>
                  </div>
                ) : (
                  getRealGoalsAndInsights().insights.map((insight, index) => (
                    <div key={insight.id} className="group/insight flex items-center space-x-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 hover:scale-105 hover:-translate-y-1 transition-all duration-300 hover:shadow-lg relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover/insight:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative">
                        <insight.icon className={`w-6 h-6 ${insight.color} group-hover/insight:scale-125 group-hover/insight:rotate-12 transition-all duration-300`} />
                        <div className="absolute -inset-2 bg-white/10 rounded-full opacity-0 group-hover/insight:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div className="relative z-10">
                        <div className="text-white font-medium group-hover/insight:tracking-wide transition-all duration-300">{insight.title}</div>
                        <div className="text-white/70 text-sm group-hover/insight:text-white/90 transition-colors duration-300">{insight.value}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scheduling' && (
          <div className="group bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl hover:bg-white/15 hover:border-white/30 hover:shadow-3xl transition-all duration-500 hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            <div className="flex items-center space-x-3 mb-8 relative z-10">
              <div className="relative">
                <MessageCircle className="w-6 h-6 text-gray-400 group-hover:text-white transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
                <div className="absolute -inset-2 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-500"></div>
              </div>
              <h3 className="text-xl font-semibold text-white group-hover:tracking-wide transition-all duration-300">Agendar Sessão com Psicólogo</h3>
            </div>
            
            <div className="space-y-8 relative z-10">
              {/* Session Type Selection - Enhanced */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4 group-hover:text-white/90 transition-colors duration-300">Tipo de Sessão:</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sessionTypes.map((type, index) => (
                    <button
                      key={type.id}
                      onClick={() => setSessionType(type.id)}
                      className={`group/session p-4 rounded-xl border transition-all duration-300 text-left hover:scale-105 hover:-translate-y-1 hover:shadow-lg relative overflow-hidden ${
                        sessionType === type.id
                          ? 'bg-white/10 border-white/30 text-white'
                          : 'bg-gray-800/30 border-gray-600/30 text-gray-300 hover:bg-gray-700/50 hover:text-white'
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover/session:opacity-100 transition-opacity duration-300"></div>
                      <div className="font-medium text-sm group-hover/session:tracking-wide transition-all duration-300 relative z-10">{type.label}</div>
                      <div className="text-xs text-gray-400 mt-2 group-hover/session:text-white/70 transition-colors duration-300 relative z-10">{type.description}</div>
                      <div className="absolute top-2 right-2 w-1 h-1 bg-white/40 rounded-full opacity-0 group-hover/session:opacity-100 group-hover/session:animate-ping transition-opacity duration-300"></div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Date and Time Selection - Enhanced */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-gray-300 group-hover:text-white/90 transition-colors duration-300">Data:</label>
                    
                    {/* Navegação entre semanas */}
                    <div className="flex items-center space-x-2 relative z-30">
                      <button
                        onClick={goToPreviousWeek}
                        disabled={currentWeekOffset === 0}
                        className="group/nav p-2 text-gray-400 hover:text-white hover:scale-125 hover:rotate-12 transition-all duration-300 bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:rotate-0 relative z-30"
                        title="Semana anterior"
                      >
                        <div className="absolute -inset-2 bg-white/10 rounded-full opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300 z-0"></div>
                        <ChevronLeft className="w-4 h-4 relative z-10" />
                      </button>
                      
                      <button
                        onClick={goToCurrentWeek}
                        className="group/today px-3 py-1.5 text-blue-400 hover:text-blue-300 hover:scale-105 transition-all duration-300 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 text-xs font-medium relative z-30"
                        title="Voltar para esta semana"
                      >
                        <div className="absolute -inset-2 bg-blue-500/10 rounded-full opacity-0 group-hover/today:opacity-100 transition-opacity duration-300 z-0"></div>
                        <span className="relative z-10">Hoje</span>
                      </button>
                      
                      <button
                        onClick={goToNextWeek}
                        className="group/nav p-2 text-gray-400 hover:text-white hover:scale-125 hover:-rotate-12 transition-all duration-300 bg-white/5 rounded-lg hover:bg-white/10 relative z-30"
                        title="Próxima semana"
                      >
                        <div className="absolute -inset-2 bg-white/10 rounded-full opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300 z-0"></div>
                        <ChevronRight className="w-4 h-4 relative z-10" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Indicador da semana atual */}
                  <div className="text-center mb-3">
                    <span className="text-xs text-white/60">
                      {currentWeekOffset === 0 ? 'Esta semana (começando hoje)' : 
                       currentWeekOffset === 1 ? 'Próxima semana (segunda a domingo)' : 
                       `${currentWeekOffset} semanas à frente (segunda a domingo)`}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-2">
                    {getNextWeekDates(currentWeekOffset).map((dateInfo, index) => (
                      <button
                        key={dateInfo.date}
                        onClick={() => {
                          setSelectedDate(dateInfo.date);
                          if (selectedTime) {
                            handleDateAndTimeSelection(dateInfo.date, selectedTime);
                          }
                        }}
                        className={`group/date p-3 rounded-xl text-center transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-lg relative overflow-hidden ${
                          selectedDate === dateInfo.date
                            ? 'bg-white text-black shadow-lg'
                            : dateInfo.isToday
                              ? 'bg-blue-500/20 border border-blue-400/30 text-blue-300'
                              : 'bg-gray-800/30 text-gray-300 hover:bg-gray-700/50 hover:text-white'
                        }`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover/date:opacity-100 transition-opacity duration-300 z-0"></div>
                        <div className="text-xs text-gray-400 group-hover/date:font-medium transition-all duration-300 relative z-10">{dateInfo.day}</div>
                        <div className="font-medium group-hover/date:font-bold group-hover/date:scale-110 transition-all duration-300 relative z-10">{dateInfo.dayNumber}</div>
                        {dateInfo.month && (
                          <div className="text-xs text-gray-500 group-hover/date:text-gray-700 transition-colors duration-300 relative z-10">{dateInfo.month}</div>
                        )}
                        {dateInfo.isToday && (
                          <div className="absolute top-1 right-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4 group-hover:text-white/90 transition-colors duration-300">Horário:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {availableTimes.map((time, index) => (
                      <button
                        key={time}
                        onClick={() => {
                          setSelectedTime(time);
                          if (selectedDate) {
                            handleDateAndTimeSelection(selectedDate, time);
                          }
                        }}
                        className={`group/time p-4 rounded-xl text-center transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-lg relative overflow-hidden ${
                          selectedTime === time
                            ? 'bg-white text-black shadow-lg'
                            : 'bg-gray-800/30 text-gray-300 hover:bg-gray-700/50 hover:text-white'
                        }`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover/time:opacity-100 transition-opacity duration-300"></div>
                        <span className="relative z-10 group-hover/time:font-bold group-hover/time:tracking-wide transition-all duration-300">{time}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Psychologist Selection - Enhanced */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4 group-hover:text-white/90 transition-colors duration-300">
                  Escolha seu Psicólogo:
                </label>
                
                {!selectedDate || !selectedTime ? (
                  <div className="text-center py-8">
                    <Calendar className="w-16 h-16 text-white/30 mx-auto mb-4" />
                    <p className="text-white/70">Selecione uma data e horário primeiro</p>
                    <p className="text-white/50 text-sm">Os psicólogos disponíveis aparecerão aqui</p>
                  </div>
                ) : loadingPsychologists ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white/70">Buscando psicólogos disponíveis...</p>
                  </div>
                ) : psychologists.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
                    <p className="text-white/70">Nenhum psicólogo disponível para este horário</p>
                    <p className="text-white/50 text-sm">Tente outro horário ou data</p>
                    
                    {/* Informações úteis */}
                    <div className="mt-4 space-y-3">
                      <div className="p-3 bg-yellow-500/10 border border-yellow-400/20 rounded-lg">
                        <p className="text-yellow-400 text-xs">
                          💡 Dica: Psicólogos são mostrados apenas quando estão disponíveis no horário selecionado
                        </p>
                      </div>
                      
                      <div className="p-3 bg-blue-500/10 border border-blue-400/20 rounded-lg">
                        <p className="text-blue-400 text-xs">
                          🔍 Buscando psicólogos na coleção 'PsychologistAccount'
                        </p>
                      </div>
                      
                      <div className="p-3 bg-green-500/10 border border-green-400/20 rounded-lg">
                        <p className="text-green-400 text-xs">
                          ✅ Verifique se há psicólogos cadastrados na coleção PsychologistAccount
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Contador de psicólogos encontrados */}
                    <div className="text-center p-3 bg-green-500/10 border border-green-400/20 rounded-lg">
                      <p className="text-green-400 text-sm font-medium">
                        ✨ {psychologists.length} psicólogo{psychologists.length > 1 ? 's' : ''} disponível{psychologists.length > 1 ? 'eis' : ''} para {selectedTime}
                      </p>
                    </div>
                    
                    {/* Grid de psicólogos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {psychologists.map((psychologist, index) => (
                        <button
                          key={psychologist.id}
                          onClick={() => setSelectedPsychologist(psychologist)}
                          className={`group/psychologist p-4 rounded-xl border transition-all duration-300 text-left hover:scale-105 hover:-translate-y-1 hover:shadow-lg relative overflow-hidden ${
                            selectedPsychologist?.id === psychologist.id
                              ? 'bg-white/10 border-white/30 text-white ring-2 ring-white/30'
                              : 'bg-gray-800/30 border-gray-600/30 text-gray-300 hover:bg-gray-700/50 hover:text-white'
                          }`}
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover/psychologist:opacity-100 transition-opacity duration-300"></div>
                          
                          {/* Header do card */}
                          <div className="flex items-start justify-between mb-3 relative z-10">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl group-hover/psychologist:scale-125 transition-all duration-300">
                                {psychologist.avatar}
                              </span>
                              <div>
                                <div className="font-medium text-sm group-hover/psychologist:tracking-wide transition-all duration-300">
                                  {psychologist.name}
                                </div>
                                <div className="text-xs text-gray-400 group-hover/psychologist:text-white/70 transition-colors duration-300">
                                  {psychologist.specialty}
                                </div>
                              </div>
                            </div>
                            
                            {/* Rating */}
                            <div className="flex items-center space-x-1 bg-yellow-500/20 px-2 py-1 rounded-lg">
                              <span className="text-yellow-400 text-xs">⭐</span>
                              <span className="text-yellow-400 text-xs font-medium">{psychologist.rating}</span>
                            </div>
                          </div>
                          
                          {/* Informações do psicólogo */}
                          <div className="space-y-2 relative z-10">
                            <div className="text-xs text-gray-400 group-hover/psychologist:text-white/70 transition-colors duration-300">
                              <span className="font-medium">Experiência:</span> {psychologist.experience}
                            </div>
                            <div className="text-xs text-gray-400 group-hover/psychologist:text-white/70 transition-colors duration-300">
                              {psychologist.description}
                            </div>
                            
                            {/* Informações adicionais */}
                            <div className="space-y-1">
                              {psychologist.crp && psychologist.crp !== 'CRP não informado' && (
                                <div className="text-xs text-gray-400 group-hover/psychologist:text-white/70 transition-colors duration-300">
                                  <span className="font-medium">CRP:</span> {psychologist.crp}
                                </div>
                              )}
                              {psychologist.education && psychologist.education !== 'Psicologia' && (
                                <div className="text-xs text-gray-400 group-hover/psychologist:text-white/70 transition-colors duration-300">
                                  <span className="font-medium">Formação:</span> {psychologist.education}
                                </div>
                              )}
                              {psychologist.languages && psychologist.languages.length > 0 && psychologist.languages[0] !== 'Português' && (
                                <div className="text-xs text-gray-400 group-hover/psychologist:text-white/70 transition-colors duration-300">
                                  <span className="font-medium">Idiomas:</span> {psychologist.languages.join(', ')}
                                </div>
                              )}
                              {psychologist.approach && (
                                <div className="text-xs text-gray-400 group-hover/psychologist:text-white/70 transition-colors duration-300">
                                  <span className="font-medium">Abordagem:</span> {psychologist.approach}
                                </div>
                              )}
                            </div>
                            
                            {/* Horário selecionado */}
                            <div className="mt-3 pt-3 border-t border-white/10">
                              <div className="text-xs text-gray-400 mb-2 group-hover/psychologist:text-white/70 transition-colors duration-300">
                                Horário selecionado:
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm px-3 py-1 bg-green-500/20 border border-green-400/30 rounded-md text-green-400 font-medium">
                                  {psychologist.selectedTime}
                                </span>
                                <span className="text-xs text-white/60">
                                  ✓ Disponível
                                </span>
                              </div>
                            </div>
                            
                            {/* Contato (opcional) */}
                            {(psychologist.email || psychologist.phone) && (
                              <div className="mt-2 pt-2 border-t border-white/10">
                                <div className="text-xs text-gray-400 mb-1 group-hover/psychologist:text-white/70 transition-colors duration-300">
                                  Contato:
                                </div>
                                <div className="space-y-1">
                                  {psychologist.email && (
                                    <div className="text-xs text-blue-400 group-hover/psychologist:text-blue-300 transition-colors duration-300">
                                      📧 {psychologist.email}
                                    </div>
                                  )}
                                  {psychologist.phone && (
                                    <div className="text-xs text-green-400 group-hover/psychologist:text-blue-300 transition-colors duration-300">
                                      📞 {psychologist.phone}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Indicador de seleção */}
                          {selectedPsychologist?.id === psychologist.id && (
                            <div className="absolute top-3 right-3 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Session Notes - Enhanced */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4 group-hover:text-white/90 transition-colors duration-300">Observações (opcional):</label>
                <div className="relative group/textarea">
                  <textarea
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    placeholder="Descreva brevemente o que gostaria de abordar na sessão..."
                    className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl p-4 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300 min-h-[100px] hover:bg-gray-800/70 hover:border-gray-500/50 focus:scale-[1.01] hover:shadow-lg focus:shadow-xl"
                  />
                  <div className="absolute inset-0 rounded-xl ring-1 ring-white/0 group-hover/textarea:ring-white/20 group-focus-within/textarea:ring-white/40 transition-all duration-300 pointer-events-none"></div>
                </div>
              </div>
              
              {/* Schedule Button - Enhanced */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleScheduleSession}
                  disabled={!selectedDate || !selectedTime || !sessionType || !selectedPsychologist}
                  className="group/schedule bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transform hover:scale-110 transition-all duration-300 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-green-500/25 relative overflow-hidden disabled:hover:scale-100"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/schedule:opacity-100 transition-opacity duration-300 group-hover/schedule:animate-pulse"></div>
                  <Calendar className="w-5 h-5 group-hover/schedule:rotate-12 group-hover/schedule:scale-125 transition-all duration-300 relative z-10" />
                  <span className="relative z-10 group-hover/schedule:tracking-wide group-hover/schedule:font-bold transition-all duration-300">
                    {selectedPsychologist 
                      ? `Agendar com ${selectedPsychologist.name.split(' ')[0]}`
                      : 'Agendar Sessão'
                    }
                  </span>
                  
                  {/* Sparkles */}
                  <div className="absolute -top-1 -right-1 w-1 h-1 bg-white/50 rounded-full opacity-0 group-hover/schedule:opacity-100 group-hover/schedule:animate-ping transition-opacity duration-300"></div>
                  <div className="absolute -bottom-1 -left-1 w-0.5 h-0.5 bg-white/30 rounded-full opacity-0 group-hover/schedule:opacity-100 group-hover/schedule:animate-ping transition-opacity duration-300" style={{ animationDelay: '0.2s' }}></div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HumorTracker;