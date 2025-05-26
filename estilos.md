
# Guía de Estilos y Diseño - QMS+Hotel (`estilos.md`)

## 1. Introducción: La Filosofía de Diseño

Este documento establece las directrices de diseño visual para "QMS+Hotel", adoptando la filosofía de **Material Design 3 (M3)**. M3 es la evolución más reciente de Material Design, centrada en la **expresividad, la adaptabilidad y la personalización**, al mismo tiempo que mantiene una base sólida en la usabilidad y la accesibilidad.

Nuestra aplicación busca ser:
*   **Intuitiva:** Fácil de entender y usar para personal de hotel con diferentes niveles de experiencia tecnológica.
*   **Confiable:** Transmitir profesionalismo y robustez, reflejando la importancia de la gestión de calidad.
*   **Engaging:** Utilizar elementos de gamificación y una experiencia visual agradable para fomentar la participación.
*   **Adaptable:** Funcionar de manera consistente en diversas plataformas y tamaños de pantalla.

### 1.1. Principios Clave de M3 para QMS+Hotel

1.  **Color Dinámico y Personalizado:** Utilizar un sistema de color tonal que no solo defina la marca, sino que también permita la personalización (si se implementa un tema configurable) y la armonía visual.
2.  **Expresividad y Ergonomía:** Las formas y tipografías se seleccionarán para guiar la atención del usuario y hacer que las interacciones sean cómodas y eficientes.
3.  **Accesibilidad por Diseño:** Asegurar que la aplicación sea utilizable por todos, prestando atención al contraste de color, tamaños de texto y facilidad de interacción.
4.  **Flujo y Animación Natural:** Transiciones y animaciones que refuercen la comprensión del usuario y hagan la interfaz más fluida y placentera.
5.  **Componentes Robustos y Adaptables:** Utilizar componentes de Material Design que se ajusten a diferentes contextos y estados.

## 2. Sistema de Color

Material Design 3 se basa en un sistema de color tonal que permite una gran flexibilidad y armonía. Para "QMS+Hotel", definiremos una paleta central que se expandirá automáticamente para generar variantes tonales para diferentes usos (superficies, texto, estados).

*   **Paleta Base:**
    *   **Primary (Primario):** El color principal de la marca, usado para elementos clave como llamadas a la acción, títulos importantes, elementos de navegación activos. (Ej: Un tono de azul o verde corporativo que evoque confianza y eficiencia).
    *   **Secondary (Secundario):** Complementario al primario, usado para elementos menos prominentes pero importantes (ej. iconos, sub-acciones).
    *   **Tertiary (Terciario):** Un tercer color para acentos, elementos visuales distintivos o elementos de gamificación para darles una apariencia única.
    *   **Neutral (Neutro):** Una escala de grises para fondos, textos y separadores, esencial para la legibilidad.
    *   **Error:** Un color distintivo para mensajes de error y advertencias (ej. Rojo).
*   **Roles del Color:** Cada color base generará una serie de tonos que se asignarán a roles específicos (ej. `primary`, `onPrimary`, `primaryContainer`, `onPrimaryContainer`, `surface`, `onSurface`, etc.). Esto asegura un contraste adecuado y una aplicación consistente del color.
*   **Temas Claro y Oscuro:** La aplicación soportará un tema claro por defecto y un tema oscuro opcional (o automático según la configuración del sistema del usuario), asegurando la legibilidad en diferentes condiciones de iluminación.

## 3. Tipografía

Utilizaremos la escala de tipos de Material Design 3, que promueve la jerarquía visual y la legibilidad. Se elegirá una fuente sans-serif legible y moderna (ej. **Roboto, Inter, Noto Sans**) que se adapte bien a contextos de datos y texto extenso.

