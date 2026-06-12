/* ===== CONFIGURACAO SUPABASE ===== */
const SUPABASE_URL = 'https://ankgssnreiqgsligrqjt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_7YKaHYmFboJJm-0eXZgtNA_6_aGBf5l';

let supabaseClient = null;
try {
  if (typeof supabase !== 'undefined' && SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('seu-projeto')) {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase conectado!');
  }
} catch (e) {
  console.log('Supabase nao configurado, usando fallback local.');
}

/* ===== HEADER SCROLL ===== */
const header = document.getElementById('header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  if (currentScroll > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
  lastScroll = currentScroll;
});

/* ===== MOBILE MENU ===== */
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');

menuToggle.addEventListener('click', () => {
  menuToggle.classList.toggle('active');
  nav.classList.toggle('open');
});

document.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    menuToggle.classList.remove('active');
    nav.classList.remove('open');
  });
});

/* ===== NAV ACTIVE LINK ===== */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav__link');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    if (window.pageYOffset >= sectionTop) {
      current = section.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active');
    }
  });
});

/* ===== FAQ ACCORDION ===== */
document.querySelectorAll('.faq__question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const isActive = item.classList.contains('active');
    document.querySelectorAll('.faq__item').forEach(i => i.classList.remove('active'));
    if (!isActive) {
      item.classList.add('active');
      btn.setAttribute('aria-expanded', 'true');
    } else {
      btn.setAttribute('aria-expanded', 'false');
    }
  });
});

/* ===== ANIMATED COUNTERS ===== */
function animateCounter(el, target, suffix = '') {
  let current = 0;
  const step = Math.ceil(target / 60);
  const interval = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(interval);
    }
    el.textContent = current + suffix;
  }, 25);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-target'));
      const suffix = el.textContent.includes('%') ? '%' : el.textContent.includes('+') ? '+' : '';
      animateCounter(el, target, suffix);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.numbers__value, .hero__stat-number').forEach(el => {
  counterObserver.observe(el);
});

/* ===== SCROLL REVEAL ===== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.service-card, .process__step, .benefit, .blog-card, .real-data__card').forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

/* ===== FORM HANDLING ===== */
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const formSubmit = document.getElementById('formSubmit');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    formSubmit.disabled = true;
    formSubmit.textContent = 'Enviando...';
    formStatus.className = 'form__status';

    const formData = {
      name: document.getElementById('formName').value.trim(),
      email: document.getElementById('formEmail').value.trim(),
      phone: document.getElementById('formPhone').value.trim(),
      company: document.getElementById('formCompany').value.trim(),
      message: document.getElementById('formMessage').value.trim(),
      created_at: new Date().toISOString()
    };

    let success = false;

    if (supabaseClient) {
      try {
        const { error } = await supabaseClient
          .from('leads')
          .insert([formData]);
        if (!error) success = true;
      } catch (e) {
        console.log('Erro Supabase:', e);
      }
    }

    if (!success) {
      try {
        const localLeads = JSON.parse(localStorage.getItem('alliance_leads') || '[]');
        localLeads.push(formData);
        localStorage.setItem('alliance_leads', JSON.stringify(localLeads));
        success = true;
      } catch (e) {
        console.log('Erro localStorage:', e);
      }
    }

    if (success) {
      formStatus.className = 'form__status success';
      formStatus.textContent = 'Recebemos sua solicitacao! Entraremos em contato em ate 2 horas.';
      contactForm.reset();
    } else {
      formStatus.className = 'form__status error';
      formStatus.textContent = 'Erro ao enviar. Por favor, nos envie uma mensagem no WhatsApp.';
    }

    formSubmit.disabled = false;
    formSubmit.textContent = 'Enviar Solicitacao';
  });
}

/* ===== WHATSAPP TRACKING ===== */
document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
  link.addEventListener('click', () => {
    console.log('WhatsApp click tracked');
  });
});
