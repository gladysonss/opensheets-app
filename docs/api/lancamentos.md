# Exemplos de Uso da API de Lançamentos

**Autenticação:**
Header: `Authorization: Bearer SEU_TOKEN_AQUI`

---

## 1. Listar Lançamentos

Retorna os lançamentos do usuário com filtros opcionais.

**Endpoint:** `GET /api/lancamentos`

**Parâmetros de Query:**
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 20)
- `startDate`: Data inicial (YYYY-MM-DD)
- `endDate`: Data final (YYYY-MM-DD)
- `type`: Tipo de transação ('Despesa', 'Receita')
- `contaId`: ID da conta
- `categoriaId`: ID da categoria

**Exemplo cURL:**
```bash
curl -X GET "http://localhost:3000/api/lancamentos?page=1&limit=10&type=Despesa" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 2. Criar Lançamentos (Bulk)

Cria um ou mais lançamentos.

**Endpoint:** `POST /api/lancamentos`

**Payload JSON (Array):**
```json
[
  {
    "name": "Compra Supermercado",
    "amount": 150.50,
    "purchaseDate": "2023-10-27",
    "transactionType": "Despesa",
    "pagadorId": "UUID_PAGADOR",
    "contaId": "UUID_CONTA",
    "categoriaId": "UUID_CATEGORIA",
    "condition": "À vista",
    "paymentMethod": "Cartão de crédito"
  }
]
```

**Exemplo cURL:**
```bash
curl -X POST http://localhost:3000/api/lancamentos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '[
    {
      "name": "Compra Supermercado",
      "amount": 150.50,
      "purchaseDate": "2023-10-27",
      "transactionType": "Despesa",
      "condition": "À vista"
    }
  ]'
```

---

## 3. Atualizar Lançamentos (Bulk)

Atualiza um ou mais lançamentos.

**Endpoint:** `PUT /api/lancamentos`

**Payload JSON (Array):**
```json
[
  {
    "id": "UUID_LANCAMENTO",
    "name": "Compra Supermercado Corrigida",
    "amount": 160.00
  }
]
```

**Exemplo cURL:**
```bash
curl -X PUT http://localhost:3000/api/lancamentos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '[
    {
      "id": "UUID_LANCAMENTO",
      "amount": 160.00
    }
  ]'
```

---

## 4. Deletar Lançamentos

Deleta um ou mais lançamentos.

**Endpoint:** `DELETE /api/lancamentos`

**Payload JSON:**
```json
{
  "ids": ["UUID_LANCAMENTO_1", "UUID_LANCAMENTO_2"]
}
```

**Exemplo cURL:**
```bash
curl -X DELETE http://localhost:3000/api/lancamentos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "ids": ["UUID_LANCAMENTO_1"]
  }'
```
