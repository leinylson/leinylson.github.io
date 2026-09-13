const header = document.querySelector(".site-header");
const cursorGlow = document.querySelector(".cursor-glow");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const year = document.getElementById("year");

year.textContent = new Date().getFullYear();

window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 20);
});

if (window.matchMedia("(pointer:fine)").matches) {
  window.addEventListener("pointermove", (e) => {
    cursorGlow.style.left = `${e.clientX}px`;
    cursorGlow.style.top = `${e.clientY}px`;
  });
} else {
  cursorGlow.style.display = "none";
}

menuToggle?.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});

document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

const sections = [...document.querySelectorAll("main section[id]")];
const links = [...document.querySelectorAll(".nav-links a")];

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      links.forEach(link => link.classList.toggle(
        "active",
        link.getAttribute("href") === `#${entry.target.id}`
      ));
    }
  });
}, { rootMargin: "-35% 0px -55% 0px" });

sections.forEach(section => sectionObserver.observe(section));

async function loadRepositories() {
  const container = document.getElementById("repo-list");
  try {
    const response = await fetch(
      "https://api.github.com/users/leinylson/repos?sort=updated&per_page=6"
    );
    if (!response.ok) throw new Error("GitHub API indisponível");
    const repos = await response.json();

    if (!repos.length) {
      container.innerHTML = `<div class="repo-loading">Nenhum repositório público encontrado.</div>`;
      return;
    }

    container.innerHTML = repos.slice(0, 6).map(repo => `
      <a class="repo-item" href="${repo.html_url}" target="_blank" rel="noopener">
        <strong>${escapeHTML(repo.name)}</strong>
        <p>${escapeHTML(repo.description || "Projeto sem descrição.")}</p>
        <div class="repo-meta">
          <span>★ ${repo.stargazers_count}</span>
          <span>⑂ ${repo.forks_count}</span>
          <span>${escapeHTML(repo.language || "Code")}</span>
        </div>
      </a>
    `).join("") + (repos.length < 3 ? `
      <a class="repo-item" href="https://github.com/leinylson?tab=repositories" target="_blank" rel="noopener">
        <strong>Novos projetos em breve</strong>
        <p>Esta área cresce junto com os próximos projetos públicos.</p>
        <div class="repo-meta"><span>GitHub</span><span>Projetos</span></div>
      </a>
    ` : "");
  } catch (error) {
    container.innerHTML = `
      <a class="repo-item" href="https://github.com/leinylson?tab=repositories" target="_blank" rel="noopener">
        <strong>Ver todos os repositórios ↗</strong>
        <p>Acesse diretamente meu GitHub.</p>
      </a>
    `;
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[char]));
}

loadRepositories();
