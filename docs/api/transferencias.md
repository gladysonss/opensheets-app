# Exemplos de Uso da API de Transferências

**Autenticação:**
Header: `Authorization: Bearer SEU_TOKEN_AQUI`

---

## 1. Realizar Transferência

Realiza uma transferência entre duas contas do usuário.

**Endpoint:** `POST /api/transferencias`

**Payload JSON:**
```json
{
  "origem": "UUID_CONTA_ORIGEM",
  "destino": "UUID_CONTA_DESTINO",
  "valor": 500.00,
  "data": "2023-10-27",
  "periodo": "2023-10"
}
```

**Exemplo cURL:**
```bash
curl -X POST http://localhost:3000/api/transferencias \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "origem": "UUID_CONTA_ORIGEM",
    "destino": "UUID_CONTA_DESTINO",
    "valor": 500.00,
    "data": "2023-10-27",
    "periodo": "2023-10"
  }'
```
