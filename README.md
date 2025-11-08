# SMAF - Sistema Anti-Fraude Frontend

Frontend desarrollado con Vite + React para el Sistema Motor Anti-Fraude (SMAF).

## 🚀 Tecnologías

- **React 18** - Biblioteca de interfaz de usuario
- **Vite** - Herramienta de construcción y desarrollo
- **Tailwind CSS** - Framework de CSS utilitario
- **Vitest** - Framework de pruebas unitarias
- **Testing Library** - Utilidades para pruebas de componentes
- **ESLint** - Linter para JavaScript/React

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes de interfaz básicos
│   ├── layout/         # Componentes de diseño
│   └── forms/          # Componentes de formularios
├── pages/              # Páginas de la aplicación
├── hooks/              # Custom hooks
├── services/           # Servicios de API
├── utils/              # Utilidades y constantes
├── assets/             # Recursos estáticos
├── styles/             # Estilos globales
└── test/               # Configuración de pruebas
```

## 🛠️ Instalación y Configuración

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   ```
   Edita el archivo `.env` con tus configuraciones.

3. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```

## 📝 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la construcción de producción
- `npm run lint` - Ejecuta ESLint
- `npm run lint:fix` - Ejecuta ESLint y corrige errores automáticamente
- `npm run test` - Ejecuta las pruebas en modo watch
- `npm run test:run` - Ejecuta las pruebas una vez
- `npm run test:ui` - Ejecuta las pruebas con interfaz gráfica

## 🧪 Pruebas

El proyecto utiliza Vitest y Testing Library para las pruebas unitarias. Los archivos de prueba se ubican junto a los componentes con la extensión `.test.jsx`.

Ejecutar pruebas:
```bash
npm run test
```

## 🎨 Estilos

El proyecto utiliza Tailwind CSS para los estilos. La configuración se encuentra en `tailwind.config.js`.

## 🔧 Configuración de ESLint

ESLint está configurado con reglas específicas para React y mejores prácticas. La configuración se encuentra en `eslint.config.js`.

## 📦 Componentes Disponibles

### UI Components
- `Button` - Botón reutilizable con variantes y tamaños

### Layout Components
- `Header` - Cabecera de la aplicación
- `Layout` - Diseño principal de la aplicación

### Pages
- `Dashboard` - Página principal del dashboard

## 🌐 API Integration

El proyecto incluye un servicio de API configurado en `src/services/api.js` y un custom hook `useApi` para facilitar las llamadas a la API.

## 🚀 Despliegue

Para construir la aplicación para producción:

```bash
npm run build
```

Los archivos se generarán en la carpeta `dist/`.

## 📄 Licencia

Este proyecto es parte del Sistema Motor Anti-Fraude (SMAF).