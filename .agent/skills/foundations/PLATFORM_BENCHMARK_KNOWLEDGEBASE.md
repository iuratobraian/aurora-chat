# Platform Benchmark Knowledgebase

## Objetivo

Consolidar patrones de construccion observados en plataformas y juegos de referencia para reutilizarlos en proyectos futuros.

## Patrones de plataformas grandes

### Meta / Instagram

- sistemas de recomendacion multiproposito
- separacion entre surfaces
- controles de usuario sobre feed
- tooling para escala de modelos
- fuerte inversion en confiabilidad

### Uber

- arquitectura orientada a dominio
- plataforma comun para miles de servicios
- portabilidad obligatoria
- rollout y rollback como capacidad central

### Spotify

- separacion entre personalizacion y experimentacion
- release system fuerte para mobile
- herramientas internas de developer experience

### Canva

- fuerte foco en ecosistema de creacion
- integraciones amplias
- obsesion por tooling productivo y experiencia final

### Juegos mobile / live service

- vertical slice antes de expansion
- live ops como sistema, no como parche
- analytics y remote config desde temprano
- backend y operaciones al servicio de contenido recurrente

## Reglas de transferencia al repo

No copiar empresas.
Copiar principios:

- platform thinking
- operational discipline
- observability first
- rollback ready
- internal tooling
- growth by utility

## Cuando usar esta base

- al crear un proyecto nuevo
- al rediseñar una app nativa
- al crear un juego mobile
- al abrir una nueva vertical de IA o media
