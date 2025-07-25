# 🍋 Lemon Tree - Extensión de VS Code

La **extensión original de Visual Studio Code** para [Lemon Tree](https://github.com/igarrux/lemon-tree) - ¡haciendo que la gestión de traducciones sea tan fácil como hacer clic en un botón!

Transforma tu flujo de trabajo de desarrollo multilingüe con **gestión de traducciones de un solo clic** directamente en tu editor.

---

## ✨ Características

### 🎯 Gestión de Traducciones de Un Solo Clic

-   **Agregar/Actualizar traducciones** con un solo clic vía CodeLens
-   **Eliminar traducciones** instantáneamente a través de acciones hover
-   **Indicadores visuales** para claves de traducción en tu código
-   **Detección inteligente** de llamadas a funciones de traducción

### 🔍 Análisis Inteligente de Código

-   **Mensajes hover** mostrando detalles de traducción y acciones disponibles
-   **Integración CodeLens** para operaciones rápidas de traducción
-   **Validación en tiempo real** de la configuración `lemon-tree.yaml`
-   **Iconos de gutter** indicando el estado de traducción

### ⚙️ Integración Perfecta

-   **Activación automática** cuando se detecta `lemon-tree.yaml`
-   **Validación de esquema YAML** para el archivo de configuración
-   **Observación de archivos** para actualizaciones de configuración en vivo

## 🎬 Demo

<!-- ¡Espacio para tu increíble GIF demo! -->

![Lemon Tree en Acción](./media/demo.gif)

_¡Agrega/actualiza/elimina traducciones con solo un clic!_

---

## 🚀 Comenzando

### Requisitos Previos

1. **Instala Lemon Tree CLI** en tu proyecto:

    ```bash
    npm install --save-dev @garrux/lemon-tree
    ```

2. **Inicializa Lemon Tree** en tu proyecto:

    ```bash
    npx ltr init
    ```

3. **Configura tu `lemon-tree.yaml`** con tus idiomas y configuraciones de traducción.

4. **Agrega ejemplos de la función de traducción** en el YAML, la extensión se basará en ellos para detectar las claves de traducción.

Agrega ejemplos de cómo usas la función de traducción en tu código. Asegúrate de colocar `$text` en el lugar donde se encuentra el texto, por ejemplo:

```yaml
translationFunctionExamples:
    - t("$text")
```

### Instalación

1. Instala esta extensión desde el marketplace de VS Code
2. Abre un proyecto con un archivo `lemon-tree.yaml`
3. ¡La extensión se **activará automáticamente** y mejorará tu experiencia de desarrollo!

---

## 🎮 Cómo Usar

### Agregando/Actualizando Traducciones

1. **Escribe tu clave de traducción** en el código (ej., `t("welcome.message")`)
2. **Haz clic en el CodeLens** "Add/Update translation" que aparece arriba de la línea
3. ¡**Listo!** Lemon Tree CLI maneja la traducción automáticamente

### Eliminando Traducciones

1. **Haz clic sobre la línea de código** que contiene la clave de traducción
2. **Pasa el cursor sobre la clave de traducción** en tu código
3. **Haz clic en "Remove translation"** desde el popup hover
4. ¡**Confirmado!** La clave de traducción se elimina de todos los archivos de idioma y tipos

### Gestión de Configuración

-   **Validación YAML** asegura que tu `lemon-tree.yaml` esté siempre correcto
-   **Recarga en vivo** cuando la configuración cambia
-   **Notificaciones de error** para configuraciones inválidas

---

## 📋 Requisitos

-   **Node.js** 16+ (requerido por Lemon Tree CLI)
-   **Paquete @garrux/lemon-tree** instalado en tu proyecto
-   **Archivo de configuración lemon-tree.yaml** en la raíz de tu workspace
-   **Extensión YAML** (sugerida automáticamente si no está instalada)
-   **Clave de API del proveedor de traducción** - Puedes usar Google, DeepL, Microsoft, Yandex o un plugin personalizado

---

## ⚡ Comandos

Esta extensión proporciona los siguientes comandos accesibles vía Paleta de Comandos:

| Comando                         | Descripción                                  |
| ------------------------------- | -------------------------------------------- |
| `lemon-tree.update-translation` | Agregar o actualizar una clave de traducción |
| `lemon-tree.remove-translation` | Eliminar una clave de traducción             |

> 💡 **Consejo Pro**: ¡Rara vez necesitas usar comandos directamente! La extensión proporciona interacciones intuitivas de CodeLens y hover.

---

## 🔧 Configuración

Esta extensión lee automáticamente tu configuración `lemon-tree.yaml`. Aquí hay un ejemplo mínimo:

```yaml
languages:
    - en
    - es
    - fr

sourceLanguage: en

default:
    filePattern: ./translations/{{lang}}/{{lang}}.json
    protectionPattern: "{{key}}"
    typeDefinition:
        file: ./translations.d.ts
        exportName: Translations

translationFunctionExamples: 
    - t("$text")
    - i18n.t("$text")
    - i18next.t("$text")

api:
    provider: google
    key: "{{GOOGLE_API_KEY}}"
```

Para opciones de configuración detalladas, visita la [documentación de Lemon Tree](https://github.com/igarrux/lemon-tree).

---

## 🎨 Configuraciones de Extensión

¡Esta extensión detecta y valida automáticamente tu configuración de Lemon Tree. No se requieren configuraciones adicionales de VS Code!

La extensión contribuye:

-   **Validación de esquema YAML** para archivos `lemon-tree.yaml`
-   **Activación automática** cuando se detectan proyectos de Lemon Tree

---

## 🐛 Problemas Conocidos

-   **Configuración inicial**: Asegúrate de que `lemon-tree.yaml` exista en la raíz de tu workspace
-   **Claves API**: Asegúrate de que tus claves API de traducción estén configuradas correctamente
-   **Proyectos grandes**: Las operaciones de traducción pueden tomar unos segundos para proyectos con muchos idiomas

## 📝 Notas de Versión

### 0.0.1

**Lanzamiento Inicial** 🎉

-   ✅ Integración CodeLens para gestión de traducciones
-   ✅ Acciones hover para operaciones rápidas de traducción
-   ✅ Validación de esquema YAML para configuración
-   ✅ Observación de archivos y actualizaciones en tiempo real
-   ✅ Soporte multi-workspace
-   ✅ Iconos de gutter e indicadores visuales

---

## 🤝 Proyectos Relacionados

-   **[Lemon Tree CLI](https://github.com/igarrux/lemon-tree)** - El poderoso CLI que alimenta esta extensión
-   **APIs de Traducción** - Soporta Google, DeepL, Microsoft, Yandex, y plugins personalizados

---

## 💡 ¿Por Qué la Extensión Lemon Tree VS Code?

-   **🚀 Productividad**: Gestiona traducciones sin salir de tu editor
-   **⚡ Velocidad**: Operaciones de un clic vs. comandos CLI manuales
-   **🎯 Precisión**: Retroalimentación visual y prevención de errores
-   **🔄 Flujo de Trabajo**: Integración perfecta con tu proceso de desarrollo

---

## 👨‍💻 Autor

-   **Lemon Tree CLI** por [Jhon Guerrero (Garrux)](https://github.com/igarrux)

---

## 📄 Licencia

Licencia MIT - ¡Siéntete libre de usar, modificar y distribuir!

---

**¡Hecho con 🍋 y mucho ❤️ para la comunidad de desarrolladores!**

_Transforma tu flujo de trabajo de traducción hoy - ¡porque gestionar traducciones debería ser tan fácil como hacer clic en un botón!_
