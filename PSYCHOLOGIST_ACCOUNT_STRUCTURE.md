# 📋 Estrutura da Coleção PsychologistAccount

## 🎯 **Objetivo**
A coleção `PsychologistAccount` foi criada para armazenar especificamente os dados de cadastro e perfil dos psicólogos, separando-os da coleção geral de usuários (`users`).

## 🏗️ **Estrutura dos Documentos**

### **Campos Obrigatórios (Criados no Cadastro)**
```javascript
{
  userId: "string",                    // ID do usuário no Firebase Auth
  displayName: "string",               // Nome completo do psicólogo
  username: "string",                  // Nome de usuário único
  email: "string",                     // Email de contato
  birthDate: "string",                 // Data de nascimento (YYYY-MM-DD)
  phone: "string",                     // Telefone de contato
  crp: "string",                       // Número do CRP
  specialty: "string",                 // Especialidade principal
  yearsExperience: "number",           // Anos de experiência
  acceptsOnline: "boolean",            // Aceita atendimento online
  bio: "string",                       // Biografia/descrição
  createdAt: "timestamp",              // Data de criação
  updatedAt: "timestamp"               // Data da última atualização
}
```

### **Campos Automáticos (Valores Padrão)**
```javascript
{
  isAvailable: true,                   // Status de disponibilidade
  rating: 5.0,                        // Rating inicial (5 estrelas)
  totalSessions: 0,                   // Total de sessões realizadas
  availableSlots: [                   // Horários disponíveis padrão
    "09:00", "10:00", "11:00", 
    "14:00", "15:00", "16:00", "17:00"
  ],
  languages: ["Português"],           // Idiomas falados
  education: "Psicologia",            // Formação acadêmica
  approach: "string",                 // Abordagem terapêutica (baseada na especialidade)
  certifications: [],                 // Certificações adicionais
  insurance: false,                   // Aceita convênios
  virtualSessions: "boolean",         // Atende online
  inPersonSessions: true              // Atende presencialmente
}
```

## 🔄 **Fluxo de Cadastro**

### **1. Usuário Comum (Cliente)**
- Dados salvos apenas na coleção `users`
- Campo `role: 'cliente'`

### **2. Psicólogo**
- **Dados básicos**: Salvos na coleção `users` com `role: 'psicologo'`
- **Dados específicos**: Salvos na coleção `PsychologistAccount`
- **Relacionamento**: Ambos documentos usam o mesmo `userId`

## 📊 **Como o Sistema Busca Psicólogos**

### **Localização**
- **Coleção**: `PsychologistAccount`
- **Filtro**: `isAvailable == true`
- **Ordenação**: Por rating (maior primeiro) e depois por experiência

### **Campos Utilizados na Busca**
```javascript
// Campos principais para exibição
name: psychologistData.displayName
specialty: psychologistData.specialty
experience: `${psychologistData.yearsExperience} anos`
rating: psychologistData.rating
availableSlots: psychologistData.availableSlots
description: psychologistData.bio
email: psychologistData.email
phone: psychologistData.phone
crp: psychologistData.crp
```

## 🛠️ **Vantagens da Nova Estrutura**

### **1. Separação de Responsabilidades**
- **`users`**: Dados básicos de autenticação e perfil
- **`PsychologistAccount`**: Dados específicos de psicólogos

### **2. Performance**
- Busca direta na coleção de psicólogos
- Não precisa filtrar por role na coleção geral
- Índices mais eficientes

### **3. Escalabilidade**
- Fácil adicionar novos campos específicos para psicólogos
- Não afeta a estrutura geral de usuários
- Melhor organização dos dados

### **4. Manutenibilidade**
- Estrutura clara e organizada
- Fácil de entender e modificar
- Separação lógica dos dados

## 🔍 **Exemplo de Uso**

### **Cadastro de Psicólogo**
```javascript
// 1. Criar usuário no Firebase Auth
const userCredential = await createUserWithEmailAndPassword(auth, email, password);

// 2. Salvar dados básicos em 'users'
await setDoc(doc(db, 'users', user.uid), {
  displayName: name,
  email: email,
  role: 'psicologo',
  // ... outros campos básicos
});

// 3. Salvar dados específicos em 'PsychologistAccount'
await setDoc(doc(db, 'PsychologistAccount', user.uid), {
  userId: user.uid,
  displayName: name,
  crp: crp,
  specialty: specialty,
  // ... outros campos específicos
});
```

### **Busca de Psicólogos Disponíveis**
```javascript
const psychologistsRef = collection(db, 'PsychologistAccount');
const q = query(psychologistsRef, where('isAvailable', '==', true));
const querySnapshot = await getDocs(q);

querySnapshot.forEach((doc) => {
  const psychologistData = doc.data();
  // Processar dados do psicólogo
});
```

## 📝 **Notas Importantes**

1. **Compatibilidade**: O sistema continua funcionando com psicólogos já cadastrados
2. **Migração**: Psicólogos existentes podem ser migrados para a nova estrutura
3. **Validação**: Todos os campos obrigatórios são validados no cadastro
4. **Segurança**: Regras do Firestore devem ser configuradas adequadamente
5. **Backup**: Recomenda-se backup antes de implementar mudanças

## 🚀 **Próximos Passos**

1. **Testar cadastro** de novos psicólogos
2. **Verificar busca** na nova coleção
3. **Configurar regras** de segurança do Firestore
4. **Migrar dados** de psicólogos existentes (se necessário)
5. **Monitorar performance** e ajustar índices se necessário
