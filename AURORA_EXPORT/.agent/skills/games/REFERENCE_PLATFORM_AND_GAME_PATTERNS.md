# Reference Platform And Game Patterns

## Objetivo

Guardar dentro del repo patrones observados en plataformas y juegos de referencia para que los agentes arranquen con criterio incrustado.

## Plataforma social y de contenido

### Meta / Instagram

Hechos observados en fuentes oficiales:

- Instagram opera multiples superficies de recomendacion, no una sola.
- Explore usa ranking multi-stage para escalar sobre volumen enorme de contenido.
- Meta invierte en infraestructura de modelos, calidad de notificaciones y control del usuario sobre el feed.
- Meta estandariza sistemas de interfaz a gran escala y prioriza confiabilidad operativa.

Patrones transferibles:

- separar surfaces por intencion
- ranking por etapas
- notificaciones con ranking propio
- tooling para escalar personalizacion sin romper estabilidad
- UI system consistente a escala

### Uber

Hechos observados en fuentes oficiales:

- Uber movio su arquitectura hacia dominios, gateways y capas para contener complejidad.
- El gateway centraliza routing, rate limits, seguridad, observabilidad y validaciones.
- La gestion de APIs y rollouts tiene UI, reglas y validaciones propias.

Patrones transferibles:

- arquitectura por dominio
- API gateway como control plane
- configuracion y publishing con guardrails
- rollout y rollback como capacidad central

### Spotify

Hechos observados en fuentes oficiales:

- Spotify separa personalizacion y experimentacion como capacidades distintas.
- Home trabaja con personalizacion y un volumen muy alto de experimentos.
- Remote config, catalogo de metricas y planner forman parte del sistema de release y experimentacion.
- Mobile release y cambios riesgosos se documentan con plan, riesgos y rollback.

Patrones transferibles:

- personalizacion no reemplaza experimentacion
- remote config desde temprano
- metrica y aprendizaje por encima de la obsesion por "ganadores"
- documentacion de rollout para cambios peligrosos

## Juego mobile y live service

### Unity / Game services patterns

Hechos observados en fuentes oficiales:

- Unity empuja un stack de LiveOps con Cloud Code, Cloud Save, Economy, Auth, Analytics, Diagnostics, Remote Config y content delivery.
- Recomienda vertical slice para aprender rapido antes de expandir.
- La retencion puede construirse como capa separada con sistemas server-authoritative, por ejemplo battle pass.
- Monetizacion, economia y analytics se conectan desde el principio.

Patrones transferibles:

- juego base + retention layer
- backend operativo desde temprano
- analytics y diagnostico como sistema base
- content operations y overrides para iteracion segura

### Google GameSnacks / H5 games

Hechos observados en fuentes oficiales:

- Los juegos distribuidos necesitan estructura clara de bundle, metadata y SDK comun.
- El rendimiento en dispositivos modestos y limites de tamaño son parte del contrato del producto.
- El juego debe contemplar lifecycle, ads, audio y storage con interfaces especificas.

Patrones transferibles:

- contrato tecnico de packaging
- performance target real desde el dia cero
- SDK de plataforma para ciclo de vida y monetizacion

## Como usar este documento

### Si el equipo construye una app nativa

Priorizar:

- shell claro
- surfaces con intenciones distintas
- gateway o BFF fuerte
- remote config
- experimentacion
- observabilidad

### Si el equipo construye un juego mobile

Priorizar:

- 10-second loop
- vertical slice
- meta systems despues
- retention layer
- live ops
- analytics + economy + content ops

## Regla

No copiar una empresa completa.
Copiar principios operativos, estructura y disciplina.

## Fuentes oficiales

- Meta Instagram recommendation scaling: https://engineering.fb.com/2023/08/09/ml-applications/scaling-instagram-explore-recommendations-system/
- Meta Instagram infrastructure scale: https://engineering.fb.com/2025/05/21/production-engineering/journey-to-1000-models-scaling-instagrams-recommendation-system/
- Meta notification ranking: https://engineering.fb.com/2025/09/02/ml-applications/a-new-ranking-framework-for-better-notification-quality-on-instagram/
- Meta StyleX at scale: https://engineering.fb.com/2025/11/11/web/stylex-a-styling-library-for-css-at-scale/
- Uber DOMA: https://www.uber.com/en-US/blog/microservice-architecture/
- Uber API gateway: https://www.uber.com/en-DE/blog/architecture-api-gateway/
- Spotify personalization: https://engineering.atspotify.com/2015/01/09/personalization-at-spotify-using-cassandra
- Spotify personalization on Home: https://engineering.atspotify.com/2020/1/for-your-ears-only-personalizing-spotify-home-with-machine-learning
- Spotify experimentation platform: https://engineering.atspotify.com/2020/10/spotifys-new-experimentation-platform-part-1/
- Spotify experimenting at scale: https://engineering.atspotify.com/2023/6/experimenting-at-scale-the-spotify-home-way
- Spotify experiments with learning: https://engineering.atspotify.com/2025/9/spotifys-experiments-with-learning-framework
- Spotify mobile release discipline: https://engineering.atspotify.com/2023/10/switching-build-systems-seamlessly/
- Google GameSnacks requirements: https://developers.google.com/gamesnacks/developer/requirements
- Google H5 game structure: https://developers.google.com/ad-placement/docs/html5-game-structure
- Google GameSnacks config: https://developers.google.com/gamesnacks/developer/config
- Unity vertical slice example: https://create.unity.com/dragon-crashers-webinar
- Unity LiveOps stack overview: https://unity.com/ja/solutions/gaming-services/continuous-game-improvements
- Unity retention layer for multiplayer: https://unity.com/resources/build-a-retention-layer-for-your-multiplayer-game
- Unity IAP and economy: https://unity.com/features/iap
