#!/usr/bin/env bash
# system-design-pg installer (macOS / Linux / WSL / Git Bash)
# Run:  curl -fsSL https://raw.githubusercontent.com/HideOnChimes/PG_Skill_System_Design/main/install.sh | bash
set -euo pipefail

REPO="HideOnChimes/PG_Skill_System_Design"
BRANCH="main"
SKILLS_DIR="${HOME}/.claude/skills"
DEST="${SKILLS_DIR}/system-design-pg"

echo ""
echo "  system-design-pg  -- Claude Code skill installer"
echo ""

# --- Node >= 18 ---
if ! command -v node >/dev/null 2>&1; then
  echo "  X  Node nao encontrado. Instale Node >= 18: https://nodejs.org"
  exit 1
fi
NODE_MAJOR="$(node --version | sed 's/v//' | cut -d. -f1)"
if [ "${NODE_MAJOR}" -lt 18 ]; then
  echo "  X  Node $(node --version) muito antigo. Precisa >= 18."
  exit 1
fi
echo "  ok  Node $(node --version)"

# --- download tarball (sem precisar de git) ---
TMP="$(mktemp -d)"
trap 'rm -rf "${TMP}"' EXIT
TAR_URL="https://github.com/${REPO}/archive/refs/heads/${BRANCH}.tar.gz"
echo "  .. baixando skill de ${REPO}"
curl -fsSL "${TAR_URL}" -o "${TMP}/src.tar.gz"
tar -xzf "${TMP}/src.tar.gz" -C "${TMP}"

REPO_NAME="${REPO##*/}"
SRC_SKILL="${TMP}/${REPO_NAME}-${BRANCH}/skill/system-design-pg"
if [ ! -d "${SRC_SKILL}" ]; then
  echo "  X  Estrutura do repo inesperada: ${SRC_SKILL} nao existe."
  exit 1
fi

# --- copiar pra ~/.claude/skills/system-design-pg ---
mkdir -p "${SKILLS_DIR}"
rm -rf "${DEST}"
cp -R "${SRC_SKILL}" "${DEST}"
echo "  ok  skill copiada -> ${DEST}"

# --- npm install (sem baixar Chromium; usa Chrome do sistema) ---
echo "  .. instalando dependencias do renderer (npm)"
( cd "${DEST}/scripts" && PUPPETEER_SKIP_DOWNLOAD=true npm install --silent --no-fund --no-audit )

echo ""
echo "  Pronto!  Abra uma nova sessao do Claude Code e peca:"
echo '    "Faca o design de um sistema X -- quero md, diagrama e PDF."'
echo ""
