# Configuração da API Ninjas para Exercícios

Para que o sistema possa buscar informações detalhadas sobre exercícios na API Ninjas, é necessário configurar uma chave de API.

## Instruções

1. Crie uma conta gratuita em [API Ninjas](https://api-ninjas.com/register)
2. Após o registro, obtenha sua chave de API na [página da sua conta](https://api-ninjas.com/account)
3. Crie um arquivo `.env.local` na raiz do projeto com o seguinte conteúdo:

```
VITE_API_NINJAS_KEY=sua_chave_api_aqui
```

4. Substitua `sua_chave_api_aqui` pela chave que você obteve
5. Reinicie o servidor de desenvolvimento

## Alternativa: Usar apenas o banco de dados local

Se preferir não usar a API externa, o sistema funcionará normalmente com o banco de dados local de exercícios. Nesse caso, você verá mensagens de log informando que a API não está configurada, mas isso não afetará o funcionamento do sistema.

## Benefícios da API

- Acesso a mais de 1300 exercícios detalhados
- Instruções precisas de execução
- Informações sobre grupos musculares trabalhados
- Níveis de dificuldade
- Equipamentos necessários

## Plano Gratuito da API Ninjas

- 50.000 requisições por mês
- Limite de 10.000 requisições por dia
- Sem necessidade de cartão de crédito