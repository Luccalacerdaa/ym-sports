# Configuração do ChatGPT para Geração de Treinos

Este guia explica como configurar o sistema para usar o ChatGPT para gerar treinos personalizados.

## Opções de Geração de Treinos

O sistema suporta duas opções para gerar treinos:

1. **OpenAI API** (padrão): Usa a API oficial da OpenAI, requer uma chave de API e tem custos associados.
2. **ChatGPT** (nova opção): Usa uma API personalizada que se conecta ao ChatGPT, sem custo adicional.

## Como Ativar o Modo ChatGPT

Para usar o ChatGPT em vez da API da OpenAI, siga estas etapas:

1. Crie ou edite o arquivo `.env.local` na raiz do projeto
2. Adicione a seguinte linha:

```
VITE_USE_CHATGPT=true
```

3. Opcionalmente, você pode configurar a URL da API do ChatGPT:

```
VITE_CHATGPT_API_URL=https://sua-api-chatgpt.com/api/generate-training
```

4. Se não configurar a URL, o sistema usará a URL padrão: `https://api.ymsports.com.br/api/generate-training`
5. Reinicie o servidor de desenvolvimento

## Como Funciona

Quando o modo ChatGPT está ativado:

1. O sistema envia o prompt de treino para a API personalizada
2. A API processa o prompt usando o ChatGPT
3. A resposta é formatada como JSON e retornada ao aplicativo
4. O aplicativo processa o JSON e cria os treinos personalizados

## Vantagens do Modo ChatGPT

- Sem custos adicionais de API
- Sem limitações de cota
- Acesso a modelos mais recentes do ChatGPT
- Respostas mais completas e detalhadas

## Solução de Problemas

Se encontrar problemas com a geração de treinos:

1. Verifique se a variável `VITE_USE_CHATGPT` está configurada corretamente
2. Verifique se a URL da API está acessível
3. Verifique os logs no console para mensagens de erro detalhadas
4. Tente alternar entre os modos para identificar o problema

## API Personalizada

Se você deseja implementar sua própria API para conectar ao ChatGPT, ela deve:

1. Aceitar requisições POST com um campo `prompt` contendo o texto do prompt
2. Retornar um JSON com um campo `result` contendo o resultado do ChatGPT
3. O `result` pode ser um objeto JSON ou uma string JSON válida
