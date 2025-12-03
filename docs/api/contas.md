# Exemplos de Uso da API de Contas

**Autenticação:**
Header: `Authorization: Bearer SEU_TOKEN_AQUI`

---

## 1. Listar Contas

Retorna todas as contas cadastradas do usuário.

**Endpoint:** `GET /api/contas`

**Exemplo cURL:**
```bash
curl -X GET http://localhost:3000/api/contas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```
