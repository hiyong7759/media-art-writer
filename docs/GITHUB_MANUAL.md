# GitHub Actions 및 수동 이미지 생성 가이드

이 문서는 AI가 생성한 프롬프트를 기반으로 사용자가 직접 이미지를 생성하고 적용하는 방법과 GitHub Actions 사용법을 설명합니다.

## 1. GitHub 저장소 연결

먼저 로컬 프로젝트를 GitHub에 올립니다. 사용자(관리자)의 GitHub 계정에 새로운 저장소를 생성해야 합니다.

1.  GitHub 로그인 및 **New Repository** 클릭
2.  저장소 이름 입력 (예: `media-art-gallery`) 후 **Create repository**
3.  로컬 프로젝트 폴더에서 다음 명령어 실행 (Git이 설치되어 있어야 함):

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/media-art-gallery.git
git push -u origin main
```
> **참고**: `YOUR_USERNAME`은 본인의 GitHub 아이디로 변경하세요.

---

## 2. API 키 설정 (GitHub Secrets)

자동 프롬프트 생성을 위해 Gemini API 키를 등록해야 합니다.

1.  GitHub 저장소의 **Settings** 탭 클릭
2.  왼쪽 메뉴에서 **Secrets and variables** > **Actions** 클릭
3.  **New repository secret** 버튼 클릭
4.  **Name**: `GEMINI_API_KEY`
5.  **Secret**: (발급받은 Google Gemini API Key 입력)
6.  **Add secret** 저장

---

## 3. GitHub Actions 실행 방법

매일 자동으로 실행되지만, 수동으로 실행할 수도 있습니다.

1.  GitHub 저장소의 **Actions** 탭 클릭
2.  왼쪽 목록에서 **Daily Art Generation** 선택
3.  오른쪽의 **Run workflow** 버튼 클릭
4.  필요시 `artist_id`나 `date`를 입력하고 **Run workflow** 클릭 (기본값은 전체 실행)

---

## 4. 수동 이미지 생성 프로세스

API 연동 대신 직접 이미지를 생성하여 적용하는 방법입니다.

### 1단계: 프롬프트 확인
Actions가 실행되면 `data/prompts/YYYY-MM-DD/` 폴더에 작가별 프롬프트 텍스트 파일(`artist-id.txt`)이 생성됩니다. 이 내용을 복사합니다.

### 2단계: 이미지 생성
Midjourney, DALL-E, 또는 로컬 Stable Diffusion 등을 사용하여 이미지를 생성합니다.

### 3단계: 이미지 업로드
생성된 이미지를 다음 경로와 이름 규칙에 맞춰 저장소에 업로드합니다.
*   **경로**: `media/artworks/YYYY-MM-DD/`
*   **파일명**: `artist-id.png` (예: `aura-7.png`)

> 이미지를 업로드하고 커밋(`git push`)하면, 뷰어는 해당 이미지가 있을 경우 우선적으로 표시하거나 배경으로 사용할 수 있습니다. (현재 뷰어는 코드 기반 생성이 우선이므로, 이미지 적용 로직 추가가 필요할 수 있습니다)
