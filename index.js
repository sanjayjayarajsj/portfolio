/* ============ CONFIG (EmailJS) ============ */
const EMAILJS = {
  publicKey: "7h2wgg4kQPqH3Dofc",
  serviceId: "service_j79fre3",
  templateId: "template_sl4h8y7",
};
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ============ Theme ============ */
const root = document.documentElement;
const themeBtn = $("#themeToggle");
function setTheme(t) {
  root.dataset.theme = t;
  themeBtn.innerHTML = `<i class="fa-solid fa-${t === "dark" ? "moon" : "sun"}"></i>`;
  try { localStorage.setItem("theme", t); } catch (e) {}
}
let saved = "dark";
try { saved = localStorage.getItem("theme") || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"); } catch (e) {}
setTheme(saved);
themeBtn.addEventListener("click", () => setTheme(root.dataset.theme === "dark" ? "light" : "dark"));

/* ============ Navbar, progress bar, active link ============ */
const navbar = $("#navbar"), progress = $("#progress");
const links = $$(".nav-links a");
const sections = links.map(a => $(a.getAttribute("href")));
function onScroll() {
  const y = window.scrollY, max = document.body.scrollHeight - innerHeight;
  navbar.classList.toggle("scrolled", y > 30);
  progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  let current = 0;
  sections.forEach((s, i) => { if (s.getBoundingClientRect().top <= innerHeight * 0.4) current = i; });
  links.forEach((a, i) => a.classList.toggle("active", i === current));
}
addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* Mobile menu */
const hamburger = $("#hamburger"), navLinks = $("#navLinks");
function toggleMenu(open) {
  navLinks.classList.toggle("open", open);
  hamburger.setAttribute("aria-expanded", open);
  hamburger.innerHTML = `<i class="fa-solid fa-${open ? "xmark" : "bars"}"></i>`;
}
hamburger.addEventListener("click", () => toggleMenu(!navLinks.classList.contains("open")));
links.forEach(a => a.addEventListener("click", () => toggleMenu(false)));
addEventListener("keydown", e => { if (e.key === "Escape") toggleMenu(false); });

$("#toTop").addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
$("#year").textContent = new Date().getFullYear();

/* ============ Scroll reveal ============ */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
}, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
$$(".reveal").forEach((el, i) => {
  // stagger siblings inside the same grid
  el.style.setProperty("--d", `${(i % 3) * 0.08}s`);
  io.observe(el);
});

/* ============ Copy to clipboard ============ */
const toast = $("#toast");
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    // fallback for http:// pages and older browsers
    const t = document.createElement("textarea");
    t.value = text; t.style.position = "fixed"; t.style.opacity = "0";
    document.body.appendChild(t); t.select();
    document.execCommand("copy");
    t.remove();
  }
}
document.addEventListener("click", async e => {
  const btn = e.target.closest("[data-copy]");
  if (!btn) return;
  await copyText(btn.dataset.copy);
  showToast(`Copied ${btn.dataset.copy}`);
});

/* ============ Contact form (EmailJS) ============ */
const form = $("#contactForm"), statusEl = $("#formStatus"), sendBtn = $("#sendBtn");
const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
let lastSent = 0;

function setStatus(msg, type) {
  statusEl.textContent = msg;
  statusEl.className = "form-status " + (type || "");
}

if (window.emailjs) emailjs.init({ publicKey: EMAILJS.publicKey });

form.addEventListener("submit", async e => {
  e.preventDefault();
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const message = form.message.value.trim();

  $$("input,textarea", form).forEach(f => f.classList.remove("invalid"));
  if (form.website.value) return;                       // honeypot: bots fill this
  if (!name) { form.name.classList.add("invalid"); form.name.focus(); return setStatus("Enter your name.", "err"); }
  if (!emailOk(email)) { form.email.classList.add("invalid"); form.email.focus(); return setStatus("Enter a valid email address.", "err"); }
  if (message.length < 10) { form.message.classList.add("invalid"); form.message.focus(); return setStatus("Write a message of at least 10 characters.", "err"); }
  if (Date.now() - lastSent < 15000) return setStatus("Please wait a few seconds before sending again.", "err");
  if (!window.emailjs) return setStatus("Email service didn't load. Check your connection and refresh, or use the copy email button.", "err");

  sendBtn.disabled = true;
  sendBtn.querySelector("span").textContent = "Sending…";
  setStatus("");

  try {
    await emailjs.send(EMAILJS.serviceId, EMAILJS.templateId, {
      name, email, message,
      reply_to: email,
      time: new Date().toLocaleString(),
    });
    lastSent = Date.now();
    form.reset();
    setStatus("Message sent. I'll reply to your email soon.", "ok");
    showToast("Message sent");
  } catch (err) {
    console.error("EmailJS error:", err);
    const detail = err && (err.text || err.message) ? ` (${err.text || err.message})` : "";
    setStatus("Message didn't send" + detail + ". Copy my email and write to me directly.", "err");
  } finally {
    sendBtn.disabled = false;
    sendBtn.querySelector("span").textContent = "Send message";
  }
});