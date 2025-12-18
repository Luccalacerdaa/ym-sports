# ⏰ Guia de Frequências do Vercel Cron

## 💰 Seu Plano: Pro ($20/mês)

**Incluído**:
- ✅ Cron Jobs ilimitados
- ✅ 1.000.000 function invocations/mês
- ✅ Execution time: 15min por função
- ✅ Notificações ilimitadas (custo zero)

**Custo**: Somente pela execução do cron, não pelas notificações enviadas.

---

## 📊 Frequências e Uso Mensal

| Frequência | Cron Syntax | Execuções/Dia | Execuções/Mês | % do Limite (1M) |
|------------|-------------|---------------|---------------|-------------------|
| **1 minuto** | `* * * * *` | 1.440 | 43.200 | 4,3% ✅ |
| **2 minutos** | `*/2 * * * *` | 720 | 21.600 | 2,2% ✅ |
| **3 minutos** | `*/3 * * * *` | 480 | 14.400 | 1,4% ✅ |
| **5 minutos** | `*/5 * * * *` | 288 | 8.640 | 0,9% ✅ |
| **10 minutos** | `*/10 * * * *` | 144 | 4.320 | 0,4% ✅ |
| **15 minutos** | `*/15 * * * *` | 96 | 2.880 | 0,3% ✅ |

**Conclusão**: Com o plano Pro, TODAS essas frequências estão **muito abaixo** do limite. Você pode usar até **1 minuto** sem problemas!

---

## 🎯 Recomendações por Caso de Uso

### 🏃 Eventos Esportivos (Alta Prioridade)
**Recomendado**: `*/2 * * * *` (a cada 2 minutos)

**Por quê?**
- Jogos e treinos precisam de notificações precisas
- Diferença de 2min é aceitável
- Usa apenas 2,2% do limite mensal
- Notificações chegam rápido e confiáveis

**Exemplo**:
- Evento às 15:00
- Primeira verificação: 14:58 (notifica 30min antes)
- Segunda verificação: 14:56
- Terceira verificação: 14:54
- ...
- Notificação de "5min antes": 14:56 ou 14:58
- Notificação de "AGORA": 15:00 ou 15:02

---

### ⚡ Máxima Precisão (Ultra Rápido)
**Recomendado**: `* * * * *` (a cada 1 minuto)

**Por quê?**
- Notificações quase instantâneas
- Precisão máxima (erro de até 1min)
- Usa apenas 4,3% do limite
- Perfeito para eventos críticos

**Exemplo**:
- Evento às 15:00
- Verificação: 14:55, 14:56, 14:57, 14:58, 14:59, 15:00, 15:01
- Notificações chegam EXATAMENTE no minuto certo

---

### 🌿 Economia Moderada
**Recomendado**: `*/5 * * * *` (a cada 5 minutos) - **ATUAL**

**Por quê?**
- Bom equilíbrio entre precisão e recursos
- Usa apenas 0,9% do limite
- Aceitável para maioria dos casos
- Você já está usando isso

**Exemplo**:
- Evento às 15:00
- Verificações: 14:50, 14:55, 15:00, 15:05
- Notificação "30min antes": 14:30
- Notificação "5min antes": 14:55 ou 15:00 (pode perder)

---

### 🐢 Máxima Economia (Não Recomendado para Eventos)
**Opção**: `*/15 * * * *` (a cada 15 minutos)

**Por quê?**
- Pode perder notificações importantes
- Exemplo: Evento às 15:07, próxima verificação só 15:15 (já passou)
- Não recomendado para eventos esportivos

---

## 🎯 Minha Recomendação para Você

### Para Eventos Esportivos: `*/2 * * * *` (A CADA 2 MINUTOS)

**Vantagens**:
- ✅ Notificações rápidas e precisas
- ✅ Erro máximo de 2 minutos (aceitável)
- ✅ Usa apenas 21.600 execuções/mês (2,2% do limite)
- ✅ Sobram 978.400 invocations para outras funções
- ✅ Muito mais confiável que 5 minutos
- ✅ Custo: $0 (incluído no plano)

**Código para ajustar**:
```json
// vercel.json
"crons": [
  {
    "path": "/api/check-events-cron",
    "schedule": "*/2 * * * *"  // A cada 2 minutos
  }
]
```

---

## 🔥 Quer Máxima Precisão? `* * * * *` (A CADA 1 MINUTO)

Se você quer notificações **instantâneas**:

```json
// vercel.json
"crons": [
  {
    "path": "/api/check-events-cron",
    "schedule": "* * * * *"  // A cada 1 minuto
  }
]
```

**Uso mensal**: 43.200 execuções (4,3% do limite) - **totalmente seguro!**

---

## 💡 Outros Cron Jobs do Seu Sistema

Além do cron de eventos, você também tem:
- **Notificações Diárias**: 7 execuções/dia (GitHub Actions ou outro cron)

**Uso total estimado** (se usar 1min para eventos):
- Eventos: 43.200/mês
- Diárias: 210/mês (7x30 dias)
- **Total**: ~43.500/mês (4,3% do limite de 1M)

**Sobram**: 956.500 invocations para outras features! 🚀

---

## 📈 Escalabilidade

### Com 100 Usuários:
- Cron a cada 2min: 21.600 execuções/mês
- Cada execução pode enviar para 100 usuários
- **Total de notificações**: Ilimitadas (push é grátis)
- **Custo extra**: $0

### Com 1.000 Usuários:
- Mesmas 21.600 execuções/mês
- Cada execução envia para 1.000 usuários
- **Total de notificações**: Ilimitadas
- **Custo extra**: $0

### Com 10.000 Usuários:
- Mesmas 21.600 execuções/mês
- Pode precisar otimizar (batch processing)
- **Custo extra**: Talvez precisar de mais execution time

---

## 🎯 Resumo Executivo

| Frequência | Uso Mensal | Precisão | Recomendação |
|------------|-----------|----------|--------------|
| **1 minuto** | 4,3% | ⭐⭐⭐⭐⭐ | Máxima precisão |
| **2 minutos** | 2,2% | ⭐⭐⭐⭐ | **IDEAL para eventos** 🏆 |
| **5 minutos** | 0,9% | ⭐⭐⭐ | Atual (pode melhorar) |
| **10 minutos** | 0,4% | ⭐⭐ | Economia desnecessária |
| **15 minutos** | 0,3% | ⭐ | Não recomendado |

---

## 🚀 Quer Mudar Agora?

Me avisa qual frequência você quer:
- **1 minuto**: Máxima precisão (4,3% do limite)
- **2 minutos**: Ideal para eventos (2,2% do limite) - **RECOMENDADO**
- **3 minutos**: Meio termo (1,4% do limite)
- **5 minutos**: Manter atual (0,9% do limite)

Eu ajusto o código e faço o deploy! 💪

---

## 📚 Links Úteis

- [Vercel Cron Docs](https://vercel.com/docs/cron-jobs)
- [Vercel Pricing](https://vercel.com/pricing)
- [Cron Expression Generator](https://crontab.guru/)

---

**Com o plano Pro, você pode usar tranquilamente 1-2 minutos sem medo!** 🎉

