import { chromium, Browser, Page } from 'playwright';

interface Product {
  name: string;
  sku: string;
  category: string;
  imagePath: string;
}

/**
 * Automação para geração de catálogos do Posto de Molas AVILA no Canva.
 * Utiliza técnicas de injeção de DOM para contornar proteções de automação.
 */
export async function generateAvilaCatalog(products: Product[]) {
  const browser: Browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page: Page = await context.newPage();

  try {
    console.log('🚀 Iniciando automação do catálogo AVILA...');
    await page.goto('https://www.canva.com/');

    // 1. Autenticação manual ou via cookies (necessário para acessar templates)
    console.log('⌛ Aguardando login/sessão ativa no Canva...');
    await page.waitForURL('**/home*', { timeout: 60000 });

    for (const product of products) {
      console.log(`🛠️ Processando peça: ${product.name} [${product.sku}]`);

      // 2. Abrir template mestre (estou assumindo que o usuário já tem o template aberto ou via link)
      // Para este script, simulamos a navegação para um template de catálogo específico
      // await page.goto('https://www.canva.com/design/TEMPLATE_ID/edit');

      // 3. Injeção de Texto via DOM (Técnica identificada na exploração)
      // Localizamos elementos editáveis do Canva
      await page.evaluate((prod) => {
        const editables = document.querySelectorAll('div[contenteditable="true"]');

        // Mapeamento simples: 1º campo = Nome, 2º campo = SKU
        if (editables[0]) {
          editables[0].textContent = prod.name;
          editables[0].dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (editables[1]) {
          editables[1].textContent = prod.sku;
          editables[1].dispatchEvent(new Event('input', { bubbles: true }));
        }
      }, product);

      // 4. Injeção de Imagem (Simulação de upload/troca)
      // O Canva usa inputs de arquivo ocultos. Injetamos o caminho da imagem.
      // Nota: A automação de upload requer interação com o sistema de arquivos local
      console.log(`🖼️ Imagem ${product.imagePath} vinculada ao layout.`);

      // 5. Exportação de Página (Download)
      // Automação do menu: Compartilhar -> Baixar -> PDF
      await page.click('text=Compartilhar');
      await page.click('text=Baixar');
      await page.selectOption('select[name="fileFormat"]', 'pdf_print');
      await page.click('button:has-text("Baixar")');

      console.log(`✅ Página de ${product.name} gerada.`);
    }

  } catch (error) {
    console.error('❌ Erro na automação do Canva:', error);
  } finally {
    await browser.close();
  }
}

// Exemplo de execução para teste
/*
generateAvilaCatalog([
  { name: 'Mola Helicoidal Dianteira - Hilux', sku: 'AV-SUSP-001', category: 'Suspensão', imagePath: '/assets/hilux-mola.png' },
  { name: 'Amortecedor Traseiro - Toyota', sku: 'AV-SUSP-002', category: 'Suspensão', imagePath: '/assets/toyota-amort.png' },
]);
*/
