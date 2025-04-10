# GSAP Timeline Provider for React

### English below 🇺🇸👇

## 🇪🇸 Sincronizador de Timelines con GSAP y React

Este proyecto te permite **sincronizar múltiples animaciones (Timelines)** creadas en distintos componentes React usando un **timeline maestro**. Las animaciones se agregan de forma secuencial o con dependencias mediante etiquetas (`labels`) gestionadas automáticamente.

### 🧠 ¿Por qué usar este TimelineProvider?

✅ Problemas que resuelve

Sin este sistema, sincronizar animaciones entre componentes React que contienen líneas de tiempo GSAP puede ser una pesadilla. Estas son algunas de las situaciones frustrantes que soluciona:

- 🔁 Tener que usar `setTimeout` para intentar alinear animaciones entre componentes.

- ⏱ Usar `delay` manual en cada timeline esperando que el orden sea correcto.

- ❌ Las animaciones se ejecutaban fuera de orden porque no existía una forma clara de coordinar cuándo estaba disponible cada timeline.

- 🤯 La complejidad aumenta drásticamente al tener 3, 5 o más componentes con relaciones dependientes entre sus animaciones.

- 🐛 Tener que adivinar el momento en el que una etiqueta estaba disponible.

Este `TimelineProvider` resuelve todo eso:

- 📦 Centraliza la lógica en una sola masterTimeline.

- ⛓ Usa dependencias declarativas (dependsOn) para asegurar el orden correcto.

- 🔖 Permite registrar etiquetas (labels) automáticamente en la línea de tiempo maestra.

- 🤝 Espera hasta que todas las animaciones estén registradas antes de hacer `play()`.

---

Asegúrate de tener React y `TypeScript` y `@gsap/react`.

---

## 🧩 Uso

### 1. Crea tu Provider

Envuelve tu app con el `<TimelineProvider />`:

```tsx
import { TimelineProvider } from "@/lib/TimelineProvider";

<React.StrictMode>
  <TimelineProvider>
    <App />
  </TimelineProvider>
</React.StrictMode>;
```

### 2. Registra tu timeline

En cualquier componente:

```tsx
import { useGSAP } from "@gsap/react";
import { useTimeline } from "@/lib/TimelineProvider";

useGSAP(() => {
  registerSyncedTimeline({
    id: "box",
    createTimeline: () => {
      const tl = gsap.timeline();
      tl.to(ref.current, { x: 100, duration: 1 })
        .addLabel("endX")
        .to(ref.current, {
          y: 100,
          duration: 1,
        });
      return tl;
    },
    labels: {
      middle: 1, // o usar: (tl) => tl.labels[endX], para obtener tiempo dinámico
    },
  });
}, []);
```

### 3. Crear dependencias con etiquetas

Otro componente puede depender de la etiqueta del anterior:

```tsx
registerSyncedTimeline({
  id: "nav",
  dependsOn: ["box.middle"],
  createTimeline: () => gsap.timeline().to(navRef.current, { opacity: 1 }),
});
```

El timeline de `nav` no se ejecutará hasta que `box.middle` haya sido registrado.

---

## 🇺🇸 GSAP Timeline Sync with React

This lightweight utility lets you **sync multiple GSAP timelines across React components** using a **master timeline**. Each local timeline can:

- Register labels.
- Declare dependencies.
- Be automatically inserted into a global timeline.

### 🧠 Why use this TimelineProvider?

Without this system, synchronizing animations across different React components using GSAP timelines is chaotic. These are real issues this solution fixes:

- 🔁 Using `setTimeout` to try aligning animations across components.

- ⏱ Adding manual `delay` values hoping timelines execute in the right order.

- ❌ Timelines playing out of sync because there’s no way to ensure when each one is ready.

- 🤯 Complexity grows fast when managing 3, 5, or more timelines with dependencies.

- 🐛 Labels missing or undefined because they were added too late.

This `TimelineProvider` solves all of that:

- 📦 Centralizes everything into a single masterTimeline.

- ⛓ Uses declarative dependsOn to enforce the right order.

- 🔖 Automatically registers labels into the master timeline.

- 🤝 Waits until all timelines are registered before calling `play()`.

---

Make sure React and `TypeScript` and `@gsap/react` are set up in your project.

---

## 🧩 How to Use

### 1. Wrap with `<TimelineProvider>`

```tsx
import { TimelineProvider } from "@/lib/TimelineProvider";

<React.StrictMode>
  <TimelineProvider>
    <App />
  </TimelineProvider>
</React.StrictMode>;
```

### 2. Register your timeline

```tsx
registerSyncedTimeline({
  id: "box",
  createTimeline: () => {
    const tl = gsap.timeline();
    tl.to(ref.current, { x: 100, duration: 1 })
      .addLabel("endX")
      .to(ref.current, {
        y: 100,
        duration: 1,
      });
    return tl;
  },
  labels: {
    middle: 1, // or a function like (tl) => tl.labels[endX]
  },
});
```

### 3. Wait for labels from others

```tsx
registerSyncedTimeline({
  id: "nav",
  dependsOn: ["box.middle"],
  createTimeline: () => gsap.timeline().to(navRef.current, { opacity: 1 }),
});
```

---

## 🪪 Licencia

MIT

---

¿Preguntas? Abre un issue o contáctame vía [GitHub](https://github.com/cpiocova).
