# Exemplos de Uso da API de Veículos

Aqui estão exemplos de como utilizar os endpoints da API de veículos. Você pode usar ferramentas como Postman, Insomnia ou cURL para testar.

**Autenticação:**
A API utiliza autenticação via Token Bearer. Você deve incluir o header `Authorization` em todas as requisições.
O token deve ser gerado/obtido nas configurações da sua conta.

Header: `Authorization: Bearer SEU_TOKEN_AQUI`

**Notas Gerais:**
*   **Pagador Padrão:** Se o campo `pagadorId` não for enviado, o sistema utilizará automaticamente o primeiro pagador cadastrado na sua conta.
*   **Status de Pagamento:**
    *   **Cartão de Crédito:** Sempre registrado como **não pago** (aguardando fatura).
    *   **Parcelado (Outros meios):** A primeira parcela é registrada como **paga**, as demais como **não pagas**.
    *   **À Vista (Outros meios):** Registrado como **pago**.

---

## 1. Listar Veículos

Retorna todos os veículos cadastrados para o usuário logado.

**Endpoint:** `GET /api/veiculos`

**Exemplo cURL:**
```bash
curl -X GET http://localhost:3000/api/veiculos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 2. Listar Lançamentos de um Veículo

Retorna o histórico de despesas (abastecimentos, manutenções, outros) de um veículo específico.

**Endpoint:** `GET /api/veiculos/[VEHICLE_ID]/lancamentos`

**Exemplo cURL:**
```bash
curl -X GET http://localhost:3000/api/veiculos/YOUR_VEHICLE_UUID_HERE/lancamentos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 3. Registrar Abastecimento

Cria um novo registro de abastecimento e o lançamento financeiro associado.

**Endpoint:** `POST /api/veiculos/abastecimento`

**Payload JSON:**
```json
{
  "veiculoId": "YOUR_VEHICLE_UUID_HERE",
  "date": "2023-10-27",
  "odometer": 50000,
  "liters": 45.5,
  "pricePerLiter": 5.89,
  "totalCost": 268.00,
  "fuelType": "Gasolina",
  "isFullTank": true,
  "paymentMethod": "Cartão de crédito",
  "condition": "À vista",
  "contaId": "YOUR_ACCOUNT_UUID_HERE", 
  "cartaoId": "YOUR_CARD_UUID_HERE",
  "categoriaId": "YOUR_CATEGORY_UUID_HERE",
  "note": "Posto Ipiranga"
}
```

**Exemplo cURL:**
```bash
curl -X POST http://localhost:3000/api/veiculos/abastecimento \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "veiculoId": "YOUR_VEHICLE_UUID_HERE",
    "date": "2023-10-27",
    "odometer": 50000,
    "liters": 45.5,
    "pricePerLiter": 5.89,
    "totalCost": 268.00,
    "fuelType": "Gasolina",
    "isFullTank": true,
    "paymentMethod": "Cartão de crédito",
    "condition": "À vista"
  }'
```

---

## 4. Registrar Manutenção

Cria um novo registro de manutenção e o lançamento financeiro associado.

**Endpoint:** `POST /api/veiculos/manutencao`

**Payload JSON:**
```json
{
  "veiculoId": "YOUR_VEHICLE_UUID_HERE",
  "date": "2023-10-28",
  "odometer": 50100,
  "type": "preventiva",
  "serviceName": "Troca de Óleo",
  "description": "Troca de óleo e filtro",
  "parts": "Óleo 5W30, Filtro de Óleo",
  "laborCost": 50.00,
  "partsCost": 150.00,
  "totalCost": 200.00,
  "workshop": "Oficina do Zé",
  "paymentMethod": "Pix",
  "condition": "À vista",
  "contaId": "YOUR_ACCOUNT_UUID_HERE"
}
```

**Exemplo cURL:**
```bash
curl -X POST http://localhost:3000/api/veiculos/manutencao \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "veiculoId": "YOUR_VEHICLE_UUID_HERE",
    "date": "2023-10-28",
    "odometer": 50100,
    "type": "preventiva",
    "serviceName": "Troca de Óleo",
    "totalCost": 200.00,
    "paymentMethod": "Pix",
    "condition": "À vista"
  }'
```

---

## 5. Registrar Outra Despesa

Cria uma despesa genérica para o veículo. O sistema adicionará automaticamente o prefixo "Outros - [Veículo] -" ao nome.

**Endpoint:** `POST /api/veiculos/outros`

**Payload JSON:**
```json
{
  "veiculoId": "YOUR_VEHICLE_UUID_HERE",
  "name": "IPVA 2024",
  "amount": 1500.00,
  "date": "2024-01-15",
  "paymentMethod": "Boleto",
  "condition": "À vista",
  "contaId": "YOUR_ACCOUNT_UUID_HERE",
  "note": "Primeira parcela"
}
```

**Exemplo cURL:**
```bash
curl -X POST http://localhost:3000/api/veiculos/outros \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "veiculoId": "YOUR_VEHICLE_UUID_HERE",
    "name": "IPVA 2024",
    "amount": 1500.00,
    "date": "2024-01-15",
    "paymentMethod": "Boleto",
    "condition": "À vista"
  }'
```

---

## 6. Registrar Despesa Parcelada (Exemplo)

Exemplo de como registrar uma despesa parcelada (ex: IPVA em 4x).

**Endpoint:** `POST /api/veiculos/outros`

**Payload JSON:**
```json
{
  "veiculoId": "YOUR_VEHICLE_UUID_HERE",
  "name": "IPVA 2024 Parcelado",
  "amount": 2000.00,
  "date": "2024-01-15",
  "dueDate": "2024-01-20",
  "paymentMethod": "Boleto",
  "condition": "Parcelado",
  "installmentCount": 4,
  "contaId": "YOUR_ACCOUNT_UUID_HERE"
}
```

**Exemplo cURL:**
```bash
curl -X POST http://localhost:3000/api/veiculos/outros \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "veiculoId": "YOUR_VEHICLE_UUID_HERE",
    "name": "IPVA 2024 Parcelado",
    "amount": 2000.00,
    "date": "2024-01-15",
    "dueDate": "2024-01-20",
    "paymentMethod": "Boleto",
    "condition": "Parcelado",
    "installmentCount": 4
  }'
```
