; NSIS Custom Installer Script para AI Site Builder
; Este script personaliza o instalador para criar atalho na área de trabalho
; e abrir o aplicativo após a instalação

!macro customInit
  ; Verifica se é uma nova instalação ou atualização
  IfSilent 0 +2
    SetDetailsPrint textonly
!macroend

!macro customInstall
  ; Código de instalação personalizada
  ; Isso roda após a cópia dos arquivos
!macroend

!macro customInstallDone
  ; Mensagem de conclusão em português
  MessageBox MB_OK "AI Site Builder foi instalado com sucesso!$(br)$(br)O aplicativo será aberto agora."
!macroend

!macro customUnInstall
  ; Limpeza na desinstalação
  DeleteRegKey HKLM "Software\AI Site Builder"
!macroend
