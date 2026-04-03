# Aurora Multimodal Runtime

## Objetivo

Guiar la evolución de Aurora hacia una experiencia multimodal con texto, voz y media sin comprometer seguridad ni claridad.

## Lo que hoy queda funcional

- chat local por texto
- speech-to-text por navegador si el runtime lo soporta
- text-to-speech genérico por navegador
- briefs de imagen para conexión futura a providers

## Lo que no queda habilitado

- clonación de voz del usuario
- réplica biométrica de identidad
- empaquetado `.exe` real sin toolchain de escritorio

## Ruta segura

1. chat local
2. voz genérica
3. proveedores externos de voz e imagen
4. empaquetado Tauri/Electron

## Regla final

Aurora puede crecer en multimodalidad, pero no debe cruzar a clonación de identidad ni a promesas de media “real” sin el provider y la validación correctos.
