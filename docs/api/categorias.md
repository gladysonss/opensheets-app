# Exemplos de Uso da API de Categorias

**Autenticação:**
Header: `Authorization: Bearer SEU_TOKEN_AQUI`

---

## 1. Listar Categorias

Retorna todas as categorias cadastradas do usuário.

**Endpoint:** `GET /api/categorias`

**Exemplo cURL:**
```bash
curl -X GET http://localhost:3000/api/categorias \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```
