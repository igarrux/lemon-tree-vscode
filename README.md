# 🍋 Lemon Tree - VS Code Extension

The **Original Visual Studio Code extension** for [Lemon Tree](https://github.com/igarrux/lemon-tree) - making translation management as easy as clicking a button! 

Transform your multilingual development workflow with **one-click translation management** directly in your editor.

---

## ✨ Features

### 🎯 One-Click Translation Management
- **Add/Update translations** with a single click via CodeLens
- **Remove translations** instantly through hover actions
- **Visual indicators** for translation keys in your code
- **Smart detection** of translation function calls

### 🔍 Intelligent Code Analysis
- **Hover messages** showing translation details and available actions
- **CodeLens integration** for quick translation operations
- **Real-time validation** of `lemon-tree.yaml` configuration
- **Gutter icons** indicating translation status

### ⚙️ Seamless Integration
- **Automatic activation** when `lemon-tree.yaml` is detected
- **YAML schema validation** for the configuration file
- **File watching** for live configuration updates

## 🎬 Demo

<!-- Space for your awesome GIF demo! -->
![Lemon Tree in Action](./media/demo.gif)

*Add/update/remove translations with just one click!*

---

## 🚀 Getting Started

### Prerequisites

1. **Install Lemon Tree CLI** in your project:
   ```bash
   npm install --save-dev @garrux/lemon-tree
   ```

2. **Initialize Lemon Tree** in your project:
   ```bash
   npx ltr init
   ```

3. **Configure your `lemon-tree.yaml`** with your languages and translation settings.

4. **Add translation function examples** in the YAML, the extension will use them to detect translation keys.

Add examples of how you use the translation function in your code. Make sure to place `$text` where the text is located, for example:

```yaml
translationFunctionExamples:
  - t("$text")
```

### Installation

1. Install this extension from the VS Code marketplace
2. Open a project with a `lemon-tree.yaml` file
3. The extension will **automatically activate** and enhance your coding experience!

---

## 🎮 How to Use

### Adding/Updating Translations

1. **Write your translation key** in code (e.g., `tr("welcome.message")`)
2. **Click the CodeLens** "Add/Update translation" that appears above the line
3. **Done!** Lemon Tree CLI handles the translation automatically

### Removing Translations

1. **Click on the line of code** that contains the translation key
2. **Hover over the translation key** in your code
3. **Click "Remove translation"** from the hover popup
4. **Confirmed!** The translation key is removed from all language files and types

### Configuration Management

- **YAML validation** ensures your `lemon-tree.yaml` is always correct
- **Live reloading** when configuration changes
- **Error notifications** for invalid configurations

---

## 📋 Requirements

- **Node.js** 16+ (required by Lemon Tree CLI)
- **@garrux/lemon-tree** package installed in your project
- **lemon-tree.yaml** configuration file in your workspace root
- **YAML extension** (automatically suggested if not installed)
- **Translation provider API key** - You can use Google, DeepL, Microsoft, Yandex, or a custom plugin

---

## ⚡ Commands

This extension provides the following commands accessible via Command Palette:

| Command | Description |
|---------|-------------|
| `lemon-tree.update-translation` | Add or update a translation key |
| `lemon-tree.remove-translation` | Remove a translation key |

> 💡 **Pro Tip**: You rarely need to use commands directly! The extension provides intuitive CodeLens and hover interactions.

---

## 🔧 Configuration

This extension automatically reads your `lemon-tree.yaml` configuration. Here's a minimal example:

```yaml
languages:
  - en
  - es
  - fr

sourceLanguage: en

default:
  filePattern: ./translations/{{lang}}/{{lang}}.json
  protectionPattern: '{{key}}'
  typeDefinition:
    file: ./translations.d.ts
    exportName: Translations

translationFunctionExamples: 
  - t("$text")
  - i18n.t("$text")
  - i18next.t("$text")

api:
  provider: google
  key: '{{GOOGLE_API_KEY}}'
```

For detailed configuration options, visit the [Lemon Tree documentation](https://github.com/igarrux/lemon-tree).

---

## 🎨 Extension Settings

This extension automatically detects and validates your Lemon Tree configuration. No additional VS Code settings are required!

The extension contributes:
- **YAML schema validation** for `lemon-tree.yaml` files
- **Automatic activation** when Lemon Tree projects are detected

---

## 🐛 Known Issues

- **First-time setup**: Make sure `lemon-tree.yaml` exists in your workspace root
- **API keys**: Ensure your translation API keys are properly configured
- **Large projects**: Translation operations may take a few seconds for projects with many languages

## 📝 Release Notes

### 0.0.1

**Initial Release** 🎉
- ✅ CodeLens integration for translation management
- ✅ Hover actions for quick translation operations  
- ✅ YAML schema validation for configuration
- ✅ Real-time file watching and updates
- ✅ Multi-workspace support
- ✅ Gutter icons and visual indicators

---

## 🤝 Related Projects

- **[Lemon Tree CLI](https://github.com/igarrux/lemon-tree)** - The powerful CLI that powers this extension
- **Translation APIs** - Supports Google, DeepL, Microsoft, Yandex, and custom plugins

---

## 💡 Why Lemon Tree VS Code Extension?

- **🚀 Productivity**: Manage translations without leaving your editor
- **⚡ Speed**: One-click operations vs. manual CLI commands
- **🎯 Precision**: Visual feedback and error prevention
- **🔄 Workflow**: Seamless integration with your development process

---

##  Author

- **Lemon Tree CLI** by [Jhon Guerrero (Garrux)](https://github.com/igarrux)

---

## 📄 License

MIT License - Feel free to use, modify, and distribute!

---

**Made with 🍋 and lots of ❤️ for the developer community!**

*Transform your translation workflow today - because managing translations should be as easy as clicking a button!*
