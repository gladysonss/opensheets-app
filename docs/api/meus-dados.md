# Exemplos de Uso da API Meus Dados

**Autenticação:**
Header: `Authorization: Bearer SEU_TOKEN_AQUI`

---

## 1. Obter Meus Dados

Retorna os dados básicos do usuário autenticado.

**Endpoint:** `GET /api/meus-dados`

**Exemplo cURL:**
```bash
curl -X GET http://localhost:3000/api/meus-dados \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```
