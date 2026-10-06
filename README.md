# Ayush Tandon — portfolio

Static site for GitHub Pages. Built from the October 2026 CV.

Live URL after publish: **https://tandon7.github.io**

The GitHub account is [Tandon7](https://github.com/Tandon7). The Pages repo name must be `Tandon7.github.io`.

## Publish (free)

1. Create a **public** repository named `Tandon7.github.io` at https://github.com/new
2. From this folder:

```bash
git add .
git commit -m "Add portfolio site"
git remote add origin https://github.com/Tandon7/Tandon7.github.io.git
git branch -M main
git push -u origin main
```

3. In the repo on GitHub: **Settings → Pages → Deploy from a branch → main / (root) → Save**.
4. Wait one or two minutes, then open https://tandon7.github.io

Anyone can open that link on any computer or phone. No login is required.

## Contact form and phone requests

Both forms post to [FormSubmit](https://formsubmit.co) (`FORM_ENDPOINT` in `main.js`), which emails each submission to `Ayushtandon717@gmail.com`. The sender's address is set as reply-to, so replying in Gmail goes straight to them.

FormSubmit sends a one-time **Activate Form** email to that Gmail address before the first message gets through. Until it is activated, the forms show an error and ask visitors to email directly.

## Preview locally

Open `index.html` in a browser, or run:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.
