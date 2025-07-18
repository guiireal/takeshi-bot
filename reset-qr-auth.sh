#!/bin/bash

# Script para reset da autenticação do Takeshi Bot

echo "🤖 Takeshi Bot - Reset da Autenticação"
echo "====================================="
echo ""

if [ ! -d "assets" ]; then
    echo "❌ Erro: Você deve executar este script no diretório raiz do Takeshi Bot"
    echo "   Certifique-se de estar na pasta onde estão as pastas 'assets' e 'src'"
    exit 1
fi

if [ ! -d "assets/auth/baileys" ]; then
    echo "⚠️  A pasta de autenticação não existe ou já foi removida"
    echo "   Caminho: ./assets/auth/baileys"
    exit 0
fi

echo "⚠️  ATENÇÃO: Esta ação irá remover todos os arquivos de autenticação do bot!"
echo "   Após executar este script, você precisará:"
echo "   1. Remover o dispositivo antigo em \"dispositivos conectados\" nas configurações do WhatsApp"
echo "   2. Iniciar o bot novamente por aqui (npm start)"
echo "   3. Colocar o número de telefone do bot novamente"
echo ""
read -p "Deseja continuar? (s/N): " confirm

case $confirm in
    [sS]|[sS][iI][mM])
        echo ""
        echo "🔄 Removendo arquivos de autenticação..."
        
        rm -rf ./assets/auth/baileys
        
        if [ $? -eq 0 ]; then
            echo "✅ Arquivos de autenticação removidos com sucesso!"
            echo ""
            echo "📝 Próximos passos:"
            echo "   1. Execute 'npm start' para iniciar o bot"
            echo "   2. Digite seu número de telefone quando solicitado"
            echo "   3. Use o código de pareamento no WhatsApp"
        else
            echo "❌ Erro ao remover os arquivos de autenticação"
            exit 1
        fi
        ;;
    *)
        echo "❌ Operação cancelada pelo usuário"
        exit 0
        ;;
esac

echo ""
echo "🚀 Script executado com sucesso!"