/**
 * Teste simples do ytdlpService
 * 
 * Execute com: node src/test/ytdlpService.test.js
 */

const ytdlpService = require("../services/ytdlpService");

async function testYtdlpService() {
  console.log("🧪 Iniciando testes do ytdlpService...\n");

  // Teste 1: Verificar instalação do yt-dlp
  console.log("📋 Teste 1: Verificando instalação do yt-dlp...");
  try {
    const isInstalled = await ytdlpService.checkYtDlpInstalled();
    if (isInstalled) {
      console.log("✅ yt-dlp está instalado!\n");
    } else {
      console.log("❌ yt-dlp NÃO está instalado!");
      console.log("Por favor, instale o yt-dlp antes de continuar.\n");
      return;
    }
  } catch (error) {
    console.error("❌ Erro ao verificar instalação:", error.message);
    return;
  }

  // Teste 2: Obter informações de um vídeo
  console.log("📋 Teste 2: Obtendo informações de um vídeo...");
  const testUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  
  try {
    const info = await ytdlpService.getVideoInfo(testUrl);
    console.log("✅ Informações obtidas com sucesso!");
    console.log(`   Título: ${info.title}`);
    console.log(`   Duração: ${Math.floor(info.duration / 60)}:${String(info.duration % 60).padStart(2, "0")}`);
    console.log(`   Canal: ${info.channel.name}`);
    console.log();
  } catch (error) {
    console.error("❌ Erro ao obter informações:", error.message);
    console.log();
  }

  // Teste 3: Validação de duração
  console.log("📋 Teste 3: Testando validação de duração...");
  const longVideoUrl = "https://www.youtube.com/watch?v=GBIIQ0kP15E"; // Vídeo de 10 horas
  
  try {
    await ytdlpService.downloadMedia(longVideoUrl, "audio");
    console.log("❌ FALHOU: Deveria ter rejeitado vídeo longo!");
  } catch (error) {
    if (error.message.includes("muito longo")) {
      console.log("✅ Validação de duração funcionando corretamente!");
      console.log(`   Erro esperado: ${error.message}`);
    } else {
      console.log("⚠️  Erro diferente do esperado:", error.message);
    }
    console.log();
  }

  // Teste 4: Download de áudio (COMENTADO - descomente para testar download real)
  /*
  console.log("📋 Teste 4: Testando download de áudio...");
  console.log("⚠️  Este teste fará um download real!");
  
  try {
    const { filePath, info } = await ytdlpService.downloadMedia(testUrl, "audio");
    console.log("✅ Download de áudio bem-sucedido!");
    console.log(`   Arquivo salvo em: ${filePath}`);
    console.log(`   Título: ${info.title}`);
    
    // Limpar arquivo de teste
    console.log("🧹 Limpando arquivo de teste...");
    await ytdlpService.cleanupFile(filePath);
    console.log("✅ Arquivo removido com sucesso!");
    console.log();
  } catch (error) {
    console.error("❌ Erro no download:", error.message);
    console.log();
  }
  */

  // Teste 5: Busca e download (COMENTADO - descomente para testar)
  /*
  console.log("📋 Teste 5: Testando busca e download...");
  console.log("⚠️  Este teste fará um download real!");
  
  try {
    const { filePath, info } = await ytdlpService.searchAndDownload("audio", "test song");
    console.log("✅ Busca e download bem-sucedidos!");
    console.log(`   Arquivo salvo em: ${filePath}`);
    console.log(`   Título: ${info.title}`);
    
    // Limpar arquivo de teste
    console.log("🧹 Limpando arquivo de teste...");
    await ytdlpService.cleanupFile(filePath);
    console.log("✅ Arquivo removido com sucesso!");
    console.log();
  } catch (error) {
    console.error("❌ Erro na busca/download:", error.message);
    console.log();
  }
  */

  console.log("🎉 Testes básicos concluídos!\n");
  console.log("💡 Dica: Descomente os testes 4 e 5 para testar downloads reais.");
  console.log("   (Isso fará downloads reais e ocupará espaço temporário)\n");
}

// Executar testes
testYtdlpService().catch((error) => {
  console.error("❌ Erro fatal nos testes:", error);
  process.exit(1);
});
