# Put your site online (easy way)

Your website files are already built inside the **`docs`** folder. You do **not** need GitHub Actions.

---

## Option A — GitHub Pages (the normal way)

### 1. Create a repo

1. Go to [github.com](https://github.com) and sign in.
2. Click **+** → **New repository**.
3. Name it (example: `Bitcoin`). Pick **Public**. Click **Create repository**.

### 2. Upload files

1. Click **Add file** → **Upload files**.
2. Open your project folder on your PC: `Downloads\Bitcoin`
3. Upload **everything** except the `node_modules` folder.
4. **Important:** include the **`docs`** folder (that is your website).
5. Click **Commit changes**.

### 3. Turn on Pages (3 clicks)

1. Click **Settings** (top of the repo).
2. Click **Pages** (left side).
3. Under **Build and deployment**:
   - **Source:** Deploy from a branch
   - **Branch:** `main` (or `master`)
   - **Folder:** `/docs`
4. Click **Save**.

### 4. Wait & open

Wait about 2 minutes. Refresh the Pages settings page. You’ll see a green link:

**`https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`**

That’s your live site. Share that link with anyone.

---

## Option B — Even easier (Netlify Drop, no GitHub settings)

1. On your PC, open the **`docs`** folder inside `Bitcoin`.
2. Select all files inside `docs` → right-click → **Send to** → **Compressed (zipped) folder**.
3. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop)
4. Drag the zip (or the files) onto the page.
5. Netlify gives you a link instantly (like `random-name.netlify.app`).

No “Pages” settings. No branch. Done.

---

## When you change the app later

On your PC, in the project folder, run once:

```bash
npm run build:pages
```

Then upload the new **`docs`** folder to GitHub (or zip & drop on Netlify again).
