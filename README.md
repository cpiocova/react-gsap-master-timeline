# GSAP Timeline Provider for React

<details open>
<summary>🇺🇸 GSAP Timeline Sync with React
</summary>

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

In any component:

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

Another component may depend on the label of the previous one:

```tsx
registerSyncedTimeline({
  id: "nav",
  dependsOn: ["box.middle"],
  createTimeline: () => gsap.timeline().to(navRef.current, { opacity: 1 }),
});
```

### 4. Accessing the Timeline

Unlike the previous version, the `TimelineProvider` now no longer automatically executes a `.play()` when all timelines are ready. Instead, it exposes a boolean property, `isReadyToPlay`, from the context.

This allows you to:

- Ensure that other resources (such as images) are fully loaded.
- Coordinate the start of the master timeline manually and in a controlled manner.

```tsx
const { isReadyToPlay, masterTimeline } = useMasterTimeline();
const [isImageLoaded, setIsImageLoaded] = useState(false);

useEffect(() => {
  if (isReadyToPlay && isImageLoaded) {
    masterTimeline.play();
  }
}, [isReadyToPlay, isImageLoaded]);
```

---

# Improved section `onDependencyFail`

In React systems (e.g., Next.js or SPAs), timelines can depend on components that **may not be mounted**. For instance, `Nav` might depend on a label from `Hero` located on `Home`. But if the user doesn't visit the `Home` page, the `Hero` component is never mounted, and its label, let's call it `hero.end-logo`, is never registered.

#### ⚠️ This causes:

- The `masterTimeline` to be broken
- Other dependent timelines (like `Nav` or `Circle`) to never execute
- Broken or inconsistent animation behavior on navigation

```tsx
  onDependencyFail?: (
    id: string,
    missingLabels: string[]
  ) =>
    | void
    | gsap.core.Timeline
    | {
        timeline: gsap.core.Timeline;
        labels?: Record<string, number | ((tl: gsap.core.Timeline) => number)>;
        startAt?: number;
      };
```

### How does onDependencyFail fix this?

It **gracefully handles missing dependencies** and allows for safe fallbacks:

- Display a static version of the component (`gsap.to(...)`)
- Run an alternate animation
- **Return a fallback timeline with labels** so other components depending on it still work
- Use `startAt` to control when the fallback should run in the master timeline

This ensures **reliable behavior and smooth UX** even when components load conditionally or route transitions occur.

## 🧪 Usage Examples

✅ Custom fallback logic only

```tsx
onDependencyFail: (id, missing) => {
  if (missingLabels.includes("hero.end-logo")) {
    gsap.set(ref.current, { opacity: 1 });
  }
};
```

✅ Fallback timeline with labels

```tsx
onDependencyFail: () => {
  const tl = gsap.timeline().set(ref.current, { opacity: 1 }).addLabel("show");

  return {
    timeline: tl,
    labels: {
      visible: (tl) => tl.labels["show"] ?? tl.duration(),
    },
    startAt: masterTimeline.labels["box.label_mid_box"] ?? 3.5,
  };
};
```

</details>

<details>
  <summary>🇪🇸 Sincronizador de Timelines con GSAP y React </summary>

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
import { useMasterTimeline } from "@/lib/TimelineProvider";

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

### 4. Acceder a la timeline

A diferencia de la versión anterior, ahora el `TimelineProvider` no hace `.play()` automáticamente cuando todas las líneas de tiempo están listas. En su lugar, expone una propiedad booleana `isReadyToPlay` desde el contexto.

Esto te permite:

- Asegurarte de que otros recursos (como imágenes) estén completamente cargados.
- Coordinar el inicio del masterTimeline de forma manual y controlada.

```tsx
const { isReadyToPlay, masterTimeline } = useMasterTimeline();
const [isImageLoaded, setIsImageLoaded] = useState(false);

useEffect(() => {
  if (isReadyToPlay && isImageLoaded) {
    masterTimeline.play();
  }
}, [isReadyToPlay, isImageLoaded]);
```

---

# Sección mejorada `onDependencyFail`

En sistemas React (como Next.js o SPA con rutas), puedes tener animaciones sincronizadas que dependen de componentes condicionales. Por ejemplo, una animación en el componente `Nav` puede depender de una etiqueta de la animación `Hero` que se encuentra en `Home`. Pero si el usuario no visita la página `Home`, `Hero` nunca se monta, y su etiqueta, llamemosla por ejemplo `hero.end-logo`, nunca se registra.

#### ⚠️ Esto provoca:

- Que la `masterTimeline` quede rota
- Que animaciones dependientes (como `Nav` o las que depneden de `Nav`) nunca se ejecuten
- Que toda la experiencia quede inconsistente o rota al volver a una ruta anterior
- Cuando una dependencia no se encuentra (por ejemplo, al cambiar de ruta), puedes manejar el caso usando la propiedad `onDependencyFail` en `registerSyncedTimeline`.

```tsx
  onDependencyFail?: (
    id: string,
    missingLabels: string[]
  ) =>
    | void
    | gsap.core.Timeline
    | {
        timeline: gsap.core.Timeline;
        labels?: Record<string, number | ((tl: gsap.core.Timeline) => number)>;
        startAt?: number;
      };
```

### ¿Cómo lo soluciona onDependencyFail?

Permite interceptar ese error de dependencia y ejecutar una alternativa segura.

**Puedes:**

- Mostrar una versión mínima del componente (por ejemplo, con `gsap.to(...)`)
- Ejecutar una animación alternativa
- Retornar una nueva timeline con etiquetas, manteniendo la sincronización con otros componentes dependientes
- Controlar el momento exacto (startAt) en que se ejecuta la fallback timeline

Esto te permite mantener la integridad visual y funcional incluso si cambian las rutas o condiciones de renderizado dinámico.

## 🧪 Ejemplos de uso

✅ Solo lógica personalizada

```tsx
onDependencyFail: (id, missing) => {
  if (missingLabels.includes("hero.end-logo")) {
    gsap.set(ref.current, { opacity: 1 });
  }
};
```

✅ Timeline alternativa con etiquetas

```tsx
onDependencyFail: () => {
  const tl = gsap.timeline().set(ref.current, { opacity: 1 }).addLabel("show");

  return {
    timeline: tl,
    labels: {
      visible: (tl) => tl.labels["show"] ?? tl.duration(),
    },
    startAt: masterTimeline.labels["box.label_mid_box"] ?? 3.5,
  };
};
```

</details>

---

---

## 🪪 Licencia

MIT

---

¿Preguntas? Abre un issue o contáctame vía [GitHub](https://github.com/cpiocova).
