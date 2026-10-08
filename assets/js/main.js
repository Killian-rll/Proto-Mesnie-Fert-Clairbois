(function () {
  "use strict";

  document.documentElement.classList.remove("no-js");
  const CFG = window.MESNIE || {};
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const stockage = {
    lire(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    ecrire(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  const animationsReduites = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const libellesTaille = ["Agrandir le texte", "Agrandir encore le texte", "Revenir à la taille normale"];
  const appliquerTaille = (t) => {
    document.documentElement.dataset.taille = t;
    $$("[data-taille-btn]").forEach((b) => { b.setAttribute("aria-label", libellesTaille[t]); b.title = libellesTaille[t]; });
  };
  appliquerTaille(Number(stockage.lire("taille")) || 0);
  $$("[data-taille-btn]").forEach((b) => b.addEventListener("click", () => {
    const t = ((Number(document.documentElement.dataset.taille) || 0) + 1) % 3;
    stockage.ecrire("taille", t); appliquerTaille(t);
  }));

  const burger = $(".burger");
  const nav = $("#navigation");
  const mobile = window.matchMedia("(max-width: 1100px)");
  const fermerMenu = () => {
    if (!burger) return;
    burger.setAttribute("aria-expanded", "false"); burger.setAttribute("aria-label", "Ouvrir le menu");
    nav.classList.remove("is-open"); document.body.classList.remove("menu-ouvert");
  };
  burger && burger.addEventListener("click", () => {
    if (burger.getAttribute("aria-expanded") === "true") { fermerMenu(); return; }
    burger.setAttribute("aria-expanded", "true"); burger.setAttribute("aria-label", "Fermer le menu");
    nav.classList.add("is-open"); document.body.classList.add("menu-ouvert");
  });
  mobile.addEventListener("change", (m) => !m.matches && fermerMenu());

  $$(".sous-menu").forEach((sm) => {
    const bouton = $(".nav__fleche", sm);
    const ouvrir = (oui) => { sm.classList.toggle("is-open", oui); bouton.setAttribute("aria-expanded", String(oui)); };
    bouton.addEventListener("click", () => ouvrir(!sm.classList.contains("is-open")));
    sm.addEventListener("mouseenter", () => !mobile.matches && ouvrir(true));
    sm.addEventListener("mouseleave", () => !mobile.matches && ouvrir(false));
    sm.addEventListener("focusout", (e) => { if (!mobile.matches && !sm.contains(e.relatedTarget)) ouvrir(false); });
    document.addEventListener("click", (e) => { if (!mobile.matches && !sm.contains(e.target)) ouvrir(false); });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    $$(".sous-menu.is-open").forEach((sm) => { sm.classList.remove("is-open"); $(".nav__fleche", sm).setAttribute("aria-expanded", "false"); });
    fermerMenu();
  });

  const header = $(".header");
  const haut = $(".haut");
  const surDefilement = () => {
    header && header.classList.toggle("is-scrolled", window.scrollY > 8);
    haut && haut.classList.toggle("is-visible", window.scrollY > 800);
  };
  window.addEventListener("scroll", surDefilement, { passive: true });
  surDefilement();
  haut && haut.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  const diapos = $$(".hero__diapos img");
  if (diapos.length > 1 && !animationsReduites) {
    let i = 0;
    setInterval(() => {
      diapos[i].classList.remove("is-active");
      i = (i + 1) % diapos.length;
      diapos[i].classList.add("is-active");
    }, 6500);
  }

  const MOIS = (CFG.mois || [4, 5, 6, 7, 8]).slice().sort((a, b) => a - b);
  const pad = (n) => String(n).padStart(2, "0");
  const heure = (txt, def) => (txt || def).split(":").map(Number);
  const [hSamO, mSamO] = heure(CFG.horaires?.samedi?.ouverture, "14:00");
  const [hDimF, mDimF] = heure(CFG.horaires?.dimanche?.fermeture, "18:00");

  const deuxiemeSamedi = (an, mois) => {
    const premier = new Date(an, mois - 1, 1);
    return new Date(an, mois - 1, 1 + ((6 - premier.getDay() + 7) % 7) + 7);
  };

  const saison = (an) => MOIS.map((mois) => {
    const cle = `${an}-${pad(mois)}`;
    const exc = CFG.exceptions && CFG.exceptions[cle];
    const samedi = exc ? new Date(exc + "T00:00:00") : deuxiemeSamedi(an, mois);
    const dimanche = new Date(samedi); dimanche.setDate(samedi.getDate() + 1);
    const debut = new Date(samedi); debut.setHours(hSamO, mSamO, 0, 0);
    const fin = new Date(dimanche); fin.setHours(hDimF, mDimF, 0, 0);
    return { an, mois, cle, samedi, dimanche, debut, fin, annulee: (CFG.annulations || []).includes(cle) };
  });

  const maintenant = new Date();
  let fetes = saison(maintenant.getFullYear());
  const actives = (l) => l.filter((f) => !f.annulee);
  if (!actives(fetes).length || maintenant > actives(fetes).at(-1).fin) fetes = saison(maintenant.getFullYear() + 1);
  const prochaine = actives(fetes).find((f) => f.fin >= maintenant);

  const nomMois = (d) => new Intl.DateTimeFormat("fr-FR", { month: "long" }).format(d);
  const datesTexte = (f) => f.samedi.getMonth() === f.dimanche.getMonth()
    ? `${f.samedi.getDate()} & ${f.dimanche.getDate()} ${nomMois(f.samedi)} ${f.an}`
    : `${f.samedi.getDate()} ${nomMois(f.samedi)} & ${f.dimanche.getDate()} ${nomMois(f.dimanche)} ${f.an}`;

  const fmtH = (t) => { const [h, m] = (t || "").split(":"); return m && m !== "00" ? `${Number(h)}h${m}` : `${Number(h)}h`; };
  const H = CFG.horaires || {};
  const heuresTexte = `Samedi ${fmtH(H.samedi?.ouverture || "14:00")} – ${fmtH(H.samedi?.fermeture || "19:00")} · Dimanche ${fmtH(H.dimanche?.ouverture || "10:00")} – ${fmtH(H.dimanche?.fermeture || "18:00")}`;
  const titreDate = (f) => f.samedi.getMonth() === f.dimanche.getMonth()
    ? `Samedi ${f.samedi.getDate()} et dimanche ${f.dimanche.getDate()} ${nomMois(f.samedi)} ${f.an}`
    : `Samedi ${f.samedi.getDate()} ${nomMois(f.samedi)} et dimanche ${f.dimanche.getDate()} ${nomMois(f.dimanche)} ${f.an}`;
  const moisCourt = (d) => new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(d).replace(".", "");

  $$("[data-calendrier]").forEach((zone) => {
    zone.innerHTML = fetes.map((f) => {
      const passee = f.fin < maintenant;
      const estProchaine = prochaine && f.cle === prochaine.cle;
      const classe = f.annulee ? " date--annulee date--passee" : passee ? " date--passee" : estProchaine ? " date--prochaine" : "";
      const libelle = titreDate(f);
      const fin = f.annulee ? '<span class="date__etat">Annulée</span>'
        : passee ? '<span class="date__etat">Terminée</span>'
        : `<div class="date__actions">
            <a class="date__billet" href="${(CFG.billets && CFG.billets[f.cle]) || CFG.billetterie}" target="_blank" rel="noopener" aria-label="Réserver mes billets pour le ${libelle}"><svg class="icon" aria-hidden="true"><use href="#i-ticket"/></svg>Réserver</a>
            <button type="button" class="date__partager" data-partager="${f.cle}" aria-label="Partager la date : ${libelle}" title="Partager"><svg class="icon" aria-hidden="true"><use href="#i-partager"/></svg></button>
          </div>`;
      return `<li class="date${classe}">
          <span class="sr-only">${estProchaine ? "Prochaine édition : " : ""}${libelle}</span>
          <span class="date__mois" aria-hidden="true">${nomMois(f.samedi)}</span>
          <span class="date__jours" aria-hidden="true">
            <span class="date__jour"><strong>${f.samedi.getDate()}</strong><small>samedi</small></span>
            <span class="date__et">&amp;</span>
            <span class="date__jour"><strong>${f.dimanche.getDate()}</strong><small>dimanche</small></span>
          </span>
          ${fin}
        </li>`;
    }).join("");
  });
  $$("[data-saison-annee]").forEach((el) => (el.textContent = fetes[0].an));

  if (prochaine) {
    $$("[data-prochaine-date]").forEach((el) => (el.textContent = datesTexte(prochaine)));
    $$("[data-ics-prochaine]").forEach((b) => (b.dataset.ics = prochaine.cle));
  }

  const compte = $("[data-compte]");
  if (compte && prochaine) {
    const c = (k) => $(`[data-c=${k}]`, compte);
    let minuteur;
    const tic = () => {
      const now = new Date();
      if (now >= prochaine.debut && now <= prochaine.fin) {
        compte.innerHTML = "<strong style=\"font-size:1.1rem\">C'est en ce moment&nbsp;! Venez nous voir.</strong>";
        clearInterval(minuteur); return;
      }
      let s = Math.max(0, Math.floor((prochaine.debut - now) / 1000));
      const j = Math.floor(s / 86400); s -= j * 86400;
      const h = Math.floor(s / 3600); s -= h * 3600;
      const m = Math.floor(s / 60); s -= m * 60;
      c("j").textContent = j; c("h").textContent = pad(h); c("m").textContent = pad(m); c("s").textContent = pad(s);
    };
    minuteur = setInterval(tic, 1000);
    tic();
  }

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-ics]");
    if (!b || !b.dataset.ics) return;
    const f = fetes.find((x) => x.cle === b.dataset.ics);
    if (!f) return;
    const t = (x) => `${x.getFullYear()}${pad(x.getMonth() + 1)}${pad(x.getDate())}T${pad(x.getHours())}${pad(x.getMinutes())}00`;
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//La Mesnie de la Ferte-Clairbois//FR", "BEGIN:VEVENT",
      `UID:feodales-${f.cle}@mesnie-ferteclairbois`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `DTSTART;TZID=Europe/Paris:${t(f.debut)}`, `DTEND;TZID=Europe/Paris:${t(f.fin)}`,
      "SUMMARY:Les Féodales de Clairbois",
      "DESCRIPTION:Fête médiévale : marché\\, campement\\, animations\\, spectacles. Samedi 14h-19h\\, dimanche 10h-18h.",
      "LOCATION:Domaine de la Ferté-Clairbois\\, 53270 Sainte-Suzanne-et-Chammes",
      "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");
    const lien = document.createElement("a");
    lien.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    lien.download = `feodales-de-clairbois-${f.cle}.ics`;
    document.body.appendChild(lien); lien.click(); lien.remove();
    setTimeout(() => URL.revokeObjectURL(lien.href), 2000);
  });

  const toast = (texte) => {
    let t = $(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = texte; t.classList.add("is-visible");
    clearTimeout(toast.minuteur); toast.minuteur = setTimeout(() => t.classList.remove("is-visible"), 2600);
  };
  document.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-partager]");
    if (!b) return;
    const f = fetes.find((x) => x.cle === b.dataset.partager);
    if (!f) return;
    const url = new URL("feodales.html", location.href).href;
    const texte = `Les Féodales de Clairbois, fête médiévale le ${datesTexte(f)} au Domaine de la Ferté-Clairbois (Sainte-Suzanne-et-Chammes).`;
    if (navigator.share) {
      try { await navigator.share({ title: "Les Féodales de Clairbois", text: texte, url }); } catch (err) {}
      return;
    }
    try { await navigator.clipboard.writeText(`${texte} ${url}`); toast("Lien copié : vous pouvez le coller dans un message."); }
    catch (err) { window.prompt("Copiez ce lien pour le partager :", url); }
  });

  $$("[data-filtres]").forEach((groupe) => {
    const cible = $(groupe.dataset.filtres);
    if (!cible) return;
    groupe.addEventListener("click", (e) => {
      const b = e.target.closest("[data-filtre]");
      if (!b) return;
      $$("[data-filtre]", groupe).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      const v = b.dataset.filtre;
      $$("[data-cat]", cible).forEach((item) => { item.hidden = v !== "tout" && !item.dataset.cat.split(" ").includes(v); });
    });
  });

  const vis = $(".visionneuse");
  if (vis) {
    const img = $("img", vis), leg = $("figcaption", vis);
    let liste = [], pos = 0, retour = null;
    const afficher = (i) => {
      pos = (i + liste.length) % liste.length;
      const b = liste[pos];
      img.src = b.dataset.grand; img.alt = b.querySelector("img")?.alt || "";
      leg.textContent = b.dataset.legende || "";
      $$(".visionneuse__prec, .visionneuse__suiv", vis).forEach((x) => (x.hidden = liste.length < 2));
    };
    const fermer = () => { vis.classList.remove("is-open"); document.body.style.overflow = ""; retour && retour.focus(); };
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-grand]");
      if (!b) return;
      const groupe = b.dataset.groupe || "galerie";
      liste = $$("[data-grand]").filter((x) => (x.dataset.groupe || "galerie") === groupe && !x.closest("[hidden]"));
      retour = b; afficher(liste.indexOf(b));
      vis.classList.add("is-open"); document.body.style.overflow = "hidden";
      $(".visionneuse__fermer", vis).focus();
    });
    $(".visionneuse__fermer", vis).addEventListener("click", fermer);
    $(".visionneuse__prec", vis).addEventListener("click", () => afficher(pos - 1));
    $(".visionneuse__suiv", vis).addEventListener("click", () => afficher(pos + 1));
    vis.addEventListener("click", (e) => { if (e.target === vis) fermer(); });
    document.addEventListener("keydown", (e) => {
      if (!vis.classList.contains("is-open")) return;
      if (e.key === "Escape") fermer();
      if (e.key === "ArrowLeft") afficher(pos - 1);
      if (e.key === "ArrowRight") afficher(pos + 1);
    });
  }

  $$("[data-carte]").forEach((zone) => {
    const b = $("button", zone);
    b && b.addEventListener("click", () => {
      zone.innerHTML = `<iframe title="Carte d'accès au Domaine de la Ferté-Clairbois" loading="lazy"
        src="https://www.google.com/maps?q=${encodeURIComponent(zone.dataset.carte)}&output=embed"></iframe>`;
    });
  });

  const emailValide = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  $$("form[data-formulaire]").forEach((form) => {
    const msg = $(".message-form", form);
    const montrer = (texte, ok) => {
      if (!msg) return;
      msg.hidden = false; msg.textContent = texte;
      msg.className = "message-form " + (ok ? "message-form--ok" : "message-form--ko");
    };
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      let valide = true;
      $$(".champ", form).forEach((c) => {
        const input = $("input, textarea, select", c);
        const err = $(".champ__erreur", c);
        if (!input || !err) return;
        let probleme = "";
        if (input.required && !input.value.trim()) probleme = "Ce champ est obligatoire.";
        else if (input.type === "email" && input.value && !emailValide(input.value)) probleme = "L'adresse e-mail ne semble pas valide.";
        err.textContent = probleme; c.classList.toggle("champ--erreur", !!probleme);
        input.setAttribute("aria-invalid", String(!!probleme));
        if (probleme) valide = false;
      });
      const emailLibre = $$("input[type=email]", form).find((i) => !i.closest(".champ"));
      if (emailLibre && !emailValide(emailLibre.value)) { montrer("Merci d'indiquer une adresse e-mail valide.", false); emailLibre.focus(); return; }
      if (!valide) { montrer("Certains champs sont à corriger (voir en rouge).", false); $(".champ--erreur input, .champ--erreur textarea, .champ--erreur select", form)?.focus(); return; }
      const rgpd = $("[name=consentement]", form);
      if (rgpd && !rgpd.checked) { montrer("Merci de cocher la case d'acceptation pour envoyer votre message.", false); rgpd.focus(); return; }

      const donnees = new FormData(form);
      const action = form.getAttribute("action");
      if (action) {
        try {
          const r = await fetch(action, { method: "POST", body: donnees, headers: { Accept: "application/json" } });
          if (!r.ok) throw new Error();
          form.reset(); montrer(form.dataset.merci || "Merci ! Votre message a bien été envoyé.", true);
        } catch (err) { montrer("L'envoi n'a pas fonctionné. Vous pouvez nous écrire directement par e-mail.", false); }
        return;
      }
      const lignes = [];
      donnees.forEach((v, k) => { if (k !== "consentement" && v) lignes.push(`${k} : ${v}`); });
      window.location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(form.dataset.sujet || "Message depuis le site")}&body=${encodeURIComponent(lignes.join("\n"))}`;
      montrer("Votre messagerie va s'ouvrir avec le message prêt à être envoyé.", true);
    });
  });

  const sujetUrl = new URLSearchParams(location.search).get("sujet");
  const selectSujet = $("#c-sujet");
  if (sujetUrl && selectSujet && $(`option[value="${CSS.escape(sujetUrl)}"]`, selectSujet)) selectSujet.value = sujetUrl;

  $$("[data-annee]").forEach((el) => (el.textContent = new Date().getFullYear()));

  const formes = ["heaume", "banniere", "tour", "bouclier", "chateau", "fleur", "chevalier", "cavalier"];
  const graine = [...location.pathname].reduce((s, ch) => s + ch.charCodeAt(0), 0);
  const recoins = [
    { top: "9%", left: "5%", r: -12 }, { top: "12%", right: "6%", r: 10 },
    { bottom: "8%", left: "9%", r: 8 }, { bottom: "12%", right: "8%", r: -8 },
    { top: "38%", left: "3%", r: 14 }, { top: "30%", right: "3%", r: -14 }
  ];
  const cacher = (parent, classe, forme, style = {}) => {
    const el = document.createElement("span");
    el.className = "cache " + classe;
    el.setAttribute("aria-hidden", "true");
    el.style.backgroundImage = `url("assets/img/deco/${forme}.svg")`;
    Object.assign(el.style, style);
    parent.prepend(el);
  };
  $$("main > section.section:not(.section--serree):not(#partenaires)").forEach((s, i) => {
    const clair = s.classList.contains("section--sombre") ? "-clair" : "";
    cacher(s, `cache--${(graine + i) % 2 ? "gauche" : "droite"}${i % 3 === 1 ? " cache--haut" : ""}`,
      formes[(graine + i * 3) % formes.length] + clair);
    if ((graine + i) % 2 === 0) {
      const p = recoins[(graine + i * 5) % recoins.length];
      const { r, ...pos } = p;
      cacher(s, "cache--dedans", formes[(graine + i * 3 + 4) % formes.length] + clair, { ...pos, "--r": r + "deg" });
    }
  });
  const pied = $(".footer");
  pied && cacher(pied, "cache--pied", "heaume-clair");

  const elts = $$(".revele");
  if (!("IntersectionObserver" in window)) elts.forEach((e) => e.classList.add("is-visible"));
  else {
    const io = new IntersectionObserver((entrees) => entrees.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
    }), { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    elts.forEach((e) => io.observe(e));
  }
})();
