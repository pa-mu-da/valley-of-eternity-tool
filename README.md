# Valley of Eternity - Character Creator

『Valley of Eternity』のブラウザ向けキャラクターメイキングツールです。
ビルド不要の純粋な静的Webアプリケーション（HTML/CSS/JS）として設計されており、**GitHub Pages、Vercel、Netlify、Cloudflare Pages** など任意の静的ホスティングへそのままデプロイして即座に利用可能です。

---

## 🚀 デプロイ手順

### 方法 1: GitHub Pages（推奨・無料）
1. 本リポジトリを GitHub に push します。
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <あなたのGitHubリポジトリURL>
   git push -u origin main
   ```
2. GitHub リポジトリの **Settings > Pages** を開きます。
3. **Build and deployment > Source** で **「GitHub Actions」** を選択します（`.github/workflows/deploy.yml` により自動デプロイされます）。
   ※ または Source を「Deploy from a branch」にし、`main` ブランチの `/ (root)` を選択して Save しても即座に公開されます。
4. 数十秒で公開URL（`https://<ユーザー名>.github.io/<リポジトリ名>/`）が発行されます。

---

### 方法 2: Vercel / Netlify（1クリック・ドラッグ＆ドロップ）
- **Vercel**: GitHubリポジトリを連携して「Import」するだけでビルドコマンドなしで即時公開されます。
- **Netlify**: [Netlify Drop](https://app.netlify.com/drop) に本フォルダをドラッグ＆ドロップするだけで即座に公開URLが発行されます。

---

### 方法 3: ローカルで今すぐ実行
```bash
npm start
# または
python -m http.server 8080
```
ブラウザで `http://localhost:8080` を開きます。
※ `index.html` をダブルクリックしてローカルブラウザで直接開く形でも動作します。

---

## 🛠 主な機能
- **ルール完全準拠**: ヒーローペンギン / アンチペンギン、6種族補正、体温値・Fat・防御力・意志力自動計算
- **特殊能力選択**: 哲学能力 / 氷河のギフトの切り替え連動、ランク可変能力対応
- **種族固有能力**: ヘッドレスバロン、ロイヤル、アデリー、イワトビの数値外特性をFat表記なしで特別明記
- **柔軟なカスタマイズ**: 能力値pt・特殊能力上限ptの自由変更、装備スロットの自由追加・編集
- **出力機能**:
  - **正方形画像出力 (900×900px)**: 顔まわりが綺麗に入る上辺中央基準の正方形クロップ対応
  - **ココフォリア駒コピー**: 盤面貼り付け（Ctrl+V）対応JSON
  - **JSON保存 & JSON読込**: 完全な状態復元
