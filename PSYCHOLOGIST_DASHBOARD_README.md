# Painel do Psicólogo - Sereno

## Visão Geral

O painel do psicólogo é uma ferramenta completa para profissionais de psicologia gerenciarem seus pacientes, sessões, relatórios e comunicações. Foi desenvolvido com foco em usabilidade e funcionalidades essenciais para a prática clínica.

## Funcionalidades Principais

### 🏠 Visão Geral (Dashboard)
- **Cards de Monitoramento**: Métricas em tempo real sobre pacientes, sessões e desempenho
- **Gráficos Interativos**: Visualização de progresso e tendências
- **Resumo Rápido**: Acesso rápido aos pacientes recentes e próximas sessões
- **Estatísticas**: Contadores de pacientes ativos, sessões realizadas, taxa de sucesso

### 👥 Gestão de Pacientes
- **Lista Completa**: Visualização de todos os pacientes com filtros avançados
- **Perfis Detalhados**: Informações completas sobre cada paciente
- **Status de Tratamento**: Controle de pacientes ativos, inativos e urgentes
- **Progresso Individual**: Acompanhamento do desenvolvimento de cada paciente
- **Adição de Novos Pacientes**: Formulário completo para cadastro

### 📅 Agenda de Sessões
- **Agendamento**: Criação de novas sessões com diferentes tipos (online, presencial, telefone)
- **Controle de Status**: Gerenciamento de sessões agendadas, em andamento e concluídas
- **Filtros Avançados**: Busca por data, status e tipo de sessão
- **Duração Configurável**: Sessões de 30, 45, 50, 60 ou 90 minutos
- **Observações**: Campo para anotações sobre cada sessão

### 📊 Relatórios e Análises
- **Tipos de Relatório**: Progresso do paciente, resumo de sessão, plano de tratamento, avaliação
- **Conteúdo Personalizado**: Campos para conteúdo, recomendações e próximos passos
- **Filtros por Data**: Relatórios da semana, mês ou período personalizado
- **Exportação**: Funcionalidade para baixar relatórios em diferentes formatos
- **Histórico Completo**: Acesso a todos os relatórios criados

### 💬 Sistema de Mensagens
- **Chat Integrado**: Comunicação direta com pacientes
- **Tipos de Mensagem**: Texto, chamada de voz, vídeo e email
- **Status de Leitura**: Controle de mensagens lidas e não lidas
- **Histórico de Conversas**: Acesso a todas as comunicações
- **Notificações**: Sistema de alertas para novas mensagens

## Configuração do Firebase

### 1. Estrutura das Coleções

#### Psicólogos (`psychologists`)
```json
{
  "userId": "string",
  "displayName": "string",
  "email": "string",
  "specialization": "string",
  "license": "string",
  "isActive": "boolean",
  "hasSeenTour": "boolean",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### Pacientes (`patients`)
```json
{
  "id": "string",
  "psychologistId": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "birthDate": "string",
  "diagnosis": "string",
  "notes": "string",
  "status": "string", // active, inactive, urgent
  "progress": "number",
  "lastSession": "timestamp",
  "nextSession": "timestamp",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### Sessões (`sessions`)
```json
{
  "id": "string",
  "psychologistId": "string",
  "patientId": "string",
  "patientName": "string",
  "scheduledDate": "timestamp",
  "duration": "number",
  "type": "string", // online, phone, in-person
  "status": "string", // scheduled, in-progress, completed, cancelled
  "notes": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### Relatórios (`reports`)
```json
{
  "id": "string",
  "psychologistId": "string",
  "patientId": "string",
  "patientName": "string",
  "title": "string",
  "type": "string", // patient-progress, session-summary, treatment-plan, assessment
  "content": "string",
  "recommendations": "string",
  "nextSteps": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### Mensagens (`messages`)
```json
{
  "id": "string",
  "senderId": "string",
  "senderName": "string",
  "recipientId": "string",
  "recipientName": "string",
  "subject": "string",
  "content": "string",
  "type": "string", // text, phone, video, email
  "read": "boolean",
  "readAt": "timestamp",
  "createdAt": "timestamp"
}
```

### 2. Regras de Segurança

As regras do Firestore já estão configuradas para garantir que:
- Psicólogos só acessem seus próprios dados
- Pacientes só vejam informações relacionadas a eles
- Sessões sejam acessíveis apenas aos participantes
- Relatórios sejam privados para cada psicólogo
- Mensagens sejam seguras entre remetente e destinatário

### 3. Índices Necessários

Os índices do Firestore já estão configurados para otimizar:
- Consultas de pacientes por psicólogo e status
- Busca de sessões por data e status
- Relatórios ordenados por data de criação
- Mensagens ordenadas por data de envio
- Filtros combinados para melhor performance

## Instalação e Configuração

### 1. Dependências
```bash
npm install lucide-react firebase
```

### 2. Configuração do Firebase
Certifique-se de que o arquivo `firebase.js` está configurado corretamente com suas credenciais.

### 3. Configuração das Regras
```bash
firebase deploy --only firestore:rules
```

### 4. Configuração dos Índices
```bash
firebase deploy --only firestore:indexes
```

## Uso do Sistema

### Primeiro Acesso
1. **Tour Automático**: Na primeira vez que um psicólogo acessa o painel, um tour interativo é exibido
2. **Configuração Inicial**: O sistema guia o usuário através das principais funcionalidades
3. **Dados de Exemplo**: O painel funciona mesmo sem dados, mostrando mensagens apropriadas

### Fluxo de Trabalho Típico
1. **Adicionar Pacientes**: Use o formulário na aba "Pacientes" para cadastrar novos pacientes
2. **Agendar Sessões**: Na aba "Sessões", crie novos agendamentos para seus pacientes
3. **Conduzir Sessões**: Atualize o status das sessões conforme elas acontecem
4. **Criar Relatórios**: Documente o progresso e crie relatórios detalhados
5. **Comunicar**: Use o sistema de mensagens para manter contato com pacientes

## Recursos Avançados

### Filtros e Busca
- **Busca Global**: Encontre rapidamente pacientes, sessões ou relatórios
- **Filtros por Status**: Organize dados por diferentes critérios
- **Filtros por Data**: Visualize informações de períodos específicos

### Responsividade
- **Design Mobile-First**: Interface otimizada para todos os dispositivos
- **Navegação Intuitiva**: Abas organizadas logicamente para fácil acesso
- **Modais Responsivos**: Formulários adaptáveis a diferentes tamanhos de tela

### Performance
- **Carregamento Lazy**: Dados são carregados conforme necessário
- **Cache Inteligente**: Informações são armazenadas localmente quando apropriado
- **Otimização de Consultas**: Índices configurados para consultas eficientes

## Suporte e Manutenção

### Logs e Monitoramento
- **Console Logs**: Informações detalhadas para debugging
- **Tratamento de Erros**: Mensagens amigáveis para problemas comuns
- **Fallbacks**: Sistema continua funcionando mesmo com erros de rede

### Atualizações
- **Versionamento**: Sistema de controle de versão para todas as funcionalidades
- **Compatibilidade**: Mantém compatibilidade com versões anteriores
- **Documentação**: README atualizado com cada nova funcionalidade

## Contribuição

Para contribuir com o desenvolvimento:
1. Fork o repositório
2. Crie uma branch para sua feature
3. Implemente as mudanças seguindo os padrões do projeto
4. Teste todas as funcionalidades
5. Submeta um pull request com descrição detalhada

## Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

**Desenvolvido com ❤️ para a comunidade de psicólogos**
