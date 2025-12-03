# Exemplos de Uso da API de Pagadores

**Autenticação:**
Header: `Authorization: Bearer SEU_TOKEN_AQUI`

---

## 1. Listar Pagadores

Retorna todos os pagadores cadastrados do usuário.

**Endpoint:** `GET /api/pagadores`

**Exemplo cURL:**
```bash
curl -X GET http://localhost:3000/api/pagadores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```
