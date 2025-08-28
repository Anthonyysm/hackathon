import {  useState  } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  BarChart3, 
  Users, 
  Calendar, 
  TrendingUp, 
  MessageCircle,
  CheckCircle,
  Star,
  Clock,
  Activity
} from 'lucide-react';
import { markTourAsSeen } from '../../services/psychologistService';
import { useAuth } from '../../contexts/AuthContext';

const PsychologistTour = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  const tourSteps = [
    {
      title: "Bem-vindo ao seu Dashboard Profissional! 👋",
      description: "Olá! Vamos fazer um tour rápido para você conhecer todas as funcionalidades do seu painel de psicólogo.",
      icon: <Star className="w-8 h-8 text-yellow-400" />,
      highlight: null
    },
    {
      title: "Visão Geral - Seu Centro de Controle",
      description: "Aqui você encontra um resumo completo da sua prática: pacientes ativos, sessões realizadas, taxa de sucesso e muito mais.",
      icon: <BarChart3 className="w-8 h-8 text-blue-400" />,
      highlight: "overview",
      features: [
        "Cards de monitoramento em tempo real",
        "Gráficos de progresso dos pacientes",
        "Estatísticas de desempenho",
        "Resumo das próximas sessões"
      ]
    },
    {
      title: "Gestão de Pacientes",
      description: "Gerencie todos os seus pacientes em um só lugar. Acompanhe progressos, histórico de sessões e informações importantes.",
      icon: <Users className="w-8 h-8 text-green-400" />,
      highlight: "patients",
      features: [
        "Lista completa de pacientes",
        "Status de tratamento",
        "Histórico de sessões",
        "Progresso individual"
      ]
    },
    {
      title: "Agenda de Sessões",
      description: "Organize sua agenda profissional com facilidade. Agende, gerencie e acompanhe todas as suas sessões de terapia.",
      icon: <Calendar className="w-8 h-8 text-purple-400" />,
      highlight: "sessions",
      features: [
        "Agendamento de sessões",
        "Diferentes tipos de atendimento",
        "Controle de status",
        "Lembretes automáticos"
      ]
    },
    {
      title: "Relatórios e Análises",
      description: "Crie relatórios detalhados sobre o progresso dos seus pacientes e analise dados para melhorar seus tratamentos.",
      icon: <TrendingUp className="w-8 h-8 text-orange-400" />,
      highlight: "reports",
      features: [
        "Relatórios de progresso",
        "Análises de tratamento",
        "Métricas de sucesso",
        "Exportação de dados"
      ]
    },
    {
      title: "Sistema de Mensagens",
      description: "Comunique-se facilmente com seus pacientes através de mensagens, chamadas e videoconferências integradas.",
      icon: <MessageCircle className="w-8 h-8 text-pink-400" />,
      highlight: "messages",
      features: [
        "Chat integrado",
        "Chamadas de voz e vídeo",
        "Notificações em tempo real",
        "Histórico de conversas"
      ]
    },
    {
      title: "Recursos Avançados",
      description: "Aproveite funcionalidades exclusivas para psicólogos: avaliações, planos de tratamento e muito mais.",
      icon: <Activity className="w-8 h-8 text-cyan-400" />,
      highlight: null,
      features: [
        "Avaliações psicológicas",
        "Planos de tratamento",
        "Rastreamento de humor",
        "Relatórios personalizados"
      ]
    },
    {
      title: "Tudo Pronto! 🎉",
      description: "Agora você está pronto para usar todas as funcionalidades do seu dashboard profissional. Boa sorte com sua prática!",
      icon: <CheckCircle className="w-8 h-8 text-green-400" />,
      highlight: null
    }
  ];

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finishTour();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const finishTour = async () => {
    if (user?.uid) {
      try {
        await markTourAsSeen(user.uid);
      } catch (error) {
        console.error('Erro ao marcar tour como visto:', error);
      }
    }
    onClose();
  };

  const skipTour = () => {
    finishTour();
  };

  const currentTourStep = tourSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tourSteps.length - 1;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-white/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
              <img 
                src="/Logo-Sereno3.png" 
                alt="Sereno Logo" 
                className="w-6 h-6 object-contain"
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Tour do Dashboard</h2>
              <p className="text-sm text-white/60">Passo {currentStep + 1} de {tourSteps.length}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={skipTour}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
              title="Pular tour"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              {currentTourStep.icon}
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              {currentTourStep.title}
            </h3>
            <p className="text-white/70 text-lg leading-relaxed">
              {currentTourStep.description}
            </p>
          </div>

          {/* Features da etapa atual */}
          {currentTourStep.features && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
              <h4 className="text-sm font-medium text-white/80 mb-3 text-center">
                Funcionalidades desta seção:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentTourStep.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-white/70">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dica especial */}
          {currentStep === 1 && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Star className="w-3 h-3 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-400 mb-1">Dica Pro</h4>
                  <p className="text-blue-300 text-sm">
                    Use os filtros de data e status para encontrar rapidamente as informações que você precisa. 
                    Os dados são atualizados em tempo real!
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Users className="w-3 h-3 text-green-400" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-green-400 mb-1">Organização</h4>
                  <p className="text-green-300 text-sm">
                    Mantenha seus pacientes organizados por status. Use as cores para identificar rapidamente 
                    casos urgentes, ativos ou inativos.
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Calendar className="w-3 h-3 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-purple-400 mb-1">Agendamento</h4>
                  <p className="text-purple-300 text-sm">
                    Configure lembretes automáticos para suas sessões. O sistema notifica você e seus pacientes 
                    sobre compromissos próximos.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Barra de progresso */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-white/60 mb-2">
              <span>Progresso do tour</span>
              <span>{Math.round(((currentStep + 1) / tourSteps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer com navegação */}
        <div className="flex items-center justify-between p-6 border-t border-white/10">
          <button
            onClick={handlePrevious}
            disabled={isFirstStep}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
              isFirstStep
                ? 'text-white/30 cursor-not-allowed'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <div className="flex space-x-2">
            {tourSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-white'
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center space-x-2 bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-white/90 transition-all duration-300"
          >
            <span>{isLastStep ? 'Finalizar' : 'Próximo'}</span>
            {!isLastStep && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PsychologistTour;
