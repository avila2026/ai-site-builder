# Ollama Local - Guia de Configuração

## Visão Geral

O AI Site Builder suporta duas modalidades de geração de conteúdo com IA:

1. **Ollama Cloud** (padrão) - Usa `qwen3.5:cloud` via API remota
2. **Ollama Local** - Usa modelos rodando localmente na sua máquina

## Configuração Atual

O projeto está configurado para usar **Ollama Cloud** por padrão:

```env
OLLAMA_MODEL=qwen3.5:cloud
```

## Opção 1: Ollama Cloud (Recomendado para Desenvolvimento)

### Vantagens
- Sem necessidade de instalar nada localmente
- Modelo qwen3.5:cloud é gratuito
- Funciona imediatamente após `npm install`

### Configuração
Nenhuma configuração adicional necessária. Apenas certifique-se de que:

```env
OLLAMA_MODEL=qwen3.5:cloud
# OLLAMA_BASE_URL não precisa ser definido (usa padrão cloud)
```

## Opção 2: Ollama Local

### Instalação

1. **Baixe o Ollama**: https://ollama.ai/download

2. **Instale no Windows**:
   - Execute o instalador baixado
   - Ollama será instalado em `C:\Users\<seu-user>\AppData\Local\Programs\Ollama`
   - O serviço roda automaticamente em `http://localhost:11434`

3. **Instale um modelo**:
   ```bash
   # Modelo recomendado (similar ao qwen3.5:cloud)
   ollama pull qwen2.5:7b

   # Ou modelos mais leves para máquinas menos potentes
   ollama pull llama3.2:3b
   ollama pull phi3:mini

   # Modelos mais capazes (requerem mais RAM/VRAM)
   ollama pull llama3.1:8b
   ollama pull mistral:7b
   ```

4. **Verifique a instalação**:
   ```bash
   ollama list
   ollama run qwen2.5:7b "Olá!"
   ```

### Configuração no Projeto

Copie para `.env.local`:

```env
# Usar Ollama local
OLLAMA_MODEL=qwen2.5:7b
OLLAMA_BASE_URL=http://localhost:11434

# Provider principal (pode ser ollama ou stitch)
SITE_GENERATION_PROVIDER=ollama
```

### Troubleshooting

**Erro: "Ollama não disponível"**
```bash
# Verifique se o serviço está rodando
ollama ps

# Inicie o serviço manualmente (se necessário)
ollama serve
```

**Erro: "model not found"**
```bash
# Baixe o modelo configurado
ollama pull <nome-do-modelo>
```

**Performance lenta**
- Use modelos menores (3b-7b parâmetros)
- Modelos maiores (13b+) requerem GPU dedicada
- Considere usar Ollama Cloud para desenvolvimento

## Comparação: Cloud vs Local

| Aspecto | Cloud | Local |
|---------|-------|-------|
| Setup | Imediato | Requer instalação |
| Custo | Gratuito | Gratuito (seu hardware) |
| Privacidade | Dados saem da máquina | 100% local |
| Performance | Depende da internet | Depende do hardware |
| Modelos | qwen3.5:cloud fixo | Qualquer modelo Ollama |

## Integração com Stitch

O projeto suporta fallback automático:

```env
SITE_GENERATION_PROVIDER=stitch
STITCH_FALLBACK_TO_OLLAMA=true
```

Se o Stitch falhar, a geração automaticamente usa Ollama (cloud ou local).
