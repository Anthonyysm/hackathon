# Plasma Mobile - Implementação

## Visão Geral
Esta implementação oculta automaticamente o efeito de plasma quando o usuário está acessando a aplicação em dispositivos móveis, melhorando a performance e experiência do usuário.

## Como Funciona

### 1. Hook useIsMobile
- **Arquivo**: `src/hooks/useIsMobile.js`
- **Funcionalidade**: Detecta se o usuário está em um dispositivo móvel baseado na largura da tela
- **Breakpoint**: 768px (padrão mobile-first)
- **Recursos**: 
  - Detecção em tempo real
  - Listener para mudanças de tamanho da tela
  - Cleanup automático de event listeners

### 2. Modificação do Componente Plasma
- **Arquivo**: `src/Components/Plasma.jsx`
- **Mudanças**:
  - Importação do hook `useIsMobile`
  - Estado `shouldRender` para controlar a renderização
  - Verificação de dispositivo móvel dentro do `useEffect`
  - Renderização condicional baseada no estado

## Código Implementado

### Hook useIsMobile
```javascript
import { useState, useEffect } from 'react';

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};
```

### Componente Plasma Modificado
```javascript
export const Plasma = ({ ... }) => {
  const containerRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const isMobile = useIsMobile();
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Se estiver no mobile, não renderiza o efeito
    if (isMobile) {
      setShouldRender(false);
      return;
    }

    setShouldRender(true);
    // ... resto do código existente
  }, [color, speed, direction, scale, opacity, mouseInteractive, isMobile]);

  // Se não deve renderizar (mobile), retorna null
  if (!shouldRender) {
    return null;
  }

  return <div ref={containerRef} className="w-full h-full overflow-hidden relative" />;
};
```

## Por que esta abordagem?

### ❌ **Problema da implementação anterior:**
- Retornar `null` antes de todos os hooks serem executados quebra as regras do React
- Causa erro: "Rendered fewer hooks than expected"
- Os hooks devem sempre ser executados na mesma ordem

### ✅ **Solução implementada:**
- Usar estado `shouldRender` para controlar a renderização
- Verificar mobile dentro do `useEffect` (após todos os hooks)
- Renderização condicional no return (não quebra as regras dos hooks)

## Benefícios

1. **Performance**: Elimina o processamento WebGL desnecessário em dispositivos móveis
2. **Bateria**: Reduz o consumo de bateria em dispositivos móveis
3. **Experiência**: Melhora a fluidez da interface em dispositivos com recursos limitados
4. **Responsividade**: Adaptação automática baseada no tamanho da tela
5. **Conformidade**: Respeita as regras dos hooks do React

## Testes

### Como Testar
1. Abrir a aplicação em diferentes dispositivos
2. Redimensionar a janela do navegador
3. Usar as ferramentas de desenvolvedor para simular dispositivos móveis
4. Verificar se o efeito Plasma aparece/desaparece conforme esperado
5. **Importante**: Verificar se não há erros no console relacionados aos hooks

## Breakpoints

- **Mobile**: < 768px (Plasma oculto)
- **Desktop**: ≥ 768px (Plasma visível)

## Considerações Técnicas

- **WebGL**: O efeito usa WebGL 2.0, que pode ter suporte limitado em alguns dispositivos móveis
- **Performance**: O efeito é computacionalmente intensivo, especialmente em dispositivos com GPU limitada
- **Responsividade**: A detecção é feita em tempo real, respondendo a mudanças de orientação da tela
- **Hooks**: Implementação respeita as regras dos hooks do React (nunca retorna antes de todos os hooks)

## Manutenção

- O hook `useIsMobile` pode ser facilmente reutilizado em outros componentes
- O breakpoint de 768px pode ser ajustado conforme necessário
- A implementação é limpa e não afeta a funcionalidade existente em desktop
- A solução é robusta e não causa erros de renderização
