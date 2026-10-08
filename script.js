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
// SUBMIT — construye JSON y lo muestra en consola
// ══════════════════════════════════════════
document.getElementById('fc2')?.addEventListener('submit', function (e) {
  e.preventDefault();
  if (!this.checkValidity()) { this.reportValidity(); return; }
  const payload = buildPayload();
  console.log('FC2 – Historia Clínica\n', JSON.stringify(payload, null, 2));
  alert('Formulario guardado. Revisa la consola (F12) para ver el JSON.');
});

function val(name) {
  return document.querySelector(`[name="${name}"]`)?.value?.trim() ?? null;
}

function radioVal(name) {
  const checked = document.querySelector(`[name="${name}"]:checked`);
  return checked ? checked.value === 'true' : null;
}

function buildPayload() {
  return {
    encabezado: {
      nombre_paciente: val('encabezado_nombre_paciente'),
      expediente:      val('encabezado_expediente'),
      fecha:           val('encabezado_fecha'),
    },
    ficha_identificacion: {
      nombre_paciente:        val('nombre_paciente'),
      nombre_tutor:           val('nombre_tutor') || null,
      sexo:                   val('sexo'),
      edad:                   parseInt(val('edad'), 10) || null,
      fecha_nacimiento:       val('fecha_nacimiento'),
      lugar_nacimiento:       val('lugar_nacimiento') || null,
      estado_civil:           val('estado_civil'),
      religion:               val('religion') || null,
      escolaridad:            val('escolaridad'),
      ocupacion:              val('ocupacion'),
      domicilio:              val('domicilio'),
      telefono_movil:         val('telefono_movil'),
      telefono_fijo:          val('telefono_fijo') || null,
      email:                  val('email'),
      motivo_consulta:        val('motivo_consulta'),
      medio_enterado_clinica: val('medio_enterado_clinica') || null,
      mejora_vida_esperada:   val('mejora_vida_esperada') || null,
    },
    antecedentes_heredofamiliares: [
      { familiar: 'Madre',          vive: radioVal('madre_vive'),          descripcion: val('madre_descripcion') || null },
      { familiar: 'Padre',          vive: radioVal('padre_vive'),          descripcion: val('padre_descripcion') || null },
      { familiar: 'Hermanos',       vive: radioVal('hermanos_vive'),       descripcion: val('hermanos_descripcion') || null },
      { familiar: 'Abuelo Paterno', vive: radioVal('abuelo_paterno_vive'), descripcion: val('abuelo_paterno_descripcion') || null },
      { familiar: 'Abuela Paterna', vive: radioVal('abuela_paterna_vive'), descripcion: val('abuela_paterna_descripcion') || null },
      { familiar: 'Abuelo Materno', vive: radioVal('abuelo_materno_vive'), descripcion: val('abuelo_materno_descripcion') || null },
      { familiar: 'Abuela Materna', vive: radioVal('abuela_materna_vive'), descripcion: val('abuela_materna_descripcion') || null },
    ],
    antecedentes_personales_patologicos: {
      condiciones: [
        { condicion: 'Hospitalizaciones',         presente: radioVal('hospitalizaciones'),      descripcion: val('hospitalizaciones_descripcion') || null },
        { condicion: 'Quirúrgicos',               presente: radioVal('quirurgicos'),            descripcion: val('quirurgicos_descripcion') || null },
        { condicion: 'Alérgicos',                presente: radioVal('alergicos'),              descripcion: val('alergicos_descripcion') || null },
        { condicion: 'Enfermedades actuales',    presente: radioVal('enfermedades_actuales'),  descripcion: val('enfermedades_actuales_descripcion') || null },
        { condicion: 'Traumatismos',             presente: radioVal('traumatismos'),           descripcion: val('traumatismos_descripcion') || null },
        { condicion: 'Convulsiones',             presente: radioVal('convulsiones'),           descripcion: val('convulsiones_descripcion') || null },
        { condicion: 'Transfusiones sanguíneas', presente: radioVal('transfusiones'),          descripcion: val('transfusiones_descripcion') || null },
        { condicion: 'Consumo de sustancias',    presente: radioVal('sustancias'),             descripcion: val('sustancias_descripcion') || null },
      ],
      medicacion_actual: {
        toma_medicamento:  radioVal('toma_medicamento'),
        especificar_dosis: val('medicamentos_dosis') || null,
      },
      salud_mental_previa: {
        recibio_tratamiento:     radioVal('tratamientos_salud_mental'),
        especificar_tratamiento: val('tratamientos_salud_mental_especificar') || null,
      },
    },
  };
}