*   **Escala de Tipos (Ejemplos de Uso):**
    *   `Display Large/Medium/Small`: Para títulos de sección muy grandes o elementos hero.
    *   `Headline Large/Medium/Small`: Para títulos de página, módulos principales.
    *   `Title Large/Medium/Small`: Para títulos de tarjetas, diálogos, encabezados de columnas.
    *   `Body Large/Medium/Small`: Para el cuerpo principal del texto, descripciones, contenido de formularios.
    *   `Label Large/Medium/Small`: Para etiquetas de componentes, texto pequeño, botones.
*   **Consistencia:** Se mantendrá una consistencia estricta en el uso de los tamaños, pesos y estilos de fuente para asegurar una experiencia de usuario cohesionada.

## 4. Formas (Shapes)

M3 introduce la noción de "formas" como una parte fundamental de la expresividad visual. Cada componente tendrá una forma definida que contribuya a la estética general y la jerarquía.

*   **Grados de Redondez:** Utilizaremos una combinación de esquinas suavemente redondeadas (`small` a `medium` `cornerShape`) para la mayoría de los componentes interactivos (botones, campos de texto), y esquinas ligeramente más prominentes (`large` `cornerShape`) para contenedores o tarjetas, creando una sensación amigable y moderna.
*   **Uso Consistente:** La forma se aplicará de manera coherente a elementos como botones, tarjetas, cuadros de diálogo, campos de entrada y contenedores, reforzando la identidad visual.

## 5. Iconografía

Utilizaremos la biblioteca **Material Symbols** de Google, lo que nos brinda una amplia gama de iconos vectoriales que se pueden personalizar en peso óptico (filled, outlined, rounded, sharp, two-tone).

*   **Estilo Principal:** Se priorizará el estilo `Outlined` o `Rounded` para la mayoría de los iconos de interfaz, por su legibilidad y estética limpia.
*   **Coherencia:** Todos los iconos mantendrán una consistencia en el estilo, asegurando que la interfaz se vea unificada.
*   **Iconos de Gamificación:** Los iconos asociados con insignias o puntos de gamificación podrían usar un estilo `Filled` o `Two-Tone` con colores vibrantes para distinguirse y ser más llamativos.

## 6. Movimiento y Animación

Las animaciones en M3 son fluidas y significativas, guiando la atención del usuario y proporcionando retroalimentación.

*   **Transiciones de Página:** Transiciones suaves entre vistas para evitar saltos bruscos y mantener al usuario orientado.
*   **Retroalimentación de Interacción:** Animaciones sutiles al pulsar botones, seleccionar elementos o cargar contenido, que confirmen la acción del usuario.
*   **Énfasis:** Animaciones que dirijan la atención a elementos importantes, como la aparición de una notificación o un nuevo punto de gamificación ganado.
*   **Propósito:** Todas las animaciones tendrán un propósito funcional, no solo estético, contribuyendo a la usabilidad y la experiencia del usuario.

## 7. Componentes de Material Design 3

Utilizaremos los componentes prediseñados de M3, adaptándolos a las necesidades específicas de "QMS+Hotel".

*   **Navegación:**
    *   **App Bar (Barra de Aplicación Superior):** Contendrá el título de la aplicación, el logo del hotel (si aplica), y acciones globales (ej. búsqueda, perfil de usuario, notificaciones).
    *   **Navigation Rail/Drawer (Carril/Cajón de Navegación):** Para la navegación principal entre módulos (Dashboard, Documentación, NC/CAPA, etc.), adaptándose al tamaño de la pantalla.
*   **Botones:**
    *   `Elevated Button` (Botón Elevado): Para acciones primarias (ej. "Guardar", "Crear Nuevo").
    *   `Filled Button` (Botón Relleno): Para acciones importantes dentro de un contexto.
    *   `Outlined Button` (Botón Contorneado): Para acciones secundarias (ej. "Cancelar", "Editar").
    *   `Text Button` (Botón de Texto): Para acciones menos prominentes (ej. dentro de diálogos).
*   **Campos de Entrada:**
    *   `Filled Text Field` o `Outlined Text Field`: Para la entrada de texto y números, con estados claros de enfoque, error y éxito.
