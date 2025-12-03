# Exemplos de Uso da API de Cartões

**Autenticação:**
Header: `Authorization: Bearer SEU_TOKEN_AQUI`

---

## 1. Listar Cartões

Retorna todos os cartões de crédito cadastrados do usuário.

**Endpoint:** `GET /api/cartoes`

**Exemplo cURL:**
```bash
curl -X GET http://localhost:3000/api/cartoes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```
