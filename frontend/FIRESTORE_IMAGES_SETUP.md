# Sistema de Imagens com Firestore

## Visão Geral

Este projeto foi migrado do Firebase Storage para o Firestore para armazenar imagens de perfil e banner dos usuários. As imagens são armazenadas como strings Base64 diretamente no banco de dados.

## Estrutura dos Dados

### Coleção: `users/{userId}/images/{imageId}`

Cada imagem é armazenada como um documento na subcoleção `images` do usuário:

```json
{
  "base64": "iVBORw0KGgoAAAANSUhEUgAA...",
  "type": "profilePhoto" | "bannerPhoto",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "size": 12345,
  "mimeType": "image/jpeg"
}
```

### Campos do Documento

- **`base64`**: String Base64 da imagem (sem o prefixo `data:image/...;base64,`)
- **`type`**: Tipo da imagem (`profilePhoto` ou `bannerPhoto`)
- **`createdAt`**: Timestamp de criação
- **`size`**: Tamanho aproximado em bytes
- **`mimeType`**: Tipo MIME da imagem

## Serviços

### `profileImageService.js`

Serviço principal para gerenciar imagens:

- `saveImageToFirestore(imageData, userId, imageType)`: Salva uma nova imagem
- `getImageFromFirestore(imageId, userId)`: Recupera uma imagem
- `deleteImageFromFirestore(imageId, userId, imageType)`: Remove uma imagem
- `replaceProfilePhoto(imageData, userId, currentPhotoId)`: Substitui foto de perfil
- `replaceBannerPhoto(imageData, userId, currentBannerId)`: Substitui banner

### `useImages.js`

Hook React para gerenciar estado das imagens:

- `profilePhoto`: Dados da foto de perfil atual
- `bannerPhoto`: Dados do banner atual
- `loading`: Estado de carregamento
- `loadUserImages(profileData)`: Carrega todas as imagens do usuário
- `updateImage(imageData, imageType, currentImageId)`: Atualiza uma imagem
- `clearImages()`: Limpa o cache das imagens

## Vantagens do Firestore

### ✅ Prós

1. **Simplicidade**: Não precisa gerenciar URLs de Storage
2. **Consistência**: Dados e imagens ficam no mesmo banco
3. **Transações**: Possibilidade de operações atômicas
4. **Backup**: Backup automático com o resto dos dados
5. **Regras**: Controle de acesso mais granular

### ⚠️ Limitações

1. **Tamanho**: Documentos Firestore têm limite de 1MB
2. **Performance**: Imagens grandes podem impactar consultas
3. **Custo**: Armazenamento pode ser mais caro para muitas imagens
4. **Cache**: Sem cache automático como Storage

## Regras de Segurança

```javascript
// Usuários podem ler suas próprias imagens
match /users/{userId}/images/{imageId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && request.auth.uid == userId;
  allow create: if request.auth != null && request.auth.uid == userId;
  allow delete: if request.auth != null && request.auth.uid == userId;
}
```

## Uso no Componente Profile

```jsx
import { useImages } from '../hooks/useImages';

const Profile = () => {
  const { 
    profilePhoto, 
    bannerPhoto, 
    loading: imagesLoading,
    loadUserImages, 
    updateImage 
  } = useImages(user?.uid);

  // Carregar imagens quando usuário for carregado
  useEffect(() => {
    if (user) {
      loadUserImages(user.profileData);
    }
  }, [user, loadUserImages]);

  // Atualizar imagem
  const handleUpdateProfilePhoto = async (imageData) => {
    const currentPhotoId = user?.profileData?.profilePhotoId;
    await updateImage(imageData, 'profilePhoto', currentPhotoId);
  };
};
```

## Migração do Storage

Para migrar imagens existentes do Storage para o Firestore:

1. Baixar imagens do Storage
2. Converter para Base64
3. Salvar no Firestore usando o novo serviço
4. Atualizar referências nos documentos de usuário

## Considerações de Performance

### Otimizações Recomendadas

1. **Compressão**: Comprimir imagens antes de converter para Base64
2. **Tamanho**: Manter imagens abaixo de 500KB
3. **Cache**: Implementar cache local para imagens frequentemente acessadas
4. **Lazy Loading**: Carregar imagens apenas quando necessário

### Limites Recomendados

- **Foto de Perfil**: Máximo 200KB (200x200px)
- **Banner**: Máximo 500KB (1200x300px)

## Troubleshooting

### Erro: "Document too large"
- Comprima a imagem antes de salvar
- Reduza a resolução da imagem
- Use formato mais eficiente (JPEG em vez de PNG)

### Erro: "Permission denied"
- Verifique se as regras do Firestore estão corretas
- Confirme se o usuário está autenticado
- Verifique se o usuário tem permissão para acessar o documento

### Imagem não carrega
- Verifique se o Base64 está correto
- Confirme se o documento existe no Firestore
- Verifique se há erros no console do navegador

## Próximos Passos

1. **Implementar compressão de imagens**
2. **Adicionar cache local**
3. **Criar sistema de backup automático**
4. **Implementar limpeza de imagens antigas**
5. **Adicionar suporte a múltiplos formatos**
