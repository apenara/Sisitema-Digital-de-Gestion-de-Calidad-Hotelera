# Guía de Migración: De Hoteles a Empresas Multi-industria

## Resumen

Esta guía documenta el proceso de migración del sistema QMS+Hotel a QMS+, un sistema de gestión de calidad multi-industria que soporta empresas de cualquier sector.

## Cambios Principales

### 1. Nuevas Entidades y Tipos

- **`Hotel` → `Company`**: La entidad principal ahora es genérica para cualquier tipo de empresa
- **Nuevos tipos de industria**: 20+ industrias soportadas (manufactura, salud, retail, tecnología, etc.)
- **Departamentos configurables**: Templates específicos por industria
- **KPIs personalizables**: Métricas específicas según el tipo de industria

### 2. Estructura de Base de Datos

**Antes:**
```
/hotels/{hotelId}/...
```

**Ahora:**
```
/companies/{companyId}/...
/hotels/{hotelId}/... (compatibilidad temporal)
```

### 3. Roles Actualizados

- `chain_admin` → `org_admin`
- `hotel_admin` → `company_admin`
- Nuevos permisos para módulos adicionales (riesgos, capacitaciones, proveedores)

## Proceso de Migración

### Paso 1: Backup de Datos

```bash
# Hacer backup de Firestore
firebase firestore:backups:create --project your-project-id
```

### Paso 2: Actualizar Reglas de Firestore

Las nuevas reglas ya están actualizadas en `infrastructure/firestore.rules`. Para aplicarlas:

```bash
cd infrastructure
firebase deploy --only firestore:rules
```

### Paso 3: Ejecutar Script de Migración

```bash
cd scripts
npm install firebase-admin

# Verificar estado actual
node migrate-hotels-to-companies.js status

# Ejecutar migración
node migrate-hotels-to-companies.js migrate

# En caso de problemas, revertir
node migrate-hotels-to-companies.js rollback
```

### Paso 4: Actualizar el Frontend

1. **Actualizar imports en componentes:**
   ```typescript
   // Antes
   import type { Hotel } from '../types';
   
   // Ahora
   import type { Company } from '../types';
   ```

2. **Actualizar rutas:**
   - `/platform/hotels` → `/platform/companies`
   - Mantener ambas rutas temporalmente para compatibilidad

3. **Actualizar textos en la UI:**
   - "Hotel" → "Empresa"
   - "Cadena hotelera" → "Organización"
   - Referencias específicas de hotelería → Términos genéricos

### Paso 5: Actualizar Cloud Functions

Si tienes Cloud Functions personalizadas, actualiza las referencias:

```javascript
// Antes
const hotelRef = db.collection('hotels').doc(hotelId);

// Ahora
const companyRef = db.collection('companies').doc(companyId);
```

## Nuevas Funcionalidades

### 1. Selección de Industria

Al crear una nueva empresa, ahora se puede seleccionar:
- Tipo de industria
- Tamaño de empresa
- Número de empleados
- Certificaciones relevantes

### 2. Departamentos por Industria

Cada industria tiene templates predefinidos de departamentos:
- **Manufactura**: Producción, Calidad, Almacén, Ingeniería
- **Salud**: Servicios Médicos, Enfermería, Laboratorio, Farmacia
- **Tecnología**: Desarrollo, Infraestructura, Soporte, QA
- Etc.

### 3. KPIs Específicos

Métricas relevantes por industria:
- **Manufactura**: OEE, Tasa de Defectos, Entregas a Tiempo
- **Hospitality**: Ocupación, Satisfacción del Huésped, RevPAR
- **Healthcare**: Satisfacción del Paciente, Tasa de Infección
- Etc.

## Consideraciones de Compatibilidad

### Período de Transición

Durante el período de transición (recomendado 3-6 meses):

1. **Mantener ambas estructuras**: Hotels y Companies coexisten
2. **Rutas duplicadas**: Tanto `/hotels` como `/companies` funcionan
3. **Sincronización de datos**: Los cambios en hotels se reflejan en companies

### Deprecación Gradual

1. **Mes 1-2**: Migración y pruebas
2. **Mes 3-4**: Actualización de integraciones externas
3. **Mes 5-6**: Deprecación de endpoints antiguos
4. **Mes 7+**: Eliminación de estructura legacy

## Checklist de Migración

- [ ] Backup completo de Firestore
- [ ] Actualizar reglas de seguridad
- [ ] Ejecutar script de migración
- [ ] Verificar integridad de datos migrados
- [ ] Actualizar componentes del frontend
- [ ] Actualizar Cloud Functions
- [ ] Probar funcionalidades críticas
- [ ] Actualizar documentación
- [ ] Comunicar cambios a usuarios
- [ ] Monitorear errores post-migración

## Solución de Problemas

### Error: "Permission denied"
- Verificar que las nuevas reglas de Firestore estén aplicadas
- Revisar Custom Claims de los usuarios

### Error: "Company not found"
- Verificar que la migración se completó exitosamente
- Revisar si el ID cambió durante la migración

### Error: "Invalid industry type"
- Asegurarse de usar uno de los tipos de industria válidos
- Verificar importación de `IndustryType`

## Soporte

Para problemas durante la migración:
1. Revisar logs del script de migración
2. Verificar la consola de Firebase para errores
3. Contactar al equipo de desarrollo

## Rollback de Emergencia

Si es necesario revertir completamente:

```bash
# 1. Revertir datos
node migrate-hotels-to-companies.js rollback

# 2. Restaurar reglas anteriores
git checkout HEAD~1 infrastructure/firestore.rules
firebase deploy --only firestore:rules

# 3. Revertir código
git revert [commit-hash]
```

---

**IMPORTANTE**: Realizar siempre en ambiente de desarrollo/staging antes de producción.