*   **Tarjetas (Cards):** Utilizadas para agrupar información relacionada, mostrar resúmenes de elementos (ej. una no conformidad, un documento), o como contenedores para widgets en el dashboard.
*   **Diálogos:** Para interacciones modales (confirmaciones, formularios rápidos).
*   **Chips:** Para etiquetas, filtros o selecciones rápidas.
*   **Snackbars/Toasts:** Para notificaciones de corta duración no intrusivas.
*   **Progreso e Indicadores:** Barras de progreso, spinners para indicar carga.

## 8. Layout y Espaciado

*   **Sistema de Cuadrícula (Grid System):** La aplicación utilizará un sistema de cuadrícula responsivo para organizar el contenido de manera consistente en diferentes tamaños de pantalla, garantizando la alineación y el equilibrio visual.
*   **Espaciado Consistente:** Se establecerá una escala de espaciado (ej. múltiplos de 4 u 8 píxeles) para paddings, margins y separación entre elementos, asegurando una apariencia ordenada y profesional.
*   **Espacios en Blanco:** El uso estratégico de espacios en blanco (white space) para reducir el desorden visual, mejorar la legibilidad y guiar la atención del usuario.

## 9. Accesibilidad

M3 está diseñado con la accesibilidad en mente. Seguiremos sus principios para garantizar que la aplicación sea usable por todos:
*   **Contraste de Color:** Asegurar un contraste de color adecuado para el texto y los elementos interactivos.
*   **Tamaños de Objetivo Táctil:** Los elementos interactivos tendrán un tamaño mínimo de 48x48 dp para facilitar la interacción táctil.
*   **Semántica:** Uso correcto de elementos HTML semánticos y atributos ARIA para la compatibilidad con lectores de pantalla.
*   **Navegación por Teclado:** Asegurar que todos los elementos interactivos sean accesibles y navegables mediante el teclado.

## 10. Visuales de Gamificación

La gamificación se integrará de forma cohesiva dentro del lenguaje visual de M3.

*   **Puntos:** Representación visual clara de los puntos ganados (ej. un icono de moneda o estrella animado que aparece brevemente al ganar puntos). El total de puntos será visible en el perfil del usuario o en el dashboard de gamificación.
*   **Insignias (Badges):**
    *   Diseños distintivos, con formas y combinaciones de colores `Tertiary` o `Secondary` vibrantes.
    *   Animaciones sutiles al obtener una nueva insignia.
    *   Una "Galería de Insignias" donde los usuarios puedan ver sus logros y los que aún les faltan por conseguir.
*   **Tablas de Clasificación (Leaderboards):** Presentadas de manera limpia y legible, utilizando las tablas de M3, con énfasis en el usuario logueado. Se podría usar una pequeña insignia o icono para destacar a los usuarios con mayor puntuación.
*   **Notificaciones de Progreso:** Animaciones suaves para indicar el progreso hacia un objetivo (ej. una barra de progreso que se llena al realizar una tarea).
*   **Integración de Color:** Los colores utilizados para los elementos de gamificación serán de la paleta M3, pero quizás en tonos más saturados o con mayor contraste para que se destaquen.

## 11. Identidad de Marca de "QMS+Hotel"

Mientras que Material Design 3 proporciona el sistema, la identidad única de "QMS+Hotel" se definirá a través de:
*   **La elección específica de la paleta de colores principal.**
*   **La selección de las tipografías.**
*   **Detalles sutiles en la personalización de los componentes M3** (ej. bordes, sombreados, animaciones únicas).
*   **El logo de la aplicación** y su uso consistente en la barra de aplicación.

Al seguir estas directrices, "QMS+Hotel" ofrecerá una experiencia de usuario moderna, consistente, intuitiva y visualmente atractiva, que no solo cumple con su propósito funcional sino que también deleita a sus usuarios.

---