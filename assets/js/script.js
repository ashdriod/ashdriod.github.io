/* ===========================
   main.js — Portfolio + Blog
   =========================== */
   "use strict";

   /* ---------------------------
      Helpers
   --------------------------- */
   const safeOn = (el, evt, fn) => el && el.addEventListener(evt, fn);
   const $ = (sel, root = document) => root.querySelector(sel);
   const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
   const toggle = (el, cls = "active") => el && el.classList.toggle(cls);
   
   /* ---------------------------
      Sidebar (mobile)
   --------------------------- */
   (() => {
    const sidebar   = document.querySelector("[data-sidebar]");
    const sidebarBtn = document.querySelector("[data-sidebar-btn]");
    if (!sidebar || !sidebarBtn) return;
  
    const label = sidebarBtn.querySelector("span");
  
    // Expanded by default
    sidebar.classList.remove("collapsed");
    if (label) label.textContent = "Hide Contacts";
    sidebarBtn.setAttribute("aria-expanded", "true");
  
    sidebarBtn.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      const collapsed = sidebar.classList.contains("collapsed");
      if (label) label.textContent = collapsed ? "Show Contacts" : "Hide Contacts";
      sidebarBtn.setAttribute("aria-expanded", String(!collapsed));
    });
  })();
   
   /* ---------------------------
      Testimonials Modal
   --------------------------- */
   (() => {
     const items = $$("[data-testimonials-item]");
     const modalContainer = $("[data-modal-container]");
     const modalCloseBtn = $("[data-modal-close-btn]");
     const overlay = $("[data-overlay]");
   
     const modalImg = $("[data-modal-img]");
     const modalTitle = $("[data-modal-title]");
     const modalText = $("[data-modal-text]");
   
     const openClose = () => {
       toggle(modalContainer);
       toggle(overlay);
     };
   
     items.forEach((item) => {
       safeOn(item, "click", () => {
         const avatar = item.querySelector("[data-testimonials-avatar]");
         const title = item.querySelector("[data-testimonials-title]");
         const text = item.querySelector("[data-testimonials-text]");
   
         if (modalImg && avatar) {
           modalImg.src = avatar.src;
           modalImg.alt = avatar.alt || "";
         }
         if (modalTitle && title) modalTitle.innerHTML = title.innerHTML;
         if (modalText && text) modalText.innerHTML = text.innerHTML;
   
         openClose();
       });
     });
   
     safeOn(modalCloseBtn, "click", openClose);
     safeOn(overlay, "click", openClose);
   })();
   
   /* ---------------------------
      Projects Filter + Select
   --------------------------- */
   (() => {
     const selectEl = $("[data-select]");
     const selectItems = $$("[data-select-item]");
     // HTML has a typo in attribute name; try both
     const selectValue = $("[data-selecct-value]") || $("[data-select-value]");
     const filterBtns = $$("[data-filter-btn]");
     const filterItems = $$("[data-filter-item]");
   
     const filterFunc = (selectedValue) => {
       filterItems.forEach((it) => {
         const match = selectedValue === "all" || selectedValue === it.dataset.category;
         it.classList.toggle("active", match);
       });
     };
   
     safeOn(selectEl, "click", function () {
       toggle(this);
     });
   
     selectItems.forEach((item) => {
       safeOn(item, "click", function () {
         const val = this.innerText.toLowerCase();
         if (selectValue) selectValue.innerText = this.innerText;
         toggle(selectEl);
         filterFunc(val);
       });
     });
   
     // Large screen buttons
     let lastClickedBtn = filterBtns[0] || null;
     filterBtns.forEach((btn) => {
       safeOn(btn, "click", function () {
         const val = this.innerText.toLowerCase();
         if (selectValue) selectValue.innerText = this.innerText;
         filterFunc(val);
   
         if (lastClickedBtn) lastClickedBtn.classList.remove("active");
         this.classList.add("active");
         lastClickedBtn = this;
       });
     });
   })();
   
   /* ---------------------------
      Contact Form Enable/Disable
   --------------------------- */
   (() => {
     const form = $("[data-form]");
     if (!form) return;
     const inputs = $$("[data-form-input]", form);
     const btn = $("[data-form-btn]", form);
   
     const update = () => {
       if (!btn) return;
       if (form.checkValidity()) btn.removeAttribute("disabled");
       else btn.setAttribute("disabled", "");
     };
   
     inputs.forEach((inp) => safeOn(inp, "input", update));
   })();
   
   /* ---------------------------
      Page Navigation (tabs)
   --------------------------- */
   (() => {
     const navLinks = $$("[data-nav-link]");
     const pages = $$("[data-page]");
   
     navLinks.forEach((link, idx) => {
       safeOn(link, "click", function () {
         const target = this.innerHTML.trim().toLowerCase();
   
         // Activate the matching page
         pages.forEach((page, pIdx) => {
           const active = target === page.dataset.page;
           page.classList.toggle("active", active);
           if (navLinks[pIdx]) {
             navLinks[pIdx].classList.toggle("active", active);
           }
         });
   
         // If user navigates to Blog tab, ensure list view is shown (not a stuck single post)
         if (target === "blog") {
           const blogArticle = $('article.blog[data-page="blog"]');
           if (blogArticle) {
             blogArticle.dispatchEvent(new CustomEvent("blog:show-list", { bubbles: true }));
           }
         }
   
         window.scrollTo(0, 0);
       });
     });
   })();
   
   /* ===========================
      BLOG: Dynamic list + loader
      Uses /blogs/posts.json and
      /blogs/<slug>.html fragments
   =========================== */
   (() => {
     const blogArticle = $('article.blog[data-page="blog"]');
     const listEl = blogArticle ? $("#blog-list", blogArticle) : null;
     if (!blogArticle || !listEl) return; // Blog section not present or not prepared
   
     // Build URLs correctly even on GitHub Pages subpaths
     const base = document.baseURI; // e.g. https://user.github.io/repo/
     const urlFor = (rel) => new URL(rel, base).toString();
   
     const postsURL = urlFor("./blogs/posts.json");
     let listSnapshotHTML = "";
   
     const cardHTML = (p) => {
       const postHref = `?post=${encodeURIComponent(p.slug)}`;
       const postData = urlFor(`./blogs/${p.slug}.html`);
       const alt = p.alt || p.title || "";
       const img = p.image || "./assets/images/blog-1.jpg";
       const dispDate = p.displayDate || p.date || "";
       const dt = p.date || dispDate;
   
       return `
         <li class="blog-post-item">
           <a href="${postHref}" data-post="${postData}">
             <figure class="blog-banner-box">
               <img src="${img}" alt="${alt}" loading="lazy">
             </figure>
             <div class="blog-content">
               <div class="blog-meta">
                 <p class="blog-category">${p.category || ""}</p>
                 <span class="dot"></span>
                 <time datetime="${dt}">${dispDate}</time>
               </div>
               <h3 class="h3 blog-item-title">${p.title || ""}</h3>
               <p class="blog-text">${p.excerpt || ""}</p>
             </div>
           </a>
         </li>
       `;
     };
   
     const renderList = (posts, replaceState = false) => {
       listEl.innerHTML = posts.map(cardHTML).join("");
       // snapshot the entire section to restore after viewing a post
       const section = $(".blog-posts", blogArticle);
       listSnapshotHTML = section ? section.innerHTML : listEl.outerHTML;
   
       const cleanURL = window.location.pathname + window.location.hash;
       if (replaceState) history.replaceState({ view: "list" }, "", cleanURL);
       else history.pushState({ view: "list" }, "", cleanURL);
     };
   
     const renderPost = (html, slug, push = true) => {
       const section = $(".blog-posts", blogArticle);
       if (!section) return;
   
       section.innerHTML = `<div class="post-container">${html}</div>`;
   
       const url = `${window.location.pathname}?post=${encodeURIComponent(slug)}${window.location.hash}`;
       if (push) {
         history.pushState({ view: "post", slug }, "", url);
       } else {
         history.replaceState({ view: "post", slug }, "", url);
       }
     };
   
     const restoreList = (replace = false) => {
       const section = $(".blog-posts", blogArticle);
       if (!section) return;
   
       if (listSnapshotHTML) {
         section.innerHTML = listSnapshotHTML;
       } else {
         // if snapshot missing (first-time), rebuild from JSON
         loadListThenMaybeDeepLink();
         return;
       }
   
       const cleanURL = window.location.pathname + window.location.hash;
       if (replace) history.replaceState({ view: "list" }, "", cleanURL);
       else history.pushState({ view: "list" }, "", cleanURL);
     };
   
     // Title (big "Blog" heading) acts as Back to list when in post view
     const blogHeading = $("header .article-title", blogArticle);
     if (blogHeading) {
       blogHeading.style.cursor = "pointer";
       blogHeading.title = "Back to Blog";
       blogHeading.addEventListener("click", () => {
         if (history.state && history.state.view === "post") restoreList();
       });
     }
   
     // Also support external request to show list (from navbar tab click)
     blogArticle.addEventListener("blog:show-list", () => {
       if (history.state && history.state.view === "post") restoreList(true);
     });
   
     // Delegate clicks inside Blog only (open post)
     safeOn(blogArticle, "click", (e) => {
       const link = e.target.closest("a[data-post]");
       if (!link) return;
   
       e.preventDefault();
       const url = link.getAttribute("data-post");
       const slug = new URLSearchParams((link.getAttribute("href") || "").split("?")[1]).get("post");
   
       fetch(url, { credentials: "same-origin" })
         .then((r) => {
           if (!r.ok) throw new Error("Fetch failed");
           return r.text();
         })
         .then((html) => renderPost(html, slug))
         .catch(() => alert("Could not load the blog post. Check the file path and that the post exists."));
     });
   
     const loadListThenMaybeDeepLink = () => {
       fetch(postsURL, { credentials: "same-origin" })
         .then((r) => {
           if (!r.ok) throw new Error("posts.json missing");
           return r.json();
         })
         .then((posts) => {
           // sort newest first (by ISO date)
           posts.sort((a, b) => (a.date < b.date ? 1 : -1));
           renderList(posts, true);
   
           // Deep link: ?post=slug
           const slug = new URLSearchParams(location.search).get("post");
           if (!slug) return;
           const postURL = urlFor(`./blogs/${slug}.html`);
           fetch(postURL, { credentials: "same-origin" })
             .then((r) => {
               if (!r.ok) throw new Error("missing post");
               return r.text();
             })
             .then((html) => renderPost(html, slug, false))
             .catch(() => history.replaceState({ view: "list" }, "", window.location.pathname));
         })
         .catch((err) => {
           console.error(err);
           listEl.innerHTML = '<li style="padding:1rem;">No posts found (missing /blogs/posts.json).</li>';
         });
     };
   
     // Support browser back/forward
     safeOn(window, "popstate", (ev) => {
       const state = ev.state || {};
       if (state.view === "post" && state.slug) {
         const postURL = urlFor(`./blogs/${state.slug}.html`);
         fetch(postURL, { credentials: "same-origin" })
           .then((r) => r.text())
           .then((html) => renderPost(html, state.slug, false))
           .catch(() => loadListThenMaybeDeepLink());
       } else {
         loadListThenMaybeDeepLink();
       }
     });
   
     // Kick off
     loadListThenMaybeDeepLink();
   })();