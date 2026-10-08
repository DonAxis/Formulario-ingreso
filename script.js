'use strict';

// ── Bloquear inputs de familia al cargar
document.querySelectorAll('.hf-body input').forEach(inp => { inp.disabled = true; });

// ── Fecha de hoy en encabezado
const fechaHeader = document.querySelector('[name="encabezado_fecha"]');
if (fechaHeader && !fechaHeader.value) {
  fechaHeader.value = new Date().toISOString().slice(0, 10);
}

// ══════════════════════════════════════════
// NAVEGACIÓN POR PASOS
// ══════════════════════════════════════════
let currentStep = 1;

function goStep(n) {
  const prevBtn  = document.querySelector(`.step-btn[data-step="${currentStep}"]`);
  const nextBtn  = document.querySelector(`.step-btn[data-step="${n}"]`);
  const prevLine = prevBtn?.nextElementSibling;

  // Marcar paso anterior como completado si avanzamos
  if (n > currentStep) {
    prevBtn?.classList.add('done');
    if (prevLine?.classList.contains('step-line')) {
    prevLine.classList.add('done');
    prevLine.dataset.fromStep = currentStep;
    const stepColors = { 1: '#16698A', 2: '#2E7D52', 3: '#6B4E9E' };
    prevLine.style.background = stepColors[currentStep] || '';
  }
  } else {
    // Quitar done si retrocedemos
    for (let i = n; i <= 3; i++) {
      document.querySelector(`.step-btn[data-step="${i}"]`)?.classList.remove('done');
      const line = document.querySelector(`.step-btn[data-step="${i}"]`)?.nextElementSibling;
      if (line?.classList.contains('step-line')) line.classList.remove('done');
    }
  }

  document.getElementById(`panel-${currentStep}`).classList.remove('active');
  document.querySelector(`.step-btn[data-step="${currentStep}"]`).classList.remove('active');

  currentStep = n;

  document.getElementById(`panel-${n}`).classList.add('active');
  nextBtn?.classList.add('active');

  document.querySelector('.stepper')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Clic en los círculos del stepper
document.querySelectorAll('.step-btn[data-step]').forEach(btn => {
  btn.addEventListener('click', () => goStep(Number(btn.dataset.step)));
});

// Botones Siguiente / Anterior
document.querySelectorAll('[data-goto]').forEach(btn => {
  btn.addEventListener('click', () => goStep(Number(btn.dataset.goto)));
});

// ══════════════════════════════════════════
// HEREDOFAMILIARES — inyectar etiqueta "¿Vive?"
// ══════════════════════════════════════════
document.querySelectorAll('.hf-card .yn-toggle').forEach(toggle => {
  const wrap = document.createElement('div');
  wrap.className = 'hf-toggle-wrap';
  const q = document.createElement('span');
  q.className = 'hf-q';
  q.textContent = '¿Vive?';
  toggle.parentNode.insertBefore(wrap, toggle);
  wrap.appendChild(q);
  wrap.appendChild(toggle);
});

// ══════════════════════════════════════════
// TOGGLE Sí / No — estado visual + label dinámico
// ══════════════════════════════════════════
document.querySelectorAll('.yn-toggle input[type="radio"]').forEach(radio => {
  radio.addEventListener('change', function () {
    const toggle = this.closest('.yn-toggle');
    toggle.querySelectorAll('.yn-btn').forEach(b => b.classList.remove('selected'));
    this.nextElementSibling.classList.add('selected');

    // Activar input y mostrar label en tarjetas de familia
    const card = this.closest('.hf-card');
    if (card) {
      const label = card.querySelector('.hf-desc-label');
      const input = card.querySelector('.hf-body input');
      if (label) label.textContent = this.value === 'true' ? 'Enfermedades actuales' : 'Causa de defunción';
      if (input) { input.disabled = false; input.focus(); }
    }
  });
});

// ══════════════════════════════════════════
// CAMPOS CONDICIONALES — Sección 3
// Textarea siempre visible: activa con Sí, bloqueada con No
// ══════════════════════════════════════════

// Bloquear todos por defecto al cargar
document.querySelectorAll('.ap-body textarea').forEach(ta => { ta.disabled = true; });

document.querySelectorAll('.cond-t').forEach(radio => {
  radio.addEventListener('change', function () {
    const body = document.getElementById(this.dataset.body);
    if (!body) return;
    body.classList.add('active');
    const ta = body.querySelector('textarea');
    if (ta) { ta.disabled = false; ta.focus(); }
  });
});

document.querySelectorAll('.cond-f').forEach(radio => {
  radio.addEventListener('change', function () {
    const body = document.getElementById(this.dataset.body);
    if (!body) return;
    body.classList.remove('active');
    body.querySelectorAll('textarea').forEach(ta => { ta.disabled = true; ta.value = ''; });
  });
});

// ══════════════════════════════════════════
// TUTOR obligatorio si es menor de edad
// ══════════════════════════════════════════
const edadInput  = document.getElementById('edad');
const tutorInput = document.getElementById('nombre_tutor');
const tutorLabel = tutorInput?.closest('.fg')?.querySelector('label');

if (edadInput && tutorInput) {
  edadInput.addEventListener('input', function () {
    const age     = parseInt(this.value, 10);
    const isMinor = !isNaN(age) && age < 18;
    tutorInput.required = isMinor;
    if (tutorLabel) {
      tutorLabel.innerHTML = isMinor
        ? 'Nombre del tutor <span class="req">*</span>'
        : 'Nombre del tutor <small>(menores de edad)</small>';
    }
  });
}

// ══════════════════════════════════════════
// SUBMIT — placeholder hasta conectar backend
// ══════════════════════════════════════════
document.getElementById('fc2')?.addEventListener('submit', function (e) {
  e.preventDefault();
  showToast();
});

function showToast() {
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
