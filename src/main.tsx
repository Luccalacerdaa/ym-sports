import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/bottombar-fix.css"; // Importar estilos para corrigir a barra inferior
import { setupMobileViewportFix } from "./utils/mobileViewportFix"; // Importar correção de viewport para dispositivos móveis

// Inicializar correção de viewport para dispositivos móveis
setupMobileViewportFix();

// Service Worker é registrado automaticamente pelo useSimpleNotifications após o login
// Não registrar aqui para evitar duplicação e loop de recarregamento

createRoot(document.getElementById("root")!).render(<App />);
