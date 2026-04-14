Unicode true
RequestExecutionLevel user

!include "LogicLib.nsh"
!include "x64.nsh"

Name "${PRODUCT_NAME} - Desinstalar"
Caption "${PRODUCT_NAME} - Desinstalar"
OutFile "${OUT_FILE}"
Icon "${ICON_FILE}"
BrandingText "${PRODUCT_NAME}"
ShowInstDetails nevershow
SilentInstall silent
AutoCloseWindow true

Var uninstallString

Function .onInit
  ${If} ${RunningX64}
    SetRegView 64
  ${EndIf}

  ReadRegStr $uninstallString HKCU "${UNINSTALL_REGISTRY_KEY}" "UninstallString"
  ${If} $uninstallString == ""
    ReadRegStr $uninstallString HKLM "${UNINSTALL_REGISTRY_KEY}" "UninstallString"
  ${EndIf}

  ${If} $uninstallString == ""
    MessageBox MB_OK|MB_ICONEXCLAMATION "${PRODUCT_NAME} nao esta instalado neste computador."
    Quit
  ${EndIf}
FunctionEnd

Section
  ClearErrors
  ExecWait $uninstallString $0

  ${If} ${Errors}
    MessageBox MB_OK|MB_ICONEXCLAMATION "Nao foi possivel iniciar a desinstalacao."
    Quit
  ${EndIf}

  ${If} $0 != 0
    MessageBox MB_OK|MB_ICONEXCLAMATION "A desinstalacao retornou o codigo $0."
  ${EndIf}
SectionEnd
